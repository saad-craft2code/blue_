import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { db } from "@/lib/db";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const conversations = await db.conversation.findMany({
    where: {
      participants: { some: { userId: session.user.id } },
    },
    orderBy: { updatedAt: "desc" },
    include: {
      participants: {
        include: {
          user: { select: { id: true, name: true, avatarUrl: true, role: true } },
        },
      },
      job: { select: { id: true, title: true, status: true, category: true } },
      messages: {
        orderBy: { createdAt: "desc" },
        take: 1,
      },
    },
  });

  // Compute unread count per conversation for the current user
  const data = conversations.map((c) => {
    const me = c.participants.find((p) => p.userId === session.user.id);
    const lastReadAt = me?.lastReadAt;
    const unreadCount = lastReadAt
      ? c.messages.filter((m) => m.createdAt > lastReadAt && m.senderId !== session.user.id).length
      : c.messages.filter((m) => m.senderId !== session.user.id).length;
    const other = c.participants.find((p) => p.userId !== session.user.id);
    return {
      id: c.id,
      type: c.type,
      subject: c.subject,
      jobId: c.jobId,
      job: c.job,
      lastMessagePreview: c.lastMessagePreview,
      lastMessageAt: c.lastMessageAt,
      unreadCount,
      other: other?.user,
      updatedAt: c.updatedAt,
    };
  });

  return NextResponse.json({ data });
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { recipientId, jobId, subject } = body as {
    recipientId?: string;
    jobId?: string;
    subject?: string;
  };
  if (!recipientId && !jobId) {
    return NextResponse.json({ error: "recipientId or jobId required" }, { status: 400 });
  }

  // If jobId provided, look up existing conversation or create one
  if (jobId) {
    const existing = await db.conversation.findUnique({ where: { jobId } });
    if (existing) return NextResponse.json(existing);

    const job = await db.job.findUnique({ where: { id: jobId } });
    if (!job) return NextResponse.json({ error: "Job not found" }, { status: 404 });

    const conv = await db.conversation.create({
      data: {
        jobId,
        type: "JOB",
        subject: subject ?? job.title,
        participants: {
          create: [
            { userId: job.customerId },
            ...(job.assignedWorkerId ? [{ userId: job.assignedWorkerId }] : []),
          ],
        },
      },
    });
    return NextResponse.json(conv);
  }

  if (recipientId) {
    // Find direct conversation between these two users
    const existing = await db.conversation.findFirst({
      where: {
        type: "DIRECT",
        AND: [
          { participants: { some: { userId: session.user.id } } },
          { participants: { some: { userId: recipientId } } },
        ],
      },
    });
    if (existing) return NextResponse.json(existing);

    const conv = await db.conversation.create({
      data: {
        type: "DIRECT",
        subject: subject ?? null,
        participants: {
          create: [{ userId: session.user.id }, { userId: recipientId }],
        },
      },
    });
    return NextResponse.json(conv);
  }

  return NextResponse.json({ error: "Invalid request" }, { status: 400 });
}
