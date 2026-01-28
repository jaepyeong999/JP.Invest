
import { GoogleGenAI, Type } from "@google/genai";
import { NewsItem, CalendarEvent, Company } from "../types";

const getAIClient = () => {
  return new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
};

export const getMarketAnalysis = async (query: string): Promise<string> => {
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
  return response.text || "현재 분석을 생성할 수 없습니다.";
};

export const searchCompanies = async (query: string): Promise<Company[]> => {
  const ai = getAIClient();
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `미국 증권거래소(NYSE, NASDAQ)에 상장된 기업 중 "${query}"와(과) 관련된 기업 5곳을 찾아주세요. 반드시 한국어로 답변하되, 티커(ticker), 기업명(name), 섹터(sector), 현재가(price - 대략적인 최신가), 간단한 설명(description)을 포함한 JSON 형식으로 제공해 주세요.`,
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

  try {
    return JSON.parse(response.text);
  } catch (e) {
    console.error("Stock search failed", e);
    return [];
  }
};

export const getLatestEconomicNews = async (): Promise<NewsItem[]> => {
  const ai = getAIClient();
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: "블룸버그(Bloomberg), 로이터(Reuters), CNBC 등 글로벌 주요 경제 소스에서 '지난 3일간' 가장 조회수가 높고 파급력이 큰 주요 뉴스 12개를 찾아주세요. 반드시 한국어로 답변하되, 각 뉴스는 제목, 2줄 분량의 핵심 요약, 출처, 날짜를 포함해야 합니다. 조회수와 중요도가 높은 순서대로 실시간 정렬해 주세요.",
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

  try {
    const rawData = JSON.parse(response.text);
    return rawData.map((item: any, index: number) => ({
      ...item,
      imageUrl: `https://images.unsplash.com/photo-${[
        '1611974717482-482436d412e0',
        '1591696208162-a9973f7425ed',
        '1554224155-8d04182258f5',
        '1590283603385-17ffb3a7f29f',
        '1611974717482-482436d412e0',
        '1526303328154-3259b6010417',
        '1460925895917-afdab827c52f',
        '1535320903710-d993d3d77d29',
        '1518186285589-2f7649de83e0',
        '1559526324-4b87b5e36e44',
        '1551288049-bbbda50a1def',
        '1563986768609-322da13575f3'
      ][index % 12]}?q=80&w=600&auto=format&fit=crop`
    }));
  } catch (e) {
    console.error("News parsing failed", e);
    return [];
  }
};

export const getCalendarEvents = async (): Promise<CalendarEvent[]> => {
  const ai = getAIClient();
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: "이번 주와 다음 주에 예정된 글로벌 주요 경제 일정을 찾아주세요. 1. 주요 대형주(NVDA, AAPL, MSFT, TSLA 등) 실적 발표 일정 2. 미국 연준(Fed) 금리 결정 및 FOMC 의사록 3. 미국 소비자물가지수(CPI), 생산자물가지수(PPI), 고용지표 등 시장에 큰 영향을 주는 핵심 지표 발표일. 모든 정보는 한국어로 제공하고, 중요도가 높은 순서로 10-12개 정도 제공해 주세요.",
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

  try {
    return JSON.parse(response.text);
  } catch (e) {
    console.error("Calendar parsing failed", e);
    return [];
  }
};

export const getMacroSummary = async (): Promise<string> => {
    const ai = getAIClient();
    const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: "현재 글로벌 시장 심리와 주요 동인에 대한 2문장 분량의 거시 경제 요약을 한국어로 제공해 주세요.",
        config: {
            systemInstruction: "당신은 JP.Invest의 수석 매크로 전략가입니다. 반드시 한국어로 답변하세요."
        }
    });
    return response.text || "현재 중립적인 시장 심리가 지배적입니다.";
}
