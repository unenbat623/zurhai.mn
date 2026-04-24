import { GoogleGenAI, Type } from "@google/genai";
import { ZodiacSign, HoroscopeData, CompatibilityResult, TarotCard, NumerologyData, BirthChartInterpretation } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// Simple in-memory cache to reduce API calls
const cache: Record<string, { data: any; timestamp: number }> = {};
const CACHE_TTL = 1000 * 60 * 60; // 1 hour

async function callGemini<T>(key: string, fn: () => Promise<T>, useCache = true, maxRetries = 3): Promise<T> {
  if (useCache && cache[key] && (Date.now() - cache[key].timestamp < CACHE_TTL)) {
    return cache[key].data;
  }

  const executeWithRetry = async (): Promise<T> => {
    let lastError: any;
    for (let i = 0; i <= maxRetries; i++) {
      try {
        return await fn();
      } catch (error: any) {
        lastError = error;
        // Check for transient errors (429 Rate Limit, 5xx Server Errors, Network issues)
        const isTransient = 
          error?.message?.includes("429") || 
          error?.status === 429 || 
          error?.code === 429 ||
          error?.message?.toLowerCase().includes("fetch") ||
          error?.message?.toLowerCase().includes("network") ||
          error?.message?.includes("500") ||
          error?.message?.includes("502") ||
          error?.message?.includes("503") ||
          error?.status >= 500;

        if (isTransient && i < maxRetries) {
          const delay = Math.pow(2, i) * 1000 + Math.random() * 1000;
          console.warn(`Transient error calling Gemini (${error?.status || error?.message}). Retrying in ${Math.round(delay)}ms... (Attempt ${i + 1}/${maxRetries})`);
          await new Promise(resolve => setTimeout(resolve, delay));
          continue;
        }
        throw error;
      }
    }
    throw lastError;
  };

  try {
    const result = await executeWithRetry();
    if (useCache) {
      cache[key] = { data: result, timestamp: Date.now() };
    }
    
    // Increment local quota estimation
    const current = parseInt(localStorage.getItem('astra_quota_usage') || '0');
    localStorage.setItem('astra_quota_usage', (current + 1).toString());
    
    return result;
  } catch (error: any) {
    console.error("Gemini API Error after retries:", error);
    
    // Check for 429 Quota Exceeded if still failing after retries
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
    3. Soul Urge Number (Heart's Desire): Sum of all vowels in the full name using the same system.

    Provide:
    - lifePathNumber
    - lifePathMeaning: Detailed interpretation of the life path number in Mongolian.
    - destinyNumber
    - destinyMeaning: Detailed interpretation of how their name influences their path in Mongolian.
    - soulUrgeNumber
    - soulUrgeMeaning: Detailed interpretation of their inner desires and soul's core in Mongolian.
    - traits: 5 personality traits in Mongolian.
    - cosmicAdvice: Short practical advice for their future in Mongolian.`;

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
            soulUrgeNumber: { type: Type.NUMBER },
            soulUrgeMeaning: { type: Type.STRING },
            traits: { type: Type.ARRAY, items: { type: Type.STRING } },
            cosmicAdvice: { type: Type.STRING }
          },
          required: ["lifePathNumber", "lifePathMeaning", "destinyNumber", "destinyMeaning", "soulUrgeNumber", "soulUrgeMeaning", "traits", "cosmicAdvice"]
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
    Provide a score from 0-100, a summary of today's energy, 3 temporary strengths for today, and 2 specific challenges they might face today with solutions.
    Also provide breakdown scores (0-100) for: communication, passion, emotional connection, shared values, and trust.`;

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
            },
            breakdown: {
              type: Type.OBJECT,
              properties: {
                communication: { type: Type.NUMBER },
                passion: { type: Type.NUMBER },
                emotional: { type: Type.NUMBER },
                values: { type: Type.NUMBER },
                trust: { type: Type.NUMBER }
              },
              required: ["communication", "passion", "emotional", "values", "trust"]
            }
          },
          required: ["score", "summary", "strengths", "challenges", "breakdown"]
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
    Provide a score from 0-100, a summary, 3 strengths, and 2 detailed challenges with explanations and potential solutions.
    Also provide breakdown scores (0-100) for: communication, passion, emotional connection, shared values, and trust.`;

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
            },
            breakdown: {
              type: Type.OBJECT,
              properties: {
                communication: { type: Type.NUMBER },
                passion: { type: Type.NUMBER },
                emotional: { type: Type.NUMBER },
                values: { type: Type.NUMBER },
                trust: { type: Type.NUMBER }
              },
              required: ["communication", "passion", "emotional", "values", "trust"]
            }
          },
          required: ["score", "summary", "strengths", "challenges", "breakdown"]
        }
      }
    });

    return JSON.parse(response.text) as CompatibilityResult;
  });
}

const TAROT_FALLBACK_CARDS = [
  { name: "Тэнэг (The Fool)", englishName: "The Fool", meaning: "Шинэ эхлэл, гэнэн итгэл, эрх чөлөө.", advice: "Өөртөө итгэж, шинэ адал явдалд зоригтой гар.", arcana: "Major" as const },
  { name: "Илбэчин (The Magician)", englishName: "The Magician", meaning: "Ур чадвар, хүч чадал, бүтээлч байдал.", advice: "Танд бүх нөөц боломж бий, үйлдлээ эхэл.", arcana: "Major" as const },
  { name: "Дээд Гэлэнмаа (The High Priestess)", englishName: "The High Priestess", meaning: "Зөн совин, далд мэдлэг, нууцлаг байдал.", advice: "Дотоод дуу хоолойгоо сонс.", arcana: "Major" as const },
  { name: "Хатан хаан (The Empress)", englishName: "The Empress", meaning: "Өсөлт, элбэг дэлбэг байдал, хайр халамж.", advice: "Бүтээлч байдлаа хөгжүүлж, байгальтай ойр бай.", arcana: "Major" as const },
  { name: "Эзэн хаан (The Emperor)", englishName: "The Emperor", meaning: "Эрх мэдэл, бүтэц, тогтвортой байдал.", advice: "Дэг журам тогтоож, хариуцлагатай бай.", arcana: "Major" as const },
  { name: "Амрагууд (The Lovers)", englishName: "The Lovers", meaning: "Хайр дурлал, сонголт, эв нэгдэл.", advice: "Зүрх сэтгэлээ дагаж шийдвэр гарга.", arcana: "Major" as const }
];

const PLACEHOLDER_TAROT_IMAGE = "https://images.unsplash.com/photo-1590059530519-2169f464010a?q=80&w=400&auto=format&fit=crop";

function generateTarotImageUrl(englishName: string): string {
  try {
    if (!englishName) return PLACEHOLDER_TAROT_IMAGE;
    const seed = Math.floor(Math.random() * 9999999);
    const stylePrompt = encodeURIComponent(`mystic tarot card ${englishName}, sleek cosmic aesthetic, floating symbols, deep indigo and golden glows, celestial background, highly detailed digital illustration, spiritual art`);
    return `https://image.pollinations.ai/prompt/${stylePrompt}?width=400&height=700&nologo=true&seed=${seed}`;
  } catch (error) {
    console.error("Error generating tarot image URL:", error);
    return PLACEHOLDER_TAROT_IMAGE;
  }
}

export async function getTarotReading(): Promise<TarotCard> {
  // Tarot results are randomized, so we don't cache them the same way
  try {
    return await callGemini(`tarot-${new Date().getHours()}`, async () => {
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
      const imageUrl = generateTarotImageUrl(rawData.englishName);

      return {
        ...rawData,
        imageUrl
      } as TarotCard;
    }, false); 
  } catch (error: any) {
    console.warn("Falling back to local tarot data due to error:", error);
    const randomIndex = Math.floor(Math.random() * TAROT_FALLBACK_CARDS.length);
    const fallback = TAROT_FALLBACK_CARDS[randomIndex];
    return {
      ...fallback,
      imageUrl: generateTarotImageUrl(fallback.englishName)
    } as TarotCard;
  }
}

export async function fetchDailyHoroscope(sign: ZodiacSign, birthChartData?: BirthChartInterpretation): Promise<HoroscopeData> {
  const dateKey = new Date().toLocaleDateString();
  return callGemini(`horoscope-${sign}-${dateKey}-${!!birthChartData}`, async () => {
    const prompt = `Generate a modern, insightful, and PERSONALIZED daily horoscope for the zodiac sign ${sign} for today ${dateKey}. 
    ${birthChartData ? `The user's birth chart consists of:
    - Sun in ${birthChartData.sun.sign}: ${birthChartData.sun.meaning}
    - Moon in ${birthChartData.moon.sign}: ${birthChartData.moon.meaning}
    ${birthChartData.rising ? `- Rising in ${birthChartData.rising.sign}: ${birthChartData.rising.meaning}` : ''}
    
    CRITICAL INSTRUCTION: You MUST explicitly mention the user's Sun sign (${birthChartData.sun.sign}), Moon sign (${birthChartData.moon.sign}), and ${birthChartData.rising ? `Rising sign (${birthChartData.rising.sign})` : 'other natal positions'} within the "dailyMessage" text. 
    Explain how today's planetary transits specifically interact with these THREE key points of their cosmic blueprint.
    The "mood" field should also be a creative, highly descriptive Mongolian phrase reflecting this specific energy mixture (e.g., "Наран мандах мэт эрч хүчтэй" or "Сарны зөн совин давамгайлсан").` : 'The tone should be mystic but practical. Provide high-quality content.'}
    
    The response must be in Mongolian.
    Provide a cohesive paragraph (4-5 sentences) of deeply personalized insight.`;

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
