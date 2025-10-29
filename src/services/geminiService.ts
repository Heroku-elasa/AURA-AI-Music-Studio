import { GoogleGenAI, Type, Modality, GenerateContentResponse } from "@google/genai";
import { Language, MarketAnalysisMode, MusicIdeaDetails, ComprehensiveMusicResult, SearchResultItem, ProviderSearchResult, SearchQueryClassification, SongIdeaResult, ProducerProfile, Source, CostAnalysisResult, MusicGenerationEngine } from '../types';

if (!(process as any).env.API_KEY) {
    console.warn("API_KEY is not set. AI features will not work.");
}

// Fallback to an empty string to prevent a crash on startup if the API_KEY is not injected.
// API calls will fail gracefully later, and the error will be handled.
export const ai = new GoogleGenAI({ apiKey: (process as any).env.API_KEY || '' });
export const model = 'gemini-2.5-flash';

// =================================================================
// CUSTOM ERROR TYPES
// =================================================================

export type GeminiErrorCode =
  | 'QUOTA_EXCEEDED'
  | 'NETWORK_ERROR'
  | 'PARSE_ERROR'
  | 'BAD_REQUEST'
  | 'UNKNOWN_ERROR';

export class GeminiApiError extends Error {
  public code: GeminiErrorCode;
  public originalError?: any;

  constructor(message: string, code: GeminiErrorCode, originalError?: any) {
    super(message);
    this.name = 'GeminiApiError';
    this.code = code;
    this.originalError = originalError;
  }
}


// =================================================================
// PRIVATE HELPERS
// =================================================================

/**
 * A centralized error handler for all Gemini API calls.
 * @param error The original error caught.
 * @throws {GeminiApiError} A more specific, classified error.
 */
function handleGeminiError(error: any): never {
    console.error("Gemini Service Error:", error);

    if (error instanceof GeminiApiError) {
        throw error;
    }

    let message = "An unknown error occurred while communicating with the AI.";
    let code: GeminiErrorCode = 'UNKNOWN_ERROR';

    if (error && typeof error.message === 'string') {
        const lowerCaseMessage = error.message.toLowerCase();
        if (lowerCaseMessage.includes('quota') || lowerCaseMessage.includes('429')) {
            message = "API quota has been exceeded. Please check your billing or try again later.";
            code = 'QUOTA_EXCEEDED';
        } else if (lowerCaseMessage.includes('failed to fetch')) {
            message = "A network error occurred. Please check your connection and try again.";
            code = 'NETWORK_ERROR';
        } else if (lowerCaseMessage.includes('invalid json')) {
             message = "The AI returned an invalid response. Please try again.";
             code = 'PARSE_ERROR';
        } else if (lowerCaseMessage.includes('400') || lowerCaseMessage.includes('bad request')) {
            message = "The request sent to the AI was invalid. Please check your input.";
            code = 'BAD_REQUEST';
        } else if (lowerCaseMessage.includes('empty response from ai model')) {
            message = "The AI returned an empty response. Please try a different query.";
            code = 'PARSE_ERROR';
        } else {
             message = error.message;
        }
    }
    
    throw new GeminiApiError(message, code, error);
}

/**
 * A generic helper to call the Gemini API and parse a JSON response.
 * @param prompt The prompt to send to the model.
 * @param schema The optional response schema for typed JSON.
 * @returns The parsed JSON object of type T.
 */
async function generateAndParseJson<T>(prompt: string, schema?: any): Promise<T> {
    try {
        const response = await ai.models.generateContent({
            model,
            contents: prompt,
            config: { 
                responseMimeType: "application/json",
                ...(schema && { responseSchema: schema })
            }
        });
        
        const text = response.text;
        if (!text) {
            throw new Error("Received empty response from AI model.");
        }

        try {
            const result = JSON.parse(text);
            if (result === null || (typeof result !== 'object' && !Array.isArray(result))) {
                 throw new Error("Parsed JSON is not a valid object or array.");
            }
            return result as T;
        } catch (e) {
            console.error("Failed to parse JSON response:", text, e);
            throw new Error("AI returned invalid JSON.");
        }
    } catch (error) {
        handleGeminiError(error);
    }
}

/**
 * A generic helper for text-based generation, which may include tools like Google Search.
 * @param prompt The prompt to send to the model.
 * @param tools Optional tools configuration.
 * @returns The full GenerateContentResponse object.
 */
async function generateWithTools(prompt: string, tools: any[]): Promise<GenerateContentResponse> {
    try {
        const response = await ai.models.generateContent({
            model,
            contents: prompt,
            config: { tools }
        });
        if (response.text === null || typeof response.text === 'undefined') {
            throw new Error("Received empty text response from AI model.");
        }
        return response;
    } catch (error) {
        handleGeminiError(error);
    }
}

/**
 * A generic helper for plain text generation.
 * @param prompt The prompt to send to the model.
 * @returns The generated text.
 */
async function generateText(prompt: string): Promise<string> {
    try {
        const response = await ai.models.generateContent({ model, contents: prompt });
        return response.text;
    } catch (error) {
        handleGeminiError(error);
    }
}


/**
 * A helper to generate speech from text using the TTS model.
 * @param text The text to convert to speech.
 * @returns A base64 encoded string of the audio data.
 */
async function generateAudio(text: string): Promise<string> {
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash-preview-tts',
            contents: [{ parts: [{ text }] }],
            config: {
                responseModalities: [Modality.AUDIO],
                speechConfig: {
                    voiceConfig: {
                        prebuiltVoiceConfig: { voiceName: 'Kore' },
                    },
                },
            },
        });
        const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
        if (!base64Audio) {
            throw new Error("No audio data received from API.");
        }
        return base64Audio;
    } catch (error) {
        handleGeminiError(error);
    }
}

// =================================================================
// PROMPT BUILDERS
// =================================================================

const buildComprehensiveAnalysisPrompt = (idea: string, ideaDetails: MusicIdeaDetails, language: Language): string => `
    You are a helpful AI assistant for a music production studio called AURA. Analyze the following user-described musical idea and provide a comprehensive, multi-faceted creative analysis.

    User's primary idea: "${idea}"
    
    Additional details provided:
    - Reference artists: ${ideaDetails.referenceArtists || 'Not specified'}
    - Specific instruments: ${ideaDetails.specificInstruments || 'Not specified'}
    - Target song length: ${ideaDetails.targetLength || 'Not specified'}
    - DAW/Software: ${ideaDetails.daw || 'Not specified'}
    - Existing melodies/lyrics: ${ideaDetails.existingIdeas || 'Not specified'}

    Your response MUST be a single, valid JSON object. The language for all user-facing text content within the JSON MUST be ${language}.
    
    The JSON object must have the following structure and content:
    {
      "songConcept": {
        "key": "e.g., C Minor, G# Major",
        "tempo": "A descriptive tempo and BPM, e.g., 'Slow and melancholic (75 BPM)'",
        "mood": ["List of 3-4 mood descriptors as strings, e.g., 'Nostalgic', 'Hopeful'"],
        "suggestedInstruments": ["List of 3-5 recommended instruments as strings."],
        "instrumentsToAvoid": ["List of 2-4 instruments to avoid as strings."],
        "productionSuggestions": ["List of 3 actionable production suggestions as strings, e.g., 'Use heavy sidechain compression on pads'"]
      },
      "productionConsultation": {
        "disclaimer": "A standard disclaimer that this is creative advice and experimentation is encouraged.",
        "recommendedProducers": ["List of 1-3 relevant producer archetypes, e.g., 'A modern hip-hop producer', 'An orchestral composer'"],
        "suggestedSongElements": [
          { "name": "Most relevant musical concept", "description": "Brief description of the concept, e.g., 'Modal Interchange'.", "relevance": "High", "suggestedStep": "A simple, clear next step for the user." },
          { "name": "Another possible concept", "description": "Brief description, e.g., 'Polyrhythms'", "relevance": "Medium", "suggestedStep": "A simple, clear next step." }
        ],
        "songStructure": {
            "name": "A common name for the structure, e.g., 'Verse-Chorus Structure'",
            "description": "A brief explanation of why this structure fits the user's idea.",
            "sections": [
                {"part": "Intro", "description": "A brief description of the intro's purpose and elements."},
                {"part": "Verse 1", "description": "A brief description of the first verse."},
                {"part": "Chorus", "description": "A brief description of the chorus."},
                {"part": "Verse 2", "description": "A brief description of the second verse."},
                {"part": "Chorus", "description": "Description of the second chorus."},
                {"part": "Bridge", "description": "Description of the bridge's purpose."},
                {"part": "Outro", "description": "Description of how to end the song."}
            ]
        },
        "productionTips": [
          { "icon": "emoji related to the tip", "title": "Tip Title", "description": "Brief description of a potential production technique." }
        ],
        "songwritingQuestions": ["List of 3-4 important creative questions the user could ask themselves."]
      },
      "genreSuggestion": {
        "styleName": "A catchy name for a suitable musical genre/subgenre (e.g., 'Atmospheric Synthwave', 'Minimalist Trap').",
        "description": "A short paragraph describing the genre and why it's suitable.",
        "keyElements": ["List of 3-4 key elements of this genre (e.g., 'Gated reverb on drums', 'Plucky basslines')."]
      },
      "melodyIdea": {
        "ideaName": "A name for a simple, relevant musical idea.",
        "description": "A brief sentence about the benefits of this idea for the user's concept.",
        "elements": ["Describe the idea in parts, e.g., 'A simple 4-note piano motif', 'A repeating rhythmic pattern'."],
        "instructions": "A single string containing numbered, step-by-step instructions for creating this idea in a DAW."
      }
    }
    `;

const buildSongIdeaPrompt = (description: string, language: Language): string => `
    You are an AI assistant for a music studio. Your task is to generate a musical concept based on the user's description.
    The user's description is: "${description}"

    Generate a single, valid JSON object that describes a musical concept. The language for all user-facing text content within the JSON MUST be ${language}.

    The JSON object must have the following structure:
    {
      "keyCharacteristics": {
        "key": "A suitable musical key (e.g., 'A Minor', 'F# Major')",
        "tempo": "A descriptive tempo and BPM (e.g., 'Moderato, ~110 BPM')",
        "mood": ["An array of 3-4 mood descriptor strings (e.g., 'Reflective', 'Melancholic', 'Hopeful')"]
      },
      "recommendedInstruments": ["An array of 3-5 recommended instrument strings (e.g., 'Acoustic Piano', 'String Section', 'Subtle Synth Pad')"],
      "instrumentsToAvoid": ["An array of 2-3 instruments to avoid for this mood (e.g., 'Heavy Electric Guitar', 'Aggressive Drums')"],
      "productionSuggestions": ["An array of 3-4 actionable production tip strings (e.g., 'Use a soft reverb with a long decay time', 'Consider using parallel compression on the piano')."]
    }
    `;

const buildProducersPrompt = (elements: string, idea: string, maxResults: number, language: Language): string => `
    You are an AI assistant for a modern music studio. Your goal is to find relevant music producers based on a user's preliminary AI-driven song analysis.
    The user's potential song elements are: ${elements}
    The user's primary idea is: ${idea}

    Generate a list of ${maxResults} hypothetical music producers who would be a good fit to work on this track.
    For each producer, create a plausible name, primary genre (specialty), city, and a short, professional bio.
    Also provide a relevance score as a number between 0 and 100.
    The response for user-facing fields (name, specialty, city, bio) must be in ${language}.
    `;

const buildMarketAnalysisPrompt = (query: string, language: Language, mode: MarketAnalysisMode): string => {
    let prompt = `Analyze the music market for "${query}". The response must be a markdown-formatted text in ${language}.`;

    switch (mode) {
        case 'in-depth':
            prompt += ` Provide an in-depth analysis including a detailed summary, key insights, emerging trends, opportunities, and risks.`;
            break;
        case 'swot':
            prompt += ` Provide a SWOT analysis (Strengths, Weaknesses, Opportunities, Threats).`;
            break;
        case 'quick':
        default:
            prompt += ` Provide a quick, concise summary.`;
            break;
    }
    
    prompt += ` Use Google Search to get up-to-date information. Also suggest some related queries or topics for further exploration at the end.`;
    return prompt;
};
    
const buildClassifyQueryPrompt = (query: string): string => `
        You are a search query classifier for a music studio website. Your job is to determine the user's intent.
        The user's query is: "${query}"

        Analyze the query.
        - If the query is asking to find a local business (e.g., "find guitar shops in London", "recording studios near me", "where can I buy a drum kit"), classify it as a 'provider_search'.
        - If the query is about anything else (e.g., "how to make a melody", "who are your producers", "music trends"), classify it as a 'general_search'.

        If it is a 'provider_search', determine if the user is looking for 'stores' or 'studios'.
        - 'stores': User is looking for instruments, gear, music shops.
        - 'studios': User is looking for recording, mixing, mastering services.

        Return a single JSON object with the following structure:
        - "type": "general_search" or "provider_search"
        - "providerType": "stores", "studios", or "none" (use "none" for general_search)
        - "searchQuery": The original user query.

        The response language is not important as this is for internal logic.
    `;
    
const buildSemanticSearchPrompt = (query: string, searchIndex: string, language: Language): string => `
        You are an intelligent search engine for the AURA Music Studio website.
        Search the following content index to find items relevant to the user's query.
        The user's query is: "${query}"

        The content index is:
        ---
        ${searchIndex}
        ---

        Return a JSON array of up to 5 relevant results.
        Each result object must have a "title", a "description", and a "targetPage".
        - The "title" should be the name of the service, producer, or page.
        - The "description" should be a brief, helpful explanation of why this result is relevant to the user's query.
        - The "targetPage" must be one of the following exact string values: 'home', 'music_generation', 'instrument_finder', 'ai_tutor', 'music_trends', 'our_producers', 'collaboration', 'my_projects'.

        The response language for the title and description fields must be ${language}.
        If there are no relevant results, return an empty array.
    `;
    
const buildLocalProvidersPrompt = (query: string, searchType: 'stores' | 'studios', userLocation: { lat: number; lon: number } | null, language: Language): string => {
    const locationInfo = userLocation
        ? `The user is at approximately latitude ${userLocation.lat} and longitude ${userLocation.lon}. When generating results, invent a plausible distance in kilometers (e.g., "approx. 2.5 km").`
        : "The user has not provided their location. The 'distance' field should be 'N/A'.";

    return `
        You are an AI assistant for the "AURA" music studio brand.
        Your task is to generate a list of 5 hypothetical ${searchType} that match the user's search query.
        The user's query is: "${query}".
        ${locationInfo}

        Generate plausible, fictional results.
        For each result, provide:
        - A unique 'id' (e.g., a UUID).
        - 'type': must be '${searchType === 'stores' ? 'store' : 'studio'}'.
        - 'name': a plausible name.
        - 'description': a short bio for a studio, or a description for a store.
        - 'address': a fictional but realistic address.
        - 'phone': a realistic phone number.
        - 'website': a URL using the example.com domain.
        - 'whatsapp': a realistic phone number (can be the same as 'phone').
        - 'distance': as instructed above.
        - 'services': provide a list of 3-5 relevant services (e.g., 'Guitar Repair', 'Vocal Recording').
        - 'specialty': IF the type is 'studio', provide a specialty (e.g., 'Mixing & Mastering', 'Vocal Production'). Otherwise, this can be an empty string.

        The response language for all user-facing text (name, description, etc.) MUST be ${language}.
        The output must be a valid JSON array matching the provided schema.
    `;
};

const buildCalculateCostsPrompt = (project: ComprehensiveMusicResult, idea: string, language: Language): string => `
    Provide an estimated production cost analysis in ${language} for a song based on this idea: "${idea}" and this AI analysis: ${JSON.stringify(project)}. Assume costs are in USD. The response must be a JSON object with one key "productionCosts", which is an array of objects. Each object should have "name", "estimatedCost" (as a number), and "unit" (e.g., 'per hour', 'flat fee'). Include items like studio time, mixing, mastering, and session musicians if relevant.
    `;

const buildSheetMusicABCPrompt = (description: string, language: Language, engine: MusicGenerationEngine): string => {
    const composerLine = {
        en: "Generated by AURA AI",
        fa: "تولید شده توسط هوش مصنوعی AURA",
        ar: "تم إنشاؤه بواسطة AURA AI"
    }[language];

    let engineInstruction = '';
    switch (engine) {
        case 'lilypond':
            engineInstruction = 'The generated music should be elegant and clean, suitable for high-quality engraving, reflecting the style of LilyPond.';
            break;
        case 'abjad':
            engineInstruction = 'The generated music can be more complex, algorithmic, or contemporary in style, reflecting the capabilities of Abjad.';
            break;
        case 'music21':
        default:
            engineInstruction = 'The generated music should be well-balanced and versatile, suitable for general-purpose analysis and performance, reflecting the style of Music21.';
            break;
    }

    return `
    You are an expert music theory AI assistant. Your task is to generate musical notation in ABC format based on a user's description.
    The response language for the title (T: field) should be "${language}".

    User description: "${description}"
    Selected Generation Engine Style: ${engine}. ${engineInstruction}

    ABC Notation Requirements:
    1.  Start with a reference number (X: 1).
    2.  Include a title based on the user's prompt (T: Title).
    3.  Include a composer (C: ${composerLine}).
    4.  Include a meter (M: e.g., 4/4).
    5.  Include a default note length (L: e.g., 1/4).
    6.  Include a key (K: e.g., C).
    7.  The melody should be simple and accurately represent the user's description and the selected engine's style. For "Twinkle Twinkle Little Star", the notes are "C C G G A A G-".

    Example for "Twinkle Twinkle Little Star" in C Major:
    X: 1
    T: Twinkle Twinkle Little Star
    C: AURA AI
    M: 4/4
    L: 1/4
    K: C
    C C G G | A A G- | F F E E | D D C- |
    G G F F | E E D- | G G F F | E E D- |
    C C G G | A A G- | F F E E | D D C- |

    Your response MUST contain ONLY the raw ABC notation code. Do NOT include any other text, explanations, or markdown backticks.
    `;
};


// =================================================================
// PUBLIC API
// =================================================================

export const generateComprehensiveMusicAnalysis = async (idea: string, ideaDetails: MusicIdeaDetails, language: Language): Promise<ComprehensiveMusicResult> => {
    const prompt = buildComprehensiveAnalysisPrompt(idea, ideaDetails, language);
    const result = await generateAndParseJson<ComprehensiveMusicResult>(prompt);
    if (!result.songConcept) {
        throw new Error("AI returned malformed JSON for comprehensive analysis.");
    }
    return result;
};

export const generateSongIdea = async (description: string, language: Language): Promise<SongIdeaResult> => {
    const prompt = buildSongIdeaPrompt(description, language);
    const result = await generateAndParseJson<SongIdeaResult>(prompt);
    if (!result.keyCharacteristics) {
        throw new Error("AI returned malformed JSON for song idea.");
    }
    return result;
};

export const generateProducers = async (elements: string, idea: string, maxResults: number, language: Language): Promise<Omit<ProducerProfile, 'id'>[]> => {
    const prompt = buildProducersPrompt(elements, idea, maxResults, language);
    const schema = {
        type: Type.ARRAY,
        items: {
            type: Type.OBJECT,
            properties: {
                name: { type: Type.STRING },
                specialty: { type: Type.STRING, description: "The producer's primary music genre." },
                city: { type: Type.STRING },
                bio: { type: Type.STRING, description: "A short, professional biography." },
                relevanceScore: { type: Type.INTEGER, description: "A score from 0 to 100 indicating relevance." },
            },
            required: ["name", "specialty", "city", "bio", "relevanceScore"],
        },
    };
    return generateAndParseJson<Omit<ProducerProfile, 'id'>[]>(prompt, schema);
};

export const generateMarketAnalysis = async (query: string, language: Language, mode: MarketAnalysisMode): Promise<{ text: string, sources: Source[] }> => {
    const prompt = buildMarketAnalysisPrompt(query, language, mode);
    const response = await generateWithTools(prompt, [{ googleSearch: {} }]);
    
    const text = response.text || '';
    const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    const sources = groundingChunks
        .map((chunk: any) => chunk.web ? { uri: chunk.web.uri, title: chunk.web.title || 'Untitled' } : null)
        .filter((s): s is Source => s !== null && !!s.uri);
    
    // Fix: Explicitly type the Map generic arguments to resolve a TypeScript type inference issue.
    const uniqueSources: Source[] = Array.from(new Map<string, Source>(sources.map(s => [s.uri, s])).values());
    
    return { text, sources: uniqueSources };
};

export const classifySearchQuery = async (query: string, language: Language): Promise<SearchQueryClassification> => {
    const prompt = buildClassifyQueryPrompt(query);
    const schema = {
        type: Type.OBJECT,
        properties: {
            type: { type: Type.STRING, enum: ["general_search", "provider_search"] },
            providerType: { type: Type.STRING, enum: ["stores", "studios", "none"] },
            searchQuery: { type: Type.STRING },
        },
        required: ["type", "providerType", "searchQuery"],
    };
    const result = await generateAndParseJson<SearchQueryClassification>(prompt, schema);
     if (!result.type) {
        throw new Error("AI returned malformed JSON for search classification.");
    }
    return result;
};

export const performSemanticSearch = async (query: string, searchIndex: string, language: Language): Promise<SearchResultItem[]> => {
    const prompt = buildSemanticSearchPrompt(query, searchIndex, language);
    const schema = {
        type: Type.ARRAY,
        items: {
            type: Type.OBJECT,
            properties: {
                title: { type: Type.STRING },
                description: { type: Type.STRING },
                targetPage: { type: Type.STRING },
            },
            required: ["title", "description", "targetPage"],
        },
    };
    return generateAndParseJson<SearchResultItem[]>(prompt, schema);
};

export const findLocalProviders = async (query: string, searchType: 'stores' | 'studios', userLocation: { lat: number; lon: number } | null, language: Language): Promise<ProviderSearchResult[]> => {
    const prompt = buildLocalProvidersPrompt(query, searchType, userLocation, language);
    const schema = {
        type: Type.ARRAY,
        items: {
            type: Type.OBJECT,
            properties: {
                id: { type: Type.STRING },
                type: { type: Type.STRING },
                name: { type: Type.STRING },
                description: { type: Type.STRING },
                services: { type: Type.ARRAY, items: { type: Type.STRING } },
                specialty: { type: Type.STRING },
                address: { type: Type.STRING },
                phone: { type: Type.STRING },
                website: { type: Type.STRING },
                whatsapp: { type: Type.STRING },
                distance: { type: Type.STRING },
            },
            required: ["id", "type", "name", "description", "address", "phone", "website", "whatsapp", "distance"],
        },
    };
    const results = await generateAndParseJson<any[]>(prompt, schema);
    return results.map((item: any) => ({
        ...item,
        services: item.services || [],
        specialty: item.type === 'studio' ? item.specialty : undefined,
    }));
};

export const calculateProductionCosts = async (project: ComprehensiveMusicResult, idea: string, language: Language): Promise<CostAnalysisResult> => {
    const prompt = buildCalculateCostsPrompt(project, idea, language);
    const result = await generateAndParseJson<CostAnalysisResult>(prompt);
    if (!result || !Array.isArray(result.productionCosts)) {
        throw new Error("AI returned malformed JSON for cost analysis.");
    }
    return result;
};

export const generateSheetMusicABC = async (description: string, language: Language, engine: MusicGenerationEngine): Promise<string> => {
    const prompt = buildSheetMusicABCPrompt(description, language, engine);
    const textResponse = await generateText(prompt);
    // ABC notation often comes with backticks from the model, so let's clean it up.
    return textResponse.replace(/`{1,3}(abc)?/g, '').trim();
};

export const generateSpeech = async (text: string): Promise<string> => {
    return generateAudio(text);
};