import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { GeminiClient } from '@/server/extract/geminiClient';

// Limite Vercel / MVP
const MAX_FILE_SIZE = 4 * 1024 * 1024; // 4 Mo

// Un Map très simple pour le rate limiting basique en mémoire
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

export async function POST(req: Request) {
  console.log("[API/extract] Received request");
  try {
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { cookies: { getAll: () => cookieStore.getAll(), setAll: () => {} } }
    );

    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      console.log("[API/extract] Unauthorized");
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const now = Date.now();
    const userLimit = rateLimitMap.get(user.id);
    if (userLimit && now < userLimit.resetTime) {
      if (userLimit.count >= 50) {
        console.log("[API/extract] Rate limited");
        return NextResponse.json({ error: "Trop de requêtes. Veuillez patienter." }, { status: 429 });
      }
      userLimit.count++;
    } else {
      rateLimitMap.set(user.id, { count: 1, resetTime: now + 60000 });
    }

    console.log("[API/extract] Reading body...");
    const body = await req.json();
    console.log("[API/extract] Body read, extracting fields...");
    const { fileBase64, mimeType } = body;

    if (!fileBase64) {
      return NextResponse.json({ error: "Aucun fichier fourni" }, { status: 400 });
    }

    const buffer = Buffer.from(fileBase64, 'base64');

    if (buffer.length > MAX_FILE_SIZE) {
      return NextResponse.json({ error: "Le fichier dépasse la limite de 4 Mo pour l'extraction." }, { status: 413 });
    }

    if (mimeType !== 'application/pdf') {
      return NextResponse.json({ error: "Le fichier doit être un PDF" }, { status: 415 });
    }

    console.log("[API/extract] Validating PDF magic bytes...");
    if (buffer.length < 5 || buffer.toString('ascii', 0, 5) !== '%PDF-') {
      return NextResponse.json({ error: "Le fichier n'est pas un document PDF valide." }, { status: 415 });
    }

    console.log("[API/extract] Initializing GeminiClient...");
    const aiClient = new GeminiClient();
    
    let draft;
    try {
      console.log("[API/extract] Calling extractInvoice...");
      draft = await aiClient.extractInvoice(buffer, mimeType);
      console.log("[API/extract] extractInvoice succeeded!");
    } catch (e: any) {
      console.log("[API/extract] extractInvoice failed:", e.message);
      if (e.message && (e.message.includes('50') || e.message.includes('network') || e.message.includes('fetch'))) {
        console.log("[API/extract] Retrying extractInvoice...");
        draft = await aiClient.extractInvoice(buffer, mimeType);
        console.log("[API/extract] Retry succeeded!");
      } else {
        throw e;
      }
    }

    console.log("[API/extract] Returning draft...");
    return NextResponse.json(draft);
  } catch (error: any) {
    console.error("Erreur d'extraction détaillée:", error);
    return NextResponse.json({ 
      error: "Erreur technique: " + (error.message || String(error)) 
    }, { status: 500 });
  }
}
