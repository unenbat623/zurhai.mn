
export type ZodiacSign = 
  | 'Aries' | 'Taurus' | 'Gemini' | 'Cancer' 
  | 'Leo' | 'Virgo' | 'Libra' | 'Scorpio' 
  | 'Sagittarius' | 'Capricorn' | 'Aquarius' | 'Pisces';

export interface UserProfile {
  name: string;
  birthDate: string; // ISO string or YYYY-MM-DD
  birthTime?: string;
  birthLocation?: string;
  sunSign: ZodiacSign;
  astroData?: BirthChartInterpretation;
  isPremium?: boolean;
}

export interface HoroscopeData {
  sign: ZodiacSign;
  date: string;
  dailyMessage: string;
  mood: string;
  color: string;
  luckyNumber: number;
  compatibility: ZodiacSign;
  areas: {
    love: number; // 1-5
    career: number;
    health: number;
    money: number;
  };
}

export const ZODIAC_SIGNS: ZodiacSign[] = [
  'Aries', 'Taurus', 'Gemini', 'Cancer', 
  'Leo', 'Virgo', 'Libra', 'Scorpio', 
  'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'
];

export const SIGN_NAMES_MN: Record<ZodiacSign, string> = {
  'Aries': 'Хонь',
  'Taurus': 'Үхэр',
  'Gemini': 'Ихэр',
  'Cancer': 'Мэлхий',
  'Leo': 'Арслан',
  'Virgo': 'Охин',
  'Libra': 'Жинлүүр',
  'Scorpio': 'Хилэнц',
  'Sagittarius': 'Нум',
  'Capricorn': 'Матar',
  'Aquarius': 'Хумх',
  'Pisces': 'Загас'
};

export const SIGN_DATES: Record<ZodiacSign, string> = {
  'Aries': '3.21 - 4.19',
  'Taurus': '4.20 - 5.20',
  'Gemini': '5.21 - 6.20',
  'Cancer': '6.21 - 7.22',
  'Leo': '7.23 - 8.22',
  'Virgo': '8.23 - 9.22',
  'Libra': '9.23 - 10.22',
  'Scorpio': '10.23 - 11.21',
  'Sagittarius': '11.22 - 12.21',
  'Capricorn': '12.22 - 1.19',
  'Aquarius': '1.20 - 2.18',
  'Pisces': '2.19 - 3.20'
};

export interface CompatibilityChallenge {
  title: string;
  explanation: string;
  solution: string;
}

export interface CompatibilityResult {
  score: number;
  summary: string;
  strengths: string[];
  challenges: CompatibilityChallenge[];
  breakdown: {
    communication: number;
    passion: number;
    emotional: number;
    values: number;
    trust: number;
  };
}

export interface TarotCard {
  name: string;
  meaning: string;
  advice: string;
  arcana: 'Major' | 'Minor';
  imageUrl: string;
}

export interface ShopProduct {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl?: string;
}

export interface BirthChartInterpretation {
  sun: {
    sign: string;
    meaning: string;
  };
  moon: {
    sign: string;
    meaning: string;
  };
  rising?: {
    sign: string;
    meaning: string;
  };
  summary: string;
}

export interface NumerologyData {
  lifePathNumber: number;
  lifePathMeaning: string;
  destinyNumber: number;
  destinyMeaning: string;
  traits: string[];
  cosmicAdvise: string;
}
