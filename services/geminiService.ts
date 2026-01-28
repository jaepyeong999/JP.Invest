import { GoogleGenAI, Type } from "@google/genai";
import { NewsItem, CalendarEvent, Company } from "../types";

const getApiKey = () => {
  // vite.config.ts의 define을 통해 주입된 값을 우선 사용
  const key = process.env.API_KEY;
  return key || '';
};

const getAIClient = () => {
  const apiKey = getApiKey();
  if (!apiKey) {
    throw new Error("API Key가 설정되지 않았습니다. Vercel 환경 변수에서 API_KEY를 설정해주세요.");
  }
  return new GoogleGenAI({ apiKey });
};

export const getMarketAnalysis = async (query: string): Promise<string> => {
  try {
    const ai = getAIClient();
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: `다음 경제 관련 질문에 대해 전문 투자자의 관점에서 분석해 주세요: ${query}. 깊이 있는 통찰력, 역사적 맥락, 그리고 잠재적인 미래 영향을 포함해야 합니다. 모든 답변은 한국어로 작성해 주세요.`,
      config: {
        temperature: 0.7,
        topP: 0.95,
        thinkingConfig: { thinkingBudget: 2000 }
      }
    });
    return response.text || "분석 결과를 생성할 수 없습니다.";
  } catch (e) {
    console.error("Analysis Error:", e);
    return "분석을 불러오려면 API_KEY 설정이 필요합니다.";
  }
};

export const searchCompanies = async (query: string): Promise<Company[]> => {
  try {
    const ai = getAIClient();
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `미국 상장사 중 "${query}"와 관련된 기업 5곳을 찾아주세요. 반드시 한국어로 답변하되, JSON 형식으로 티커, 이름, 섹터, 가격, 설명을 포함해야 합니다.`,
      config: {
        tools: [{ googleSearch: {} }],
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              ticker: { type: Type.STRING },
              name: { type: Type.STRING },
              sector: { type: Type.STRING },
              price: { type: Type.STRING },
              description: { type: Type.STRING }
            },
            required: ["ticker", "name", "sector", "price", "description"]
          }
        }
      }
    });
    return JSON.parse(response.text);
  } catch (e) {
    return [];
  }
};

export const getLatestEconomicNews = async (): Promise<NewsItem[]> => {
  try {
    const ai = getAIClient();
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: "최근 3일간의 글로벌 주요 경제 뉴스 12개를 찾아주세요. 제목, 요약, 출처, 날짜를 포함한 JSON 형식이어야 합니다. 반드시 한국어로 제공하세요.",
      config: {
        tools: [{ googleSearch: {} }],
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING },
              title: { type: Type.STRING },
              summary: { type: Type.STRING },
              source: { type: Type.STRING },
              date: { type: Type.STRING }
            },
            required: ["id", "title", "summary", "source", "date"]
          }
        }
      }
    });

    const rawData = JSON.parse(response.text);
    return rawData.map((item: any, index: number) => ({
      ...item,
      imageUrl: `https://images.unsplash.com/photo-${[
        '1611974717482-482436d412e0', '1591696208162-a9973f7425ed', '1554224155-8d04182258f5',
        '1590283603385-17ffb3a7f29f', '1611974717482-482436d412e0', '1526303328154-3259b6010417',
        '1460925895917-afdab827c52f', '1535320903710-d993d3d77d29', '1518186285589-2f7649de83e0',
        '1559526324-4b87b5e36e44', '1551288049-bbbda50a1def', '1563986768609-322da13575f3'
      ][index % 12]}?q=80&w=600&auto=format&fit=crop`
    }));
  } catch (e) {
    return [];
  }
};

export const getCalendarEvents = async (): Promise<CalendarEvent[]> => {
  try {
    const ai = getAIClient();
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: "이번 주와 다음 주의 주요 글로벌 경제 일정을 한국어로 10개 찾아주세요. 날짜, 제목, 유형(earnings, macro, fed), 영향력(high, medium, low)을 포함한 JSON 형식이어야 합니다.",
      config: {
        tools: [{ googleSearch: {} }],
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING },
              date: { type: Type.STRING },
              title: { type: Type.STRING },
              type: { type: Type.STRING, enum: ['earnings', 'macro', 'fed'] },
              impact: { type: Type.STRING, enum: ['high', 'medium', 'low'] }
            },
            required: ["id", "date", "title", "type", "impact"]
          }
        }
      }
    });
    return JSON.parse(response.text);
  } catch (e) {
    return [];
  }
};

export const getMacroSummary = async (): Promise<string> => {
    try {
      const ai = getAIClient();
      const response = await ai.models.generateContent({
          model: 'gemini-3-flash-preview',
          contents: "현재 시장 심리 요약을 한국어 2문장으로 제공해 주세요.",
          config: {
              systemInstruction: "당신은 전문 경제 분석가입니다. API_KEY가 설정되어 있어야 데이터를 가져올 수 있습니다."
          }
      });
      return response.text || "데이터를 불러오는 중입니다...";
    } catch (e) {
      return "환경 변수에서 API_KEY를 설정하면 실시간 마켓 펄스가 활성화됩니다.";
    }
}