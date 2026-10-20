import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { db } from "@/lib/db";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const url = new URL(req.url);
  const onlyUnread = url.searchParams.get("unread") === "1";
  const where: any = { userId: session.user.id };
  if (onlyUnread) where.isRead = false;

  const [items, unreadCount] = await Promise.all([
    db.notification.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: 50,
    }),
    db.notification.count({ where: { userId: session.user.id, isRead: false } }),
  ]);

  return NextResponse.json({ data: items, unreadCount });
}

export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { id, all } = body as { id?: string; all?: boolean };

  if (all) {
    await db.notification.updateMany({
      where: { userId: session.user.id, isRead: false },
      data: { isRead: true, readAt: new Date() },
    });
    return NextResponse.json({ ok: true });
  }

  if (id) {
    await db.notification.updateMany({
      where: { id, userId: session.user.id },
      data: { isRead: true, readAt: new Date() },
    });
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ error: "id or all required" }, { status: 400 });
}
