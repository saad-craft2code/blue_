import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { db } from "@/lib/db";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const favorites = await db.favorite.findMany({
    where: { customerId: session.user.id },
    orderBy: { createdAt: "desc" },
    include: {
      worker: { select: { id: true, name: true, location: true, avatarUrl: true } },
    },
  });

  const workerUserIds = favorites.map((f) => f.workerId);
  const profiles = await db.workerProfile.findMany({
    where: { userId: { in: workerUserIds } },
  });

  return NextResponse.json({
    data: favorites.map((f) => ({
      id: f.id,
      notes: f.notes,
      createdAt: f.createdAt,
      worker: f.worker,
      profile: profiles.find((p) => p.userId === f.workerId) ?? null,
    })),
  });
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { workerId, notes } = await req.json();
  if (!workerId) return NextResponse.json({ error: "workerId required" }, { status: 400 });

  try {
    const fav = await db.favorite.create({
      data: { customerId: session.user.id, workerId, notes },
    });
    return NextResponse.json(fav, { status: 201 });
  } catch (err: any) {
    if (err?.code === "P2002") {
      return NextResponse.json({ error: "Already saved" }, { status: 409 });
    }
    throw err;
  }
}

export async function DELETE(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const url = new URL(req.url);
  const workerId = url.searchParams.get("workerId");
  if (!workerId) return NextResponse.json({ error: "workerId required" }, { status: 400 });

  await db.favorite.delete({
    where: { customerId_workerId: { customerId: session.user.id, workerId } },
  });
  return NextResponse.json({ ok: true });
}
