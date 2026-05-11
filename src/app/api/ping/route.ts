export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";

export async function GET() {
  const dbUrl = process.env.DATABASE_URL;

  return NextResponse.json(
    {
      status: "Ping Successful",
      databaseUrlExists: !!dbUrl,
      urlLength: dbUrl ? dbUrl.length : 0,
      nodeEnv: process.env.NODE_ENV,
    },
    { status: 200 },
  );
}
