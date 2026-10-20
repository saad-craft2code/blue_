import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { db } from "@/lib/db";
import { z } from "zod";

const createSchema = z.object({
  category: z.enum(["INDIVIDUAL_WORKER", "CONTRACTOR", "CAR_WASHING"]),
  title: z.string().min(4, "Title is too short").max(120),
  description: z.string().min(10, "Please add a clear description"),
  location: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  zipCode: z.string().optional(),
  preferredDate: z.string().optional(),
  budgetMin: z.coerce.number().min(0).optional(),
  budgetMax: z.coerce.number().min(0).optional(),
  requirements: z.any().optional(),
  attachments: z.array(z.string()).optional(),
});

// GET: list jobs (customer's jobs OR open jobs for workers)
export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const url = new URL(req.url);
  const scope = url.searchParams.get("scope") ?? "mine";
  const status = url.searchParams.get("status");
  const category = url.searchParams.get("category");
  const page = parseInt(url.searchParams.get("page") ?? "1");
  const limit = parseInt(url.searchParams.get("limit") ?? "20");

  const where: any = {};
  if (scope === "mine") {
    if (session.user.role === "CUSTOMER") {
      where.customerId = session.user.id;
    } else if (session.user.role === "WORKER") {
      // For worker's "my jobs" — show assigned or completed-by-them
      where.assignedWorkerId = session.user.id;
    } else if (session.user.role === "ADMIN") {
      // all
    }
  } else if (scope === "available") {
    where.status = "OPEN";
    if (session.user.role === "WORKER") {
      // exclude jobs they've already proposed to
      const proposed = await db.proposal.findMany({
        where: { workerId: session.user.id },
        select: { jobId: true },
      });
      where.id = { notIn: proposed.map((p) => p.jobId) };
    }
  } else if (scope === "active") {
    where.assignedWorkerId = session.user.id;
    where.status = "IN_PROGRESS";
  } else if (scope === "completed") {
    where.assignedWorkerId = session.user.id;
    where.status = "COMPLETED";
  }
  if (status) where.status = status;
  if (category) where.category = category;

  const [total, jobs] = await Promise.all([
    db.job.count({ where }),
    db.job.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
      include: {
        customer: { select: { id: true, name: true, location: true, avatarUrl: true } },
        _count: { select: { proposals: true } },
      },
    }),
  ]);

  return NextResponse.json({
    total,
    page,
    pageSize: limit,
    data: jobs,
  });
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (session.user.role !== "CUSTOMER") {
    return NextResponse.json({ error: "Only customers can post jobs" }, { status: 403 });
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

  const job = await db.job.create({
    data: {
      customerId: session.user.id,
      category: d.category,
      title: d.title,
      description: d.description,
      location: d.location,
      city: d.city,
      state: d.state,
      zipCode: d.zipCode,
      preferredDate: d.preferredDate ? new Date(d.preferredDate) : null,
      budgetMin: d.budgetMin,
      budgetMax: d.budgetMax,
      requirements: d.requirements,
      attachments: d.attachments ?? [],
      status: "OPEN",
      events: {
        create: {
          actorId: session.user.id,
          type: "REQUEST_CREATED",
          title: "Request created",
          description: "Job request posted and open for proposals.",
        },
      },
    },
    include: { events: { orderBy: { createdAt: "asc" } } },
  });

  return NextResponse.json(job, { status: 201 });
}
