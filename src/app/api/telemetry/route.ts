import { NextResponse } from 'next/server';

export async function GET() {
  const mockTelemetry = {
    currentDay: 14, 
    
    // Fluctuates between 37.3°C and 37.7°C
    waterTemp: 37.5 + (Math.random() * 0.4 - 0.2), 
    
    // Fluctuates between 53% and 55%
    chamberHumid: 53 + Math.floor(Math.random() * 3), 
    gasFlowPct: 45, 
    status: "TURNING_PHASE"
  };

  //fake 500ms network delay to simulate real-world latency
  await new Promise((resolve) => setTimeout(resolve, 500));

  return NextResponse.json(mockTelemetry, { status: 200 });
}

export async function POST(req: Request) {
  // This empty POST route catches the hardware's data later.
  // For now, it just returns a 201 Created so the hardware doesn't crash during early testing.
  return NextResponse.json({ success: true, message: "Mock data received" }, { status: 201 });
}