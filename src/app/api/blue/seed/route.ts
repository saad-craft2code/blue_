import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { db } from "@/lib/db";
import bcrypt from "bcryptjs";

// Self-contained seed endpoint: creates a small set of demo data
// only if the database is empty. Does NOT destroy production data.
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const existing = await db.user.count();
  if (existing > 1) {
    return NextResponse.json({
      ok: false,
      message: "Database already has users. Seed is skipped to protect existing data.",
    });
  }

  const passwordHash = await bcrypt.hash("blueplatform", 10);

  // 1. Admin
  const admin = await db.user.create({
    data: {
      email: "admin@blue.platform",
      name: "B.L.U.E. Admin",
      passwordHash,
      role: "ADMIN",
      chatName: "Admin",
    },
  });

  // 2. Customers
  const customers = await Promise.all(
    [
      { name: "Aisha Rahman", email: "aisha@example.com", location: "Austin, TX" },
      { name: "Michael Cohen", email: "michael@example.com", location: "Round Rock, TX" },
      { name: "Elena Vasquez", email: "elena@example.com", location: "Dallas, TX" },
    ].map((c) =>
      db.user.create({
        data: {
          email: c.email,
          name: c.name,
          passwordHash,
          role: "CUSTOMER",
          chatName: c.name.split(" ")[0],
          location: c.location,
          customerProfile: { create: {} },
        },
      })
    )
  );

  // 3. Workers (one per category, verified + unverified mix)
  const workersData = [
    { name: "Daniel Roberts", email: "daniel@example.com", location: "Austin, TX", category: "INDIVIDUAL_WORKER", title: "Senior mover", bio: "8 years helping families move across Texas. Truck, dolly, and straps always ready.", exp: 8, rate: 22, verified: true },
    { name: "Mariana Santos", email: "mariana@example.com", location: "Austin, TX", category: "CAR_WASHING", title: "Mobile detailer", bio: "Premium on-site car washing and detailing. Eco-friendly products.", exp: 5, rate: 25, verified: true },
    { name: "Carlos Mendoza", email: "carlos@example.com", location: "Round Rock, TX", category: "CONTRACTOR", title: "Licensed contractor", bio: "Renovations, repairs, and remodels. Insured and licensed in TX.", exp: 12, rate: 50, verified: false },
    { name: "Priya Patel", email: "priya@example.com", location: "Dallas, TX", category: "INDIVIDUAL_WORKER", title: "Packing specialist", bio: "Careful packing and home organization. Trusted with fragile items.", exp: 6, rate: 20, verified: true },
    { name: "James Foster", email: "james@example.com", location: "Dallas, TX", category: "CAR_WASHING", title: "Express wash", bio: "Quick washes and detailing at home or office.", exp: 3, rate: 18, verified: false },
  ];

  const workers = await Promise.all(
    workersData.map((w) =>
      db.user.create({
        data: {
          email: w.email,
          name: w.name,
          passwordHash,
          role: "WORKER",
          chatName: w.name.split(" ")[0],
          location: w.location,
          workerProfile: {
            create: {
              category: w.category,
              title: w.title,
              bio: w.bio,
              experienceYears: w.exp,
              startingRate: w.rate,
              isAvailable: true,
              verificationStatus: w.verified ? "VERIFIED" : "PENDING",
              verifiedAt: w.verified ? new Date() : null,
              verifiedBy: w.verified ? admin.id : null,
              completedJobs: w.verified ? Math.floor(Math.random() * 80) + 20 : 0,
              ratingAverage: 4.5 + Math.random() * 0.5,
              ratingCount: w.verified ? Math.floor(Math.random() * 40) + 5 : 0,
            },
          },
        },
        include: { workerProfile: true },
      })
    )
  );

  // 4. Sample jobs
  const jobsData = [
    { customer: 0, title: "Move 2 bedrooms of furniture", description: "Need help loading and unloading a 16ft truck. Stairs at destination.", category: "INDIVIDUAL_WORKER", budgetMin: 150, budgetMax: 250 },
    { customer: 0, title: "Weekly car wash — sedan", description: "Looking for recurring Saturday morning car wash.", category: "CAR_WASHING", budgetMin: 25, budgetMax: 40 },
    { customer: 1, title: "Bathroom renovation", description: "Remodel master bath — tile, vanity, fixtures.", category: "CONTRACTOR", budgetMin: 3000, budgetMax: 5000 },
    { customer: 2, title: "Packing for cross-country move", description: "Need careful packing of 1BR apartment for upcoming relocation.", category: "INDIVIDUAL_WORKER", budgetMin: 200, budgetMax: 400 },
  ];

  const jobs = await Promise.all(
    jobsData.map((j) =>
      db.job.create({
        data: {
          customerId: customers[j.customer].id,
          category: j.category as any,
          title: j.title,
          description: j.description,
          location: customers[j.customer].location!,
          budgetMin: j.budgetMin,
          budgetMax: j.budgetMax,
          status: "OPEN",
          events: {
            create: {
              actorId: customers[j.customer].id,
              type: "REQUEST_CREATED",
              title: "Request created",
              description: "Job request posted and open for proposals.",
            },
          },
        },
      })
    )
  );

  // 5. A sample proposal from Daniel on job 0
  await db.proposal.create({
    data: {
      jobId: jobs[0].id,
      workerId: workers[0].id,
      proposedPrice: 200,
      estimatedTime: "3 hours",
      message: "Hi! I'm available Saturday morning. I have a 16ft truck, dolly, and straps. Two helpers if needed.",
      status: "PENDING",
    },
  });
  await db.job.update({
    where: { id: jobs[0].id },
    data: {
      status: "PROPOSAL_RECEIVED",
      proposalCount: { increment: 1 },
      events: {
        create: {
          actorId: workers[0].id,
          type: "PROPOSAL_SUBMITTED",
          title: "Proposal submitted",
          description: "Daniel submitted a proposal.",
        },
      },
    },
  });

  return NextResponse.json({
    ok: true,
    message: "Seed complete.",
    admin: { email: "admin@blue.platform", password: "blueplatform" },
    customers: customers.length,
    workers: workers.length,
    jobs: jobs.length,
  });
}
