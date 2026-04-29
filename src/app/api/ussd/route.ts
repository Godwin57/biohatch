import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const textData = await req.text();
    const params = new URLSearchParams(textData);

    // Extract the variables sent by the telecom provider
    const sessionId = params.get("sessionId");
    const phoneNumber = params.get("phoneNumber");
    const text = params.get("text") || "";

    let response = "";

    // 2. USSD Routing Logic
    // If 'text' is empty, it's the very first time the farmer dialed the code
    if (text === "") {
      response = `CON Welcome to BioHatch Farm Hub
Please select an option:
1. Check Incubator Status
2. Trigger Manual Turn
3. Emergency Lockdown`;
    } else if (text === "1") {
      response = `END BioHatch (Unit 04-A)
Day: 14/21
Temp: 37.6C (Optimal)
Humidity: 53%
Gas Flow: 45%`;
    } else if (text === "2") {
      response = `END Command Queued.
The egg tray will rotate to 45 degrees on the next hardware sync.`;
    } else if (text === "3") {
      response = `END EMERGENCY PROTOCOL ACTIVE.
Gas valve shut off. Humidity raised for lockdown.`;
    } else {
      response = `END Invalid choice. Please dial the shortcode again.`;
    }

    return new NextResponse(response, {
      headers: { "Content-Type": "text/plain" },
    });
  } catch (error) {
    console.error("USSD Webhook Error:", error);
    return new NextResponse("END System Error. Please try again later.", {
      headers: { "Content-Type": "text/plain" },
    });
  }
}
