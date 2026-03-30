import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/Bolt Database-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface LearningStep {
  title: string;
  description: string;
}

function generatePlaceholderImage(concept: string, stepIndex: number): string {
  const colors = [
    "4F46E5", "DC2626", "2563EB", "059669", "D97706", "7C3AED",
    "0891B2", "EA580C", "DB2777", "6366F1"
  ];
  const color = colors[(stepIndex + concept.length) % colors.length];

  const encodedConcept = encodeURIComponent(`${concept} - Step ${stepIndex + 1}`);

  return `https://via.placeholder.com/1024x1024/${color}/FFFFFF?text=${encodedConcept}`;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const { concept } = await req.json();

    if (!concept || typeof concept !== "string") {
      return new Response(
        JSON.stringify({ error: "Invalid concept provided" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const geminiApiKey = Deno.env.get("GEMINI_API_KEY");
    if (!geminiApiKey) {
      return new Response(
        JSON.stringify({
          error: "Gemini API key not configured. Please add your GEMINI_API_KEY to edge function secrets. Get a free key at https://ai.google.dev",
        }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const Bolt Database = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const complexity = concept.length + (concept.split(" ").length * 2);
    const numSteps = Math.max(4, Math.min(8, Math.floor(complexity / 10)));

    const prompt = `You are an expert educator. Break down the concept "${concept}" into exactly ${numSteps} sequential learning steps. Each step should build on the previous one.

For EACH step, provide:
1. A clear title (5-8 words)
2. A detailed explanation (2-3 sentences)

Return ONLY a valid JSON array with this exact structure, no other text:
[
  {
    "title": "Step title here",
    "description": "Explanation here"
  }
]

Make sure the JSON is valid and contains exactly ${numSteps} objects.`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiApiKey}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              role: "user",
              parts: [
                {
                  text: prompt,
                },
              ],
            },
          ],
          generationConfig: {
            temperature: 0.7,
            topP: 0.95,
            topK: 64,
            maxOutputTokens: 2048,
          },
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.text();
      console.error(`Gemini API error status: ${response.status}`);
      console.error(`Gemini API error body: ${errorData}`);
      throw new Error(`Gemini API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    if (!data.candidates || !data.candidates[0]) {
      console.error("Invalid Gemini response:", JSON.stringify(data));
      throw new Error("Invalid response from Gemini API");
    }

    const content = data.candidates[0].content.parts[0].text;

    let learningSteps: LearningStep[] = [];
    const jsonMatch = content.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      learningSteps = JSON.parse(jsonMatch[0]);
    } else {
      throw new Error("Failed to parse AI response");
    }

    const { data: conceptData, error: conceptError } = await Bolt Database
      .from("concepts")
      .insert({ name: concept })
      .select()
      .single();

    if (conceptError) throw conceptError;

    const cardsToInsert = learningSteps.map((step, index) => ({
      concept_id: conceptData.id,
      sequence: index + 1,
      title: step.title,
      description: step.description,
      image_url: generatePlaceholderImage(concept, index),
    }));

    const { data: cards, error: cardsError } = await Bolt Database
      .from("learning_cards")
      .insert(cardsToInsert)
      .select();

    if (cardsError) throw cardsError;

    return new Response(
      JSON.stringify({
        cards: cards.map((card) => ({
          id: card.id,
          sequence: card.sequence,
          title: card.title,
          description: card.description,
          imageUrl: card.image_url,
        })),
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "An unexpected error occurred",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
