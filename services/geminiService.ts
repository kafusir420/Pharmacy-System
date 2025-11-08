
import { GoogleGenAI } from "@google/genai";
import type { Medicine, Sale } from '../types';

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
    // This is a placeholder check. In a real app, the key would be set.
    console.warn("API_KEY environment variable not set. Gemini API calls will fail.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY! });

export const getDrugInformation = async (drugName: string): Promise<string> => {
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: `Provide a concise, easy-to-understand summary for the drug "${drugName}". Include its primary use, common side effects, and any major warnings. Format it in simple paragraphs suitable for a patient.`,
        });
        return response.text;
    } catch (error) {
        console.error("Error fetching drug information:", error);
        return "Sorry, I couldn't fetch information for this drug at the moment. Please ensure your API key is configured correctly.";
    }
};

export const checkDrugInteractions = async (drugList: string[]): Promise<string> => {
    if (drugList.length < 2) {
        return "Please provide at least two drugs to check for interactions.";
    }
    try {
        const prompt = `Analyze potential drug-drug interactions for the following list: ${drugList.join(', ')}. 
        Provide a summary of any significant interactions, categorized by severity (e.g., High, Moderate, Low). 
        IMPORTANT: Start your response with a clear, bold disclaimer: "**This is an AI-generated analysis and not a substitute for professional medical advice. Always consult a healthcare provider.**"`;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-pro',
            contents: prompt,
        });
        return response.text;
    } catch (error) {
        console.error("Error checking drug interactions:", error);
        return "Sorry, I couldn't check for interactions at this time. Please ensure your API key is configured correctly.";
    }
};

export const queryInventory = async (query: string, medicines: Medicine[], sales: Sale[]): Promise<string> => {
    try {
        const inventorySummary = medicines.map(m => ({
            name: m.name,
            stock: m.stock,
            warehouse: m.warehouse,
            batches: m.batches.map(b => ({ expiry: b.expiryDate, qty: b.quantity }))
        }));

        const salesSummary = sales.slice(-20).map(s => ({ // last 20 sales for context
            date: s.date,
            total: s.totalAmount,
            items: s.items.map(i => i.name)
        }));

        const prompt = `You are a pharmacy inventory analysis AI. Based on the following data, answer the user's question.
        
        User Question: "${query}"

        Inventory Data (JSON):
        ${JSON.stringify(inventorySummary)}

        Recent Sales Data (JSON):
        ${JSON.stringify(salesSummary)}

        Provide a clear, concise answer based *only* on the data provided. If the data doesn't support an answer, say so.
        `;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });
        return response.text;
    } catch (error) {
        console.error("Error querying inventory:", error);
        return "Sorry, I couldn't analyze the inventory at this time. Please ensure your API key is configured correctly.";
    }
};
