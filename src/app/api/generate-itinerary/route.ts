import { NextResponse } from 'next/server';
import Groq from 'groq-sdk';

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export async function POST(req: Request) {
  try {
    const { destination, startDate, endDate, budget } = await req.json();
    const budgetConstraint = budget && budget > 0 ? `The total cost of ALL activities across all days MUST NOT exceed $${budget}. Distribute this budget realistically.` : "Plan a balanced trip.";

    console.log("Generating itinerary for:", { destination, startDate, endDate, budget });

    if (!process.env.GROQ_API_KEY) {
      console.error("GROQ_API_KEY is missing in environment variables");
      return NextResponse.json({ error: 'API Key Configuration Error' }, { status: 500 });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const durationDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

    const prompt = `
      Create a comprehensive ${durationDays}-day travel itinerary for ${destination}.
      ${budgetConstraint}
      STRICT REQUIREMENTS:
      1. You MUST provide exactly ${durationDays} items in the "days" array (Day 1 to Day ${durationDays}).
      2. For EVERY day, you MUST provide 3-4 varied activities (e.g., Morning, Afternoon, Evening, and a Meal/Night spot).
      3. Do NOT provide just one activity per day. Each day should be a full schedule.
      
      Output ONLY valid JSON in this format:
      {
        "days": [
          {
            "dayNumber": 1,
            "cityName": "${destination}",
            "activities": [
              { 
                "name": "Morning Activity", 
                "cost": 30, 
                "duration": 120, 
                "category": "Sightseeing", 
                "timeStart": "09:00",
                "description": "Morning description.",
                "famousFor": "Iconic reason.",
                "imageSearchKeyword": "Photo keyword"
              },
              { 
                "name": "Afternoon Activity", 
                "cost": 50, 
                "duration": 180, 
                "category": "Culture", 
                "timeStart": "13:30",
                "description": "Afternoon description.",
                "famousFor": "Iconic reason.",
                "imageSearchKeyword": "Photo keyword"
              },
              { 
                "name": "Evening Experience", 
                "cost": 40, 
                "duration": 120, 
                "category": "Dining", 
                "timeStart": "19:00",
                "description": "Evening description.",
                "famousFor": "Iconic reason.",
                "imageSearchKeyword": "Photo keyword"
              }
            ]
          }
        ]
      }
    `;

    try {
      const chatCompletion = await groq.chat.completions.create({
        messages: [
          {
            role: 'system',
            content: 'You are a travel planning API that only outputs JSON.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        model: 'llama-3.3-70b-versatile',
        temperature: 0.3,
        response_format: { type: "json_object" },
      });

      const content = chatCompletion.choices[0]?.message?.content || '{}';
      console.log("Groq Response:", content);
      
      const parsedItinerary = JSON.parse(content);
      return NextResponse.json(parsedItinerary);
    } catch (groqError: any) {
      console.error("Groq SDK Error:", groqError);
      return NextResponse.json({ 
        error: 'Groq Service Error', 
        details: groqError.message,
        type: groqError.constructor.name
      }, { status: 500 });
    }
  } catch (error: any) {
    console.error("General API Error:", error);
    return NextResponse.json(
      { error: 'Server Error', details: error.message },
      { status: 500 }
    );
  }
}
