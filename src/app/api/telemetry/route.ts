export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";

const DEVICE_ID = "BH_UNIZIK_001";
const EXPECTED_API_KEY = process.env.API_KEY;

export async function GET() {
  try {
    // 1. Grab the URL natively inside the dynamic route
    const dbUrl = process.env.DATABASE_URL;
    if (!dbUrl) throw new Error("Environment string missing in dynamic route.");

    const { getPrisma } = await import("@/lib/prisma");

    // 2. Inject it directly into Prisma
    const prisma = getPrisma(dbUrl);

    const latestData = await prisma.telemetry.findFirst({
      where: { incubatorId: DEVICE_ID },
      orderBy: { createdAt: "desc" },
    });

    if (!latestData) {
      return NextResponse.json(
        {
          currentDay: 0,
          waterTemp: 0,
          chamberHumid: 0,
          gasFlowPct: 0,
          status: "WAITING_FOR_HARDWARE",
        },
        { status: 200 },
      );
    }

    return NextResponse.json(latestData, { status: 200 });
  } catch (error) {
    console.error("Database Fetch Error:", error);
    return NextResponse.json(
      {
        currentDay: 0,
        waterTemp: 0,
        chamberHumid: 0,
        gasFlowPct: 0,
        batteryV: 0,
        status: "SYSTEM_OFFLINE_DB_ERROR",
      },
      { status: 200 },
    );
  }
}

export async function POST(req: Request) {
  try {
    // 1. Grab the URL
    const dbUrl = process.env.DATABASE_URL;
    if (!dbUrl) throw new Error("Environment string missing in dynamic route.");

    const { getPrisma } = await import("@/lib/prisma");

    // 2. Inject it
    const prisma = getPrisma(dbUrl);

    const apiKey = req.headers.get("x-api-key");
    if (apiKey !== EXPECTED_API_KEY) {
      return NextResponse.json(
        { error: "Unauthorized: Invalid API Key" },
        { status: 401 },
      );
    }

    const body = await req.json();

    if (body.device_id !== DEVICE_ID) {
      return NextResponse.json(
        { error: "Unauthorized: Unknown Device" },
        { status: 403 },
      );
    }

    await prisma.telemetry.create({
      data: {
        incubatorId: body.device_id,
        currentDay: body.current_day,
        waterTemp: body.water_temp,
        chamberHumid: body.chamber_humid,
        gasFlowPct: body.gas_flow_pct,
        batteryV: body.battery_v,
        status: body.status,
      },
    });

    return NextResponse.json(
      { success: true, message: "Data synced" },
      { status: 201 },
    );
  } catch (error) {
    console.error("Hardware Ingestion Error:", error);
    return NextResponse.json({ error: "Failed to save data" }, { status: 500 });
  }
}
