import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { db } from "@/lib/db";
import { z } from "zod";

const querySchema = z.object({
  q: z.string().optional(),
  category: z.enum(["INDIVIDUAL_WORKER", "CONTRACTOR", "CAR_WASHING"]).optional(),
  minRating: z.coerce.number().min(0).max(5).optional(),
  available: z.coerce.boolean().optional(),
  maxRate: z.coerce.number().min(0).optional(),
  lat: z.coerce.number().optional(),
  lng: z.coerce.number().optional(),
  radius: z.coerce.number().min(1).max(500).optional(),
  page: z.coerce.number().min(1).optional(),
  limit: z.coerce.number().min(1).max(50).optional(),
  sort: z.enum(["rating", "rate_asc", "rate_desc", "recent", "jobs"]).optional(),
});

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const url = new URL(req.url);
  const params = Object.fromEntries(url.searchParams.entries());
  const parsed = querySchema.safeParse(params);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message }, { status: 400 });
  }
  const q = parsed.data;
  const limit = q.limit ?? 12;
  const page = q.page ?? 1;

  const where: any = {
    user: { isActive: true, isSuspended: false, role: "WORKER" },
    verificationStatus: { in: ["VERIFIED", "PENDING", "UNVERIFIED"] },
  };
  if (q.category) where.category = q.category;
  if (q.available === true) where.isAvailable = true;
  if (q.minRating) where.ratingAverage = { gte: q.minRating };
  if (q.maxRate) where.startingRate = { lte: q.maxRate };
  if (q.q) {
    where.OR = [
      { title: { contains: q.q, mode: "insensitive" } },
      { bio: { contains: q.q, mode: "insensitive" } },
      { user: { name: { contains: q.q, mode: "insensitive" } } },
      { user: { location: { contains: q.q, mode: "insensitive" } } },
    ];
  }

  const orderBy: any = (() => {
    switch (q.sort) {
      case "rating": return { ratingAverage: "desc" };
      case "rate_asc": return { startingRate: "asc" };
      case "rate_desc": return { startingRate: "desc" };
      case "recent": return { createdAt: "desc" };
      case "jobs": return { completedJobs: "desc" };
      default: return { ratingAverage: "desc" };
    }
  })();

  const total = await db.workerProfile.count({ where });
  const workers = await db.workerProfile.findMany({
    where,
    orderBy,
    skip: (page - 1) * limit,
    take: limit,
    include: { user: { select: { id: true, name: true, location: true, avatarUrl: true, createdAt: true } } },
  });

  return NextResponse.json({
    total,
    page,
    pageSize: limit,
    data: workers.map((w) => ({
      id: w.id,
      userId: w.userId,
      name: w.user.name,
      avatarUrl: w.user.avatarUrl,
      location: w.user.location,
      category: w.category,
      title: w.title,
      bio: w.bio,
      experienceYears: w.experienceYears,
      startingRate: w.startingRate,
      hourlyRate: w.hourlyRate,
      currency: w.currency,
      isAvailable: w.isAvailable,
      verificationStatus: w.verificationStatus,
      completedJobs: w.completedJobs,
      ratingAverage: w.ratingAverage,
      ratingCount: w.ratingCount,
      services: w.services,
      portfolioUrls: w.portfolioUrls,
      createdAt: w.user.createdAt,
    })),
  });
}

export async function POST(req: NextRequest) {
  // Worker self-update endpoint (placeholder for future)
  return NextResponse.json({ ok: true });
}
