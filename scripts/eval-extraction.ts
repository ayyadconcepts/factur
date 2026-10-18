import fs from 'fs';
import path from 'path';
import { GeminiClient } from '../src/server/extract/geminiClient';
import { LlmInvoiceDraft } from '../src/server/extract/schema';
import dotenv from 'dotenv';

// Charger les variables d'environnement pour GEMINI_API_KEY
dotenv.config({ path: '.env.local' });

const FIXTURES_DIR = path.join(__dirname, '../tests/fixtures/pdfs');

interface EvalResult {
  total: number;
  correct: number;
  missing: number;
  wrong: number;
}

const stats: Record<string, EvalResult> = {};

function recordStat(field: string, isCorrect: boolean, isMissing: boolean) {
  if (!stats[field]) stats[field] = { total: 0, correct: 0, missing: 0, wrong: 0 };
  stats[field].total++;
  if (isCorrect) stats[field].correct++;
  else if (isMissing) stats[field].missing++;
  else stats[field].wrong++;
}

// Fonction utilitaire pour extraire la valeur "flat" depuis LlmInvoiceDraft
function extractFieldValue(draft: any, fieldPath: string): string | null {
  const parts = fieldPath.split('.');
  let current = draft;
  for (const part of parts) {
    if (current == null) return null;
    current = current[part];
  }
  return current?.value ?? null;
}

async function runEval() {
  console.log('🚀 Démarrage de l\'évaluation (VRAI modèle Gemini)...');
  
  if (!fs.existsSync(FIXTURES_DIR)) {
    console.log(`Le dossier ${FIXTURES_DIR} n'existe pas. Création...`);
    fs.mkdirSync(FIXTURES_DIR, { recursive: true });
  }

  const files = fs.readdirSync(FIXTURES_DIR).filter(f => f.endsWith('.pdf'));
  
  if (files.length === 0) {
    console.log('⚠️ Aucun fichier PDF trouvé dans', FIXTURES_DIR);
    return;
  }

  const client = new GeminiClient();

  for (const file of files) {
    const pdfPath = path.join(FIXTURES_DIR, file);
    const expectedPath = path.join(FIXTURES_DIR, file.replace('.pdf', '.expected.json'));
    
    if (!fs.existsSync(expectedPath)) {
      console.log(`⚠️ Ignoré: ${file} (pas de fichier .expected.json)`);
      continue;
    }

    console.log(`\n📄 Traitement de ${file}...`);
    const buffer = fs.readFileSync(pdfPath);
    const expected = JSON.parse(fs.readFileSync(expectedPath, 'utf8'));

    try {
      const draft = await client.extractInvoice(buffer, 'application/pdf');
      
      const fieldsToCheck = [
        'invoiceNumber', 'issueDate', 
        'seller.siren', 'buyer.siren',
        'totals.excludingVat', 'totals.vatTotal', 'totals.includingVat'
      ];

      for (const field of fieldsToCheck) {
        const actualValue = extractFieldValue(draft, field);
        const expectedValue = expected[field] || null;

        if (actualValue === expectedValue) {
          recordStat(field, true, false);
          console.log(`  ✅ ${field} (Attendu: ${expectedValue})`);
        } else {
          recordStat(field, false, actualValue === null);
          console.log(`  ❌ ${field} - ÉCART !`);
          console.log(`     Attendu: "${expectedValue}"`);
          console.log(`     Obtenu : "${actualValue}"`);
        }
      }
    } catch (e: any) {
      console.error(`💥 Erreur fatale sur ${file} :`, e.message);
    }
  }

  console.log('\n📊 RÉSULTATS GLOBAUX :');
  console.table(
    Object.entries(stats).map(([field, res]) => ({
      Field: field,
      Total: res.total,
      Correct: res.correct,
      'Wrong (Diff)': res.wrong,
      Missing: res.missing,
      'Accuracy %': ((res.correct / res.total) * 100).toFixed(1) + '%'
    }))
  );
}

runEval().catch(console.error);
