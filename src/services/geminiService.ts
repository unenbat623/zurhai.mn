import { GoogleGenAI, Type } from "@google/genai";
import { ZodiacSign, HoroscopeData, CompatibilityResult, TarotCard, NumerologyData, BirthChartInterpretation } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// Simple in-memory cache to reduce API calls
const cache: Record<string, { data: any; timestamp: number }> = {};
const CACHE_TTL = 1000 * 60 * 60; // 1 hour

async function callGemini<T>(key: string, fn: () => Promise<T>, useCache = true): Promise<T> {
  if (useCache && cache[key] && (Date.now() - cache[key].timestamp < CACHE_TTL)) {
    return cache[key].data;
  }

  try {
    const result = await fn();
    if (useCache) {
      cache[key] = { data: result, timestamp: Date.now() };
    }
    return result;
  } catch (error: any) {
    console.error("Gemini API Error:", error);
    
    // Check for 429 Quota Exceeded
    if (error?.message?.includes("429") || error?.status === 429 || (error?.code === 429)) {
       throw new Error("QUOTA_EXCEEDED");
    }
    
    throw error;
  }
}

export async function fetchNumerology(name: string, birthDate: string): Promise<NumerologyData> {
  return callGemini(`numerology-${name}-${birthDate}`, async () => {
    const prompt = `Provide a detailed numerology analysis for:
    Name: ${name}
    Birth Date: ${birthDate}

    The response must be in Mongolian.

    Calculations needed:
    1. Life Path Number: Sum all digits of the birth date, reduce to single digit (1-9) or master numbers (11, 22, 33).
    2. Destiny Number (Expression Number): Convert each letter of the full name to a number using the Pythagorean system (A=1, B=2, ..., I=9, J=1, etc.), sum them, and reduce.

    Provide:
    - lifePathNumber
    - lifePathMeaning: Detailed interpretation of the life path number in Mongolian.
    - destinyNumber
    - destinyMeaning: Detailed interpretation of how their name influences their path in Mongolian.
    - traits: 5 personality traits in Mongolian.
    - cosmicAdvise: Short practical advice for their future in Mongolian.`;

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            lifePathNumber: { type: Type.NUMBER },
            lifePathMeaning: { type: Type.STRING },
            destinyNumber: { type: Type.NUMBER },
            destinyMeaning: { type: Type.STRING },
            traits: { type: Type.ARRAY, items: { type: Type.STRING } },
            cosmicAdvise: { type: Type.STRING }
          },
          required: ["lifePathNumber", "lifePathMeaning", "destinyNumber", "destinyMeaning", "traits", "cosmicAdvise"]
        }
      }
    });

    return JSON.parse(response.text) as NumerologyData;
  });
}

export async function fetchDailyCompatibility(sign1: ZodiacSign, sign2: ZodiacSign): Promise<CompatibilityResult> {
  const dateKey = new Date().toLocaleDateString();
  return callGemini(`daily-compatibility-${sign1}-${sign2}-${dateKey}`, async () => {
    const prompt = `Analyze the DAILY astrological compatibility between ${sign1} and ${sign2} for today, ${dateKey}.
    The response must be in Mongolian.
    How do today's planetary positions affect their interaction?
    Provide a score from 0-100, a summary of today's energy, 3 temporary strengths for today, and 2 specific challenges they might face today with solutions.`;

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            score: { type: Type.NUMBER },
            summary: { type: Type.STRING, description: "Detailed Mongolian summary for today's energy." },
            strengths: { type: Type.ARRAY, items: { type: Type.STRING }, description: "3 items in Mongolian" },
            challenges: { 
              type: Type.ARRAY, 
              items: { 
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING, description: "Short title of today's challenge in Mongolian" },
                  explanation: { type: Type.STRING, description: "Why this is a risk today in Mongolian" },
                  solution: { type: Type.STRING, description: "Advice for today in Mongolian" }
                },
                required: ["title", "explanation", "solution"]
              }, 
              description: "2 detailed challenges for today in Mongolian" 
            }
          },
          required: ["score", "summary", "strengths", "challenges"]
        }
      }
    });

    return JSON.parse(response.text) as CompatibilityResult;
  });
}
export async function fetchCompatibility(sign1: ZodiacSign, sign2: ZodiacSign): Promise<CompatibilityResult> {
  return callGemini(`compatibility-${sign1}-${sign2}`, async () => {
    const prompt = `Analyze the astrological compatibility between ${sign1} and ${sign2} for a romantic or deep partnership.
    The response must be in Mongolian.
    Provide a score from 0-100, a summary, 3 strengths, and 2 detailed challenges with explanations and potential solutions.`;

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            score: { type: Type.NUMBER },
            summary: { type: Type.STRING, description: "Detailed Mongolian summary." },
            strengths: { type: Type.ARRAY, items: { type: Type.STRING }, description: "3 items in Mongolian" },
            challenges: { 
              type: Type.ARRAY, 
              items: { 
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING, description: "Short title of the challenge in Mongolian" },
                  explanation: { type: Type.STRING, description: "Detailed explanation of why this is a challenge in Mongolian" },
                  solution: { type: Type.STRING, description: "Practical solution or advice to overcome this challenge in Mongolian" }
                },
                required: ["title", "explanation", "solution"]
              }, 
              description: "2 detailed challenges in Mongolian" 
            }
          },
          required: ["score", "summary", "strengths", "challenges"]
        }
      }
    });

    return JSON.parse(response.text) as CompatibilityResult;
  });
}

export async function getTarotReading(): Promise<TarotCard> {
  // Tarot results are randomized, so we don't cache them the same way
  return callGemini(`tarot-${new Date().getHours()}`, async () => {
    const prompt = `Provide a single tarot card pull for today's guidance.
    The response must be in Mongolian.
    Select a random card from the Rider-Waite tradition. Provide name, meaning, and advice.
    Also provide an English name for the card in a separate field called 'englishName' for internal image generation.`;

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            name: { type: Type.STRING, description: "Card name in Mongolian" },
            englishName: { type: Type.STRING, description: "Simple card name in English, e.g. 'The Fool', 'Three of Cups'" },
            meaning: { type: Type.STRING, description: "Card meaning in Mongolian" },
            advice: { type: Type.STRING, description: "Daily advice in Mongolian" },
            arcana: { type: Type.STRING, enum: ["Major", "Minor"] }
          },
          required: ["name", "englishName", "meaning", "advice", "arcana"]
        }
      }
    });

    const rawData = JSON.parse(response.text);
    
    // Create a stylized image URL using the English name
    const stylePrompt = encodeURIComponent(`mystic tarot card ${rawData.englishName}, sleek cosmic aesthetic, floating symbols, deep indigo and golden glows, celestial background, highly detailed digital illustration, spiritual art`);
    const imageUrl = `https://image.pollinations.ai/prompt/${stylePrompt}?width=400&height=700&nologo=true&seed=${Math.floor(Math.random() * 1000000)}`;

    return {
      ...rawData,
      imageUrl
    } as TarotCard;
  });
}

export async function fetchDailyHoroscope(sign: ZodiacSign, birthChartData?: BirthChartInterpretation): Promise<HoroscopeData> {
  const dateKey = new Date().toLocaleDateString();
  return callGemini(`horoscope-${sign}-${dateKey}-${!!birthChartData}`, async () => {
    const prompt = `Generate a modern, insightful, and PERSONALIZED daily horoscope for the zodiac sign ${sign} for today ${dateKey}. 
    ${birthChartData ? `The user's birth chart consists of:
    - Sun in ${birthChartData.sun.sign}: ${birthChartData.sun.meaning}
    - Moon in ${birthChartData.moon.sign}: ${birthChartData.moon.meaning}
    ${birthChartData.rising ? `- Rising in ${birthChartData.rising.sign}: ${birthChartData.rising.meaning}` : ''}
    
    Please incorporate how today's planetary transits specifically interact with their natal positions (Sun, Moon, and Rising) to provide highly personalized advice.` : 'The tone should be mystic but practical. Provide high-quality content.'}
    
    The response must be in Mongolian.
    Provide 3 sentences of general insight and 2 sentences of specific advice based on their transits.`;

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            sign: { type: Type.STRING },
            date: { type: Type.STRING },
            dailyMessage: { type: Type.STRING, description: "A few sentences of insightful horoscope in Mongolian." },
            mood: { type: Type.STRING, description: "Mood in Mongolian" },
            color: { type: Type.STRING, description: "Color name in Mongolian" },
            luckyNumber: { type: Type.NUMBER },
            compatibility: { type: Type.STRING, description: "One other zodiac sign in Mongolian." },
            areas: {
              type: Type.OBJECT,
              properties: {
                love: { type: Type.NUMBER, description: "1-5 rating" },
                career: { type: Type.NUMBER },
                health: { type: Type.NUMBER },
                money: { type: Type.NUMBER }
              },
              required: ["love", "career", "health", "money"]
            }
          },
          required: ["sign", "date", "dailyMessage", "mood", "color", "luckyNumber", "compatibility", "areas"]
        }
      }
    });

    const data = JSON.parse(response.text);
    return data as HoroscopeData;
  });
}

export async function interpretBirthChart(name: string, date: string, time?: string, location?: string): Promise<BirthChartInterpretation> {
  return callGemini(`birthchart-${name}-${date}-${time}-${location}`, async () => {
    const prompt = `As a world-renowned master astrologer, provide a comprehensive birth chart interpretation for:
    Name: ${name}
    Birth Date: ${date}
    Birth Time: ${time || 'Unknown'}
    Birth Location: ${location || 'Unknown'}
    
    The response must be in Mongolian.
    
    Please provide:
    1. Sun Sign identification and interpretation.
    2. Moon Sign identification and interpretation.
    3. Rising (Ascendant) Sign identification and interpretation (only if birth time is provided, otherwise leave as null).
    4. A general summary of their cosmic blueprint.`;

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            sun: {
              type: Type.OBJECT,
              properties: {
                sign: { type: Type.STRING },
                meaning: { type: Type.STRING }
              },
              required: ["sign", "meaning"]
            },
            moon: {
              type: Type.OBJECT,
              properties: {
                sign: { type: Type.STRING },
                meaning: { type: Type.STRING }
              },
              required: ["sign", "meaning"]
            },
            rising: {
              type: Type.OBJECT,
              properties: {
                sign: { type: Type.STRING },
                meaning: { type: Type.STRING }
              },
              required: ["sign", "meaning"]
            },
            summary: { type: Type.STRING }
          },
          required: ["sun", "moon", "summary"]
        }
      }
    });

    return JSON.parse(response.text) as BirthChartInterpretation;
  });
}

export async function generateProductDescription(productName: string): Promise<string> {
  const prompt = `Үйлчлүүлэгчийн өгсөн барааны нэрээр одон орны болон ид шидийн агуулгатай, маш гоё яруу тансаг тайлбар бичиж өгнө үү.
  Барааны нэр: ${productName}
  Хэл: Монгол
  Тайлбар нь богино (2-3 өгүүлбэр) бөгөөд хүмүүсийн сонирхлыг татахуйц, сэтгэл татам байх ёстой.`;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt,
  });

  return response.text;
}
