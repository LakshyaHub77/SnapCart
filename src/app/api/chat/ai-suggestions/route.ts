import connectDb from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    await connectDb();

    const { message, role } = await req.json();

    if (!message || !role) {
      return NextResponse.json(
        { message: "Missing fields" },
        { status: 400 }
      );
    }

    const prompt = `
You are a professional delivery assistant chatbot.

You will be given:
- role: either "user" or "delivery_boy"
- last message: the last message sent in the conversation

Your task:
If role is "user":
Generate 3 short WhatsApp-style replies a user can send.

If role is "delivery_boy":
Generate 3 short WhatsApp-style replies a delivery boy can send.

Rules:
- max 10 words
- natural human tone
- relevant to delivery/location/order
- at most one emoji
- no numbering
- no explanations
- return only comma-separated replies

Role: ${role}
Last message: ${message}
`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: prompt,
                },
              ],
            },
          ],
        }),
      }
    );

    const data = await response.json();

    const replyText =
      data?.candidates?.[0]?.content?.parts?.[0]?.text || "";

    const suggestions = replyText
      .replace(/\n/g, ",")
      .split(",")
      .map((s: string) => s.trim())
      .filter(Boolean)
      .slice(0, 3);

    if (suggestions.length === 0) {
      return NextResponse.json([
        "I’m nearby 🚴",
        "Reaching in 5 minutes",
        "Please share location",
      ]);
    }

    return NextResponse.json(suggestions, { status: 200 });
  } catch (error) {
    console.log(error);

    return NextResponse.json(
      {
        message: "Gemini API Error",
      },
      { status: 500 }
    );
  }
}