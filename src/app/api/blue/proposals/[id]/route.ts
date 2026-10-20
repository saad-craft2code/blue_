import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { db } from "@/lib/db";

export async function GET(
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await ctx.params;
  const proposal = await db.proposal.findUnique({
    where: { id },
    include: {
      job: true,
      worker: { select: { id: true, name: true, location: true, avatarUrl: true } },
    },
  });
  if (!proposal) return NextResponse.json({ error: "Proposal not found" }, { status: 404 });

  // RBAC
  const isOwner = proposal.job.customerId === session.user.id;
  const isWorker = proposal.workerId === session.user.id;
  const isAdmin = session.user.role === "ADMIN";
  if (!isOwner && !isWorker && !isAdmin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  return NextResponse.json(proposal);
}

// PATCH: accept or reject proposal
export async function PATCH(
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await ctx.params;
  const body = await req.json();
  const action = body?.action as "accept" | "reject";
  if (!["accept", "reject"].includes(action)) {
    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  }

  const proposal = await db.proposal.findUnique({
    where: { id },
    include: { job: true },
  });
  if (!proposal) return NextResponse.json({ error: "Proposal not found" }, { status: 404 });

  // Only the customer who owns the job can accept/reject
  if (proposal.job.customerId !== session.user.id && session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  if (action === "accept") {
    // Mark this proposal accepted and all others rejected
    await db.$transaction([
      db.proposal.update({
        where: { id },
        data: { status: "ACCEPTED", acceptedAt: new Date(), isRead: true },
      }),
      db.proposal.updateMany({
        where: { jobId: proposal.jobId, id: { not: id } },
        data: { status: "REJECTED", rejectedAt: new Date() },
      }),
      db.job.update({
        where: { id: proposal.jobId },
        data: {
          status: "ASSIGNED",
          assignedWorkerId: proposal.workerId,
          events: {
            create: [
              {
                actorId: session.user.id,
                type: "PROPOSAL_ACCEPTED",
                title: "Proposal accepted",
                description: "Customer accepted a proposal and assigned the worker.",
              },
              {
                actorId: session.user.id,
                type: "WORKER_ASSIGNED",
                title: "Worker assigned",
                description: "Worker has been assigned to the job.",
              },
            ],
          },
        },
      }),
      db.notification.create({
        data: {
          userId: proposal.workerId,
          type: "PROPOSAL_ACCEPTED",
          title: "Proposal accepted",
          body: `Your proposal on "${proposal.job.title}" was accepted.`,
          link: `#/worker-portal/job/${proposal.jobId}`,
          relatedId: proposal.id,
        },
      }),
    ]);

    // Create or get conversation for this job
    let conversation = await db.conversation.findUnique({
      where: { jobId: proposal.jobId },
    });
    if (!conversation) {
      conversation = await db.conversation.create({
        data: {
          jobId: proposal.jobId,
          type: "JOB",
          subject: proposal.job.title,
          participants: {
            create: [
              { userId: proposal.job.customerId },
              { userId: proposal.workerId },
            ],
          },
        },
      });
    }

    return NextResponse.json({ ok: true, conversationId: conversation.id });
  } else {
    await db.proposal.update({
      where: { id },
      data: { status: "REJECTED", rejectedAt: new Date() },
    });
    await db.notification.create({
      data: {
        userId: proposal.workerId,
        type: "PROPOSAL_REJECTED",
        title: "Proposal declined",
        body: `Your proposal on "${proposal.job.title}" was declined.`,
        link: `#/worker-portal/job/${proposal.jobId}`,
        relatedId: proposal.id,
      },
    });
    return NextResponse.json({ ok: true });
  }
}
