
import { GoogleGenAI, Type } from "@google/genai";
import { NewsItem, SearchFilters, NewsImpact } from "../types";

export const fetchNewsWithGemini = async (
  filters: SearchFilters, 
  page: number = 1, 
  coords?: { latitude: number; longitude: number },
  previousHeadlines: string[] = []
): Promise<{ news: NewsItem[]; impactData: any[] }> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

  let locationContext = "";
  if (filters.country === 'Local' && coords) {
    locationContext = `The user is currently at coordinates (Latitude: ${coords.latitude}, Longitude: ${coords.longitude}). Prioritize news stories specifically relevant to this local region/city/state/country.`;
  } else if (filters.country === 'Local' && !coords) {
    locationContext = "The user requested local news but location access was denied. Fallback to general global breaking news.";
  } else {
    locationContext = `Target Country/Region: ${filters.country}`;
  }

  const outputLanguage = filters.language === 'pt' ? 'Portuguese' : 'English';
  
  // Provide the model with a few existing headlines to avoid
  const avoidList = previousHeadlines.length > 0 
    ? `IMPORTANT: Do NOT return any of these stories or very similar ones: ${previousHeadlines.slice(-15).join(', ')}.`
    : "";

  const prompt = `
    Acts as a professional news aggregator. 
    Find exactly 10 NEW news stories for the current batch (Batch #${page}).
    The news must be from the last 24-48 hours based on these filters:
    - Theme: ${filters.theme}
    - Location Context: ${locationContext}
    - World Impact Target: ${filters.impact}
    - Specific Keywords: ${filters.query || 'latest breaking news'}

    ${avoidList}

    CRITICAL: All generated text (title, summary, category) MUST be in ${outputLanguage}.
    UNIFORMITY: Do NOT repeat news stories that have already been presented. Every batch must contain unique, distinct events or significantly different updates.

    IMPORTANT: Sort the 10 items in the response such that the MOST RECENT and MOST IMPACTFUL (highest importance and urgency) news items appear FIRST in the array. 

    For each of the 10 news items, you MUST provide:
    1. A catchy headline in ${outputLanguage}.
    2. A brief 2-sentence professional summary in ${outputLanguage}.
    3. An impact score from 1 (Minor/Local) to 10 (Major Global/Urgent).
    4. The primary category in ${outputLanguage}.
    5. The country of origin.
    6. Accurate timestamp (ISO format).
    7. (Optional) A representative image URL ONLY if you can identify a highly relevant and accessible public one. If not sure, leave null.

    Use Google Search to find the most up-to-date information.
    Format your response as a valid JSON array of objects.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              summary: { type: Type.STRING },
              impactScore: { type: Type.NUMBER },
              category: { type: Type.STRING },
              country: { type: Type.STRING },
              timestamp: { type: Type.STRING },
              imageUrl: { type: Type.STRING, description: "A relevant news image URL or null" }
            },
            required: ["title", "summary", "impactScore", "category", "country", "timestamp"]
          }
        }
      },
    });

    const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    let newsData: any[] = [];
    
    try {
      newsData = JSON.parse(response.text || '[]');
    } catch (e) {
      console.error("Failed to parse Gemini JSON output", e);
      return { news: [], impactData: [] };
    }

    // Map news data with grounding sources
    const mappedNews: NewsItem[] = newsData.map((item, index) => {
      const sources = groundingChunks
        .filter(chunk => chunk.web)
        .slice(index * 2, index * 2 + 2)
        .map(chunk => ({
          title: chunk.web?.title || 'Original Source',
          uri: chunk.web?.uri || '#'
        }));

      return {
        id: `news-${page}-${index}-${Date.now()}`,
        title: item.title,
        summary: item.summary,
        category: item.category,
        country: item.country,
        impactScore: item.impactScore,
        timestamp: item.timestamp || new Date().toISOString(),
        sources: sources.length > 0 ? sources : [{ title: 'View Source', uri: `https://www.google.com/search?q=${encodeURIComponent(item.title)}` }],
        imageUrl: item.imageUrl || undefined
      };
    });

    return { news: mappedNews, impactData: [] };
  } catch (error) {
    console.error("Gemini News Fetch Error:", error);
    throw error;
  }
};
