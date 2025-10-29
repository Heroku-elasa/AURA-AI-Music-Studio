

import { GoogleGenAI, Type } from "@google/genai";
import { Language, MarketAnalysisMode, MusicIdeaDetails, ComprehensiveMusicResult, SearchResultItem, ProviderSearchResult, ComprehensiveMusicResult as ProjectResult, SearchQueryClassification, SongIdeaResult } from '../types';

if (!process.env.API_KEY) {
    console.warn("API_KEY is not set. AI features will not work.");
}

// FIX: Use GoogleGenAI instead of deprecated GoogleGenerativeAI
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });
// FIX: Use recommended 'gemini-2.5-flash' model instead of deprecated 'gemini-1.5-flash'
const model = 'gemini-2.5-flash';

// FIX: Updated to use the modern `ai.models.generateContent` API
async function generateContent(prompt: string): Promise<string> {
    try {
        const response = await ai.models.generateContent({
            model,
            contents: prompt,
        });
        return response.text;
    } catch (error) {
        console.error("Error generating content:", error);
        throw new Error("Failed to get response from AI model.");
    }
}

export const generateComprehensiveMusicAnalysis = async (
    idea: string, 
    ideaDetails: MusicIdeaDetails, 
    language: Language
): Promise<ComprehensiveMusicResult> => {
    const prompt = `
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
        "arrangementAdvice": "A paragraph of general song structure advice (e.g., suggest a verse-chorus structure).",
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

    const response = await ai.models.generateContent({
        model,
        contents: prompt,
        config: { responseMimeType: "application/json" }
    });
    
    return JSON.parse(response.text);
};

export const generateSongIdea = async (
    description: string,
    language: Language
): Promise<SongIdeaResult> => {
    const prompt = `
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

    const response = await ai.models.generateContent({
        model,
        contents: prompt,
        config: { responseMimeType: "application/json" }
    });
    
    return JSON.parse(response.text);
};


export const generateSpecialists = (prompt: string): Promise<string> => {
    return generateContent(prompt);
};

export const generateMarketAnalysis = async (query: string, language: Language, mode: MarketAnalysisMode): Promise<string> => {
    let prompt = `Analyze the music market for "${query}". The response must be in ${language}.`;

    switch (mode) {
        case 'in-depth':
            prompt += ` Provide an in-depth analysis including a detailed summary, key insights, emerging trends, opportunities, and risks.`;
            break;
        case 'swot':
            prompt += ` Provide a SWOT analysis (Strengths, Weaknesses, Opportunities, Threats).`;
            break;
        case 'quick':
            prompt += ` Provide a quick, concise summary.`;
            break;
    }
    
    prompt += ` Use Google Search to get up-to-date information. The entire response must be a single JSON object with two keys: "text" (a markdown string with the analysis) and "sources" (an array of source objects, each with "uri" and "title").`;

    const response = await ai.models.generateContent({
        model,
        contents: prompt,
        config: {
            tools: [{ googleSearch: {} }],
        }
    });

    const text = response.text;
    const sources = response.candidates?.[0]?.groundingMetadata?.groundingChunks?.map(chunk => ({
        uri: chunk.web?.uri || '',
        title: chunk.web?.title || 'Untitled',
    })) || [];
    
    return JSON.stringify({ text, sources });
};

export const classifySearchQuery = async (query: string, language: Language): Promise<SearchQueryClassification> => {
    const prompt = `
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
    const schema = {
        type: Type.OBJECT,
        properties: {
            type: { type: Type.STRING, enum: ["general_search", "provider_search"] },
            providerType: { type: Type.STRING, enum: ["stores", "studios", "none"] },
            searchQuery: { type: Type.STRING },
        },
        required: ["type", "providerType", "searchQuery"],
    };

    const response = await ai.models.generateContent({
        model,
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: schema,
        },
    });

    return JSON.parse(response.text);
};


export const performSemanticSearch = async (query: string, searchIndex: string, language: Language): Promise<SearchResultItem[]> => {
    const prompt = `
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

    const response = await ai.models.generateContent({
        model,
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: {
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
            },
        },
    });

    return JSON.parse(response.text);
};

export const findLocalProviders = async (
    query: string,
    searchType: 'stores' | 'studios',
    userLocation: { lat: number; lon: number } | null,
    language: Language
): Promise<ProviderSearchResult[]> => {
    const locationInfo = userLocation
        ? `The user is at approximately latitude ${userLocation.lat} and longitude ${userLocation.lon}. When generating results, invent a plausible distance in kilometers (e.g., "approx. 2.5 km").`
        : "The user has not provided their location. The 'distance' field should be 'N/A'.";

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

    const prompt = `
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

    const response = await ai.models.generateContent({
        model,
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: schema,
        },
    });
    
    const results = JSON.parse(response.text);
    return results.map((item: any) => ({
        ...item,
        services: item.services || [],
        specialty: item.type === 'studio' ? item.specialty : undefined,
    }));
};


export const calculateProductionCosts = async (project: ProjectResult, idea: string, language: Language): Promise<any> => {
    const prompt = `Provide an estimated production cost analysis in ${language} for a song based on this idea: "${idea}" and this AI analysis: ${JSON.stringify(project)}. Assume costs are in USD. The response must be a JSON object with one key "productionCosts", which is an array of objects. Each object should have "name", "estimatedCost" (as a number), and "unit" (e.g., 'per hour', 'flat fee'). Include items like studio time, mixing, mastering, and session musicians if relevant.`;

    const response = await ai.models.generateContent({
        model,
        contents: prompt,
        config: { responseMimeType: "application/json" }
    });

    return JSON.parse(response.text);
};

export const generateAbcNotation = async (
    description: string,
    language: Language
): Promise<string> => {
    const prompt = `
You are an expert music theory AI assistant specializing in ABC notation.
The user wants to generate sheet music for the following description: "${description}"
Your task is to generate the corresponding music in ABC notation format.

Guidelines for your output:
1. Start the notation with standard headers like X: (reference number, e.g., 1), T: (title), M: (meter, e.g., 4/4), L: (default note length, e.g., 1/8), Q: (tempo, e.g., 1/4=120), and K: (key, e.g., Cmaj).
2. The title (T:) should be based on the user's prompt.
3. The key (K:) should be appropriate for the described mood.
4. The body of the notation should be a simple melody that fits the description. Make it at least 8 bars long.
5. Your response MUST contain ONLY the raw ABC notation text. Do NOT include any explanations, comments, or markdown formatting like \`\`\`abc ... \`\`\`.

The language of the Title (T:) field should be in ${language}.
`;
    try {
        const response = await ai.models.generateContent({
            model,
            contents: prompt,
        });
        // Clean the response to ensure it's valid ABC notation
        // Remove markdown backticks if they still appear
        return response.text.replace(/```(abc)?/g, '').trim();
    } catch (error) {
        console.error("Error generating ABC notation:", error);
        throw new Error("Failed to get ABC notation from AI model.");
    }
}