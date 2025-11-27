import { GoogleGenAI, Type, Schema } from "@google/genai";
import { StrategicAnalysis, GeneratedContent, GenerationRequest, Archetype } from "../types";

// Helper to ensure API Key exists
const getClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API_KEY is missing via process.env.API_KEY");
  }
  return new GoogleGenAI({ apiKey });
};

// --- SYSTEM 2: STEP 1 - THE STRATEGIST ---
export const generateStrategy = async (req: GenerationRequest): Promise<StrategicAnalysis> => {
  const ai = getClient();
  
  const systemInstruction = `
    You are the Chief Brand Strategist for a high-end agency. 
    Your goal is Brand Safety and Strategic Alignment.
    
    ARCHETYPE: ${req.brand.archetype}
    BRAND MISSION: ${req.brand.mission}
    BRAND TONE: ${req.brand.tone}
    CONSTRAINTS: ${req.brand.constraints}
    
    Analyze the user's request. Do NOT generate the final content yet. 
    Think deeply about the risks, the angle, and the alignment.
    
    Output JSON only.
  `;

  const prompt = `
    Request Topic: ${req.topic}
    Context: ${req.context}
    Target Audience: ${req.targetAudience}
    
    Provide a strategic analysis.
  `;

  const responseSchema: Schema = {
    type: Type.OBJECT,
    properties: {
      marketAnalysis: { type: Type.STRING, description: "Brief analysis of the current market context for this topic." },
      strategicAngle: { type: Type.STRING, description: "The unique angle we will take to stand out." },
      alignmentCheck: { type: Type.STRING, description: "Confirming this aligns with brand mission. Flag potential risks." },
      toneInstruction: { type: Type.STRING, description: "Specific instructions for the copywriter." }
    },
    required: ["marketAnalysis", "strategicAngle", "alignmentCheck", "toneInstruction"]
  };

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: prompt,
    config: {
      systemInstruction,
      responseMimeType: "application/json",
      responseSchema,
      temperature: 0.2 // Low temperature for analytical rigor
    }
  });

  const text = response.text;
  if (!text) throw new Error("Strategy generation failed");
  
  return JSON.parse(text) as StrategicAnalysis;
};

// --- SYSTEM 2: STEP 2 - THE EXECUTOR ---
export const generateFinalContent = async (
  req: GenerationRequest, 
  strategy: StrategicAnalysis
): Promise<GeneratedContent> => {
  const ai = getClient();

  const systemInstruction = `
    You are a Senior Copywriter and Art Director.
    Execute the content based strictly on the provided STRATEGY.
    
    STRATEGY ANGLE: ${strategy.strategicAngle}
    TONE INSTRUCTIONS: ${strategy.toneInstruction}
    VISUAL PRESET: ${req.preset}
    
    Your visual prompt must be highly detailed, photorealistic, and match the "Onyx Prestige" aesthetic if applicable, 
    but strictly following the specific Visual Preset requirements for the ${req.brand.archetype}.
  `;

  const prompt = `
    Write a LinkedIn/Social post about: ${req.topic}
    Audience: ${req.targetAudience}
    
    Also provide a detailed prompt for an image generation model (like Imagen 3) that visualizes this concept.
  `;

  const responseSchema: Schema = {
    type: Type.OBJECT,
    properties: {
      headline: { type: Type.STRING },
      body: { type: Type.STRING },
      imagePrompt: { type: Type.STRING, description: "A highly detailed prompt for an image generator." },
      rationale: { type: Type.STRING, description: "Why this content is safe and aligned." }
    },
    required: ["headline", "body", "imagePrompt", "rationale"]
  };

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: prompt,
    config: {
      systemInstruction,
      responseMimeType: "application/json",
      responseSchema,
      temperature: 0.7 // Higher for creativity within constraints
    }
  });

  const text = response.text;
  if (!text) throw new Error("Content generation failed");
  
  return JSON.parse(text) as GeneratedContent;
};

// --- SYSTEM 2: STEP 3 - VISUALIZATION ---
export const generateVisual = async (imagePrompt: string): Promise<string> => {
  const ai = getClient();
  
  // Try to use Imagen if available, or fallback to standard generation if specific model not allowed
  // Using the requested prompt instruction for image gen
  try {
    const response = await ai.models.generateImages({
      model: 'imagen-3.0-generate-001',
      prompt: imagePrompt,
      config: {
        numberOfImages: 1,
        aspectRatio: '1:1',
      }
    });
    
    if (response.generatedImages && response.generatedImages.length > 0) {
        return `data:image/png;base64,${response.generatedImages[0].image.imageBytes}`;
    }
    throw new Error("No image generated");

  } catch (error) {
    console.warn("Imagen generation failed, falling back to placeholder logic or error handling", error);
    // Fallback: Use Picsum with a seed based on prompt length for consistency
    return `https://picsum.photos/seed/${imagePrompt.length}/800/800`;
  }
};