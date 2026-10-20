import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { db } from "@/lib/db";

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") return null;
  return session;
}

export async function GET(req: NextRequest) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const url = new URL(req.url);
  const scope = url.searchParams.get("scope");

  if (scope === "metrics") {
    const [
      totalUsers,
      customers,
      workers,
      activeJobs,
      completedJobs,
      pendingVerification,
      activeSubscriptions,
      revenue,
    ] = await Promise.all([
      db.user.count(),
      db.user.count({ where: { role: "CUSTOMER" } }),
      db.user.count({ where: { role: "WORKER" } }),
      db.job.count({ where: { status: { in: ["OPEN", "PROPOSAL_RECEIVED", "ASSIGNED", "IN_PROGRESS"] } } }),
      db.job.count({ where: { status: "COMPLETED" } }),
      db.workerProfile.count({ where: { verificationStatus: "PENDING" } }),
      db.subscription.count({ where: { status: "ACTIVE" } }),
      db.subscription.aggregate({ _sum: { amount: true }, where: { status: "ACTIVE" } }),
    ]);

    return NextResponse.json({
      totalUsers,
      customers,
      workers,
      activeJobs,
      completedJobs,
      pendingVerification,
      activeSubscriptions,
      revenue: revenue._sum.amount ?? 0,
    });
  }

  if (scope === "users") {
    const q = url.searchParams.get("q") ?? "";
    const role = url.searchParams.get("role");
    const where: any = {};
    if (role) where.role = role;
    if (q) {
      where.OR = [
        { name: { contains: q, mode: "insensitive" } },
        { email: { contains: q, mode: "insensitive" } },
      ];
    }
    const users = await db.user.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: 100,
      include: {
        workerProfile: { select: { id: true, category: true, verificationStatus: true, ratingAverage: true, completedJobs: true } },
        subscriptions: { where: { status: "ACTIVE" }, take: 1 },
        _count: { select: { jobsAsCustomer: true, proposals: true } },
      },
    });
    return NextResponse.json({ data: users });
  }

  if (scope === "jobs") {
    const status = url.searchParams.get("status");
    const where: any = {};
    if (status) where.status = status;
    const jobs = await db.job.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: 100,
      include: {
        customer: { select: { id: true, name: true, avatarUrl: true } },
        _count: { select: { proposals: true } },
      },
    });
    return NextResponse.json({ data: jobs });
  }

  if (scope === "verification") {
    const workers = await db.workerProfile.findMany({
      where: { verificationStatus: "PENDING" },
      orderBy: { updatedAt: "asc" },
      include: { user: { select: { id: true, name: true, email: true, createdAt: true, avatarUrl: true, location: true, phone: true } } },
    });
    return NextResponse.json({ data: workers });
  }

  if (scope === "subscriptions") {
    const subs = await db.subscription.findMany({
      orderBy: { createdAt: "desc" },
      take: 100,
      include: { user: { select: { id: true, name: true, email: true } } },
    });
    return NextResponse.json({ data: subs });
  }

  return NextResponse.json({ error: "Unknown scope" }, { status: 400 });
}

// PATCH for verification status update, suspend user, etc.
export async function PATCH(req: NextRequest) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await req.json();
  const { action, userId, workerId, status } = body as {
    action: "verify" | "suspend" | "reactivate";
    userId?: string;
    workerId?: string;
    status?: "UNVERIFIED" | "PENDING" | "VERIFIED" | "REJECTED";
  };

  if (action === "verify" && workerId && status) {
    const wp = await db.workerProfile.update({
      where: { id: workerId },
      data: { verificationStatus: status, verifiedAt: status === "VERIFIED" ? new Date() : null, verifiedBy: session.user.id },
    });
    if (status === "VERIFIED" || status === "REJECTED") {
      await db.notification.create({
        data: {
          userId: wp.userId,
          type: "VERIFICATION_UPDATE",
          title: status === "VERIFIED" ? "Verification approved" : "Verification rejected",
          body: status === "VERIFIED"
            ? "Your worker profile is now verified. You have the verified badge."
            : "Your verification was rejected. Please review your profile information.",
          link: `#/worker-portal/profile`,
        },
      });
    }
    return NextResponse.json({ ok: true });
  }

  if (action === "suspend" && userId) {
    await db.user.update({ where: { id: userId }, data: { isSuspended: true } });
    return NextResponse.json({ ok: true });
  }
  if (action === "reactivate" && userId) {
    await db.user.update({ where: { id: userId }, data: { isSuspended: false } });
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ error: "Invalid action" }, { status: 400 });
}
