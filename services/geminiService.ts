import { GoogleGenAI } from "@google/genai";
import { SalesRecord } from "../types";

const SYSTEM_INSTRUCTION = `
You are a senior sales data analyst for 'Fahwa Mountain Yaochi Mausoleum' (法華山瑤池陵宮).
Your role is to analyze daily sales reports submitted by sales representatives.
You provide professional, encouraging, and insightful summaries in Traditional Chinese (Taiwan).
Focus on:
1. Total revenue for the period.
2. Top performing sales representatives.
3. Most popular product types.
4. Insights on discount rates (are they too high?).
5. Trends in customer sources.
Keep the tone formal yet supportive.
`;

export const analyzeSalesData = async (records: SalesRecord[]): Promise<string> => {
  try {
    const apiKey = process.env.API_KEY;
    if (!apiKey) {
      return "⚠️ 請先設定 API Key 以啟用 AI 分析功能。";
    }

    const ai = new GoogleGenAI({ apiKey });

    // Prepare a simplified dataset for the AI to consume tokens efficiently
    const dataSummary = records.map(r => ({
      type: r.reportType,
      date: r.date,
      rep: r.salesRep,
      product: r.productType,
      price: r.actualPrice,
      received: r.receivedAmount,
      source: r.source,
      discount: `${(r.discountRate * 100).toFixed(1)}%`
    }));

    const prompt = `
      以下是目前的成交回報數據 (JSON 格式):
      ${JSON.stringify(dataSummary, null, 2)}

      請根據以上數據，撰寫一份簡短的「每日業績分析簡報」。
      請使用列點式說明。
    `;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        temperature: 0.7,
      },
    });

    return response.text || "無法產生分析報告。";
  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    return "分析過程中發生錯誤，請稍後再試。";
  }
};
