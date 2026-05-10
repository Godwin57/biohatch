export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";

const DEVICE_ID = "BH_UNIZIK_001";
const EXPECTED_API_KEY = "your_secure_uuid_here";

// ==========================================
// 1. GET: FETCH REAL DATA FOR THE DASHBOARD
// ==========================================
export async function GET() {
  // LAZY LOAD PRISMA HERE: Bypasses the Next.js build compiler
  const { prisma } = await import("@/lib/prisma");

  try {
    const latestData = await prisma.telemetry.findFirst({
      where: { incubatorId: DEVICE_ID },
      orderBy: { createdAt: "desc" },
    });

    if (!latestData) {
      return NextResponse.json(
        {
          currentDay: 1,
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
      { error: "Failed to fetch telemetry" },
      { status: 500 },
    );
  }
}

// ==========================================
// 2. POST: CATCH REAL DATA FROM THE ESP32
// ==========================================
export async function POST(req: Request) {
  // LAZY LOAD PRISMA HERE
  const { prisma } = await import("@/lib/prisma");

  try {
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
