import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { db } from "@/lib/db";
import { z } from "zod";

// GET: list proposals (customer sees proposals on their jobs; worker sees own proposals)
export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const url = new URL(req.url);
  const jobId = url.searchParams.get("jobId");
  const workerId = url.searchParams.get("workerId");

  const where: any = {};
  if (jobId) where.jobId = jobId;
  if (workerId) where.workerId = workerId;

  // RBAC: customer can see proposals for their jobs; worker can see their own
  if (session.user.role === "CUSTOMER") {
    where.job = { customerId: session.user.id };
  } else if (session.user.role === "WORKER") {
    if (!workerId) {
      where.workerId = session.user.id;
    } else if (workerId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
  }

  const proposals = await db.proposal.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: {
      worker: { select: { id: true, name: true, location: true, avatarUrl: true } },
      job: { select: { id: true, title: true, category: true, customerId: true, status: true, preferredDate: true, location: true, city: true, state: true } },
    },
  });

  return NextResponse.json({ data: proposals });
}

const createSchema = z.object({
  jobId: z.string(),
  proposedPrice: z.coerce.number().min(1),
  estimatedTime: z.string().optional(),
  availableFrom: z.string().optional(),
  availableTo: z.string().optional(),
  message: z.string().min(10, "Add a short message"),
  notes: z.string().optional(),
});

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (session.user.role !== "WORKER") {
    return NextResponse.json({ error: "Only workers can submit proposals" }, { status: 403 });
  }

  const body = await req.json();
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input" },
      { status: 400 }
    );
  }
  const d = parsed.data;

  const job = await db.job.findUnique({ where: { id: d.jobId } });
  if (!job) return NextResponse.json({ error: "Job not found" }, { status: 404 });
  if (job.status !== "OPEN" && job.status !== "PROPOSAL_RECEIVED") {
    return NextResponse.json({ error: "Job is no longer accepting proposals" }, { status: 400 });
  }

  // Ensure no duplicate proposals
  const existing = await db.proposal.findUnique({
    where: { jobId_workerId: { jobId: d.jobId, workerId: session.user.id } },
  });
  if (existing) {
    return NextResponse.json({ error: "You already submitted a proposal for this job" }, { status: 400 });
  }

  const proposal = await db.proposal.create({
    data: {
      jobId: d.jobId,
      workerId: session.user.id,
      proposedPrice: d.proposedPrice,
      estimatedTime: d.estimatedTime,
      availableFrom: d.availableFrom ? new Date(d.availableFrom) : null,
      availableTo: d.availableTo ? new Date(d.availableTo) : null,
      message: d.message,
      notes: d.notes,
    },
  });

  // Transition job status and increment proposalCount
  await db.job.update({
    where: { id: d.jobId },
    data: {
      status: "PROPOSAL_RECEIVED",
      proposalCount: { increment: 1 },
      events: {
        create: {
          actorId: session.user.id,
          type: "PROPOSAL_SUBMITTED",
          title: "Proposal submitted",
          description: "A worker submitted a proposal.",
        },
      },
    },
  });

  // Notify customer
  await db.notification.create({
    data: {
      userId: job.customerId,
      type: "NEW_PROPOSAL",
      title: "New proposal received",
      body: `A worker submitted a proposal on "${job.title}".`,
      link: `#/customer/job/${job.id}`,
      relatedId: proposal.id,
    },
  });

  return NextResponse.json(proposal, { status: 201 });
}
