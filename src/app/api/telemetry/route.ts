export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";

const DEVICE_ID = "BH_UNIZIK_001";
const EXPECTED_API_KEY = process.env.API_KEY;

export async function GET() {
  try {
    const dbUrl = process.env.DATABASE_URL;
    if (!dbUrl) throw new Error("Environment string missing");

    // Initialize Neon's stateless HTTP driver
    const sql = neon(dbUrl);

    // Fetch the latest row directly
    const data = await sql`
      SELECT * FROM "Telemetry"
      WHERE "incubatorId" = ${DEVICE_ID}
      ORDER BY "createdAt" DESC
      LIMIT 1
    `;

    if (data.length === 0) {
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

    return NextResponse.json(data[0], { status: 200 });
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
    const apiKey = req.headers.get("x-api-key");
    // if (apiKey !== EXPECTED_API_KEY) {
    //   return NextResponse.json(
    //     { error: "Unauthorized: Invalid API Key" },
    //     { status: 401 },
    //   );
    // }

    const body = await req.json();

    // if (body.device_id !== DEVICE_ID) {
    //   return NextResponse.json(
    //     { error: "Unauthorized: Unknown Device" },
    //     { status: 403 },
    //   );
    // }

    const dbUrl = process.env.DATABASE_URL;
    if (!dbUrl) throw new Error("Environment string missing");

    // Initialize Neon's stateless HTTP driver
    const sql = neon(dbUrl);

    // Direct SQL insertion
    await sql`
      INSERT INTO "Telemetry" (
        "incubatorId", "currentDay", "waterTemp", "chamberHumid", 
        "gasFlowPct", "batteryV", "status"
      ) VALUES (
        ${body.device_id}, ${body.current_day}, ${body.water_temp}, 
        ${body.chamber_humid}, ${body.gas_flow_pct}, ${body.battery_v}, ${body.status}
      )
    `;

    return NextResponse.json(
      { success: true, message: "Data synced" },
      { status: 201 },
    );
  } catch (error) {
    console.error("Hardware Ingestion Error:", error);
    return NextResponse.json({ error: "Failed to save data" }, { status: 500 });
  }
}
