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
  const job = await db.job.findUnique({
    where: { id },
    include: {
      customer: { select: { id: true, name: true, location: true, avatarUrl: true, email: true, phone: true } },
      events: { orderBy: { createdAt: "asc" }, include: { actor: { select: { id: true, name: true, avatarUrl: true } } } },
      proposals: {
        orderBy: { createdAt: "asc" },
        include: {
          worker: { select: { id: true, name: true, location: true, avatarUrl: true } },
        },
      },
      conversation: true,
    },
  });
  if (!job) return NextResponse.json({ error: "Job not found" }, { status: 404 });

  // RBAC
  const isOwner = job.customerId === session.user.id;
  const isAssignedWorker = job.assignedWorkerId === session.user.id;
  const isAdmin = session.user.role === "ADMIN";
  const hasProposed = job.proposals.some((p) => p.workerId === session.user.id);
  if (!isOwner && !isAssignedWorker && !isAdmin && !hasProposed && job.status !== "OPEN") {
    return NextResponse.json({ error: "Not authorized" }, { status: 403 });
  }

  return NextResponse.json(job);
}
