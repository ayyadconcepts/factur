import { GoogleGenAI } from '@google/genai';
import { LlmInvoiceDraft } from './schema';
import { geminiInvoiceSchema } from './geminiSchema';
import { SYSTEM_PROMPT } from './systemPrompt';

export interface IGeminiClient {
  extractInvoice(pdfBytes: Buffer, mimeType: string): Promise<LlmInvoiceDraft>;
}

export class GeminiClient implements IGeminiClient {
  private ai: GoogleGenAI;
  private preferredModel: string;

  constructor() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY is not set in environment variables");
    }
    this.ai = new GoogleGenAI({ apiKey });
    this.preferredModel = process.env.GEMINI_MODEL || 'gemini-3.5-flash-lite';
  }

  async extractInvoice(pdfBytes: Buffer, mimeType: string): Promise<LlmInvoiceDraft> {
    const candidateModels = Array.from(
      new Set([
        this.preferredModel,
        'gemini-3.5-flash-lite',
        'gemini-flash-lite-latest',
        'gemini-3.8-flash',
        'gemini-3.7-flash',
      ])
    );

    let lastError: any = null;

    for (const model of candidateModels) {
      for (let attempt = 1; attempt <= 2; attempt++) {
        try {
          const response = await this.ai.models.generateContent({
            model,
            contents: [
              {
                role: 'user',
                parts: [
                  {
                    inlineData: {
                      data: pdfBytes.toString('base64'),
                      mimeType,
                    },
                  },
                  {
                    text: "Extrais les données de cette facture.",
                  },
                ],
              },
            ],
            config: {
              systemInstruction:
                SYSTEM_PROMPT +
                '\n\nIMPORTANT: Tu DOIS répondre avec un JSON qui respecte RIGOUREUSEMENT ce schéma JSON :\n' +
                JSON.stringify(geminiInvoiceSchema, null, 2),
              temperature: 0.0,
              responseMimeType: "application/json",
            },
          });

          const text = response.text;
          if (!text) {
            throw new Error(`Réponse vide reçue de l'IA (${model})`);
          }

          return JSON.parse(text) as LlmInvoiceDraft;
        } catch (err: any) {
          lastError = err;
          const msg = err?.message || String(err);
          const isTransient =
            msg.includes('503') ||
            msg.includes('429') ||
            msg.includes('high demand') ||
            msg.includes('UNAVAILABLE') ||
            msg.includes('fetch failed') ||
            msg.includes('socket') ||
            msg.includes('ETIMEDOUT');

          console.warn(`[GeminiClient] Modèle ${model} tentative ${attempt}/2 a échoué: ${msg.slice(0, 120)}`);

          if (isTransient && attempt < 2) {
            // Courte pause avant retry sur le même modèle
            await new Promise((r) => setTimeout(r, 1000));
            continue;
          }

          // Si 503 ou 404 ou non transitoire, passer au modèle suivant dans la cascade
          break;
        }
      }
    }

    // Si tous les modèles ont échoué, formater un message lisible
    const finalMsg = lastError?.message || 'Erreur inconnue du service IA';
    if (finalMsg.includes('503') || finalMsg.includes('high demand')) {
      throw new Error("Les serveurs d'analyse IA Google sont temporairement surchargés (503). Veuillez réessayer dans quelques instants.");
    }
    if (finalMsg.includes('fetch failed')) {
      throw new Error("La connexion réseau vers l'API d'analyse IA a échoué. Veuillez vérifier votre connexion et réessayer.");
    }

    throw new Error(`Échec de l'extraction IA : ${finalMsg}`);
  }
}
