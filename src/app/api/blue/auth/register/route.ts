import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { db } from "@/lib/db";

const schema = z.object({
  name: z.string().min(2, "Name is too short").max(80, "Name is too long"),
  email: z.string().email("Invalid email").toLowerCase(),
  password: z.string().min(8, "Password must be at least 8 characters").max(72),
  role: z.enum(["CUSTOMER", "WORKER"]),
  chatName: z.string().min(2).max(40).optional(),
  phone: z.string().optional(),
  location: z.string().optional(),
  // Worker-only fields
  category: z.enum(["INDIVIDUAL_WORKER", "CONTRACTOR", "CAR_WASHING"]).optional(),
  title: z.string().optional(),
  bio: z.string().optional(),
  experienceYears: z.coerce.number().int().min(0).max(70).optional(),
  startingRate: z.coerce.number().min(0).optional(),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Invalid input" },
        { status: 400 }
      );
    }
    const d = parsed.data;

    const existing = await db.user.findUnique({ where: { email: d.email } });
    if (existing) {
      return NextResponse.json(
        { error: "An account already exists with this email." },
        { status: 409 }
      );
    }

    const passwordHash = await bcrypt.hash(d.password, 10);
    const user = await db.user.create({
      data: {
        email: d.email,
        name: d.name,
        passwordHash,
        role: d.role,
        chatName: d.chatName ?? d.name,
        phone: d.phone,
        location: d.location,
        customerProfile: d.role === "CUSTOMER" ? { create: {} } : undefined,
        workerProfile:
          d.role === "WORKER"
            ? {
                create: {
                  category: d.category ?? "INDIVIDUAL_WORKER",
                  title: d.title,
                  bio: d.bio,
                  experienceYears: d.experienceYears ?? 0,
                  startingRate: d.startingRate,
                  verificationStatus: "UNVERIFIED",
                },
              }
            : undefined,
      },
    });

    return NextResponse.json({
      id: user.id,
      email: user.email,
      role: user.role,
    });
  } catch (err: any) {
    console.error("[register] error", err);
    return NextResponse.json(
      { error: err?.message ?? "Unable to register" },
      { status: 500 }
    );
  }
}
