import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { db } from "@/lib/db";
import { z } from "zod";

export async function GET(
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await ctx.params;
  const conversation = await db.conversation.findUnique({
    where: { id },
    include: {
      participants: {
        include: {
          user: { select: { id: true, name: true, avatarUrl: true, role: true, chatName: true } },
        },
      },
      job: true,
    },
  });
  if (!conversation) return NextResponse.json({ error: "Conversation not found" }, { status: 404 });

  const isParticipant = conversation.participants.some((p) => p.userId === session.user.id);
  if (!isParticipant && session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // mark as read for current user
  await db.conversationParticipant.update({
    where: {
      conversationId_userId: { conversationId: id, userId: session.user.id },
    },
    data: { lastReadAt: new Date() },
  });

  const messages = await db.message.findMany({
    where: { conversationId: id },
    orderBy: { createdAt: "asc" },
    take: 200,
  });

  const other = conversation.participants.find((p) => p.userId !== session.user.id);

  return NextResponse.json({
    id: conversation.id,
    type: conversation.type,
    subject: conversation.subject,
    jobId: conversation.jobId,
    job: conversation.job,
    other: other?.user,
    messages,
  });
}

const sendSchema = z.object({
  body: z.string().min(1, "Message cannot be empty").max(5000),
  attachments: z.array(z.string()).optional(),
});

export async function POST(
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await ctx.params;
  const body = await req.json();
  const parsed = sendSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input" },
      { status: 400 }
    );
  }

  const conversation = await db.conversation.findUnique({
    where: { id },
    include: { participants: true },
  });
  if (!conversation) return NextResponse.json({ error: "Conversation not found" }, { status: 404 });

  const isParticipant = conversation.participants.some((p) => p.userId === session.user.id);
  if (!isParticipant) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const message = await db.message.create({
    data: {
      conversationId: id,
      senderId: session.user.id,
      body: parsed.data.body,
      attachments: parsed.data.attachments ?? [],
    },
  });

  await db.conversation.update({
    where: { id },
    data: {
      lastMessageAt: new Date(),
      lastMessagePreview: parsed.data.body.slice(0, 120),
    },
  });

  // Notify other participants
  const others = conversation.participants.filter((p) => p.userId !== session.user.id);
  await db.notification.createMany({
    data: others.map((p) => ({
      userId: p.userId,
      type: "NEW_MESSAGE",
      title: "New message",
      body: parsed.data.body.slice(0, 120),
      link: `#/messages?c=${id}`,
      relatedId: id,
    })),
  });

  return NextResponse.json(message, { status: 201 });
}
