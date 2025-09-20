import { aiJournaling, AIJournalingInput } from "@/ai/flows/ai-journaling";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body: AIJournalingInput = await request.json();
    const { journalEntry } = body;

    if (!journalEntry) {
      return NextResponse.json(
        { error: "journalEntry is required" },
        { status: 400 }
      );
    }

    const result = await aiJournaling({ journalEntry });

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error in chat API:", error);
    const errorMessage =
      error instanceof Error ? error.message : "An unknown error occurred";
    return NextResponse.json(
      { error: "Failed to get AI response", details: errorMessage },
      { status: 500 }
    );
  }
}