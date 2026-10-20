import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { db } from "@/lib/db";
import { z } from "zod";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    include: {
      customerProfile: true,
      workerProfile: true,
      subscriptions: { where: { status: "ACTIVE" }, take: 1 },
      _count: {
        select: {
          jobsAsCustomer: true,
          proposals: true,
          favoritesAsCustomer: true,
          notifications: { where: { isRead: false } } as any,
        },
      },
    },
  });
  if (!user) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // Add separate counts
  const [activeJobs, completedJobs, pendingProposals, unreadNotifs] = await Promise.all([
    db.job.count({ where: { customerId: user.id, status: { in: ["OPEN", "PROPOSAL_RECEIVED", "ASSIGNED", "IN_PROGRESS"] } } }),
    db.job.count({ where: { customerId: user.id, status: "COMPLETED" } }),
    db.proposal.count({ where: { job: { customerId: user.id }, status: "PENDING" } }),
    db.notification.count({ where: { userId: user.id, isRead: false } }),
  ]);

  return NextResponse.json({
    id: user.id,
    email: user.email,
    name: user.name,
    chatName: user.chatName,
    phone: user.phone,
    location: user.location,
    avatarUrl: user.avatarUrl,
    role: user.role,
    isActive: user.isActive,
    createdAt: user.createdAt,
    customerProfile: user.customerProfile,
    workerProfile: user.workerProfile
      ? {
          ...user.workerProfile,
          // don't leak internal verifiedBy
          verifiedBy: undefined,
        }
      : null,
    activeSubscription: user.subscriptions[0] ?? null,
    stats: {
      activeJobs,
      completedJobs,
      pendingProposals,
      unreadNotifs,
      favorites: user._count.favoritesAsCustomer,
    },
  });
}

const updateSchema = z.object({
  name: z.string().min(2).max(80).optional(),
  chatName: z.string().min(2).max(40).optional(),
  phone: z.string().optional(),
  location: z.string().optional(),
  avatarUrl: z.string().url().optional(),
  // Worker fields
  title: z.string().optional(),
  bio: z.string().optional(),
  experienceYears: z.coerce.number().int().min(0).max(70).optional(),
  startingRate: z.coerce.number().min(0).optional(),
  isAvailable: z.boolean().optional(),
  services: z.any().optional(),
  // Customer preferences
  preferences: z.any().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  zipCode: z.string().optional(),
});

export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input" },
      { status: 400 }
    );
  }
  const d = parsed.data;

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    include: { customerProfile: true, workerProfile: true },
  });
  if (!user) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const userData: any = {};
  if (d.name !== undefined) userData.name = d.name;
  if (d.chatName !== undefined) userData.chatName = d.chatName;
  if (d.phone !== undefined) userData.phone = d.phone;
  if (d.location !== undefined) userData.location = d.location;
  if (d.avatarUrl !== undefined) userData.avatarUrl = d.avatarUrl;

  await db.user.update({ where: { id: user.id }, data: userData });

  // Worker profile
  if (user.workerProfile && (
    d.title !== undefined ||
    d.bio !== undefined ||
    d.experienceYears !== undefined ||
    d.startingRate !== undefined ||
    d.isAvailable !== undefined ||
    d.services !== undefined
  )) {
    await db.workerProfile.update({
      where: { userId: user.id },
      data: {
        title: d.title,
        bio: d.bio,
        experienceYears: d.experienceYears,
        startingRate: d.startingRate,
        isAvailable: d.isAvailable,
        services: d.services,
      },
    });
  }

  // Customer profile
  if (user.customerProfile && (
    d.preferences !== undefined ||
    d.address !== undefined ||
    d.city !== undefined ||
    d.state !== undefined ||
    d.zipCode !== undefined
  )) {
    await db.customerProfile.update({
      where: { userId: user.id },
      data: {
        preferences: d.preferences,
        address: d.address,
        city: d.city,
        state: d.state,
        zipCode: d.zipCode,
      },
    });
  }

  return NextResponse.json({ ok: true });
}
