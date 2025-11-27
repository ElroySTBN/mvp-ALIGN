
import { GoogleGenAI, Type, Schema } from "@google/genai";
import { StrategicAnalysis, GeneratedContent, GenerationRequest, Archetype, VisualPreset } from "../types";

// Helper to ensure API Key exists
const getClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API_KEY is missing via process.env.API_KEY");
  }
  return new GoogleGenAI({ apiKey });
};

// --- SYSTEM 2: VISUAL RULES ENGINE ---
const getVisualInstruction = (archetype: Archetype, preset: VisualPreset): string => {
  const RULES: Record<string, string> = {
    // SPACE
    [`${Archetype.SPACE}_${VisualPreset.LISTING}`]: 
      "Photography style: Architectural Digest. Technical: Wide angle 16mm lens, f/8, natural light, vertical lines corrected. Mood: Airy, spacious, pristine.",
    [`${Archetype.SPACE}_${VisualPreset.AMBIANCE}`]: 
      "Photography style: Boutique Hotel Editorial. Technical: 50mm lens, f/1.8, bokeh effect, warm evening light, focus on textures (velvet, wood).",
    
    // PRODUCT
    [`${Archetype.PRODUCT}_${VisualPreset.STUDIO}`]: 
      "Photography style: High-end Commercial. Technical: Macro lens 100mm, hard studio lighting, infinite background, sharp focus, 8k resolution.",
    [`${Archetype.PRODUCT}_${VisualPreset.LIFESTYLE}`]: 
      "Photography style: Social Media Influencer. Technical: 35mm lens, natural chaotic light, shallow depth of field, product placed in a living environment.",
    
    // SERVICE
    [`${Archetype.SERVICE}_${VisualPreset.AUTHORITY}`]: 
      "Photography style: Forbes Portrait. Technical: 85mm portrait lens, rim lighting, confident pose, blurred office background.",
    [`${Archetype.SERVICE}_${VisualPreset.CRAFT}`]: 
      "Photography style: National Geographic Workshop. Technical: Close-up on hands, motion blur on tools, high contrast, gritty texture.",
    [`${Archetype.SERVICE}_${VisualPreset.CORPORATE}`]: 
      "Photography style: Modern Tech Company. Technical: Wide shot, symmetry, glass and steel environment, diverse team interaction."
  };

  return RULES[`${archetype}_${preset}`] || "Photography style: Professional, high resolution, consistent lighting.";
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
  const visualRule = getVisualInstruction(req.brand.archetype, req.preset);

  const systemInstruction = `
    You are a Senior Copywriter and Art Director.
    Execute the content based strictly on the provided STRATEGY.
    
    STRATEGY ANGLE: ${strategy.strategicAngle}
    TONE INSTRUCTIONS: ${strategy.toneInstruction}
    
    --- VISUAL DIRECTOR INSTRUCTIONS (STRICT) ---
    You must generate an image prompt that adheres to these physics/camera rules:
    ${visualRule}
    
    The image prompt should be descriptive, referencing specific lighting, lens type, and composition mentioned above.
    
    --- COPYWRITING INSTRUCTIONS ---
    Adhere to the brand constraints: ${req.brand.constraints}
    Tone: ${req.brand.tone}
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
