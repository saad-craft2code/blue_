import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { db } from "@/lib/db";

const PLANS = {
  MONTHLY: { amount: 14.99, interval: "monthly", label: "Monthly" },
  YEARLY: { amount: 199.99, interval: "yearly", label: "Yearly" },
} as const;

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const subs = await db.subscription.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
  });

  const active = subs.find((s) => s.status === "ACTIVE" || s.status === "TRIALING");
  return NextResponse.json({
    active: active
      ? {
          id: active.id,
          plan: active.plan,
          status: active.status,
          amount: active.amount,
          interval: active.interval,
          startDate: active.startDate,
          currentPeriodEnd: active.currentPeriodEnd,
          cancelAt: active.cancelAt,
        }
      : null,
    history: subs.map((s) => ({
      id: s.id,
      plan: s.plan,
      status: s.status,
      amount: s.amount,
      interval: s.interval,
      startDate: s.startDate,
      endDate: s.endDate,
      createdAt: s.createdAt,
    })),
  });
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const action = body?.action as "subscribe" | "cancel";
  const plan = body?.plan as keyof typeof PLANS;

  if (action === "subscribe") {
    if (!PLANS[plan]) return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
    const cfg = PLANS[plan];
    const now = new Date();
    const periodEnd = new Date(now);
    if (cfg.interval === "monthly") periodEnd.setMonth(periodEnd.getMonth() + 1);
    else periodEnd.setFullYear(periodEnd.getFullYear() + 1);

    // Cancel any active subs first
    await db.subscription.updateMany({
      where: { userId: session.user.id, status: "ACTIVE" },
      data: { status: "CANCELLED", cancelledAt: now, endDate: now },
    });

    const sub = await db.subscription.create({
      data: {
        userId: session.user.id,
        plan,
        status: "ACTIVE",
        amount: cfg.amount,
        currency: "USD",
        interval: cfg.interval,
        startDate: now,
        currentPeriodEnd: periodEnd,
        paymentProvider: "stub", // integration point for Stripe/Paddle/RevenueCat
      },
    });

    await db.notification.create({
      data: {
        userId: session.user.id,
        type: "SUBSCRIPTION_EVENT",
        title: "Subscription activated",
        body: `Your ${cfg.label} subscription is now active.`,
        link: `#/customer/subscription`,
        relatedId: sub.id,
      },
    });

    return NextResponse.json({ ok: true, subscription: sub });
  }

  if (action === "cancel") {
    await db.subscription.updateMany({
      where: { userId: session.user.id, status: "ACTIVE" },
      data: { status: "CANCELLED", cancelledAt: new Date(), cancelAt: new Date() },
    });
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ error: "Invalid action" }, { status: 400 });
}
