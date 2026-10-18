# Extraction avec Gemini

## Architecture
Le projet utilise `gemini-3.8-flash` via le SDK `@google/genai` (version 0.1.2) pour l'extraction déterministe des factures PDF. Le modèle agit comme un puissant "lecteur" capable de normaliser les formats et de gérer les structures non prévisibles, mais la **vérification** est entièrement laissée au code de l'application (`verifyDraft.ts`).

## Configuration Modèle
- Modèle : `gemini-3.8-flash`
- `responseSchema` strict (Structured Outputs)
- Température : `0.0`
- `inlineData` (Pas d'utilisation de l'API Files)

## Traitement des données par Google
Le PDF est encodé en base64 et transmis en `inlineData` lors de la requête `generateContent`. Il n'y a pas d'utilisation de l'API Google Files, garantissant qu'aucun document n'est conservé dans le cache long terme des serveurs Google (contrairement à l'utilisation du File API qui conserve les fichiers pendant 48 heures). Google traite le document de manière éphémère. (À vérifier avec les CGU de l'API payante concernant l'entraînement des modèles).

## Limites Connues
1. Vercel limite le payload des requêtes serverless à 4.5 MB. La limite logicielle de notre route `/api/extract` est fixée à 4 Mo pour éviter les plantages (erreur 413).
2. L'absence des boîtes englobantes exactes (`bbox`) depuis Gemini : Gemini ne renvoie pas les coordonnées visuelles de ses réponses, c'est pour cette raison que nous forçons l'extraction de l'extrait textuel (`quote`) et que le code `verifyDraft.ts` ancre ce texte dans la structure de `pdf.js`.
3. Pas de Batch (par lots) : Les requêtes sont individuelles et traitées de façon synchrone.

## Coût Estimé
- Requêtes d'images PDF : ~258 tokens par page.
- Prompt Système : ~500 tokens.
- Réponse JSON : ~300 tokens.
- Coût total par facture estimé (Flash) : $0.000075 à $0.0001 per facture. À ajuster suite au run de `scripts/eval-extraction.ts`.
