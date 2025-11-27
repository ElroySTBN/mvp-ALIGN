// ARCHETYPES
export enum Archetype {
  SPACE = 'SPACE',     // Real Estate, Hotels
  PRODUCT = 'PRODUCT', // E-commerce, Retail
  SERVICE = 'SERVICE'  // Consulting, Agencies
}

export enum VisualPreset {
  // SPACE
  LISTING = 'LISTING',
  AMBIANCE = 'AMBIANCE',
  // PRODUCT
  STUDIO = 'STUDIO',
  LIFESTYLE = 'LIFESTYLE',
  // SERVICE
  AUTHORITY = 'AUTHORITY',
  CRAFT = 'CRAFT',
  CORPORATE = 'CORPORATE'
}

// DATA STRUCTURES
export interface BrandProfile {
  name: string;
  archetype: Archetype;
  mission: string;
  tone: string;
  constraints: string; // Negative prompts / forbidden topics
}

export interface AssetLocker {
  // Space
  spaceUrls?: string[];
  exteriorUrls?: string[];
  // Product
  productUrls?: string[];
  textureUrls?: string[];
  // Service
  teamUrls?: string[];
  actionUrls?: string[];
}

// AI STRATEGY (SYSTEM 2)
export interface StrategicAnalysis {
  marketAnalysis: string;
  strategicAngle: string;
  alignmentCheck: string;
  toneInstruction: string;
}

export interface GeneratedContent {
  headline: string;
  body: string;
  imagePrompt: string; // The prompt sent to image gen
  imageUrl?: string;   // The result
  rationale: string;   // Why the AI chose this
}

export interface GenerationRequest {
  topic: string;
  context: string;
  targetAudience: string;
  brand: BrandProfile;
  preset: VisualPreset;
}