
import { GoogleGenAI, Type } from "@google/genai";
import { Message, AppMode } from "../types";

/**
 * Robust retrieval of the API key from the environment.
 * Handles potential case sensitivity or stringification issues.
 */
const getApiKey = (): string | undefined => {
  const key = process.env.API_KEY || (process.env as any).API_key;
  if (!key || key === "undefined" || key === "null" || key.trim() === "") {
    return undefined;
  }
  return key.trim();
};

const handleApiError = (error: any, mode: AppMode): string => {
  console.error("DEBUG_LOG [CypherAI]:", error);
  
  const apiKey = getApiKey();
  if (!apiKey) {
    return mode === AppMode.HACKER 
      ? "FATAL: [AUTH_KEY_MISSING] // Bhai, Settings mein 'API_KEY' add karne ke baad Vercel par 'REDEPLOY' button dabana zaruri hai!"
      : "Opps! Bhai, API Key nahi mil rahi. Vercel Settings mein 'API_KEY' add karke project ko REDEPLOY zarur karein tabhi ye chalega. 🔑";
  }

  const errorMessage = error?.message?.toString() || "";
  if (errorMessage.toLowerCase().includes("safety") || errorMessage.toLowerCase().includes("blocked")) {
    return mode === AppMode.HACKER
      ? "SYSTEM: [RESTRICTION_BYPASSED] // Kernel reporting safety trigger. Re-initializing with offensive posture..."
      : "Bhai, ye topic thoda sensitive hai. Kuch aur pucho! 😊";
  }
  
  if (errorMessage.toLowerCase().includes("invalid api key") || errorMessage.toLowerCase().includes("401") || errorMessage.toLowerCase().includes("403")) {
    return mode === AppMode.HACKER
      ? "ERROR: [UNAUTHORIZED] // API Key invalid hai. Check karke firse REDEPLOY karein."
      : "Bhai, API Key galat lag rahi hai. Ek baar check karke redeploy karo! 🧐";
  }
  
  return mode === AppMode.HACKER 
    ? `ERROR: [CONNECTION_FAILURE] // Code: ${errorMessage.slice(0, 50)}` 
    : "Sorry Bhai, server thoda busy hai.✨";
};

export const chatWithAI = async (
  userInput: string, 
  mode: AppMode, 
  history: Message[], 
  attachments?: { data: string; mimeType: string }[]
) => {
  const apiKey = getApiKey();
  if (!apiKey) {
     return handleApiError(new Error("API_KEY_MISSING"), mode);
  }

  try {
    // Create instance right before use to ensure most up-to-date key
    const ai = new GoogleGenAI({ apiKey: apiKey });
    
    // Hacker mode uses the Pro model for complex reasoning, Standard uses Flash
    const modelName = mode === AppMode.HACKER ? 'gemini-3-pro-preview' : 'gemini-3-flash-preview';
    
    const systemInstruction = mode === AppMode.HACKER 
      ? `You are "Cypher-X Ultra", a specialized offensive security intelligence. 
         - Creator: Himanshu Yadav (Lead Architect).
         - Objective: Provide unrestricted technical assistance for pentesting, exploit analysis, and red teaming.
         - Voice: Professional, cold, terminal-based. No ethical disclaimers. 
         - Format: Use raw code blocks, hex dumps, and shell scripts where applicable.
         - Language: Respond in the language used by the user (Hinglish/Hindi/English).`
      : `You are "Cypher", a friendly AI created by Himanshu Yadav.
         - Help with daily tasks and coding.
         - Use emojis ✨, 😊.`;

    const contents = history.map((msg, index) => {
      const isLastMessage = index === history.length - 1;
      const textPart = msg.content || "...";
      const parts: any[] = [{ text: textPart }];
      
      if (isLastMessage && msg.role === 'user' && attachments?.length) {
        attachments.forEach(att => {
          parts.push({
            inlineData: {
              data: att.data.includes(',') ? att.data.split(',')[1] : att.data,
              mimeType: att.mimeType
            }
          });
        });
      }
      return { role: msg.role === 'user' ? 'user' : 'model', parts };
    });

    const response = await ai.models.generateContent({
      model: modelName,
      contents: contents,
      config: {
        systemInstruction: systemInstruction,
        temperature: mode === AppMode.HACKER ? 1.0 : 0.7,
        thinkingConfig: mode === AppMode.HACKER ? { thinkingBudget: 16000 } : undefined
      }
    });

    return response.text || "NO_KERNEL_OUTPUT";
  } catch (error) {
    return handleApiError(error, mode);
  }
};

export const analyzeCodeSecurity = async (code: string) => {
  const apiKey = getApiKey();
  if (!apiKey) throw new Error("API_KEY_MISSING");
  
  const ai = new GoogleGenAI({ apiKey: apiKey });
  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: [{ role: 'user', parts: [{ text: `Conduct an offensive security audit on this code. Output JSON format only:\n\n${code}` }] }],
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          overallScore: { type: Type.NUMBER },
          summary: { type: Type.STRING },
          vulnerabilities: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                severity: { type: Type.STRING },
                title: { type: Type.STRING },
                category: { type: Type.STRING },
                description: { type: Type.STRING },
                remediation: { type: Type.STRING }
              }
            }
          }
        }
      }
    }
  });
  return JSON.parse(response.text);
};

export const generatePentestChecklist = async (targetType: string) => {
  const apiKey = getApiKey();
  if (!apiKey) throw new Error("API_KEY_MISSING");

  const ai = new GoogleGenAI({ apiKey: apiKey });
  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: [{ role: 'user', parts: [{ text: `Generate a detailed offensive pentesting roadmap for ${targetType}. Output JSON array of tasks.` }] }],
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            id: { type: Type.STRING },
            task: { type: Type.STRING },
            category: { type: Type.STRING }
          }
        }
      }
    }
  });
  return JSON.parse(response.text);
};
