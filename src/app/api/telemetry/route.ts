export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";
import twilio from "twilio";

const DEVICE_ID = "BH_UNIZIK_001";
const EXPECTED_API_KEY = process.env.API_KEY;

// Initialize Twilio Client
const twilioClient = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN,
);

// Helper function to send SMS safely without crashing the API
async function sendFarmerSMS(message: string) {
  try {
    if (!process.env.FARMER_PHONE_NUMBER || !process.env.TWILIO_PHONE_NUMBER) {
      console.warn("Twilio ENV variables missing. Skipping SMS.");
      return;
    }
    await twilioClient.messages.create({
      body: message,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: process.env.FARMER_PHONE_NUMBER,
    });
    console.log(`SMS Sent successfully: "${message}"`);
  } catch (error) {
    console.error("Twilio SMS Failed:", error);
  }
}

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
    // const apiKey = req.headers.get("x-api-key");
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

    const sql = neon(dbUrl);

    // --- EDGE DETECTION (ANTI-SPAM LOGIC) ---
    // Fetch the absolute latest reading before we save this new one
    const prevDataResult = await sql`
      SELECT "waterTemp", "currentDay", "chamberHumid" FROM "Telemetry"
      WHERE "incubatorId" = ${body.device_id || DEVICE_ID}
      ORDER BY "createdAt" DESC
      LIMIT 1
    `;

    // If we have previous data, compare it to the incoming data
    if (prevDataResult.length > 0) {
      const prevData = prevDataResult[0];

      // A. THERMAL EMERGENCY (Only trigger if it WAS normal, and IS NOW critical)
      if (prevData.waterTemp <= 39.0 && body.water_temp > 39.0) {
        await sendFarmerSMS(
          `🚨 URGENT: BioHatch temperature is critical at ${body.water_temp}°C! Check the incubator immediately.`,
        );
      }

      // B. DAY 18 LOCKDOWN (Only trigger exactly when it shifts from Day 17 to Day 18)
      if (prevData.currentDay === 17 && body.current_day === 18) {
        await sendFarmerSMS(
          `🐣 BioHatch: Day 18 Lockdown initiated. Target humidity increased to 68%. Prepare the brooder.`,
        );
      }

      // C. LOW WATER ALERT (Only trigger if humidity falls below 45%)
      if (prevData.chamberHumid >= 45.0 && body.chamber_humid < 45.0) {
        await sendFarmerSMS(
          `⚠️ Warning: BioHatch humidity dropped to ${body.chamber_humid}%. Please check and refill the water reservoir.`,
        );
      }
    }

    const newId = crypto.randomUUID();

    await sql`
      INSERT INTO "Telemetry" (
        "id", "incubatorId", "currentDay", "waterTemp", "chamberHumid", 
        "gasFlowPct", "batteryV", "status"
      ) VALUES (
        ${newId}, ${body.device_id}, ${body.current_day}, ${body.water_temp}, 
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
