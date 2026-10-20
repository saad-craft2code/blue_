import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { db } from "@/lib/db";
import { z } from "zod";

const schema = z.object({
  jobId: z.string(),
  revieweeId: z.string(),
  rating: z.coerce.number().int().min(1).max(5),
  comment: z.string().min(10, "Add a few words").max(2000),
});

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const url = new URL(req.url);
  const jobId = url.searchParams.get("jobId");
  const workerId = url.searchParams.get("workerId");
  const where: any = { isPublic: true };
  if (jobId) where.jobId = jobId;
  if (workerId) where.revieweeId = workerId;

  const reviews = await db.review.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: {
      reviewer: { select: { id: true, name: true, avatarUrl: true } },
      job: { select: { id: true, title: true, category: true } },
    },
  });
  return NextResponse.json({ data: reviews });
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input" },
      { status: 400 }
    );
  }
  const d = parsed.data;

  const job = await db.job.findUnique({ where: { id: d.jobId } });
  if (!job) return NextResponse.json({ error: "Job not found" }, { status: 404 });
  if (job.status !== "COMPLETED") {
    return NextResponse.json({ error: "Job must be completed before review" }, { status: 400 });
  }

  // Reviewer must be the customer OR the assigned worker
  if (session.user.id !== job.customerId && session.user.id !== job.assignedWorkerId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // Prevent duplicate from same reviewer on same job
  const existing = await db.review.findUnique({
    where: { jobId_reviewerId: { jobId: d.jobId, reviewerId: session.user.id } },
  });
  if (existing) {
    return NextResponse.json({ error: "You already reviewed this job" }, { status: 400 });
  }

  // Find the worker profile for stats aggregation
  const workerProfileId = d.revieweeId === job.assignedWorkerId
    ? (await db.workerProfile.findUnique({ where: { userId: d.revieweeId } }))?.id
    : null;

  const review = await db.review.create({
    data: {
      jobId: d.jobId,
      reviewerId: session.user.id,
      revieweeId: d.revieweeId,
      workerProfileId,
      rating: d.rating,
      comment: d.comment,
    },
  });

  // Update worker profile aggregate stats when the reviewee is the worker
  if (workerProfileId) {
    const all = await db.review.findMany({
      where: { workerProfileId },
      select: { rating: true },
    });
    const avg = all.reduce((s, r) => s + r.rating, 0) / (all.length || 1);
    await db.workerProfile.update({
      where: { id: workerProfileId },
      data: { ratingAverage: Math.round(avg * 100) / 100, ratingCount: all.length },
    });
  }

  return NextResponse.json(review, { status: 201 });
}
