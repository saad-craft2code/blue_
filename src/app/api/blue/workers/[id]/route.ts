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
  const worker = await db.workerProfile.findFirst({
    where: { OR: [{ id }, { userId: id }] },
    include: {
      user: { select: { id: true, name: true, email: true, location: true, avatarUrl: true, createdAt: true, phone: true } },
    },
  });
  if (!worker) return NextResponse.json({ error: "Worker not found" }, { status: 404 });

  const reviews = await db.review.findMany({
    where: { workerProfileId: worker.id, isPublic: true },
    orderBy: { createdAt: "desc" },
    take: 10,
    include: {
      reviewer: { select: { id: true, name: true, avatarUrl: true } },
      job: { select: { id: true, title: true, category: true } },
    },
  });

  // Get authed user's favorite status
  const favorite = session.user?.id
    ? await db.favorite.findUnique({
        where: {
          customerId_workerId: { customerId: session.user.id, workerId: worker.userId },
        },
      })
    : null;

  return NextResponse.json({
    id: worker.id,
    userId: worker.userId,
    name: worker.user.name,
    avatarUrl: worker.user.avatarUrl,
    email: worker.user.email,
    phone: worker.user.phone,
    location: worker.user.location,
    category: worker.category,
    title: worker.title,
    bio: worker.bio,
    experienceYears: worker.experienceYears,
    startingRate: worker.startingRate,
    hourlyRate: worker.hourlyRate,
    currency: worker.currency,
    isAvailable: worker.isAvailable,
    verificationStatus: worker.verificationStatus,
    completedJobs: worker.completedJobs,
    ratingAverage: worker.ratingAverage,
    ratingCount: worker.ratingCount,
    responseTimeHours: worker.responseTimeHours,
    services: worker.services,
    portfolioUrls: worker.portfolioUrls,
    createdAt: worker.user.createdAt,
    favorite: !!favorite,
    reviews: reviews.map((r) => ({
      id: r.id,
      rating: r.rating,
      comment: r.comment,
      createdAt: r.createdAt,
      reviewer: r.reviewer,
      job: r.job,
    })),
  });
}
