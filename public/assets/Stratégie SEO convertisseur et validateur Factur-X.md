## 

Cette section est à implémenter **avant** la publication. Elle répond à la question des paramètres canonical.

### **9.1 Règles générales**

1. **Un seul hôte** : https, avec ou sans www (choisissez-en un). Toutes les autres variantes (http, l’autre hôte) redirigent en 301 vers l’hôte retenu.  
2. **Pas de slash final** (sauf la racine) : /ressources/avoir-factur-x, pas /ressources/avoir-factur-x/. Dans Next.js : trailingSlash: false. La variante avec slash redirige en 301\.  
3. **URLs en minuscules**, mots séparés par des tirets, sans accents ni paramètres.  
4. **Chaque page indexable porte un canonical auto-référent en URL absolue**, une seule fois, avec la même valeur dans og:url.  
5. **Canonical n’est pas une redirection** : une URL qui ne doit plus exister se redirige en 301 (ou répond 410), elle n’est pas « canonicalisée ».  
6. **Une page noindex ne pointe jamais vers une page indexable par son canonical** (signaux contradictoires), et n’apparaît jamais dans le sitemap.  
7. **Ne bloquez pas dans robots.txt une page que vous voulez noindexer** : Google doit pouvoir la crawler pour lire la balise noindex. /login et /signup restent donc crawlables avec noindex.  
8. Le sitemap ne contient que des URLs **indexables, canoniques et répondant 200**, avec une vraie date lastmod (date de modification du contenu, pas de génération).

### **9.2 Traitement des paramètres et des variantes**

| Cas | Traitement | Canonical |
| :---- | :---- | :---- |
| ?utm\_source, ?utm\_medium, ?gclid, ?fbclid, ?ref, ?mc\_cid | Même page ; aucun traitement spécial | URL propre, sans paramètre |
| ?next= sur /login et /signup | Pages d’application | Aucun (pages noindex) |
| Pagination de /ressources | Utiliser un chemin, pas un paramètre : /ressources/page/2 | Auto-référent ; index, follow. /ressources/page/1 redirige en 301 vers /ressources |
| Recherche interne ou tri (?q=, ?sort=) | Ne pas générer de pages indexables | noindex, follow ; canonical vers /ressources |
| Tags, archives par date, pages d’auteur sans contenu | Ne pas créer | Sans objet |
| Résultats du validateur (/validateur-factur-x/resultat/...) | Contenu propre à l’utilisateur | noindex en en-tête X-Robots-Tag, absent du sitemap |
| Pages de campagne publicitaire | Contenu proche d’un pilier : canonical vers le pilier. Intention différente : noindex | Pilier correspondant ou aucun |
| Contenu republié (LinkedIn, Medium) | Si la plateforme le permet, canonical vers votre article ; sinon un extrait et un lien, jamais la copie intégrale | URL d’origine |
| Hubs de cluster (/ressources/conversion, etc.) | Indexables uniquement avec au moins 4 articles et une introduction unique de 250 mots | Auto-référent ; sinon noindex, follow |
| Anciennes URLs supprimées | 301 vers l’équivalent le plus proche, ou 410 | Sans objet |
| Version anglaise (plus tard) | Chemin /en/, hreflang réciproques et x-default, canonical auto-référent **dans chaque langue** | Jamais vers l’autre langue |

### **9.3 Table des pages**

| Page | Canonical | Robots | Sitemap |
| :---- | :---- | :---- | :---- |
| / | https\://\[domaine\]/ | index, follow | Oui |
| /validateur-factur-x | auto-référent | index, follow | Oui |
| /ressources | auto-référent | index, follow | Oui |
| /ressources/conversion, /validation, /bases | auto-référent | index, follow (selon la règle des 4 articles) | Oui si indexé |
| /ressources/{slug} (19 articles) | auto-référent | index, follow | Oui |
| /tarifs, /a-propos | auto-référent | index, follow | Oui |
| /confidentialite, /mentions-legales, /cgu | auto-référent | index, follow | Oui |
| /login, /signup | aucun | noindex, follow | Non |
| /dashboard/\*, /api/\* | aucun | noindex (en-tête X-Robots-Tag) ; Disallow dans robots.txt autorisé car ces pages sont privées | Non |
| Page de remerciement, états d’erreur | aucun | noindex | Non |

### **9.4 Implémentation Next.js (App Router)**

// app/layout.tsx  
export const metadata \= {  
  metadataBase: new URL('https\://\[domaine\]'),  
};

// app/ressources/\[slug\]/page.tsx  
export async function generateMetadata({ params }) {  
  const { slug } \= await params; // selon la version de Next.js, params est une Promise  
  const post \= await getPost(slug);  
  return {  
    title: post.title,  
    description: post.metaDescription,  
    alternates: { canonical: \`/ressources/\${slug}\` },  
    openGraph: { type: 'article', url: \`/ressources/\${slug}\` },  
    robots: { index: true, follow: true },  
  };  
}

// app/(auth)/login/page.tsx et signup, dashboard  
export const metadata \= { robots: { index: false, follow: true } };

\# app/robots.ts produit l'équivalent de :  
User-agent: \*  
Allow: /  
Disallow: /api/  
Disallow: /dashboard  
Sitemap: https\://\[domaine\]/sitemap.xml

* app/sitemap.ts liste uniquement les pages de la colonne « Sitemap : Oui », avec lastModified lu dans la source du contenu.  
* Ajoutez dans next.config un en-tête X-Robots-Tag: noindex pour /api/\* et pour les chemins de résultats d’outil.  
* Les paramètres de suivi n’ont pas besoin d’être supprimés par un middleware : le canonical auto-référent suffit.

### **9.5 Données structurées (JSON-LD)**

| Type de page | Balisage |
| :---- | :---- |
| Accueil | Organization, WebApplication (catégorie BusinessApplication, système Web, offre uniquement si elle existe), FAQPage |
| Validateur | WebApplication, FAQPage, BreadcrumbList |
| Articles | Article (titre, datePublished, dateModified, auteur Person, éditeur Organization), BreadcrumbList, FAQPage si la FAQ est visible |

Points d’attention :

* Google a fortement réduit l’affichage des résultats enrichis FAQ depuis 2023 : gardez les FAQ pour vos lecteurs et pour les moteurs de réponse, sans en attendre un gain d’affichage.  
* N’utilisez pas HowTo (résultats enrichis supprimés).  
* Aucun aggregateRating sans avis réels et vérifiables.  
* Ne balisez rien qui ne soit pas visible sur la page. Testez avec l’outil de test des résultats enrichis de Google.

### **9.6 Liste de contrôle avant mise en ligne**

1. Redirections http, www et slash final testées.  
2. Chaque page indexable renvoie 200 et porte un canonical auto-référent unique.  
3. noindex présent sur login, signup, dashboard et résultats d’outils.  
4. Sitemap soumis dans Search Console, sans URL noindex ni redirigée.  
5. robots.txt n’interdit aucune page de contenu.  
6. JSON-LD valide et conforme au contenu visible.  
7. Pages de contenu rendues côté serveur (le HTML initial contient le texte).  
8. Les pages d’article ne chargent ni pdf.js ni le code d’outil.  
9. Titres de 60 caractères au maximum et descriptions de 120 à 155 caractères.  
10. Chaque page a au moins un lien entrant interne (aucune page orpheline).

## **10\. Fiches des deux pages piliers**

### **10.1 Pilier 1 : / (convertisseur PDF en Factur-X)**

| Élément | Valeur |
| :---- | :---- |
| Mot-clé principal | convertisseur pdf en factur-x |
| Mots-clés secondaires | convertir pdf en factur-x, transformer une facture pdf en factur-x, pdf vers factur-x, convertir facture en factur-x, pdf en facturx (variante sans trait d’union), convertisseur factur-x gratuit (seulement si une offre gratuite existe) |
| Intention | Transactionnelle (utiliser l’outil) avec besoin de comprendre le fonctionnement et de se rassurer |
| Concurrence | Très forte : une dizaine d’outils dédiés. Objectif 9 à 18 mois |
| Title (60 max) | Convertisseur PDF en Factur-X gratuit | \[Marque\] (si une offre gratuite existe ; sinon : Convertisseur PDF en Factur-X en ligne | \[Marque\]) |
| Meta description | Déposez votre facture PDF : les données sont extraites, contrôlées côte à côte puis intégrées en XML. Votre PDF reste identique. EN 16931\. |
| H1 | Convertissez votre facture PDF en Factur-X |
| Longueur | 1 200 à 1 600 mots sous l’outil |

**Structure (H2)**

1. **Hero** : zone de dépôt, trois preuves (extraction automatique, contrôles visibles, PDF identique), mention du traitement des données avec lien vers la confidentialité.  
2. **Comment ça marche** en 4 étapes : déposez, vérifiez côte à côte, contrôles automatiques, téléchargez.  
3. **Ce que nous vérifions pour vous** (c’est votre différenciation) : tableau contrôle, exemple, résultat (SIREN avec Luhn, clé de TVA, IBAN, SIRET cohérent avec le SIREN, HT \+ TVA \= TTC, valeur présente dans le PDF).  
4. **Ce que contient votre Factur-X** : PDF/A-3 et XML EN 16931, ce qui reste identique visuellement.  
5. **Pour qui** : indépendants, TPE, cabinets comptables (liens vers les articles 6 et 5).  
6. **Après la conversion** : où envoyer le fichier (lien vers l’article 10). Préciser clairement que l’outil ne transmet pas la facture à l’administration.  
7. **Vérifier un fichier existant** : lien vers le validateur.  
8. **Tarifs en deux lignes** et lien vers /tarifs.  
9. **FAQ** (voir ci-dessous).  
10. **Bloc de confiance** : auteur ou équipe, date de mise à jour, sources officielles (FNFE-MPE, impots.gouv.fr).

**CTA** : principal « Convertir ma facture » (hero, après l’étape 2, fin de page). Secondaire « Valider un fichier existant » vers le pilier 2 (section 7).

**FAQ (réponses à valider avec le produit réel avant publication)**

1. *Comment convertir un PDF en Factur-X ?* Déposez le PDF, vérifiez les données extraites, téléchargez le fichier : l’outil ajoute à votre PDF un XML EN 16931 et les métadonnées PDF/A-3.  
2. *Faut-il ressaisir les données ?* Non, elles sont extraites automatiquement. Vous contrôlez et corrigez uniquement les écarts signalés ; vous restez responsable de l’exactitude de la facture.  
3. *Mon PDF reste-t-il identique ?* Dans le mode fidèle, le PDF d’origine est conservé ; seuls le XML et les métadonnées sont ajoutés. \[Préciser les cas où une régénération est nécessaire.\]  
4. *Que vérifie l’outil ?* SIREN, SIRET, numéro de TVA, IBAN, cohérence des totaux, présence de chaque valeur dans le PDF.  
5. *Le fichier est-il accepté par ma plateforme agréée ?* Il vise la norme EN 16931 \[et les règles françaises BR-FR si elles sont exécutées\]. Chaque plateforme applique ses propres contrôles : testez avec le validateur et avec votre plateforme.  
6. *L’outil envoie-t-il la facture à l’administration ?* Non. Vous déposez le fichier sur votre plateforme agréée.  
7. *Que devient mon fichier ?* \[Écrire exactement le traitement réel : API d’IA utilisée et son statut, durée de conservation, stockage optionnel, suppression.\]  
8. *Puis-je convertir un avoir ou une facture avec plusieurs taux de TVA ?* \[Oui si pris en charge\] avec liens vers les articles 7 et 8\.  
9. *Combien ça coûte ?* \[À compléter.\]

### **10.2 Pilier 2 : /validateur-factur-x**

| Élément | Valeur |
| :---- | :---- |
| Mot-clé principal | validateur factur-x |
| Mots-clés secondaires | valider factur-x, vérifier une facture factur-x, tester factur-x en ligne, vérifier conformité factur-x, factur-x validator, validateur facture électronique |
| Intention | Transactionnelle (outil de diagnostic) |
| Concurrence | Très forte (FNFE-MPE officiel et au moins huit outils). Se gagne par la clarté du rapport en français et les pages d’erreurs reliées |
| Title | Validateur Factur-X en ligne gratuit | \[Marque\] |
| Meta description | Vérifiez votre fichier Factur-X : PDF/A-3, XML embarqué, EN 16931 et règles françaises. Erreurs expliquées en français, avec la correction. |
| H1 | Validateur Factur-X en ligne |

**Exigences produit** : aucune inscription ; analyse dans le navigateur si possible (argument de confiance) ; Schematron EN 16931 **et** BR-FR ; fichiers PDF ou XML jusqu’à 10 Mo ; pages de résultat non indexables.

**Structure (H2)**

1. **Outil** : dépôt d’un PDF ou d’un XML ; verdict clair (valide, invalide, pas un Factur-X).  
2. **Lire le rapport** : quatre blocs (PDF/A-3, XML embarqué et nom du fichier, profil et XSD, règles Schematron EN 16931 et BR-FR). Chaque erreur affiche son code avec un lien vers sa fiche explicative (articles 11, 12, 13).  
3. **Ce que ce validateur vérifie, et ce qu’il ne vérifie pas** (lien vers l’article 14). Précisez qu’il ne remplace pas la validation de votre plateforme agréée.  
4. **Confidentialité** : ce qui arrive au fichier (à écrire exactement).  
5. **Que faire si le fichier est invalide** : liens vers le convertisseur et vers les guides.  
6. **FAQ**.

**CTA conditionnels dans le résultat** : « pas un Factur-X » mène à « Convertir ce PDF » (pilier 1\) ; erreurs XML mène à la fiche d’erreur, puis à « Régénérer ce fichier avec le convertisseur ». Fichier valide : proposition de lecture de la FAQ et de l’article sur l’envoi (article 10).

**FAQ**

1. *Qu’est-ce qu’un validateur Factur-X ?* Un outil qui contrôle qu’un PDF contient un XML conforme et que le conteneur est un PDF/A-3.  
2. *Comment savoir si ma facture est un Factur-X ?* Le validateur cherche une pièce jointe factur-x.xml dans le PDF ; sans elle, c’est un PDF ordinaire.  
3. *Pourquoi mon PDF s’ouvre-t-il mais est-il refusé ?* La conformité se joue dans des éléments invisibles : polices embarquées, métadonnées, XML. Lien vers l’article 4\.  
4. *Quelle différence entre XSD, Schematron et PDF/A ?* Structure XML, règles métier, conteneur PDF. Lien vers l’article 14\.  
5. *Ce validateur est-il officiel ?* Non. Le validateur officiel de la FNFE-MPE existe séparément. \[Préciser les règles et versions utilisées.\]  
6. *Mes fichiers sont-ils conservés ?* \[À écrire selon l’implémentation réelle.\]  
7. *Quels profils sont supportés ?* \[MINIMUM, BASIC WL, BASIC, EN 16931, EXTENDED, selon l’implémentation.\]  
8. *Que faire en cas d’erreur BR-CO-15 ?* Lien vers l’article 12\.

## **11\. Fiches des 19 articles**

### **Comment utiliser les fiches**

Chaque fiche est la **variable du prompt de rédaction** (section 14\) : copiez le prompt maître, puis collez la fiche de l’article. Les liens sortants listés sont obligatoires ; les ancres sont des suggestions (voir les règles d’ancres en section 13).

**Légende des liens** : P1 \= / (convertisseur), P2 \= /validateur-factur-x.

| Code | URL (sous /ressources/) |
| :---- | :---- |
| A1 | convertir-facture-word-en-factur-x |
| A2 | convertir-facture-excel-en-factur-x |
| A3 | factur-x-xml-pdf-incoherents |
| A4 | pdf-a-3-facture-refusee |
| A5 | factur-x-cabinet-comptable |
| A6 | factur-x-micro-entrepreneur |
| A7 | avoir-factur-x |
| A8 | factur-x-plusieurs-taux-tva |
| A9 | facture-fournisseur-pdf-simple |
| A10 | envoyer-factur-x-plateforme-agreee |
| A11 | erreurs-validation-factur-x |
| A12 | erreur-br-co-15 |
| A13 | erreur-br-fr-12-br-fr-13 |
| A14 | ce-que-controle-un-validateur-factur-x |
| A15 | comparatif-validateurs-factur-x |
| A16 | factur-x-definition-profils |
| A17 | calendrier-facturation-electronique-2026-2027 |
| A18 | etude-exports-pdf-factur-x |
| A19 | convertisseur-factur-x-confidentialite-ia |

**Règle d’exactitude pour tous les articles** : ne jamais recopier un code d’erreur, une règle ou un chiffre d’un site concurrent. La source de vérité est le Schematron officiel, la spécification Factur-X de la FNFE-MPE et les textes de la DGFiP. Plusieurs guides concurrents contiennent des erreurs de codes (par exemple une règle présentée pour « aucune ligne de facture » qui, à ma connaissance, correspond à une autre règle) : **vérifiez chaque code dans les fichiers officiels avant publication**.

### **Cluster Conversion (soutient P1)**

#### **A1 : Convertir une facture Word en Factur-X**

* **Mot-clé principal** : convertir facture word en factur-x. **Secondaires** : facture word factur-x, word en factur-x, modèle de facture word factur-x.  
* **Intention et concurrence** : « comment faire » ; concurrence moyenne (un concurrent dispose d’une page dédiée).  
* **Preuve originale requise** : exporter un vrai modèle Word (Windows et Mac, version actuelle) en PDF, le passer dans le validateur et publier les captures avec la version testée et la date.  
* **Title** : Convertir une facture Word en Factur-X. **Meta** : Votre facture est un modèle Word ? Voici comment obtenir un PDF/A-3 avec XML EN 16931, sans changer d’outil ni ressaisir vos données.  
* **Plan (H2)** : pourquoi l’export PDF de Word ne suffit pas (résultat du test) ; la méthode en 4 étapes (exporter, convertir, vérifier côte à côte, valider) ; les pièges Word (polices, logos PNG transparents, tableaux) ; l’alternative d’un logiciel de facturation ; après la conversion.  
* **FAQ** : Word peut-il exporter directement du Factur-X ? Pourquoi mon PDF Word est-il refusé ? Dois-je changer mon modèle de facture ?  
* **CTA** : convertisseur (encadré avec zone de dépôt après l’introduction, puis après l’étape 2, puis en fin d’article) ; validateur à l’étape 4\.  
* **Liens sortants** : P1 (premier paragraphe, ancre « convertir votre PDF en Factur-X »), P2 (étape 4), A4, A2, A10.

#### **A2 : Convertir une facture Excel en Factur-X**

* **Mot-clé principal** : convertir facture excel en factur-x. **Secondaires** : facture excel factur-x, excel en factur-x, facture google sheets factur-x.  
* **Intention et concurrence** : « comment faire » ; concurrence moyenne.  
* **Preuve originale requise** : reproduire un modèle Excel dont les formules produisent plus de deux décimales, et montrer l’écart d’un centime qui provoque l’erreur BR-CO-15 dans le validateur.  
* **Title** : Convertir une facture Excel en Factur-X. **Meta** : Facture sous Excel : exporter en PDF puis ajouter le XML Factur-X. Méthode pas à pas, pièges des formules et arrondis, contrôles avant envoi.  
* **Plan** : exporter en PDF (zone d’impression, une page) ; le piège des arrondis (valeur affichée et valeur stockée, fonction ARRONDI) ; convertir et vérifier ; classeurs à plusieurs feuilles ; Google Sheets.  
* **FAQ** : Excel peut-il produire un Factur-X ? Pourquoi un écart d’un centime fait-il échouer la validation ? Et avec Google Sheets ?  
* **CTA** : convertisseur après l’étape d’export ; validateur en fin d’article.  
* **Liens sortants** : P1, P2, A12, A8, A1.

#### **A3 : XML et PDF qui divergent**

* **Mot-clé principal** : factur-x xml pdf différents. **Secondaires** : incohérence xml pdf factur-x, quelle version fait foi factur-x, cohérence des données factur-x.  
* **Intention et concurrence** : informationnelle ; concurrence faible à moyenne (le sujet est traité en quelques paragraphes dans des guides généraux, sans page dédiée dans mes recherches : **à confirmer** sur la page de résultats).  
* **Preuve originale requise** : fabriquer deux fichiers de test (une divergence de montant, une divergence de date), les passer dans trois validateurs et publier ce que chacun détecte. **N’affirmez rien avant d’avoir testé.**  
* **Title** : Factur-X : que faire si XML et PDF divergent ? **Meta** : Le XML dit 1 200 €, le PDF 1 020 € ? Ce que prévoit la norme, ce que voit votre client et comment vérifier la cohérence avant l’envoi.  
* **Plan** : le principe (les données du XML doivent figurer dans le PDF lisible, selon la spécification Factur-X) ; qui lit quoi ; ce qui se passe en cas de divergence (plusieurs sources indiquent que le XML prévaut pour le traitement automatique, mais l’écart reste une anomalie) ; comment la divergence naît (extraction erronée, correction manuelle, modification du PDF après coup) ; comment l’éviter ; résultat du test des validateurs.  
* **FAQ** : Quelle version fait foi ? Peut-on modifier le PDF d’un Factur-X ? Un validateur détecte-t-il cet écart ?  
* **CTA** : convertisseur dans la section « comment l’éviter », avec une capture de la vérification côte à côte ; validateur en fin d’article.  
* **Liens sortants** : P1 (ancre « vérification côte à côte »), P2, A14, A4, A16.

#### **A4 : PDF/A-3, pourquoi votre facture est refusée**

* **Mot-clé principal** : pdf/a-3 facture refusée. **Secondaires** : pdf non conforme pdf/a-3, polices non embarquées pdf/a, mon pdf n’est pas pdf/a-3, vérifier pdf/a-3 facture.  
* **Intention et concurrence** : diagnostic ; concurrence moyenne à forte (au moins cinq sites).  
* **Preuve originale requise** : trois PDF de sources différentes avant et après conversion, avec rapport du validateur et de veraPDF. Exemple de constat de première main à utiliser : un PDF produit par WeasyPrint avait ses polices embarquées mais ne contenait ni métadonnées XMP ni profil de sortie couleur.  
* **Title** : PDF/A-3 : pourquoi votre facture est refusée. **Meta** : Polices non embarquées, couleurs, métadonnées : les causes visibles seulement avec un validateur, et comment obtenir un PDF/A-3 valide.  
* **Plan** : ce que PDF/A-3 exige (polices, profil couleur, XMP, pièce jointe avec la bonne relation, ni JavaScript ni chiffrement) ; les causes de refus les plus fréquentes et comment les repérer ; diagnostiquer (validateur, veraPDF) ; corriger ; les cas où le PDF d’origine ne peut pas être sauvé.  
* **FAQ** : Quelle différence entre PDF/A-1, A-2 et A-3 ? Pourquoi mon PDF s’ouvre-t-il bien mais est-il refusé ? Peut-on convertir un PDF/A-1 en PDF/A-3 ?  
* **CTA** : validateur en haut de l’article ; convertisseur dans la partie « corriger ».  
* **Liens sortants** : P2, P1, A14, A18, A1.

#### **A5 : Cabinet comptable, factures clients en Factur-X**

* **Mot-clé principal** : factur-x cabinet comptable. **Secondaires** : convertir factures clients factur-x, expert-comptable conversion factur-x, traitement par lots factur-x.  
* **Intention et concurrence** : informationnelle et commerciale (B2B) ; concurrence faible à moyenne.  
* **Preuve originale requise** : scénario mesuré (temps de traitement de 50 factures de 10 clients) ou témoignage d’un cabinet partenaire.  
* **Title** : Cabinet comptable : factures clients en Factur-X. **Meta** : Plusieurs clients, des PDF de toutes origines : méthode de conversion par lots, contrôle des identifiants et suivi par entreprise.  
* **Plan** : le problème du cabinet ; méthode en 5 étapes (collecte, rapprochement par SIREN, extraction, contrôle, archivage) ; contrôles qui comptent (SIREN, TVA, doublons de numéro) ; responsabilités (le client reste émetteur ; **avis juridique à faire valider**) ; organisation par entreprise ; fonctionnalités de l’outil (uniquement celles disponibles).  
* **FAQ** : Comment traiter les factures de plusieurs clients ? Qui est responsable de l’exactitude ? Peut-on garder un historique par entreprise ?  
* **CTA** : convertisseur ; lien vers l’offre cabinet dans /tarifs ; formulaire de contact.  
* **Liens sortants** : P1, A9, A10, A17, A6.

#### **A6 : Micro-entrepreneur et Factur-X**

* **Mot-clé principal** : factur-x micro-entrepreneur. **Secondaires** : auto-entrepreneur facture électronique factur-x, convertir facture auto-entrepreneur, mention tva non applicable 293 b factur-x, franchise en base tva factur-x.  
* **Intention et concurrence** : informationnelle et « comment faire » ; forte pour « facturation électronique auto-entrepreneur », plus faible pour « convertir ses factures existantes ».  
* **Preuve originale requise** : facture type en franchise en base convertie, avec XML annoté (catégorie d’exonération et motif).  
* **Title** : Micro-entrepreneur : convertir ses factures en Factur-X. **Meta** : Vous gardez votre modèle de facture actuel. Calendrier, mention de franchise en base (293 B) et conversion de vos PDF existants en Factur-X.  
* **Plan** : où en est le calendrier (réception depuis 2026, émission et e-reporting en 2027, y compris en franchise en base selon plusieurs sources : **à confirmer sur le site de la DGFiP**) ; garder son modèle ; la mention 293 B dans le PDF et le motif d’exonération dans le XML ; clients particuliers ; sanctions et tolérance ; marche à suivre.  
* **FAQ** : Un micro-entrepreneur doit-il faire du Factur-X ? Comment mentionner la franchise en base ? Et si mon client est un particulier ?  
* **CTA** : convertisseur.  
* **Liens sortants** : P1, A7, A10, A17, A16.

#### **A7 : Faire un avoir en Factur-X**

* **Mot-clé principal** : avoir factur-x. **Secondaires** : facture d’avoir électronique, convertir un avoir pdf en factur-x, type de document 381\.  
* **Intention et concurrence** : « comment faire » ; concurrence moyenne (traité dans des FAQ d’outils).  
* **Preuve originale requise** : un avoir complet converti avec XML annoté. **Règle de signe des montants à vérifier dans la spécification EN 16931 avant de rédiger : ne pas l’affirmer de mémoire.**  
* **Title** : Faire un avoir en Factur-X : méthode et pièges. **Meta** : Un avoir au format Factur-X : type de document, référence à la facture d’origine, signe des montants. Les erreurs à éviter avant envoi.  
* **Plan** : quand émettre un avoir ; type de document et référence à la facture d’origine ; les montants ; convertir un avoir PDF existant ; erreurs fréquentes ; numérotation.  
* **FAQ** : Peut-on annuler une facture déjà envoyée en Factur-X ? L’avoir doit-il référencer la facture d’origine ? Peut-on faire un avoir partiel ?  
* **CTA** : convertisseur.  
* **Liens sortants** : P1, P2, A12, A8, A10.

#### **A8 : Factur-X avec plusieurs taux de TVA**

* **Mot-clé principal** : factur-x plusieurs taux de tva. **Secondaires** : facture multi taux tva xml, ventilation tva factur-x.  
* **Intention et concurrence** : « comment faire » ; concurrence moyenne à faible.  
* **Preuve originale requise** : facture avec 20 %, 10 %, 5,5 % et une ligne exonérée ; XML annoté ; rapport du validateur sans erreur.  
* **Title** : Factur-X avec plusieurs taux de TVA : comment faire. **Meta** : 20 %, 10 %, 5,5 % sur une même facture : la ventilation de TVA attendue dans le XML, les arrondis et les erreurs BR-CO à éviter.  
* **Plan** : ce que le XML attend (une ligne de ventilation par catégorie et taux) ; exemple chiffré ; règle d’arrondi de la TVA par catégorie (**à lire dans le Schematron**) ; catégories de TVA ; erreurs BR-CO fréquentes ; comment l’outil recalcule et compare.  
* **FAQ** : Comment arrondir la TVA ? Faut-il une ligne de ventilation par taux ? Quelle catégorie pour une TVA à 0 % ou une exonération ?  
* **CTA** : convertisseur ; validateur pour vérifier le résultat.  
* **Liens sortants** : P1, P2, A12, A7, A2.

#### **A9 : Fournisseur qui envoie un PDF simple**

* **Mot-clé principal** : facture fournisseur pdf simple. **Secondaires** : recevoir facture électronique pdf, fournisseur envoie pdf facture électronique, convertir facture fournisseur en factur-x.  
* **Intention et concurrence** : résolution de problème ; concurrence moyenne (contenus de plateformes).  
* **Preuve originale requise** : paraphrase de la FAQ officielle de la DGFiP et avis d’un expert-comptable. **Sujet sensible juridiquement : relecture obligatoire.**  
* **Title** : Fournisseur qui envoie un PDF simple : que faire ? **Meta** : Depuis le 1er septembre 2026 vous devez pouvoir recevoir des factures électroniques. Que faire des PDF simples encore reçus ? Réponses claires.  
* **Plan** : ce qui est obligatoire en réception ; pourquoi vous recevez encore des PDF (émission des PME en 2027\) ; que faire (accepter, demander une facture électronique, importer) ; convertir pour votre logiciel : **une donnée d’import n’est pas une facture émise par le fournisseur** ; choisir une plateforme pour recevoir.  
* **FAQ** : Dois-je refuser une facture PDF simple ? Puis-je la convertir moi-même ? Comment recevoir des factures via une plateforme ?  
* **CTA** : convertisseur, avec le rappel que la conversion sert à l’import interne.  
* **Liens sortants** : P1, A10, A17, A5, A16.

#### **A10 : Envoyer un Factur-X**

* **Mot-clé principal** : envoyer facture factur-x. **Secondaires** : déposer factur-x plateforme agréée, factur-x chorus pro, comment transmettre une facture électronique, où envoyer un factur-x.  
* **Intention et concurrence** : « comment faire » ; concurrence forte (contenus de plateformes agréées).  
* **Preuve originale requise** : un schéma du parcours (émetteur, sa plateforme, la plateforme du destinataire, le client ; données vers l’administration) et, si possible, des captures de dépôt sur une ou deux plateformes réelles, avec leur accord. Lien vers la liste officielle des plateformes agréées sur impots.gouv.fr (**vérifier l’URL exacte**).  
* **Title** : Envoyer un Factur-X : plateforme agréée ou Chorus Pro. **Meta** : Votre Factur-X est prêt : où le déposer, qui transmet les données à l’administration et ce qui change selon la taille de votre entreprise.  
* **Plan** : ce que vous avez en main ; les trois destinataires (client privé, client public via Chorus Pro, particulier ou étranger avec e-reporting) ; comment fonctionne une plateforme agréée ; déposer le fichier (téléversement, e-mail ou API selon la plateforme) ; checklist avant envoi ; **cet outil n’est pas une plateforme agréée et ne transmet rien**.  
* **FAQ** : Mon outil peut-il envoyer la facture ? L’e-mail suffit-il encore entre entreprises ? (réponse selon la taille de l’entreprise et la date : renvoyer vers A17) Quelle différence entre Chorus Pro et une plateforme agréée ?  
* **CTA** : validateur dans la checklist avant envoi ; convertisseur pour ceux qui n’ont pas encore de Factur-X.  
* **Liens sortants** : P2, P1, A17, A9, A16.

## **15\. Textes complets des 19 articles**

**À lire avant de publier**

1. **Marqueurs** : \[À COMPLÉTER\] \= donnée que vous devez mesurer vous-même (aucun résultat de test n’est inventé dans ces textes) ; \[À VÉRIFIER\] \= fait à confirmer dans une source officielle (Schematron EN 16931, spécification Factur-X de la FNFE-MPE, site de la DGFiP). **Ne publiez aucun article tant qu’il reste un marqueur.**  
2. **Nom du produit** : « Factur-X Facile » est utilisé tel que vous l’avez choisi.  
3. **Promesses produit** : ne conservez que ce qui est vrai le jour de la mise en ligne (voir le tableau de la section 3). Les passages « dans Factur-X Facile » décrivent le produit tel que conçu ; supprimez ce qui n’est pas encore livré (lots, historique, validateur).  
4. **Données d’exemple** : les entreprises, SIREN et IBAN des exemples sont fictifs et servent uniquement à illustrer.  
5. Ces textes informent, ils ne remplacent ni un conseil juridique ni l’avis de votre expert-comptable.  
6. **Positionnement** : les articles présentent l’extraction automatique **et** la vérification côte à côte. Ils ne prétendent pas que les autres outils obligent à ressaisir les données.

### **A1 · Convertir une facture Word en Factur-X**

**URL** : /ressources/convertir-facture-word-en-factur-x · **Title** : Convertir une facture Word en Factur-X · **Meta** : Votre facture est un modèle Word ? Voici comment obtenir un PDF/A-3 avec XML EN 16931, sans changer d’outil ni ressaisir vos données.

Vous facturez avec un modèle Word et vous entendez partout qu’il faut du « Factur-X » ? Bonne nouvelle : vous n’avez pas forcément à abandonner votre modèle. On peut transformer une facture Word en Factur-X en deux temps : l’exporter en PDF, puis y ajouter les données structurées (un fichier XML conforme à la norme EN 16931\) dans un PDF de type PDF/A-3. Cet article explique la méthode, les pièges propres à Word, et comment contrôler le résultat avant l’envoi.

***Convertir ma facture Word en Factur-X** : déposez votre PDF exporté dans le convertisseur PDF en Factur-X de Factur-X Facile ; les données sont extraites, puis vérifiées côte à côte avec votre facture.*

#### **Ce que Word produit, et ce qu’il ne produit pas**

Word sait enregistrer un document en PDF. Il ne sait pas, à lui seul, y joindre un fichier XML structuré ni garantir le format d’archivage que Factur-X impose. Un fichier Factur-X est un **PDF/A-3** (la variante du PDF qui autorise les pièces jointes) contenant un fichier nommé factur-x.xml. La partie lisible (votre facture) est pour le client ; la partie XML est pour les logiciels et les plateformes.

Deux écarts à connaître :

* **Le PDF « normal » de Word n’est pas un PDF/A-3.** Il peut contenir des éléments que le format d’archivage interdit ou exige autrement (polices non incorporées, métadonnées absentes).  
* **L’option « conforme PDF/A » de Word** correspond, d’après les informations que j’ai trouvées, à une version ancienne du format (PDF/A-1) qui ne prévoit pas de pièce jointe. \[À VÉRIFIER sur votre version de Word\]

| Test réalisé par nos soins | Résultat |
| :---- | :---- |
| Word pour Windows, version \[À COMPLÉTER\], export PDF standard | \[À COMPLÉTER : rapport du validateur\] |
| Word pour Windows, option PDF/A cochée | \[À COMPLÉTER\] |
| Word pour Mac, version \[À COMPLÉTER\], export PDF | \[À COMPLÉTER\] |

*Date du test : \[À COMPLÉTER\]. Vous pouvez reproduire ces tests avec le validateur Factur-X.*

#### **La méthode en 4 étapes**

**Étape 1 : préparer le modèle.** Avant d’exporter, vérifiez que votre facture contient toutes les données dont le XML aura besoin (tableau plus bas). Un modèle Word incomplet donne un Factur-X incomplet : le XML ne peut pas contenir plus que ce qui est lisible dans le PDF.

**Étape 2 : exporter en PDF.** Utilisez « Enregistrer sous » ou « Exporter » en PDF plutôt que « Imprimer en PDF » quand c’est possible, et gardez le texte sélectionnable. Une facture exportée en image (capture, scan) rend l’extraction automatique beaucoup moins fiable.

**Étape 3 : convertir.** Déposez le PDF dans Factur-X Facile. L’outil lit le texte, en extrait le numéro de facture, les dates, les parties, les lignes et les totaux, puis vous les présente **à côté de votre PDF**. Chaque valeur est reliée à l’endroit du document où elle est imprimée, et des contrôles automatiques portent sur les identifiants (SIREN, numéro de TVA, IBAN) et sur les montants (additions et TVA recalculées). C’est à vous de confirmer : vous restez responsable de l’exactitude de la facture.

**Étape 4 : valider.** Passez le fichier obtenu dans un validateur Factur-X : il vérifie le conteneur PDF/A-3, la présence du XML et ses règles. Si une erreur apparaît, consultez le guide des codes d’erreur.

#### **Les données à prévoir dans votre modèle Word**

Les sources que j’ai consultées indiquent que la réforme ajoute plusieurs mentions obligatoires sur les factures entre assujettis à la TVA. \[À VÉRIFIER sur le site de la DGFiP\]

| Donnée | Où la placer dans le modèle | Exemple |
| :---- | :---- | :---- |
| Numéro de facture | En-tête, unique et chronologique | FA-2026-10-0042 |
| Date d’émission | En-tête | 08/10/2026 |
| Date de la prestation ou de la livraison | En-tête | 05/10/2026 |
| Date d’échéance | En-tête ou pied de page | 07/11/2026 |
| SIREN du vendeur (SIRET facultatif) | Bloc vendeur | 834 567 893 |
| SIREN du client (nouveauté) | Bloc client | 912 345 675 |
| Numéros de TVA intracommunautaire | Blocs vendeur et client | FR25834567893 |
| Adresses complètes | Blocs vendeur et client | 12 rue de la Paix, 75002 Paris |
| Adresse de livraison si différente | Bloc client | Identique ou adresse |
| Nature de l’opération (biens, services ou mixte) | Sous l’en-tête | Prestation de services |
| Option pour la TVA sur les débits, le cas échéant | Pied de page | TVA acquittée sur les encaissements |
| Lignes : description, quantité, prix unitaire HT, taux de TVA, total HT | Tableau | 1 × 1 200,00 € à 20 % |
| Totaux HT, TVA, TTC | Sous le tableau | 1 500,00 / 300,00 / 1 800,00 |
| Coordonnées bancaires et conditions de paiement | Pied de page | IBAN, BIC, 30 jours |
| Pénalités de retard et indemnité forfaitaire de 40 € | Pied de page | Selon vos conditions |

Si votre modèle n’affiche pas le SIREN du client, ajoutez-le : c’est la donnée qui permet de router la facture.

#### **Les 6 pièges propres à Word**

1. **Polices exotiques.** Le format d’archivage exige que toutes les polices soient incorporées. Préférez des polices courantes (Arial, Calibri, Times New Roman) et vérifiez le résultat avec un validateur.  
2. **Logos PNG avec transparence.** Ils peuvent poser problème selon le niveau de PDF/A visé. \[À TESTER sur votre convertisseur avant d’affirmer\]  
3. **Tableaux aux cellules fusionnées.** Ils sont jolis mais ambigus pour une lecture automatique. Un tableau régulier (une ligne \= une prestation) donne des extractions plus fiables.  
4. **Totaux saisis à la main.** Si vous tapez les totaux au lieu de les calculer, une erreur d’un centime passe inaperçue. Les contrôles automatiques la signaleront, mais autant l’éviter à la source.  
5. **Numérotation manuelle.** Les doublons et les trous de numérotation sont une source de litiges. Gardez un registre ou un compteur.  
6. **Dates ambiguës.** Écrivez 08/10/2026 ou 8 octobre 2026, jamais 8/10/26 : l’ordre jour/mois est une cause classique d’erreur.

#### **Faut-il rester sous Word ?**

Pour quelques factures par mois, Word plus un convertisseur est une solution raisonnable : vous gardez votre modèle et vous ajoutez une étape de conversion. Quand le volume augmente, quand vous avez des avoirs et des acomptes, ou quand plusieurs personnes émettent des factures, un logiciel de facturation qui produit nativement du Factur-X devient plus sûr : il écrit le PDF et le XML à partir des **mêmes données**, ce qui supprime le risque de divergence (voir XML et PDF qui divergent). Le seuil dépend de votre organisation ; comptez environ une conversion par facture et un contrôle humain à chaque fois.

#### **Et ensuite ?**

Le Factur-X est prêt, mais il n’est pas encore envoyé. Votre outil de conversion ne transmet rien à l’administration : il faut déposer le fichier sur une plateforme agréée. Notre guide sur l’envoi d’un Factur-X détaille les options.

#### **FAQ**

**Word peut-il exporter directement du Factur-X ?** Non, pas à lui seul. Word produit un PDF ; il faut ensuite y intégrer le XML et obtenir un PDF/A-3, ce que fait un convertisseur.

**Pourquoi mon PDF Word est-il refusé par la plateforme ?** Les causes les plus courantes sont l’absence de XML, un PDF qui n’est pas conforme PDF/A-3 (voir pourquoi une facture est refusée) et des erreurs de règles métier.

**Dois-je changer mon modèle de facture ?** Pas forcément. Vérifiez qu’il contient toutes les mentions du tableau ci-dessus ; le reste est géré à la conversion.

**Et si mes factures sont sous Excel ?** La méthode est proche, avec un piège supplémentaire : les arrondis. Voir convertir une facture Excel en Factur-X.

**Sources à consulter** : spécification Factur-X (fnfe-mpe.org) ; informations de la DGFiP sur la facturation électronique (impots.gouv.fr).

### **A2 · Convertir une facture Excel en Factur-X**

**URL** : /ressources/convertir-facture-excel-en-factur-x · **Title** : Convertir une facture Excel en Factur-X · **Meta** : Facture sous Excel : exporter en PDF puis ajouter le XML Factur-X. Méthode pas à pas, pièges des formules et arrondis, contrôles avant envoi.

Beaucoup d’indépendants et de petites entreprises facturent avec une feuille Excel : un tableau, des formules, un export PDF. Pour passer au Factur-X, la méthode est proche de celle de Word, avec un piège de plus : **les arrondis**. Une facture qui s’affiche correctement peut contenir des valeurs que le XML ne tolère pas. Voici comment l’éviter et comment convertir proprement.

***Convertir ma facture Excel en Factur-X** : exportez votre feuille en PDF puis déposez-la dans le convertisseur de Factur-X Facile ; les totaux sont recalculés et comparés avant la génération.*

#### **Étape 1 : préparer la feuille**

* **Une feuille \= une facture.** Si votre classeur contient plusieurs onglets (brouillon, clients, historique), n’exportez que la feuille de la facture.  
* **Définissez la zone d’impression** et ajustez à une page de largeur : un tableau coupé en deux pages complique la lecture.  
* **Affichez toutes les mentions** : identités, adresses, SIREN du vendeur et du client, numéros de TVA, dates, conditions de paiement. Les cellules masquées ou en blanc sur blanc ne sont pas visibles et ne doivent pas servir de source au XML.  
* **Verrouillez les formules** de totaux pour éviter une saisie manuelle par erreur.

#### **Le piège des arrondis**

Excel affiche deux décimales, mais **stocke bien plus**. Exemple avec trois lignes à 10,005 € HT chacune :

|  | Valeur stockée | Valeur affichée |
| :---- | :---- | :---- |
| Ligne 1 | 10,005 | 10,01 |
| Ligne 2 | 10,005 | 10,01 |
| Ligne 3 | 10,005 | 10,01 |
| Somme des lignes affichées |  | 30,03 |
| Total calculé par la formule | 30,015 | 30,02 |

À l’écran, un lecteur additionne 30,03 mais lit 30,02 comme total. Dans le XML, les montants de lignes et le total doivent être cohérents : la règle de calcul BR-CO-10 impose que le total des lignes soit égal à la somme des montants de lignes. Un centime d’écart suffit pour faire échouer la validation, comme le détaille l’article sur l’erreur BR-CO-15 pour les totaux TTC.

**Le remède** : arrondir **à chaque ligne**, avec la fonction ARRONDI, et faire dépendre les totaux de ces lignes arrondies.

Montant ligne HT  :  \=ARRONDI(quantité \* prix\_unitaire; 2\)  
Total HT          :  \=SOMME(montants des lignes)  
TVA par taux      :  \=ARRONDI(base\_HT\_du\_taux \* taux; 2\)  
Total TTC         :  \=Total\_HT \+ somme des TVA  
Pour plusieurs taux de TVA, la ventilation par taux a ses propres règles d’arrondi, expliquées dans Factur-X avec plusieurs taux de TVA.

#### **Étape 2 : exporter en PDF**

Dans Excel, utilisez « Fichier \> Exporter \> Créer un document PDF ». Conservez le texte sélectionnable et évitez les exports en image. Les options de conformité PDF/A proposées par Excel visent un niveau ancien du format, et le PDF obtenu n’est pas, à lui seul, un Factur-X. \[À VÉRIFIER sur votre version\]

#### **Étape 3 : convertir et vérifier**

Déposez le PDF dans Factur-X Facile. Voici ce qui se passe :

1. **Extraction** du numéro, des dates, des parties, des lignes et des totaux.  
2. **Contrôles automatiques** : SIREN et SIRET (somme de contrôle), numéro de TVA (clé de contrôle et SIREN cohérent), IBAN, puis recalcul des lignes, de la TVA et du TTC.  
3. **Vérification côte à côte** : vous voyez la valeur extraite à côté de l’endroit du PDF où elle est lue. Un écart d’un centime entre les lignes et le total est signalé avec les deux montants.  
4. **Génération** du Factur-X avec votre PDF d’origine conservé.

Si l’outil signale un écart d’arrondi, **corrigez-le dans votre feuille Excel** (c’est la source), réexportez et relancez, plutôt que de modifier le formulaire : sinon le PDF affichera encore l’ancien montant et le XML le nouveau (voir XML et PDF qui divergent).

#### **Étape 4 : valider**

Contrôlez le fichier avec le validateur Factur-X, puis conservez la feuille corrigée comme nouveau modèle.

#### **Classeurs à plusieurs feuilles, Google Sheets et LibreOffice**

* **Plusieurs feuilles** : exportez uniquement la feuille facture, nommez le fichier avec le numéro de facture.  
* **Google Sheets** : « Fichier \> Télécharger \> Document PDF », avec les options de mise en page. Les polices du PDF obtenu ne sont pas forcément incorporées : \[À TESTER avec le validateur avant d’affirmer\].  
* **LibreOffice Calc** : l’export PDF propose des options d’archivage ; vérifiez le niveau obtenu avec un validateur.

#### **Les 5 erreurs classiques avec Excel**

1. Totaux saisis à la main au lieu d’être calculés.  
2. Taux de TVA appliqué au total au lieu d’être appliqué par taux (voir l’article multi-taux).  
3. Cellules de remise qui modifient le total sans apparaître dans le PDF.  
4. Un seul champ « Adresse » qui mélange rue, code postal et ville, ce qui complique l’extraction.  
5. Mentions obligatoires absentes du modèle (SIREN du client, adresse de livraison, nature de l’opération).

#### **FAQ**

**Excel peut-il produire un Factur-X ?** Pas à lui seul. Il produit le PDF ; un convertisseur ajoute le XML et fournit un PDF/A-3.

**Pourquoi un écart d’un centime fait-il échouer la validation ?** Parce que les règles de calcul de la norme comparent les montants au centime près, sans tolérance.

**Que faire avec Google Sheets ?** Même méthode : export PDF, conversion, validation. Testez le résultat avec un validateur, surtout pour les polices.

**Mon classeur contient des macros. Est-ce un problème ?** Non, tant que vous n’exportez que le PDF.

**Sources à consulter** : règles de validation EN 16931 (Schematron officiel) ; spécification Factur-X (fnfe-mpe.org).

### **A3 · Factur-X : que faire si XML et PDF divergent ?**

**URL** : /ressources/factur-x-xml-pdf-incoherents · **Title** : Factur-X : que faire si XML et PDF divergent ? · **Meta** : Le XML dit 1 200 €, le PDF 1 020 € ? Ce que prévoit la norme, ce que voit votre client et comment vérifier la cohérence avant l’envoi.

Un fichier Factur-X contient deux versions de la même facture : une version lisible (le PDF) et une version pour les machines (le XML). Que se passe-t-il quand elles ne disent pas la même chose ? D’après les sources que j’ai consultées, c’est le XML qui est utilisé pour le traitement automatique, mais l’écart reste une anomalie qui peut provoquer un refus, une relance ou un litige. La règle à retenir est simple : **mêmes données, mêmes valeurs, dans les deux couches**.

***Éviter l’écart dès la conversion** : dans le convertisseur de Factur-X Facile, chaque valeur du XML est reliée à l’endroit du PDF où elle est imprimée, et vous vérifiez côte à côte avant de générer le fichier.*

#### **Le principe posé par la norme**

La spécification Factur-X décrit une facture « mixte » : un PDF lisible accompagné de données structurées. Elle demande à l’émetteur de garantir la cohérence des deux, c’est-à-dire que les informations du XML figurent bien, avec les mêmes valeurs, dans la représentation lisible. \[À VÉRIFIER : reprendre le paragraphe exact de la version en vigueur de la spécification, sur fnfe-mpe.org\]

La règle est asymétrique : le PDF peut contenir **plus** d’informations que le XML (logo, conditions générales, commentaires), mais les données obligatoires du XML doivent toutes se retrouver dans le PDF.

#### **Qui lit quoi ?**

| Lecteur | Ce qu’il lit | Conséquence d’un écart |
| :---- | :---- | :---- |
| Votre client (comptable, dirigeant) | Le PDF | Il voit un montant, une date ou une mention |
| Le logiciel comptable du client | Le XML | Il enregistre une autre valeur |
| Les plateformes agréées | Le XML | Elles transmettent les données du XML |
| L’administration | Les données extraites du XML via la plateforme | Elle compare, à terme, avec les déclarations |

Votre client paie ce qu’il lit dans le PDF, tandis que sa comptabilité enregistre ce qui est dans le XML. Un écart devient alors un problème de lettrage, de TVA déductible ou de relance.

#### **Que se passe-t-il en cas de divergence ?**

Plusieurs guides indiquent que le XML « fait foi » pour le traitement automatique. Deux nuances :

1. **« Faire foi » pour la machine n’efface pas l’anomalie.** Une plateforme ou un client peut refuser la facture, ou la signaler.  
2. **Aucun contrôle automatique ne vous sauve.** Un validateur de conformité vérifie que le XML respecte les règles et que le PDF est un PDF/A-3. À notre connaissance, il ne lit pas le texte visible pour le comparer au XML. \[À COMPLÉTER : test ci-dessous\]

**Exemple chiffré.** Votre PDF affiche un total TTC de 1 020,00 €. Le XML contient 1 200,00 € (deux chiffres inversés pendant la conversion). Le XML est cohérent en lui-même (HT, TVA et TTC s’additionnent) : toutes les règles de calcul passent. Rien n’alerte… sauf une comparaison avec le PDF.

#### **Comment naît une divergence ?**

1. **Une extraction erronée non repérée**, quand on convertit un PDF existant : un chiffre mal lu, un total pris pour un autre.  
2. **Une correction manuelle** dans un formulaire, sans corriger le PDF d’origine : le XML change, le PDF non.  
3. **Une modification du PDF après la génération** (éditeur PDF, ajout d’une mention, tampon). Le fichier Factur-X est un tout : ne le retouchez jamais après coup. Régénérez-le depuis la source.  
4. **Des arrondis différents** entre le logiciel qui produit le PDF et celui qui produit le XML (voir convertir une facture Excel).  
5. **Des mentions présentes dans le XML mais absentes du PDF**, par exemple le SIREN du client ou l’adresse de livraison.

#### **Les 6 règles pour l’éviter**

1. **Une seule source de données** pour le PDF et le XML (un logiciel de facturation natif le fait naturellement).  
2. **Vérification côte à côte** avant génération, valeur par valeur, avec la position de chaque valeur dans le PDF.  
3. **Contrôles croisés** : refuser toute valeur du XML qui n’existe pas dans le PDF.  
4. **Corriger à la source, puis régénérer** : si une valeur est fausse, corrigez la facture d’origine et relancez la conversion.  
5. **Ne jamais modifier le fichier final.**  
6. **Archiver le fichier envoyé** et n’en envoyer qu’un seul exemplaire (voir envoyer un Factur-X).

#### **Comment Factur-X Facile traite le sujet**

\[À ALIGNER SUR LE PRODUIT RÉEL avant publication\] Le PDF d’origine est conservé tel quel ; le XML est construit à partir des valeurs que vous avez confirmées. Chaque valeur est reliée à un emplacement dans le PDF ; une valeur introuvable dans le document est refusée ; si vous modifiez une valeur différente de ce qui est imprimé, l’outil vous le signale et vous demande soit de corriger la source, soit de confirmer explicitement.

#### **Notre test sur trois validateurs**

Nous avons fabriqué deux fichiers dont le XML diffère du PDF, puis nous les avons passés dans trois validateurs.

| Fichier de test | Validateur A | Validateur B | Validateur C |
| :---- | :---- | :---- | :---- |
| Montant TTC différent (1 020 € dans le PDF, 1 200 € dans le XML) | \[À COMPLÉTER\] | \[À COMPLÉTER\] | \[À COMPLÉTER\] |
| Date d’émission différente | \[À COMPLÉTER\] | \[À COMPLÉTER\] | \[À COMPLÉTER\] |

*Date, versions et méthode : \[À COMPLÉTER\]. Les fichiers de test sont téléchargeables : \[À PUBLIER\].*

**Ne publiez cette section qu’avec des résultats réels.** Si un validateur détecte l’écart, dites-le : c’est une information utile pour le lecteur et ça renforce votre crédibilité.

#### **FAQ**

**Quelle version fait foi ?** Pour le traitement automatique, le XML. Pour la lecture humaine, le PDF. La facture doit donc être cohérente ; en cas d’écart, émettez une facture rectificative ou un avoir selon la situation, avec l’avis de votre expert-comptable.

**Peut-on modifier le PDF d’un Factur-X ?** Non. Toute modification brise la cohérence et peut invalider le conteneur PDF/A-3. Régénérez le fichier.

**Un validateur détecte-t-il l’écart ?** Voir le test ci-dessus. Les validateurs de conformité contrôlent d’abord le XML et la structure du PDF.

**Que faire si j’ai déjà envoyé un fichier incohérent ?** Contactez votre client et votre plateforme, puis corrigez par un avoir et une nouvelle facture si l’écart touche des données obligatoires. \[À VALIDER avec un expert-comptable\]

**Sources à consulter** : spécification Factur-X (fnfe-mpe.org).

**Pour aller plus loin** : contrôlez votre propre fichier avec le validateur Factur-X et lisez ce que contrôle (et ignore) un validateur.

### **A4 · PDF/A-3 : pourquoi votre facture est refusée**

**URL** : /ressources/pdf-a-3-facture-refusee · **Title** : PDF/A-3 : pourquoi votre facture est refusée · **Meta** : Polices non embarquées, couleurs, métadonnées : les causes visibles seulement avec un validateur, et comment obtenir un PDF/A-3 valide.

Votre PDF s’ouvre sans problème, il est lisible, il contient même un XML… et pourtant la plateforme le refuse. La raison tient souvent à une exigence **invisible à l’écran** : le conteneur doit être un PDF/A-3 conforme, et la conformité se joue sur des détails techniques (polices, métadonnées, couleurs, pièce jointe). Cet article liste les causes de refus les plus fréquentes, explique comment les repérer et comment les corriger.

***Tester votre fichier** : déposez-le dans le validateur Factur-X pour voir les erreurs PDF/A-3 et XML, sans inscription.*

#### **PDF/A-3 en deux phrases**

PDF/A est la famille de formats PDF conçue pour l’archivage : le fichier doit être autonome (tout ce qu’il faut pour l’afficher y est inclus) et prévisible. La variante A-3 autorise en plus l’ajout de pièces jointes, ce qui permet d’embarquer le fichier factur-x.xml. Les variantes A-1 et A-2 ne conviennent pas à Factur-X.

#### **Ce que PDF/A-3 exige**

| Exigence | Pourquoi | Visible à l’écran ? |
| :---- | :---- | :---- |
| Toutes les polices incorporées | Afficher la facture à l’identique sans dépendre des polices du lecteur | Non |
| Couleurs caractérisées (profil de sortie quand des couleurs dépendantes de l’appareil sont utilisées) | Rendu stable des couleurs | Non |
| Métadonnées XMP déclarant le niveau PDF/A et le profil Factur-X | Permettre la détection automatique | Non |
| Pièce jointe nommée factur-x.xml avec la relation prévue | Retrouver le XML | Non |
| Ni chiffrement ni mot de passe | Lisibilité à long terme | Parfois |
| Ni JavaScript ni contenu externe | Fichier autonome et sûr | Non |

#### **Les 7 causes de refus les plus fréquentes**

**1\. Polices non incorporées.** Le PDF fait référence à Arial ou Helvetica sans les inclure. Cause fréquente avec des exports de logiciels bureautiques et des générateurs de PDF simples. *Comment le repérer* : un validateur PDF/A (veraPDF) la signale ; en ligne de commande, pdffonts facture.pdf affiche une colonne « emb » : no signale une police non incorporée.

**2\. Métadonnées XMP absentes ou incomplètes.** Le fichier ne déclare pas qu’il est PDF/A-3, ou ne déclare pas le profil Factur-X.

**3\. Profil de sortie couleur absent.** Un PDF qui utilise des couleurs RVB sans profil de sortie échoue au contrôle.

**4\. XML absent, mal nommé ou mal rattaché.** Un fichier joint avec un autre nom ou sans la relation prévue peut ne pas être détecté automatiquement.

**5\. Incohérence entre les métadonnées et le XML.** Les métadonnées annoncent un profil, le XML en déclare un autre.

**6\. Chiffrement ou restrictions.** Un PDF protégé par mot de passe ou limité (impression, copie) est refusé.

**7\. Contenus actifs.** JavaScript, formulaires interactifs ou actions : interdits en archivage.

#### **Le piège de la fausse conformité**

Un fichier peut **déclarer** qu’il est PDF/A-3 dans ses propriétés sans l’être : certains outils ajoutent les métadonnées sans corriger le contenu (par exemple, sans incorporer les polices). Un affichage « PDF/A-3B » dans le lecteur ne prouve rien. Seule une validation avec un outil dédié le prouve.

**Un constat de première main.** Dans l’un de nos fichiers de test, produit par WeasyPrint 62.3, les polices (Liberation Sans) étaient bien incorporées, mais le fichier ne contenait ni métadonnées XMP ni profil de sortie couleur : il n’était donc pas PDF/A en l’état, alors qu’il avait l’air parfait à l’écran. Résultat après conversion et validation : \[À COMPLÉTER : rapport veraPDF et validateur\].

#### **Comment diagnostiquer**

1. **Le validateur Factur-X** : il contrôle le conteneur PDF/A-3, le XML et les règles. Gratuit et sans inscription : validateur Factur-X.  
2. **veraPDF**, validateur PDF/A open source de référence : verapdf \--flavour 3b facture.pdf. Il valide PDF/A mais pas la sémantique Factur-X (le XML).  
3. **pdffonts** (outils poppler) pour la liste des polices et leur état d’incorporation.

Pour que le résultat ait du sens, combinez un validateur PDF/A et un validateur Factur-X : le premier vérifie le conteneur, le second le contenu. Voir ce que contrôle un validateur.

#### **Comment corriger**

1. **Régénérer le PDF depuis la source** avec des polices incorporées (dans Word ou Excel, vérifiez les options d’export et utilisez des polices courantes).  
2. **Passer par un convertisseur qui produit réellement du PDF/A-3** : il doit corriger ou régénérer le contenu, pas seulement ajouter des métadonnées. Le convertisseur de Factur-X Facile vérifie ces points avant de livrer un fichier. \[À ALIGNER SUR LE PRODUIT RÉEL : validation veraPDF en CI\]  
3. **Quand le PDF d’origine ne peut pas être sauvé** (scan, protection, contenus actifs), régénérer la facture à partir des données vérifiées plutôt que de conserver le fichier original.

#### **Quels exports sont risqués ?**

Les PDF issus d’outils bureautiques et de navigateurs ne sont pas des PDF/A-3 par défaut, d’après les informations que j’ai trouvées. Nous mesurons ce que donnent réellement les exports de logiciels courants dans notre étude sur les exports PDF.

#### **FAQ**

**Quelle différence entre PDF/A-1, PDF/A-2 et PDF/A-3 ?** A-1 est la première version ; A-2 ajoute des fonctions graphiques et autorise l’inclusion de documents PDF/A ; A-3 autorise toute pièce jointe, dont le XML de Factur-X.

**Mon PDF s’ouvre très bien : pourquoi est-il refusé ?** Parce que les exigences de PDF/A ne se voient pas : polices, métadonnées, couleurs et pièce jointe se contrôlent avec un outil.

**Peut-on convertir un PDF/A-1 en PDF/A-3 ?** Pas par simple renommage. Il faut traiter le fichier avec un outil qui produit du PDF/A-3 conforme.

**Pourquoi la plateforme accepte parfois un fichier que veraPDF refuse ?** Les contrôles varient d’une plateforme à l’autre. Un fichier conforme passera partout ; un fichier approximatif peut passer ici et pas là.

**Sources à consulter** : norme ISO 19005-3 ; veraPDF (verapdf.org) ; spécification Factur-X (fnfe-mpe.org).

### **A5 · Cabinet comptable : factures clients en Factur-X**

**URL** : /ressources/factur-x-cabinet-comptable · **Title** : Cabinet comptable : factures clients en Factur-X · **Meta** : Plusieurs clients, des PDF de toutes origines : méthode de conversion par lots, contrôle des identifiants et suivi par entreprise.

Un cabinet comptable reçoit des factures de dizaines d’entreprises, produites avec des outils très différents : modèles Word, feuilles Excel, exports de logiciels, PDF générés par des sites. Depuis le 1er septembre 2026, tout le monde doit pouvoir **recevoir** des factures électroniques, et l’obligation d’**émettre** arrive pour les PME, TPE et micro-entreprises le 1er septembre 2027, avec une faculté légale de décalage par décret au plus tard au 1er décembre 2027 d’après les sources que j’ai consultées. Vos clients vont donc vous demander quoi faire de leurs PDF existants. Voici une méthode pour les traiter sans multiplier les erreurs.

***Traiter les factures de vos clients** : Factur-X Facile gère plusieurs entreprises dans un même compte, rapproche chaque facture de la bonne entreprise par son SIREN et affiche les contrôles avant génération. \[À ALIGNER SUR LES FONCTIONNALITÉS LIVRÉES\]*

#### **Trois situations à distinguer**

| Situation | Qui produit le Factur-X ? | Rôle du cabinet |
| :---- | :---- | :---- |
| Le client utilise un logiciel de facturation qui génère nativement du Factur-X | Le logiciel | Vérifier un échantillon, former le client |
| Le client facture avec Word, Excel ou un export PDF | Un convertisseur, à partir du PDF | Mettre en place la méthode et le contrôle |
| Le cabinet saisit ou prépare lui-même les factures de vente du client | Le cabinet, avec un outil adapté | Responsabilité plus forte : à cadrer dans la lettre de mission |

#### **La méthode en 5 étapes**

**1\. Collecter proprement.** Un dossier par entreprise, un nom de fichier qui contient la date et le numéro de facture, des PDF avec du texte sélectionnable (pas des photos). Un PDF d’image donne des extractions moins fiables.

**2\. Rapprocher la facture de la bonne entreprise.** Le SIREN du vendeur lu sur la facture doit correspondre à l’entreprise du dossier. C’est le contrôle qui évite d’émettre une facture avec l’identité d’une autre société, une erreur plus fréquente qu’on ne le croit quand un cabinet traite beaucoup de dossiers. Un SIRET différent avec le même SIREN signale un autre établissement : à confirmer, pas à écarter.

**3\. Extraire et contrôler.** L’extraction est automatique, le contrôle est humain et outillé :

* identifiants : SIREN et SIRET (somme de contrôle), numéro de TVA (clé et SIREN cohérent), IBAN ;  
* montants : somme des lignes, TVA par taux, total TTC ;  
* cohérence : valeur lue dans le PDF, numéro de facture déjà présent dans l’historique de l’entreprise, dates compatibles (échéance après émission).

**4\. Générer et valider.** Le fichier est produit à partir des valeurs confirmées, puis contrôlé par un validateur (validateur Factur-X).

**5\. Archiver avec traçabilité.** Conservez le fichier final, la date de conversion, la personne qui a validé et l’entreprise concernée. En cas de litige, c’est cette trace qui compte.

#### **Les contrôles qui comptent vraiment pour un cabinet**

| Contrôle | Pourquoi |
| :---- | :---- |
| SIREN du vendeur \= SIREN du dossier | Éviter d’attribuer la facture à la mauvaise entreprise |
| SIREN du client présent et valide | Nouvelle mention exigée pour les factures entre assujettis, d’après les sources consultées \[À VÉRIFIER\] |
| Numéro unique par entreprise | Doublons et trous de numérotation |
| Franchise en base ou TVA applicable | Cohérence des mentions et de la ventilation de TVA (voir micro-entrepreneur) |
| Plusieurs taux de TVA | Ventilation correcte (voir plusieurs taux de TVA) |
| Avoirs | Référence à la facture d’origine (voir avoir en Factur-X) |

#### **Traiter beaucoup de factures sans valider à l’aveugle**

Le réflexe de « tout valider en un clic » est dangereux : la validation humaine est justement ce qui protège le cabinet. Une organisation efficace consiste à :

1. **Trier par statut** : les factures sans alerte d’un côté, celles qui présentent un écart de l’autre.  
2. **Contrôler les premières en tableau** (numéro, date, client, HT, TVA, TTC), en confirmant chaque ligne explicitement.  
3. **Ouvrir en détail les factures avec alerte**, avec le PDF à côté.  
4. **Ne jamais confirmer une facture avec une erreur bloquante** (SIREN invalide, écart d’addition).

Temps de contrôle mesuré sur 50 factures de 10 clients : \[À COMPLÉTER avec votre mesure réelle\].

#### **Responsabilités : ce qui doit être clair avec vos clients**

* **Le client reste l’émetteur** de la facture et responsable de son contenu.  
* Le rôle du cabinet (conversion, contrôle, dépôt) doit figurer dans la **lettre de mission** ou un avenant. \[À VALIDER avec le conseil juridique de l’ordre ou du cabinet\]  
* Le traitement de factures contenant des données personnelles de clients finals est une sous-traitance au sens du RGPD : prévoyez un contrat et vérifiez où et comment l’outil traite les fichiers (voir que deviennent vos factures).

#### **Et après la conversion ?**

Le fichier est prêt, il reste à le transmettre via une plateforme agréée (voir envoyer un Factur-X). Pour les factures **reçues** de fournisseurs en PDF simple, la question est différente (voir fournisseur qui envoie un PDF simple). Pour le calendrier à présenter à vos clients, consultez le calendrier 2026-2027.

#### **FAQ**

**Comment traiter les factures de plusieurs clients sans tout mélanger ?** Un espace par entreprise, un rapprochement par SIREN et un contrôle qui bloque si le vendeur lu ne correspond pas à l’entreprise choisie.

**Qui est responsable de l’exactitude de la facture ?** L’émetteur, c’est-à-dire le client. Le cabinet est responsable de ce qui relève de sa mission ; cadrez-la par écrit.

**Peut-on garder un historique par entreprise ?** Oui, avec une conservation limitée dans le temps et la possibilité d’exporter. Attention : l’historique pratique n’est pas un archivage à valeur probante. \[À ALIGNER SUR LE PRODUIT\]

**Un cabinet doit-il lui-même émettre ses factures en Factur-X ?** Comme toute entreprise, selon sa taille et le calendrier : voir le calendrier.

**Sources à consulter** : informations de la DGFiP sur la facturation électronique (impots.gouv.fr) ; recommandations de votre ordre professionnel.

### **A6 · Micro-entrepreneur : convertir ses factures en Factur-X**

**URL** : /ressources/factur-x-micro-entrepreneur · **Title** : Micro-entrepreneur : convertir ses factures en Factur-X · **Meta** : Vous gardez votre modèle de facture actuel. Calendrier, mention de franchise en base (293 B) et conversion de vos PDF existants en Factur-X.

Vous êtes micro-entrepreneur, vous avez un modèle de facture qui vous convient (Word, Excel, un PDF exporté d’un outil gratuit) et vous vous demandez ce qu’il faut changer pour la facturation électronique. Cet article répond aux questions pratiques : à partir de quand, pour quels clients, comment gérer la mention de franchise en base de TVA (article 293 B), et comment convertir vos factures existantes en Factur-X sans repartir de zéro.

***Convertir votre facture actuelle** : déposez votre PDF dans le convertisseur de Factur-X Facile ; vous gardez votre mise en page et vous vérifiez les données avant de générer le fichier.*

#### **Où en est le calendrier ?**

D’après les sources que j’ai consultées :

| Date | Ce qui s’applique |
| :---- | :---- |
| 1er septembre 2026 | Toutes les entreprises assujetties à la TVA établies en France doivent pouvoir **recevoir** des factures électroniques |
| 1er septembre 2027 | **Émission** et e-reporting pour les PME, TPE et micro-entreprises, y compris, selon plusieurs sources, celles en franchise en base de TVA ; une faculté de décalage par décret existe, au plus tard au 1er décembre 2027 |

\[À VÉRIFIER sur impots.gouv.fr : la situation exacte des micro-entrepreneurs en franchise en base, pour la réception comme pour l’émission\]

La DGFiP recommande de ne pas attendre : une mise en conformité progressive est plus sûre qu’un passage en urgence en 2027\.

#### **Pour quels clients ?**

* **Clients professionnels français assujettis à la TVA** : la facture électronique passe par une plateforme agréée.  
* **Clients particuliers et clients étrangers** : ce n’est pas une facture électronique mais un **e-reporting** (transmission de données). \[À VÉRIFIER : conditions exactes selon votre activité\]

Si vous ne facturez que des particuliers, l’enjeu est surtout l’e-reporting, pas le Factur-X. Voir le calendrier.

#### **Sanctions et tolérance**

Les sources consultées indiquent une amende de 50 € par facture non émise sous forme électronique (plafonnée à 15 000 € par an) et de 500 € par transmission d’e-reporting manquante (avec plafond annuel), et une tolérance pour une première infraction régularisée spontanément ou dans les 30 jours d’une demande. \[À VÉRIFIER sur le site de la DGFiP avant de publier ces montants\]

#### **Garder son modèle de facture**

Vous n’avez pas à abandonner votre modèle. Deux options :

1. **Continuer avec votre modèle et convertir chaque facture.** Adapté si vous émettez peu de factures par mois.  
2. **Passer à un outil de facturation qui produit du Factur-X nativement.** Plus confortable si vos volumes augmentent.

Quelle que soit l’option, vous devez ensuite **déposer le fichier sur une plateforme agréée** : voir envoyer un Factur-X.

#### **La franchise en base de TVA (article 293 B) dans un Factur-X**

Si vous êtes en franchise en base, votre facture porte la mention **« TVA non applicable, article 293 B du CGI »**. Dans le Factur-X, cette mention doit aussi exister **sous forme structurée** dans le XML : la ventilation de TVA indique une catégorie « exonéré » et le motif.

\<\!-- Extrait simplifié du XML : ordre exact des éléments à vérifier avec le XSD \--\>  
\<ram:ApplicableTradeTax\>  
  \<ram:CalculatedAmount\>0.00\</ram:CalculatedAmount\>  
  \<ram:TypeCode\>VAT\</ram:TypeCode\>  
  \<ram:ExemptionReason\>TVA non applicable, article 293 B du CGI\</ram:ExemptionReason\>  
  \<ram:BasisAmount\>1000.00\</ram:BasisAmount\>  
  \<ram:CategoryCode\>E\</ram:CategoryCode\>  
  \<ram:RateApplicablePercent\>0\</ram:RateApplicablePercent\>  
\</ram:ApplicableTradeTax\>  
Les règles EN 16931 exigent un motif d’exonération pour la catégorie « exonéré » (règle BR-E-10 d’après mes recherches : \[À VÉRIFIER dans le Schematron\]). Le texte visible dans le PDF et le motif du XML doivent dire la même chose (voir XML et PDF qui divergent).

#### **Les mentions à vérifier sur votre facture**

| Mention | Remarque |
| :---- | :---- |
| Nom ou dénomination, adresse, SIREN | Le SIREN est l’identifiant exigé ; le SIRET est facultatif |
| Numéro et date de facture | Numérotation chronologique et continue |
| Désignation, quantité, prix unitaire | Une ligne par prestation |
| Mention de TVA | « TVA non applicable, article 293 B du CGI » le cas échéant |
| Client : nom, adresse, SIREN s’il est professionnel | Le SIREN du client est une nouveauté de la réforme \[À VÉRIFIER\] |
| Nature de l’opération | Biens, services ou mixte |
| Pénalités de retard et indemnité forfaitaire de 40 € | Pour les clients professionnels |
| Coordonnées de paiement | IBAN, conditions |

#### **Marche à suivre en 5 étapes**

1. **Choisir une plateforme agréée** pour recevoir (et émettre en 2027). La liste officielle est publiée par la DGFiP.  
2. **Mettre à jour votre modèle** : SIREN du client, nature de l’opération, mentions de TVA.  
3. **Convertir vos factures** : déposez-les dans Factur-X Facile, contrôlez côte à côte, générez.  
4. **Valider** avec le validateur.  
5. **Déposer** le fichier sur votre plateforme agréée.

#### **FAQ**

**Un micro-entrepreneur doit-il faire du Factur-X ?** Il doit pouvoir recevoir des factures électroniques dès le 1er septembre 2026 et, selon plusieurs sources, émettre dès le 1er septembre 2027 pour ses clients professionnels. \[À VÉRIFIER\]

**Comment mentionner la franchise en base ?** Avec la mention de l’article 293 B dans le PDF et un motif d’exonération dans le XML (voir ci-dessus).

**Et si mon client est un particulier ?** Il ne s’agit pas d’une facture électronique mais d’un e-reporting, à confirmer selon votre situation.

**Puis-je envoyer mon Factur-X directement à mon client par e-mail ?** La transmission passe par une plateforme agréée entre entreprises assujetties à partir de l’échéance qui vous concerne. Voir envoyer un Factur-X.

**Sources à consulter** : impots.gouv.fr (pages dédiées à la facturation électronique) ; spécification Factur-X (fnfe-mpe.org).

### **A7 · Faire un avoir en Factur-X : méthode et pièges**

**URL** : /ressources/avoir-factur-x · **Title** : Faire un avoir en Factur-X : méthode et pièges · **Meta** : Un avoir au format Factur-X : type de document, référence à la facture d’origine, signe des montants. Les erreurs à éviter avant envoi.

Une facture émise ne se modifie pas : quand elle contient une erreur, quand une remise est accordée après coup ou quand une marchandise est retournée, on émet un **avoir** (aussi appelé facture d’avoir ou note de crédit). Au format Factur-X, l’avoir est un document à part entière, avec son propre numéro et un lien explicite vers la facture qu’il corrige. Voici comment le construire, comment convertir un avoir PDF existant et quelles erreurs éviter.

***Convertir un avoir PDF en Factur-X** : déposez-le dans le convertisseur de Factur-X Facile ; le type de document et la référence à la facture d’origine sont contrôlés avant la génération. \[À ALIGNER SUR LE PRODUIT\]*

#### **Quand émettre un avoir ?**

* **Annulation totale** d’une facture déjà émise.  
* **Correction partielle** (erreur de prix, de quantité ou de taux de TVA).  
* **Remise ou ristourne** accordée après la facturation.  
* **Retour de marchandises** ou prestation non réalisée.

Dans tous les cas, on ne retouche pas la facture d’origine : l’avoir la compense, et une nouvelle facture est émise si nécessaire. \[À VALIDER avec votre expert-comptable pour les cas particuliers\]

#### **Ce que contient un avoir en Factur-X**

| Élément | Ce qu’il faut renseigner |
| :---- | :---- |
| Type de document | Code 381 (avoir) à la place de 380 (facture) |
| Numéro de l’avoir | Un numéro propre, jamais celui de la facture d’origine |
| Date d’émission | Date de l’avoir |
| Référence de la facture d’origine | Numéro et date de la facture corrigée |
| Lignes et totaux | Les montants corrigés ; règle de signe à vérifier (voir ci-dessous) |
| Mentions habituelles | Parties, SIREN, TVA, conditions |

\<\!-- Extrait simplifié : structure exacte à vérifier avec le XSD du profil \--\>  
\<rsm:ExchangedDocument\>  
  \<ram:ID\>AV-2026-10-0003\</ram:ID\>  
  \<ram:TypeCode\>381\</ram:TypeCode\>  
  \<ram:IssueDateTime\>  
    \<udt:DateTimeString format='102'\>20261020\</udt:DateTimeString\>  
  \</ram:IssueDateTime\>  
\</rsm:ExchangedDocument\>

\<\!-- Dans le bloc de règlement : la facture d'origine \--\>  
\<ram:InvoiceReferencedDocument\>  
  \<ram:IssuerAssignedID\>FA-2026-10-0042\</ram:IssuerAssignedID\>  
  \<ram:FormattedIssueDateTime\>  
    \<qdt:DateTimeString format='102'\>20261008\</qdt:DateTimeString\>  
  \</ram:FormattedIssueDateTime\>  
\</ram:InvoiceReferencedDocument\>

#### **La règle de signe des montants**

\[À VÉRIFIER AVANT DE RÉDIGER : dans la spécification EN 16931 et la documentation de la FNFE-MPE, comment doivent être exprimés les montants d’un avoir (valeurs positives avec le type 381, ou valeurs négatives). Ne pas l’affirmer de mémoire. Illustrer ensuite avec le résultat d’un validateur.\]

**Exemple pour l’illustration** : facture FA-2026-10-0042 de 1 800,00 € TTC. Le client obtient une remise de 500,00 € HT.

|  | Montant |
| :---- | :---- |
| Remise HT | 500,00 € |
| TVA 20 % | 100,00 € |
| Avoir TTC | 600,00 € |
| Reste dû sur la facture d’origine | 1 800,00 − 600,00 \= 1 200,00 € |

#### **Convertir un avoir PDF existant**

Si vos avoirs sont produits avec Word, Excel ou un logiciel qui ne génère pas de Factur-X, la méthode est la même que pour une facture (voir convertir une facture Word). Trois points demandent de l’attention :

1. **Le type de document** : l’outil doit proposer « avoir » et non « facture ». Vérifiez que le titre du PDF (« AVOIR ») est bien reconnu.  
2. **La référence à la facture d’origine** : elle doit figurer dans le PDF pour pouvoir être reprise dans le XML. Si elle manque, ajoutez-la à votre modèle.  
3. **La cohérence des montants** : les contrôles habituels s’appliquent (voir erreur BR-CO-15).

#### **Les 6 erreurs les plus fréquentes**

1. **Un avoir émis avec le code facture (380)** : le destinataire l’enregistre comme une dette.  
2. **Aucune référence à la facture d’origine.**  
3. **Le même numéro que la facture.**  
4. **Un signe de montant incohérent** avec la convention retenue.  
5. **Des taux de TVA différents** de ceux de la facture d’origine (voir plusieurs taux de TVA).  
6. **L’oubli d’envoyer l’avoir** par la même voie que la facture (plateforme agréée) : voir envoyer un Factur-X.

#### **Numérotation**

Certaines entreprises utilisent une série dédiée aux avoirs (AV-…), d’autres une numérotation commune. L’essentiel est la **continuité et l’unicité**. \[À VALIDER avec votre expert-comptable\]

#### **FAQ**

**Peut-on annuler une facture déjà envoyée en Factur-X ?** On émet un avoir (total ou partiel), puis une nouvelle facture si nécessaire. On ne modifie pas le fichier d’origine.

**L’avoir doit-il référencer la facture d’origine ?** Oui, c’est une bonne pratique et c’est attendu dans la structure de données. \[À VÉRIFIER : règle exacte dans les spécifications\]

**Peut-on faire un avoir partiel ?** Oui. L’avoir ne reprend que les lignes ou montants corrigés.

**Comment convertir un avoir PDF en Factur-X ?** Même méthode qu’une facture, avec le type « avoir » et la référence de la facture d’origine.

**Sources à consulter** : spécification Factur-X et règles EN 16931 (fnfe-mpe.org).

**Pour aller plus loin** : après la conversion d’un avoir, vérifiez le fichier avec le validateur Factur-X.

### **A8 · Factur-X avec plusieurs taux de TVA : comment faire**

**URL** : /ressources/factur-x-plusieurs-taux-tva · **Title** : Factur-X avec plusieurs taux de TVA : comment faire · **Meta** : 20 %, 10 %, 5,5 % sur une même facture : la ventilation de TVA attendue dans le XML, les arrondis et les erreurs BR-CO à éviter.

Une facture avec un seul taux de TVA est simple. Dès qu’elle mélange 20 %, 10 %, 5,5 % ou des lignes exonérées, le XML doit contenir une **ventilation de TVA** : un récapitulatif par taux, avec une base, un montant de TVA et une catégorie. C’est là que les erreurs d’un centime apparaissent. Cet article explique ce que la norme attend, avec un exemple chiffré, et comment éviter les écarts.

***Convertir une facture multi-taux** : le convertisseur de Factur-X Facile recalcule la ventilation par taux et la compare aux totaux imprimés avant de générer le fichier.*

#### **Ce que le XML attend**

Pour chaque couple **catégorie de TVA \+ taux**, le XML contient une ligne de ventilation avec :

| Donnée | Référence EN 16931 | Exemple |
| :---- | :---- | :---- |
| Catégorie de TVA | BT-118 | S (standard) |
| Taux | BT-119 | 20 |
| Base imposable | BT-116 | 1 000,00 |
| Montant de TVA | BT-117 | 200,00 |
| Motif d’exonération (si exonéré) | BT-120 | Texte du motif |

Une ligne de facture (BG-25) porte aussi sa propre catégorie et son taux.

#### **Exemple chiffré**

Une facture avec quatre lignes :

| Ligne | Désignation | HT | Taux |
| :---- | :---- | :---- | :---- |
| 1 | Prestation A | 1 000,00 | 20 % |
| 2 | Prestation B | 400,00 | 10 % |
| 3 | Produit C | 200,00 | 5,5 % |
| 4 | Prestation D | 100,00 | Exonérée |

La ventilation attendue :

| Catégorie | Taux | Base | TVA |
| :---- | :---- | :---- | :---- |
| S | 20 % | 1 000,00 | 200,00 |
| S | 10 % | 400,00 | 40,00 |
| S | 5,5 % | 200,00 | 11,00 |
| E | 0 % | 100,00 | 0,00 |
| **Totaux** |  | **1 700,00** | **251,00** |

Total TTC : 1 700,00 \+ 251,00 \= **1 951,00 €**.

\<\!-- Extrait simplifié du XML : ordre exact des éléments à vérifier avec le XSD \--\>  
\<ram:ApplicableTradeTax\>  
  \<ram:CalculatedAmount\>200.00\</ram:CalculatedAmount\>  
  \<ram:TypeCode\>VAT\</ram:TypeCode\>  
  \<ram:BasisAmount\>1000.00\</ram:BasisAmount\>  
  \<ram:CategoryCode\>S\</ram:CategoryCode\>  
  \<ram:RateApplicablePercent\>20\</ram:RateApplicablePercent\>  
\</ram:ApplicableTradeTax\>  
\<\!-- ... une ligne par taux ... \--\>  
\<ram:ApplicableTradeTax\>  
  \<ram:CalculatedAmount\>0.00\</ram:CalculatedAmount\>  
  \<ram:TypeCode\>VAT\</ram:TypeCode\>  
  \<ram:ExemptionReason\>Motif de l'exonération\</ram:ExemptionReason\>  
  \<ram:BasisAmount\>100.00\</ram:BasisAmount\>  
  \<ram:CategoryCode\>E\</ram:CategoryCode\>  
  \<ram:RateApplicablePercent\>0\</ram:RateApplicablePercent\>  
\</ram:ApplicableTradeTax\>

#### **Le piège des arrondis : TVA par taux, pas ligne par ligne**

D’après mes recherches, la règle de calcul BR-CO-17 impose que la TVA d’une catégorie soit égale à la **base totale de la catégorie multipliée par le taux**, arrondie à deux décimales. \[À VÉRIFIER dans le Schematron EN 16931\]

Exemple : trois lignes à 1,12 € HT chacune, TVA 20 %.

| Méthode | Calcul | TVA obtenue |
| :---- | :---- | :---- |
| Ligne par ligne, puis somme | 3 × (1,12 × 20 % \= 0,224, arrondi à 0,22) | 0,66 |
| Par taux, sur la base totale | (3 × 1,12 \= 3,36) × 20 % \= 0,672, arrondi | **0,67** |

Un centime d’écart. Si votre logiciel affiche 0,66 dans le PDF et que le XML doit contenir 0,67, vous obtenez à la fois une erreur de validation et un PDF qui ne dit pas la même chose que le XML (voir XML et PDF qui divergent).

**La bonne pratique** : calculer la TVA **par taux** sur la base totale, et générer le PDF et le XML à partir de ce calcul.

#### **Les catégories de TVA**

| Code | Signification courante | Remarque |
| :---- | :---- | :---- |
| S | Taux normal ou réduit applicable | Cas le plus courant |
| Z | Taux zéro | Opération soumise à TVA à 0 % |
| E | Exonéré | Motif d’exonération obligatoire |
| AE | Autoliquidation | Cas particuliers (sous-traitance BTP, etc.) |
| K, G, O | Livraison intracommunautaire, exportation, hors champ | Selon le cas |

\[Complétez avec la liste exacte de la spécification ; votre outil ne prend peut-être pas en charge toutes les catégories au lancement\]

Taux courants en France métropolitaine : 20 %, 10 %, 5,5 % et 2,1 %. Les taux applicables aux départements d’outre-mer sont différents. \[À VÉRIFIER\]

#### **Les erreurs à éviter**

1. **Un seul taux de TVA** appliqué au total alors que les lignes ont des taux différents.  
2. **Une ligne avec deux taux.** Une ligne a un taux ; séparez-la en deux lignes.  
3. **Un motif d’exonération manquant** pour une ligne exonérée.  
4. **Des remises globales** qui ne sont pas réparties par taux.  
5. **Un total TVA saisi à la main** au lieu d’être la somme des TVA par taux.

Les erreurs de validation associées sont de la famille BR-CO : voir le guide des codes d’erreur et l’erreur BR-CO-15.

#### **Comment Factur-X Facile le gère**

\[À ALIGNER SUR LE PRODUIT RÉEL\] Les lignes sont extraites avec leur taux ; la ventilation est recalculée par taux ; elle est comparée aux totaux imprimés dans le PDF. Un écart est présenté avec les deux valeurs, jamais corrigé en silence : c’est à vous de décider quelle valeur est la bonne, puis de corriger la source.

#### **FAQ**

**Comment arrondir la TVA ?** Par catégorie et taux, sur la base totale, à deux décimales. Vérifiez la règle exacte dans le Schematron.

**Faut-il une ligne de ventilation par taux ?** Oui, une par couple catégorie et taux présents dans la facture.

**Quelle catégorie pour une TVA à 0 % ou une exonération ?** Z pour un taux zéro, E pour une exonération avec motif. Les autres catégories répondent à des cas précis.

**Puis-je mélanger biens et services avec des taux différents ?** Oui, c’est justement le rôle de la ventilation.

**Sources à consulter** : règles EN 16931 (Schematron officiel) ; spécification Factur-X (fnfe-mpe.org).

**Pour aller plus loin** : contrôlez la ventilation de votre fichier avec le validateur Factur-X et, pour les avoirs, lisez faire un avoir en Factur-X.

### **A9 · Fournisseur qui envoie un PDF simple : que faire ?**

**URL** : /ressources/facture-fournisseur-pdf-simple · **Title** : Fournisseur qui envoie un PDF simple : que faire ? · **Meta** : Depuis le 1er septembre 2026 vous devez pouvoir recevoir des factures électroniques. Que faire des PDF simples encore reçus ? Réponses claires.

**Sujet sensible : faites relire cet article par un expert-comptable ou un juriste avant publication.**

Depuis le 1er septembre 2026, toute entreprise assujettie à la TVA et établie en France doit pouvoir **recevoir** des factures électroniques. Pourtant, votre boîte e-mail continue de recevoir des PDF classiques de vos fournisseurs. Faut-il les refuser ? Les convertir ? Les accepter comme avant ? Voici une méthode claire, avec une mise en garde importante sur ce que vous pouvez (et ne devez pas) faire avec un convertisseur.

***Importer une facture fournisseur dans votre logiciel** : Factur-X Facile peut produire un fichier structuré à partir d’un PDF, **pour votre usage interne**. Ce n’est pas la facture électronique de votre fournisseur (voir plus bas).*

#### **Ce qui est obligatoire pour vous**

D’après les sources que j’ai consultées :

* **Réception** : toutes les entreprises assujetties à la TVA établies en France doivent pouvoir recevoir des factures électroniques depuis le 1er septembre 2026, par l’intermédiaire d’une plateforme agréée.  
* **Annuaire** : l’entreprise doit être inscrite dans l’annuaire central et indiquer la plateforme qui reçoit ses factures. \[À VÉRIFIER sur impots.gouv.fr : démarche et délais\]

Ce qui change n’est donc pas ce que vous **acceptez**, mais ce que vous devez être **capable de recevoir**.

#### **Pourquoi vous recevez encore des PDF simples**

1. **L’obligation d’émettre n’est pas encore applicable à tous.** Les PME, TPE et micro-entreprises émettent en électronique à compter du 1er septembre 2027 (avec une faculté de décalage par décret au plus tard au 1er décembre 2027, selon les sources consultées).  
2. **Des fournisseurs étrangers** ne relèvent pas du même régime. \[À VÉRIFIER\]  
3. **Certaines opérations** (ventes à des particuliers, export) relèvent d’un e-reporting plutôt que de la facture électronique.  
4. **Des retards d’organisation** : tolérance prévue pour les premières infractions, selon les sources.

#### **Que faire selon le fournisseur ?**

| Fournisseur | Situation | Réaction raisonnable |
| :---- | :---- | :---- |
| Grande entreprise ou ETI | Doit émettre en électronique depuis le 1er septembre 2026 | Lui indiquer votre plateforme et demander une facture électronique |
| PME, TPE, micro-entreprise | Émission électronique obligatoire à partir de 2027 | Accepter le PDF pour l’instant, lui communiquer votre plateforme pour anticiper |
| Fournisseur étranger | Régime distinct | Traiter comme avant, avec vos contrôles habituels |

\[Tableau à valider avec un expert-comptable\]

#### **Les 4 bons réflexes**

1. **Ne refusez pas une facture valide pour une question de format** tant que le fournisseur n’est pas tenu d’émettre en électronique. Gardez trace de l’échange si vous la contestez.  
2. **Communiquez votre plateforme** à vos fournisseurs : indiquez-la dans vos conditions d’achat ou par e-mail.  
3. **Archivez l’original** reçu, sans le modifier.  
4. **Contrôlez comme toujours** : SIREN et TVA du fournisseur, numéro de facture déjà enregistré (doublons), cohérence des montants, IBAN.

#### **Convertir vous-même le PDF d’un fournisseur : ce que c’est, et ce que ce n’est pas**

Un convertisseur sait transformer un PDF en fichier Factur-X. Utilisé sur la facture d’un fournisseur, il produit **une version structurée pour votre logiciel comptable** : c’est utile pour importer les données sans ressaisie.

Mais attention :

* **Ce fichier n’est pas la facture électronique émise par votre fournisseur.** Vous ne devez ni le présenter comme tel, ni l’envoyer à une plateforme agréée comme si votre fournisseur l’avait émis.  
* **Il ne vous décharge d’aucune obligation** : ni la vôtre (recevoir), ni celle de votre fournisseur (émettre à son échéance).  
* **Conservez l’original** : c’est lui qui fait foi comme pièce comptable.  
* **Le risque d’erreur d’extraction demeure** : contrôlez chaque valeur avant d’importer.

\[Faites valider cette présentation par votre expert-comptable ou par un conseil juridique.\]

#### **Un point de sécurité : le faux RIB**

La fraude au changement d’IBAN passe souvent par des PDF modifiés. Une vérification arithmétique d’IBAN (somme de contrôle) détecte une faute de frappe, **pas une fraude**. Si un fournisseur change de coordonnées bancaires, confirmez-le par un autre canal (téléphone au numéro connu), quel que soit le format de la facture.

#### **Choisir une plateforme pour recevoir**

| Critère | Question à poser |
| :---- | :---- |
| Immatriculation | La plateforme figure-t-elle dans la liste officielle de la DGFiP ? |
| Intégration | Se connecte-t-elle à votre logiciel comptable ? |
| Archivage | Comment et combien de temps les factures sont-elles conservées ? |
| Coût | Abonnement, coût par facture, offre gratuite ? |
| Support | Assistance en cas de rejet, délais de réponse |

Pour la partie émission, voir envoyer un Factur-X. Pour le calendrier, le calendrier 2026-2027. Les cabinets comptables qui accompagnent plusieurs clients trouveront une méthode dans Cabinet comptable : factures clients en Factur-X.

#### **FAQ**

**Dois-je refuser une facture PDF simple ?** Pas nécessairement : tant que votre fournisseur n’est pas tenu d’émettre en électronique, il peut encore vous envoyer un PDF. \[À VALIDER\] L’essentiel est que vous soyez capable de recevoir des factures électroniques.

**Puis-je convertir moi-même la facture d’un fournisseur en Factur-X ?** Pour un import interne, oui, avec contrôle. Ce n’est pas l’émission d’une facture électronique par le fournisseur.

**Comment recevoir des factures via une plateforme ?** Choisissez une plateforme agréée, inscrivez-la dans l’annuaire et communiquez-la à vos fournisseurs.

**Que dit la loi sur les sanctions ?** Les sources évoquent des amendes à l’émission et à l’e-reporting, avec une tolérance pour les premières infractions. \[À VÉRIFIER sur impots.gouv.fr\]

**Sources à consulter** : FAQ de la DGFiP sur la facturation électronique (impots.gouv.fr).

### **A10 · Envoyer un Factur-X : plateforme agréée ou Chorus Pro**

**URL** : /ressources/envoyer-factur-x-plateforme-agreee · **Title** : Envoyer un Factur-X : plateforme agréée ou Chorus Pro · **Meta** : Votre Factur-X est prêt : où le déposer, qui transmet les données à l’administration et ce qui change selon la taille de votre entreprise.

Vous avez converti votre facture en Factur-X. Et maintenant ? **Un convertisseur ne transmet rien : il fabrique le fichier.** Pour que votre client le reçoive comme une facture électronique et que les données arrivent à l’administration, il faut passer par une **plateforme agréée** (anciennement « plateforme de dématérialisation partenaire »), ou par Chorus Pro si votre client est une entité publique. Voici comment ça marche, comment choisir et quoi vérifier avant l’envoi.

***Pas encore de Factur-X ?** Convertissez votre facture PDF puis revenez ici pour le dépôt.*

#### **Les acteurs, en une image**

Vous (émetteur)  
   │  dépôt du Factur-X  
   ▼  
Votre plateforme agréée ──► (données de facturation et e-reporting) ──► Administration fiscale  
   │  routage via l’annuaire central  
   ▼  
Plateforme agréée de votre client  
   │  
   ▼  
Votre client (PDF lisible \+ XML dans son logiciel)  
D’après les sources consultées : la plateforme agréée émet vos factures, les achemine vers celle du destinataire en s’appuyant sur l’annuaire, puis extrait et transmet les données réglementaires au portail public, qui les relaie à l’administration. Le portail public ne sert plus d’outil d’échange de factures entre entreprises ; il joue le rôle d’annuaire et de concentrateur de données. \[À VÉRIFIER : état à la date de publication\]

Un point clé : **l’administration reçoit des données extraites de la facture, pas votre PDF.** Votre client, lui, reçoit votre fichier complet.

#### **Trois destinataires, trois chemins**

| Votre client | Chemin | Remarque |
| :---- | :---- | :---- |
| Entreprise assujettie à la TVA établie en France | Plateforme agréée vers plateforme agréée | Obligatoire à votre échéance (voir le calendrier) |
| Entité publique | Chorus Pro | Chorus Pro accepte des dépôts au format Factur-X ; les informations exigées (service, engagement) dépendent du destinataire \[À VÉRIFIER dans la documentation Chorus Pro\] |
| Particulier, client étranger | E-reporting (données) | Pas de facture électronique au sens de la réforme \[À VÉRIFIER\] |

#### **L’e-mail suffit-il encore ?**

Ça dépend de votre taille et de la date :

* **Grandes entreprises et ETI** : l’émission électronique via plateforme agréée s’applique depuis le 1er septembre 2026\.  
* **PME, TPE, micro-entreprises** : l’obligation d’émettre en électronique arrive le 1er septembre 2027 (faculté de décalage par décret au plus tard au 1er décembre 2027, selon les sources). Jusqu’à cette échéance, un PDF envoyé par e-mail reste possible dans le cadre prévu. \[À VÉRIFIER\]

Dans tous les cas, **un Factur-X envoyé simplement en pièce jointe d’un e-mail ne remplit pas l’obligation de passer par une plateforme agréée** lorsque celle-ci s’applique.

Voir le détail dans le calendrier 2026-2027.

#### **Comment choisir une plateforme agréée ?**

La DGFiP publie la liste officielle des plateformes immatriculées. \[Ajouter le lien exact vers la liste sur impots.gouv.fr après vérification\] Les critères pratiques :

| Critère | À regarder |
| :---- | :---- |
| Statut | Immatriculation officielle, pas seulement une mention commerciale |
| Mode de dépôt | Téléversement dans l’interface, e-mail dédié ou API |
| Formats acceptés | Factur-X (profil EN 16931), UBL, CII |
| Contrôles à l’entrée | Quelles règles appliquent-elles ? Messages de rejet clairs ? |
| Intégration | Compatibilité avec votre logiciel comptable ou de facturation |
| Tarification | Abonnement, coût par facture, volume inclus |
| Archivage | Durée, accès, export |
| Support | Réponse en cas de rejet |

#### **Déposer votre fichier**

Selon la plateforme, vous pouvez :

1. **Téléverser** le fichier dans l’interface.  
2. **L’envoyer par e-mail** à une adresse dédiée.  
3. **Utiliser une API** ou un connecteur (surtout pour les volumes).

La plateforme contrôle le fichier, le transmet au destinataire et vous indique son statut (déposée, mise à disposition, rejetée, refusée, etc.). \[Noms exacts des statuts à vérifier dans la documentation des plateformes\]

#### **La checklist avant l’envoi**

1. Le fichier est un **Factur-X** (PDF/A-3 avec XML), pas un PDF simple : testez-le avec le validateur.  
2. Les **identifiants** sont corrects : SIREN du vendeur et du client, numéros de TVA.  
3. Les **adresses électroniques** exigées par les règles françaises sont renseignées (voir erreurs BR-FR-12 et BR-FR-13).  
4. Les **totaux** sont cohérents (voir erreur BR-CO-15).  
5. Le PDF visible et le XML disent la même chose (voir XML et PDF qui divergent).  
6. Vous n’envoyez **qu’un seul exemplaire** : pas de PDF classique en parallèle, au risque de créer un doublon.  
7. Le numéro de facture est unique.  
8. Vous avez archivé le fichier envoyé.

#### **Si la plateforme rejette le fichier**

1. Lisez le **motif de rejet** et son code (BR-… ou message de la plateforme) : guide des codes d’erreur.  
2. **Corrigez à la source** (la facture d’origine ou les données), jamais en modifiant le fichier final.  
3. **Régénérez** le Factur-X, **revalidez**, puis déposez à nouveau.

#### **À retenir**

* Un convertisseur **fabrique** le fichier ; une plateforme agréée le **transmet**.  
* L’administration reçoit des **données**, votre client reçoit votre **fichier**.  
* Selon votre taille et le calendrier, l’e-mail peut suffire pour l’instant, mais pas pour longtemps.

Pour comprendre le format, lisez Factur-X : définition et profils. Pour les factures que vous **recevez**, voir fournisseur qui envoie un PDF simple.

#### **FAQ**

**Mon outil de conversion peut-il envoyer la facture à l’administration ?** Non. Seule une plateforme agréée transmet les données.

**L’e-mail suffit-il encore entre entreprises ?** Selon votre taille et la date : voir ci-dessus et le calendrier.

**Quelle différence entre Chorus Pro et une plateforme agréée ?** Chorus Pro est le portail de dépôt des factures destinées au secteur public. Les plateformes agréées couvrent les échanges entre entreprises assujetties.

**Dois-je déposer le PDF, le XML ou le Factur-X ?** Le Factur-X (PDF/A-3 avec XML embarqué), sauf indication contraire de la plateforme.

**Sources à consulter** : impots.gouv.fr (liste des plateformes agréées, guide de la facturation électronique) ; documentation Chorus Pro (portail officiel).

### **A11 · Erreurs de validation Factur-X : guide des codes BR**

**URL** : /ressources/erreurs-validation-factur-x · **Title** : Erreurs de validation Factur-X : guide des codes BR · **Meta** : BR-CO-15, BR-FR-12, BR-S-08 : le sens de chaque code, la cause la plus fréquente et la correction, expliqués en français.

**Règle d’exactitude pour cet article : le tableau des codes doit être contrôlé ligne par ligne dans le Schematron officiel (version et date à indiquer) avant publication. Plusieurs guides concurrents contiennent des erreurs de codes.**

Votre validateur ou votre plateforme vous renvoie un message du type « BR-CO-15 » et rien d’autre de lisible ? Ces codes ne sont pas arbitraires : ils correspondent aux **règles de la norme européenne EN 16931** et, pour la France, à des règles complémentaires (BR-FR). Chaque code désigne une règle précise, avec une cause classique et une correction. Voici comment les lire, les familles principales et les erreurs les plus fréquentes, en français.

***Tester votre fichier** : le validateur Factur-X affiche chaque erreur avec son code et un lien vers sa fiche. Si votre PDF n’est pas encore un Factur-X, convertissez-le.*

#### **Les quatre niveaux de contrôle**

Un fichier Factur-X peut échouer à quatre endroits différents. Savoir lequel vous évite de chercher au mauvais endroit.

| Niveau | Ce qui est vérifié | Exemple d’erreur |
| :---- | :---- | :---- |
| 1\. Conteneur PDF/A-3 | Polices, métadonnées, pièce jointe | Police non incorporée (voir PDF/A-3 refusé) |
| 2\. Structure XML (XSD) | Éléments, ordre, types, formats | Date au mauvais format, élément manquant |
| 3\. Règles métier EN 16931 (Schematron) | Cohérence des données | BR-CO-15 : total TTC incohérent |
| 4\. Règles françaises (BR-FR) | Compléments de la réforme française | BR-FR-12 : adresse électronique de l’acheteur manquante |

Un fichier peut passer le niveau 2 et échouer au niveau 3 : le XML est bien formé, mais les chiffres ne tombent pas juste.

#### **Anatomie d’un message d’erreur**

1. **Un code** (BR-CO-15).  
2. **Une sévérité** : « fatale » (bloquante) ou « avertissement ».  
3. **Un message**, souvent en anglais, qui est la traduction d’une condition écrite en langage de règles.  
4. **Une localisation** dans le XML (chemin de l’élément concerné).

Le code vous dit **quelle règle**, la localisation vous dit **où**, et la section « Bt-xxx » vous dit **quel champ**. Les références BT et BG désignent les termes de la norme (BT \= champ, BG \= groupe de champs).

#### **Les familles de codes**

| Famille | Domaine | Exemple |
| :---- | :---- | :---- |
| BR-xx | Présence des données obligatoires | BR-02 : numéro de facture |
| BR-CO-xx | Cohérence des calculs et des conditions | BR-CO-15 |
| BR-CL-xx | Valeurs autorisées (listes de codes) | Code pays ou devise invalide |
| BR-S, BR-Z, BR-E, BR-AE… | TVA selon la catégorie | BR-E-10 : motif d’exonération |
| BR-FR-xx | Règles françaises | BR-FR-12, BR-FR-13 |

#### **Les erreurs les plus fréquentes**

\[Tableau à vérifier ligne par ligne dans le Schematron officiel de la version en vigueur\]

| Code | Ce que ça signifie | Cause fréquente | Correction | Fiche |
| :---- | :---- | :---- | :---- | :---- |
| BR-CO-10 | Somme des lignes (BT-106) ≠ somme des montants de lignes | Total saisi à la main, arrondi par ligne oublié | Recalculer à partir des lignes arrondies | A2 |
| BR-CO-13 | Total HT (BT-109) ≠ lignes − remises \+ frais | Remises ou frais de pied de facture mal pris en compte | Recalculer le total HT | — |
| BR-CO-14 | Total TVA (BT-110) ≠ somme des TVA par catégorie | TVA globale saisie à la main | Additionner les TVA de la ventilation | A8 |
| **BR-CO-15** | **Total TTC (BT-112) ≠ total HT (BT-109) \+ total TVA (BT-110)** | **Arrondis, TVA ligne par ligne** | **Recalculer par taux** | **A12** |
| BR-CO-16 | Reste à payer (BT-115) incohérent avec TTC, acomptes et arrondi | Acompte mal placé | Revoir les montants BT-113 et BT-115 | A12 |
| BR-CO-17 | TVA d’une catégorie ≠ base × taux, arrondie | Calcul de TVA ligne par ligne | Calculer par taux sur la base totale | A8 |
| BR-CO-25 | Montant à payer positif sans échéance ni conditions | Date d’échéance et conditions absentes | Renseigner l’échéance ou les conditions | — |
| BR-02, BR-03 | Numéro ou date de facture absent | Extraction manquante | Renseigner la donnée | — |
| BR-08, BR-09 | Adresse du vendeur ou pays absent | Adresse incomplète | Compléter l’adresse | — |
| BR-16 | Aucune ligne de facture | XML généré sans lignes | Ajouter au moins une ligne | — |
| BR-E-10 | Exonération sans motif | TVA à 0 % sans mention | Ajouter le motif (voir micro-entrepreneur) | — |
| BR-FR-12 | Adresse électronique de l’acheteur (BT-49) manquante | Champ non renseigné | Renseigner l’adresse électronique | A13 |
| BR-FR-13 | Adresse électronique du vendeur (BT-34) manquante | Champ non renseigné | Renseigner l’adresse électronique | A13 |

#### **Les erreurs de structure (XSD)**

Elles ne portent pas de code BR. Les plus courantes :

* **Format de date** : le XML attend un format précis (par exemple AAAAMMJJ avec le code de format 102\) ; une date écrite 08/10/2026 est refusée.  
* **Séparateur décimal** : le point, pas la virgule.  
* **Élément obligatoire manquant ou vide** : un champ vide n’est pas un champ absent. Un élément vide (par exemple une adresse sans ville) déclenche des erreurs ; mieux vaut ne pas écrire l’élément du tout quand l’information n’existe pas.  
* **Ordre des éléments** : le schéma impose un ordre. Un générateur qui l’ignore produit des fichiers invalides.  
* **Espaces de noms** : un préfixe ou une URL incorrects.

#### **La méthode de correction en 5 étapes**

1. **Notez le code et la localisation** de chaque erreur.  
2. **Commencez par les erreurs de structure** (XSD) puis par la présence des données (BR-xx), car elles masquent souvent les erreurs de calcul.  
3. **Corrigez à la source** (la facture d’origine ou les données), jamais en retouchant le fichier final.  
4. **Régénérez** le Factur-X.  
5. **Revalidez** : une correction peut en révéler une autre, par exemple un arrondi corrigé qui décale un total.

#### **Les erreurs propres aux conversions de PDF existants**

Quand on convertit un PDF, d’autres risques apparaissent, que les codes BR ne décrivent pas :

* une **valeur mal lue** (un chiffre, un total pris pour un autre) qui rend le XML cohérent en interne mais faux par rapport au PDF (voir XML et PDF qui divergent) ;  
* un **SIREN du vendeur** qui ne correspond pas à l’entreprise ;  
* un **champ obligatoire absent du PDF** et donc impossible à reprendre.

C’est pourquoi Factur-X Facile relie chaque valeur à son emplacement dans le PDF et exécute des contrôles avant de générer le fichier.

#### **Version et date de ce catalogue**

Ce guide est vérifié contre le Schematron EN 16931 version \[À COMPLÉTER\] et les règles BR-FR version \[À COMPLÉTER\], à la date du \[À COMPLÉTER\]. Les règles évoluent avec les versions de la spécification : en cas de doute, la source de vérité est le fichier Schematron lui-même.

#### **FAQ**

**Que signifie BR dans les codes d’erreur ?** « Business Rule » : une règle métier de la norme EN 16931\.

**Quelle différence entre XSD et Schematron ?** Le premier vérifie la forme (éléments, types, ordre), le second le fond (cohérence, calculs, conditions). Voir ce que contrôle un validateur.

**Pourquoi mon fichier passe un validateur et pas la plateforme ?** Les plateformes appliquent leurs propres contrôles, parfois plus stricts ou fondés sur une autre version des règles.

**Un avertissement empêche-t-il l’envoi ?** Pas toujours, mais corrigez-le : une plateforme peut le traiter comme une erreur.

**Sources à consulter** : fichiers Schematron EN 16931 (publiés par la Commission européenne) ; règles BR-FR et spécification Factur-X (fnfe-mpe.org).

### **A12 · Erreur BR-CO-15 : total TTC différent de HT \+ TVA**

**URL** : /ressources/erreur-br-co-15 · **Title** : Erreur BR-CO-15 : total TTC différent de HT \+ TVA · **Meta** : BR-CO-15 signifie que BT-112 n’est pas égal à BT-109 \+ BT-110. Les causes (arrondis, remises) et comment corriger votre facture.

\[Vérifier le texte officiel de la règle dans le Schematron avant publication.\]

**BR-CO-15 est l’une des erreurs les plus fréquentes en validation Factur-X.** Elle signifie que le **total TTC** de la facture n’est pas égal à la somme du **total HT** et du **total de TVA**. Un écart d’un centime suffit : la norme ne prévoit aucune tolérance. Voici le sens exact de la règle, ses causes classiques, un exemple chiffré et la méthode pour corriger.

***Éviter l’erreur dès la conversion** : Factur-X Facile recalcule HT, TVA et TTC et vous montre les deux valeurs en cas d’écart, avant de générer le fichier. Pour contrôler un fichier existant : validateur Factur-X.*

#### **Ce que dit la règle**

| Terme | Référence | Élément XML (profil CII) |
| :---- | :---- | :---- |
| Total HT | BT-109 | TaxBasisTotalAmount |
| Total de TVA | BT-110 | TaxTotalAmount |
| Total TTC | BT-112 | GrandTotalAmount |

**BT-112 \= BT-109 \+ BT-110**, au centime près, dans la devise de la facture.

#### **Les 5 causes les plus fréquentes**

1. **Arrondi de la TVA ligne par ligne** : le total TVA est la somme de TVA arrondies ligne par ligne, alors que la norme calcule la TVA **par taux** sur la base totale (voir plusieurs taux de TVA).  
2. **Montants saisis à la main** : un total TTC tapé dans un tableur ou un modèle, sans lien avec les lignes.  
3. **Remises ou frais de pied de facture** non reportés dans le HT ou dans la ventilation de TVA.  
4. **Confusion entre TTC et reste à payer** : après un acompte, on inscrit le reste à payer à la place du TTC.  
5. **Arrondis différents entre le PDF et le XML**, produits par deux outils distincts.

#### **Exemple 1 : un centime d’arrondi**

Trois lignes à 1,12 € HT, TVA 20 %.

|  | Calcul ligne par ligne | Calcul par taux (attendu) |
| :---- | :---- | :---- |
| Total HT | 3,36 | 3,36 |
| TVA | 3 × 0,22 \= 0,66 | 3,36 × 20 % \= 0,672, arrondi à 0,67 |
| TTC | 4,02 | 4,03 |

Si le XML contient une TVA de 0,67 (calcul par taux, conforme à la règle de calcul de la TVA) mais un TTC de 4,02 (déduit de 3,36 \+ 0,66), BR-CO-15 se déclenche : 3,36 \+ 0,67 \= 4,03.

#### **Exemple 2 : un acompte**

Facture de 1 800,00 € TTC. Le client a versé 500,00 € d’acompte. Le reste à payer est 1 300,00 €.

\<\!-- Extrait simplifié : cumul des montants de l'en-tête \--\>  
\<ram:SpecifiedTradeSettlementHeaderMonetarySummation\>  
  \<ram:LineTotalAmount\>1500.00\</ram:LineTotalAmount\>  
  \<ram:TaxBasisTotalAmount\>1500.00\</ram:TaxBasisTotalAmount\>  
  \<ram:TaxTotalAmount currencyID='EUR'\>300.00\</ram:TaxTotalAmount\>  
  \<ram:GrandTotalAmount\>1800.00\</ram:GrandTotalAmount\>  
  \<ram:TotalPrepaidAmount\>500.00\</ram:TotalPrepaidAmount\>  
  \<ram:DuePayableAmount\>1300.00\</ram:DuePayableAmount\>  
\</ram:SpecifiedTradeSettlementHeaderMonetarySummation\>  
Le **TTC reste 1 800,00 €** ; l’acompte figure à part, et le reste à payer est une troisième valeur (règle voisine, BR-CO-16 d’après mes recherches \[À VÉRIFIER\]). Écrire 1 300,00 € dans GrandTotalAmount déclenche BR-CO-15.

#### **Comment diagnostiquer, en 4 étapes**

1. **Extrayez** les trois valeurs du XML (voir le tableau ci-dessus) ; voir comment ouvrir le XML d’un Factur-X.  
2. **Calculez** : total HT \+ total TVA.  
3. **Comparez** au total TTC du XML. L’écart vous renseigne : un centime évoque un arrondi ; un écart rond (500 €, 1 000 €) évoque un acompte ou une remise.  
4. **Remontez à la cause** : vérifiez BR-CO-10 (somme des lignes), BR-CO-13 (HT global), BR-CO-14 (somme des TVA) et BR-CO-17 (TVA par catégorie), car BR-CO-15 est souvent la conséquence d’une autre règle. \[À VÉRIFIER dans le Schematron\]

#### **Comment corriger**

* **Corrigez à la source** (votre logiciel, votre feuille, votre modèle), puis régénérez le fichier. Retoucher le fichier final casse la cohérence avec le PDF.  
* **Calculez la TVA par taux** sur la base totale.  
* **Ne masquez pas un écart** avec un montant d’arrondi (BT-114) : ce champ n’est pas fait pour cela. \[À VÉRIFIER\]  
* **Revalidez** avec le validateur.

Si vos factures viennent d’un tableur, lisez aussi convertir une facture Excel en Factur-X.

#### **FAQ**

**Un écart d’un centime est-il vraiment bloquant ?** Oui, la règle ne prévoit pas de tolérance.

**BR-CO-15 vient-elle de mon PDF ou de mon XML ?** Du XML. Mais si le PDF affiche d’autres montants, vous avez en plus un problème de cohérence (voir XML et PDF qui divergent).

**Quelle différence avec le reste à payer ?** Le TTC (BT-112) est le total de la facture ; le reste à payer (BT-115) tient compte des acomptes et de l’arrondi.

**Où trouver la liste de toutes les erreurs ?** Dans le guide des codes d’erreur.

**Sources à consulter** : fichiers Schematron EN 16931 ; spécification Factur-X (fnfe-mpe.org).

### **A13 · Erreurs BR-FR-12 et BR-FR-13 : adresse électronique**

**URL** : /ressources/erreur-br-fr-12-br-fr-13 · **Title** : Erreurs BR-FR-12 et BR-FR-13 : adresse électronique · **Meta** : Les règles françaises exigent les adresses électroniques du vendeur (BT-34) et de l’acheteur (BT-49). Ce qu’elles signifient et que saisir.

\[Valeurs, schémas d’identification et formats à reprendre mot pour mot des spécifications externes de la DGFiP et de l’AIFE, et des règles BR-FR de la FNFE-MPE. Ne rien inventer.\]

Votre fichier passe les règles européennes, puis la validation française s’arrête sur **BR-FR-12** ou **BR-FR-13**. Ces deux règles sont propres à la France : elles exigent que l’**adresse électronique de l’acheteur** (BT-49) et celle du **vendeur** (BT-34) soient renseignées. Beaucoup de factures n’affichent pourtant jamais cette donnée, ce qui en fait l’une des erreurs les plus déroutantes. Voici ce qu’elles signifient, où les corriger et comment éviter de saisir n’importe quoi.

***Contrôler votre fichier** : le validateur Factur-X signale ces deux règles avec le champ concerné. Factur-X Facile vous demande les adresses électroniques qui ne figurent pas sur le PDF. \[À ALIGNER SUR LE PRODUIT\]*

#### **Ce que disent les règles**

| Code | Règle (d’après les règles BR-FR publiées) | Champ |
| :---- | :---- | :---- |
| BR-FR-12 | L’adresse électronique de l’acheteur est obligatoire | BT-49 |
| BR-FR-13 | L’adresse électronique du vendeur est obligatoire | BT-34 |

D’autres règles voisines portent sur le **format** et la **longueur** de ces adresses (par exemple BR-FR-23 et BR-FR-25 pour l’identifiant de l’adresse, selon la liste publiée). \[À VÉRIFIER\]

#### **À quoi sert l’adresse électronique ?**

Dans le système français, une facture électronique est routée d’une plateforme agréée à une autre grâce à un **annuaire central** : chaque entreprise y déclare la plateforme qui reçoit ses factures. L’adresse électronique renseignée dans la facture est la clé qui permet de retrouver le bon destinataire. Sans elle, la plateforme ne sait pas où acheminer le fichier. \[À VÉRIFIER dans les spécifications externes : rôle exact de BT-34 et BT-49\]

Cette adresse **n’est pas une adresse e-mail** au sens courant : c’est un identifiant de routage, avec un schéma d’identification et une valeur dont le format est fixé par les spécifications.

#### **Où ces champs se trouvent dans le XML**

\<\!-- Extrait simplifié du XML (profil CII) \--\>  
\<ram:SellerTradeParty\>  
  \<ram:Name\>TECH LAB SOLUTIONS SAS\</ram:Name\>  
  \<ram:URIUniversalCommunication\>  
    \<ram:URIID schemeID='\[schéma prévu par les spécifications\]'\>\[valeur\]\</ram:URIID\>  
  \</ram:URIUniversalCommunication\>  
\</ram:SellerTradeParty\>

\<ram:BuyerTradeParty\>  
  \<ram:Name\>ATELIER DU DIGITAL SARL\</ram:Name\>  
  \<ram:URIUniversalCommunication\>  
    \<ram:URIID schemeID='\[schéma prévu par les spécifications\]'\>\[valeur\]\</ram:URIID\>  
  \</ram:URIUniversalCommunication\>  
\</ram:BuyerTradeParty\>  
**Un constat de première main.** Dans l’un de nos premiers fichiers de test, le générateur avait écrit ces éléments **vides** (\<ram:URIID/\>). C’est exactement le type de défaut que ces règles sanctionnent : un élément vide n’est pas une adresse renseignée. Mieux vaut ne pas écrire l’élément du tout quand l’information n’existe pas, et empêcher la génération tant qu’une donnée obligatoire manque.

#### **Que saisir ?**

1. **Pour le vendeur (BT-34)** : l’adresse de réception que vous avez déclarée dans l’annuaire lors de votre inscription auprès d’une plateforme agréée. Votre plateforme vous la communique. \[À VÉRIFIER : format exact\]  
2. **Pour l’acheteur (BT-49)** : l’adresse de réception de votre client. Demandez-la-lui, ou consultez l’annuaire si votre plateforme le permet. \[À VÉRIFIER : conditions d’accès à l’annuaire\]  
3. **Ne l’inventez pas.** Une valeur approximative est pire qu’une valeur absente : la facture serait acheminée au mauvais endroit ou rejetée plus tard.

#### **Le piège des conversions de PDF**

Ces adresses figurent **rarement sur une facture PDF** classique. Un convertisseur ne peut donc pas les extraire : il doit vous les demander. Retenez-le : si vous convertissez des PDF existants, préparez dans votre fiche client l’adresse électronique de chacun de vos clients professionnels.

Se pose aussi la question de la cohérence avec le PDF visible : une donnée de routage n’a pas toujours vocation à apparaître sur le document lisible. \[À VÉRIFIER dans la spécification Factur-X : exigence de présence dans la représentation lisible\] Voir XML et PDF qui divergent.

#### **Comment corriger**

1. **Obtenez les adresses** (la vôtre auprès de votre plateforme, celle de votre client auprès de lui ou dans l’annuaire).  
2. **Enregistrez-les** dans votre fiche entreprise et dans votre fiche client, pour ne pas les ressaisir.  
3. **Régénérez** le Factur-X.  
4. **Revalidez** avec le validateur.

La suite du parcours : envoyer un Factur-X. La liste des autres erreurs : guide des codes.

#### **FAQ**

**BR-FR-12 et BR-FR-13 s’appliquent-elles à tous les profils ?** \[À VÉRIFIER selon le profil et la version des règles\]

**L’adresse électronique est-elle une adresse e-mail ?** Non : c’est un identifiant de routage défini par les spécifications.

**Puis-je laisser le champ vide si je ne connais pas l’adresse de mon client ?** Non, la règle est bloquante. Demandez-la à votre client.

**Pourquoi cette erreur apparaît-elle seulement avec un validateur français ?** Parce que ce sont des règles françaises, absentes de la norme européenne de base.

**Sources à consulter** : spécifications externes de la facturation électronique (impots.gouv.fr) ; règles BR-FR et spécification Factur-X (fnfe-mpe.org).

### **A14 · Ce que contrôle un validateur Factur-X (et ce qu’il ignore)**

**URL** : /ressources/ce-que-controle-un-validateur-factur-x · **Title** : Ce que contrôle un validateur Factur-X (et ce qu’il ignore) · **Meta** : XSD, Schematron, PDF/A-3, règles BR-FR : quatre contrôles différents. Ce que chacun vérifie, et ce qui reste à contrôler vous-même.

« Valide » ne veut pas dire la même chose d’un outil à l’autre. Un validateur peut vérifier que votre PDF est un bon PDF/A-3, que votre XML respecte la structure, que vos calculs tombent juste, que les règles françaises sont respectées… ou seulement une partie de ces points. Et **aucun outil ne vérifie que la facture est exacte**. Voici ce que contrôle chaque couche, ce qui échappe à tous les validateurs, et comment lire un résultat sans se tromper.

***Vérifier votre fichier** : le validateur Factur-X indique, pour chaque couche, ce qui a été contrôlé. \[À ALIGNER SUR LE PRODUIT RÉEL\]*

#### **Les quatre couches de contrôle**

| Couche | Ce qui est vérifié | Outil typique |
| :---- | :---- | :---- |
| 1\. Conteneur PDF/A-3 | Polices, métadonnées, couleurs, pièce jointe | veraPDF |
| 2\. Structure du XML (XSD) | Éléments, ordre, types, formats | Validation de schéma |
| 3\. Règles métier EN 16931 et profil Factur-X (Schematron) | Données obligatoires, calculs, conditions | Fichiers Schematron officiels |
| 4\. Règles françaises (BR-FR) | Compléments de la réforme | Schematron des règles françaises |

Le validateur PDF/A ne contrôle pas la sémantique Factur-X (le XML). Le validateur Factur-X ne remplace pas veraPDF pour le conteneur. Pour un contrôle complet, il faut les deux, d’où l’intérêt de savoir ce que fait chaque outil.

#### **Ce que les validateurs ne contrôlent pas**

1. **La cohérence entre le PDF visible et le XML.** À notre connaissance, les validateurs de conformité lisent le XML et la structure du PDF ; ils ne comparent pas les montants affichés à ceux du XML. \[À COMPLÉTER : résultat de notre test, voir l’article A3\] Voir XML et PDF qui divergent.  
2. **L’exactitude réelle des montants** par rapport à votre contrat ou à votre bon de commande.  
3. **L’existence du SIREN** : un SIREN peut passer la somme de contrôle et ne correspondre à aucune entreprise réelle. Il faut une vérification dans la base Sirene pour cela.  
4. **L’appartenance d’un IBAN à son titulaire** : la somme de contrôle détecte une faute de frappe, pas une fraude.  
5. **Les règles propres à votre plateforme** : chaque plateforme peut appliquer des contrôles supplémentaires.  
6. **La numérotation continue** et l’absence de doublons.  
7. **Les mentions légales textuelles** (pénalités de retard, indemnité de 40 €) dans le PDF.

#### **Quels outils pour quel contrôle ?**

\[Tableau à remplir après test : cochez uniquement ce que vous avez vérifié vous-même, avec la date et la version\]

| Contrôle | veraPDF | Validateur officiel FNFE-MPE | Notre validateur |
| :---- | :---- | :---- | :---- |
| PDF/A-3 (conteneur) | Oui | \[À COMPLÉTER\] | \[À COMPLÉTER\] |
| XSD | Non | \[À COMPLÉTER\] | \[À COMPLÉTER\] |
| Schematron EN 16931 | Non | \[À COMPLÉTER\] | \[À COMPLÉTER\] |
| Règles BR-FR | Non | \[À COMPLÉTER\] | \[À COMPLÉTER\] |
| Cohérence PDF et XML | Non | \[À COMPLÉTER\] | \[À COMPLÉTER\] |

Le validateur officiel de la FNFE-MPE est accessible gratuitement sur le site de l’organisation (services.fnfe-mpe.org). \[Vérifier l’adresse et les formats pris en charge avant publication\]

#### **Comment voir le XML d’un Factur-X**

Le XML est une pièce jointe du PDF, nommée factur-x.xml. Pour l’afficher :

* **Adobe Acrobat Reader** : icône de trombone dans le volet de gauche.  
* **Firefox** : panneau latéral, onglet des pièces jointes.  
* **SumatraPDF (Windows)** ou **Evince (Linux)** : les pièces jointes sont listées dans le volet latéral.

En ligne de commande avec les outils poppler :

pdfdetach \-list facture.pdf  
pdfdetach \-save 1 \-o factur-x.xml facture.pdf  
xmllint \--format factur-x.xml  
Vous pouvez ensuite ouvrir le XML dans un navigateur ou un éditeur de texte. Comparez les montants et les identifiants avec ceux du PDF : c’est un contrôle que les validateurs ne font pas à votre place.

#### **Les versions comptent**

* Le profil est déclaré à deux endroits : dans le XML (identifiant de spécification, BT-24) et dans les métadonnées XMP du PDF. Les deux doivent concorder.  
* Les règles Schematron dépendent de la version de la spécification Factur-X et de la norme EN 16931\. Un validateur qui utilise une ancienne version peut accepter ou refuser à tort.  
* Factur-X et ZUGFeRD 2.x sont techniquement le même format, d’après les sources consultées.

#### **La bonne méthode en 3 passes**

1. **Un validateur Factur-X** pour le XML et les règles (validateur Factur-X).  
2. **veraPDF** pour le conteneur, si le premier signale une erreur PDF/A ou en cas de doute (PDF/A-3 refusé).  
3. **Votre plateforme agréée**, qui reste juge de dernière instance (envoyer un Factur-X).

Pour comparer plusieurs validateurs en ligne, voir le comparatif des validateurs Factur-X. Pour comprendre les codes, le guide des erreurs.

#### **FAQ**

**Un fichier « valide » est-il forcément accepté par ma plateforme ?** Non : la plateforme peut appliquer des contrôles supplémentaires ou utiliser une autre version des règles.

**Quelle différence entre XSD et Schematron ?** Le XSD vérifie la forme, le Schematron les règles métier. Un fichier peut être valide en XSD et invalide en Schematron.

**Un validateur détecte-t-il un chiffre faux dans mon XML ?** Seulement s’il viole une règle de calcul. Un chiffre faux mais cohérent passe tous les contrôles.

**Pourquoi utiliser plusieurs validateurs ?** Parce que chacun couvre un périmètre différent.

**Sources à consulter** : veraPDF (verapdf.org) ; fichiers Schematron EN 16931 ; spécification Factur-X (fnfe-mpe.org).

### **A15 · Comparatif des validateurs Factur-X en ligne (2026)**

**URL** : /ressources/comparatif-validateurs-factur-x · **Title** : Comparatif des validateurs Factur-X en ligne (2026) · **Meta** : FNFE-MPE, outils en ligne, bibliothèques open source : ce que chacun contrôle, la confidentialité des fichiers et le meilleur usage.

**Cet article ne doit être publié qu’après avoir réalisé vous-même les tests décrits plus bas. Les cellules \[À COMPLÉTER\] sont à remplir avec vos résultats, la date et les versions.**

**Transparence : nous éditons l’un des outils comparés.** Nous avons testé tous les outils avec la même méthode et publié les fichiers de test pour que vous puissiez refaire l’exercice. Si vous constatez une erreur sur votre outil, écrivez-nous : nous corrigerons.

Il existe aujourd’hui de nombreux validateurs Factur-X en ligne, gratuits pour la plupart. Ils ne font pas tous le même travail : certains vérifient seulement le XML, d’autres aussi le conteneur PDF/A-3, certains appliquent les règles françaises (BR-FR), d’autres non. Et la question de la **confidentialité** de vos factures est rarement posée. Voici une méthode pour les comparer, un tableau à remplir avec des résultats réels, et un guide pour choisir.

***Tester votre fichier maintenant** : le validateur Factur-X est gratuit et sans inscription. \[À ALIGNER SUR LE PRODUIT\]*

#### **Les outils comparés**

Échantillon issu de nos recherches en octobre 2026 (liste non exhaustive) :

| Outil | Type |
| :---- | :---- |
| Validateur de la FNFE-MPE (services.fnfe-mpe.org) | Officiel, en ligne, gratuit |
| zugferd-validator.de | En ligne |
| verifier-ma-facture.fr | En ligne (affiche des contrôles dans le navigateur, selon son site) |
| facture-obligatoire.fr | En ligne |
| einvoicevalidator.com | En ligne |
| facturwise.com | En ligne |
| sealdoc.eu | En ligne |
| billstride.com | En ligne |
| Mustang Project, validateur KoSIT | Open source, à installer (Java) |
| veraPDF | Open source, conteneur PDF/A uniquement |
| Notre validateur | En ligne |

#### **Les critères de comparaison**

| Critère | Pourquoi il compte |
| :---- | :---- |
| Contrôle du conteneur PDF/A-3 | Beaucoup de refus viennent du conteneur, pas du XML |
| Validation XSD | Structure du XML |
| Schematron EN 16931 | Règles métier européennes |
| Règles BR-FR | Règles françaises de la réforme |
| Version des règles | Une ancienne version donne de faux résultats |
| Profils pris en charge | MINIMUM à EXTENDED |
| Clarté du rapport | Message en français, localisation, correction proposée |
| Confidentialité | Fichier traité dans le navigateur ou envoyé sur un serveur ? |
| Limites | Taille, nombre de fichiers, compte obligatoire |
| Prix | Gratuit, limité, payant |

#### **La méthode : six fichiers de test publics**

Chaque outil reçoit **les mêmes six fichiers** :

1. Un Factur-X valide (EN 16931, avec une ventilation de TVA).  
2. Un fichier au XML invalide en structure (une date mal formatée).  
3. Un fichier avec une erreur BR-CO-15 (total TTC faux d’un centime).  
4. Un fichier avec une erreur BR-FR-12 (adresse électronique de l’acheteur absente).  
5. Un PDF avec XML mais dont le PDF n’est pas conforme PDF/A-3 (police non incorporée).  
6. Un fichier dont le PDF et le XML divergent (voir XML et PDF qui divergent).

Les six fichiers sont téléchargeables : \[À PUBLIER\]. Date des tests : \[À COMPLÉTER\].

#### **Résultats**

\[Tableau à remplir : pour chaque outil et chaque fichier, indiquez le verdict et le code d’erreur renvoyé. Ne mettez rien de mémoire.\]

| Outil | Fichier 1 | Fichier 2 | Fichier 3 | Fichier 4 | Fichier 5 | Fichier 6 |
| :---- | :---- | :---- | :---- | :---- | :---- | :---- |
| FNFE-MPE | \[À COMPLÉTER\] | \[À COMPLÉTER\] | \[À COMPLÉTER\] | \[À COMPLÉTER\] | \[À COMPLÉTER\] | \[À COMPLÉTER\] |
| Outil B | \[À COMPLÉTER\] | \[À COMPLÉTER\] | \[À COMPLÉTER\] | \[À COMPLÉTER\] | \[À COMPLÉTER\] | \[À COMPLÉTER\] |
| Outil C | \[À COMPLÉTER\] | \[À COMPLÉTER\] | \[À COMPLÉTER\] | \[À COMPLÉTER\] | \[À COMPLÉTER\] | \[À COMPLÉTER\] |
| Notre validateur | \[À COMPLÉTER\] | \[À COMPLÉTER\] | \[À COMPLÉTER\] | \[À COMPLÉTER\] | \[À COMPLÉTER\] | \[À COMPLÉTER\] |

Dans ce type de test, les résultats peuvent différer : un outil détecte une erreur, un autre l’ignore, un troisième la classe en avertissement. **Rapportez ces différences sans commentaire acerbe** : elles s’expliquent le plus souvent par des versions de règles différentes.

#### **Confidentialité : la question que presque personne ne pose**

Une facture contient des noms, des adresses, des identifiants et des montants. Avant de téléverser un fichier réel, vérifiez :

1. Le fichier est-il **analysé dans votre navigateur** ou **envoyé** à un serveur ?  
2. Est-il **conservé** ? Combien de temps ?  
3. Où le serveur est-il **hébergé** ?  
4. Le service indique-t-il un **sous-traitant** ou une IA ?

Pour des factures sensibles, un outil local (veraPDF et un validateur à installer) est la solution la plus sûre. Voir aussi que deviennent vos factures dans un convertisseur.

#### **Quel outil pour quel besoin ?**

| Besoin | Recommandation |
| :---- | :---- |
| Vérifier rapidement un fichier | Un validateur en ligne gratuit |
| Avoir un avis « officiel » sur le XML | Le validateur de la FNFE-MPE |
| Diagnostiquer un problème de PDF/A | veraPDF |
| Valider beaucoup de fichiers ou intégrer dans un processus | Une bibliothèque open source ou une API |
| Fichiers sensibles | Un outil local ou un validateur qui traite dans le navigateur |
| Obtenir un fichier corrigé | Un convertisseur, par exemple Factur-X Facile |

Pour comprendre ce que chaque couche contrôle, lisez ce que contrôle un validateur. Pour déchiffrer un message d’erreur, le guide des codes.

#### **FAQ**

**Quel est le meilleur validateur Factur-X gratuit ?** Aucun n’est « le meilleur » dans l’absolu : le résultat dépend de ce que vous voulez contrôler. Utilisez-en deux complémentaires (XML et conteneur PDF/A-3).

**Un validateur en ligne est-il sûr pour mes factures ?** Cela dépend de son fonctionnement : demandez-vous si le fichier quitte votre navigateur.

**Pourquoi deux validateurs donnent-ils des résultats différents ?** Versions de règles, périmètre de contrôle, interprétation des avertissements.

**Le validateur de la FNFE-MPE suffit-il ?** Il est la référence pour le format, mais votre plateforme applique ses propres contrôles.

**Sources à consulter** : FNFE-MPE (fnfe-mpe.org) ; veraPDF (verapdf.org) ; Mustang Project.

### **A16 · Factur-X : définition et profils, lequel choisir ?**

**URL** : /ressources/factur-x-definition-profils · **Title** : Factur-X : définition et profils, lequel choisir ? · **Meta** : Un PDF/A-3 avec XML embarqué. Les 5 profils (MINIMUM à EXTENDED), ce que contient chacun et celui à viser pour une facture B2B.

**Cet article est une référence : vérifiez chaque point de ce texte dans la spécification Factur-X en vigueur (fnfe-mpe.org) et dans les spécifications externes de la DGFiP avant publication.**

On parle beaucoup de « Factur-X » sans toujours dire ce que c’est. Un Factur-X est **une facture au format PDF qui embarque, à l’intérieur du même fichier, ses données au format XML**. L’humain lit le PDF, le logiciel lit le XML. Voici une explication claire du format, de ses cinq profils, et du profil à viser pour une facture B2B en France.

***Obtenir un Factur-X** : convertissez votre facture PDF ; **vérifier un fichier existant** : validateur Factur-X.*

#### **Factur-X en une définition**

Factur-X est un format de facture électronique **hybride**, publié conjointement par la France (FNFE-MPE) et l’Allemagne (FeRD, sous le nom ZUGFeRD). Il combine :

1. **Une représentation lisible** : un PDF (conteneur PDF/A-3, la variante qui autorise les pièces jointes).  
2. **Des données structurées** : un fichier XML nommé factur-x.xml, au format CII (Cross Industry Invoice, norme UN/CEFACT), conforme à la norme européenne EN 16931 selon le profil.  
3. **Des métadonnées XMP** qui déclarent le format et le profil.

Factur-X et ZUGFeRD 2.x sont techniquement le même format, d’après les sources consultées. La version en vigueur au moment de la rédaction : \[À COMPLÉTER sur fnfe-mpe.org\].

#### **Les cinq profils**

Un profil définit **la quantité de données** présentes dans le XML.

| Profil | Lignes de facture | Contenu | Usage typique |
| :---- | :---- | :---- | :---- |
| MINIMUM | Non | Données minimales d’identification et de montants | Rapprochement, pas une facture complète |
| BASIC WL | Non | Un peu plus que MINIMUM, sans détail des lignes | Cas limités |
| BASIC | Oui | Facture avec lignes, partie des champs de la norme | Facturation simple |
| EN 16931 | Oui | L’ensemble des données de la norme européenne | **Facture B2B complète** |
| EXTENDED | Oui | Champs additionnels au-delà de la norme | Besoins sectoriels, échanges complexes |

Selon les sources, un profil étendu dédié aux besoins de la réforme française (appelé « EXTENDED-CTC-FR ») existe aussi. \[À VÉRIFIER dans les spécifications externes\]

#### **Quel profil pour la réforme française ?**

Les sources ne sont pas unanimes. Plusieurs indiquent que le profil **EN 16931** constitue le socle pour une facture B2B complète, et que MINIMUM ou BASIC WL ne suffisent pas pour émettre de vraies factures. D’autres évoquent EXTENDED-CTC-FR comme profil attendu par certaines plateformes. \[À VÉRIFIER : la règle exacte, dans les spécifications externes de la DGFiP, à la date de publication\]

**Notre recommandation pour une facture B2B complète : viser EN 16931 avec les règles françaises (BR-FR)**, et vérifier ce qu’exige votre plateforme agréée. Faites évoluer le profil si les spécifications changent : le profil est un paramètre, pas une décision définitive.

#### **Les trois couches d’un fichier Factur-X**

| Couche | Contenu | Pour qui |
| :---- | :---- | :---- |
| Visuelle | PDF : la facture lisible | Humain (client, comptable) |
| Structurée | factur-x.xml | Logiciels, plateformes, administration (via la plateforme) |
| Déclarative | Métadonnées XMP | Détection automatique du format et du profil |

Les trois doivent concorder : voir XML et PDF qui divergent.

#### **À quoi ressemble le XML ?**

Extrait annoté (facture d’exemple fictive, profil EN 16931). Structure simplifiée : référez-vous au schéma officiel.

\<rsm:CrossIndustryInvoice xmlns:rsm='urn:un:unece:uncefact:data:standard:CrossIndustryInvoice:100'  
    xmlns:ram='urn:un:unece:uncefact:data:standard:ReusableAggregateBusinessInformationEntity:100'  
    xmlns:udt='urn:un:unece:uncefact:data:standard:UnqualifiedDataType:100'\>  
  \<rsm:ExchangedDocumentContext\>  
    \<ram:GuidelineSpecifiedDocumentContextParameter\>  
      \<ram:ID\>urn:cen.eu:en16931:2017\</ram:ID\>  \<\!-- BT-24 : profil \--\>  
    \</ram:GuidelineSpecifiedDocumentContextParameter\>  
  \</rsm:ExchangedDocumentContext\>  
  \<rsm:ExchangedDocument\>  
    \<ram:ID\>FA-2026-10-0042\</ram:ID\>            \<\!-- BT-1 : numéro \--\>  
    \<ram:TypeCode\>380\</ram:TypeCode\>            \<\!-- BT-3 : facture \--\>  
    \<ram:IssueDateTime\>  
      \<udt:DateTimeString format='102'\>20261008\</udt:DateTimeString\>  \<\!-- BT-2 \--\>  
    \</ram:IssueDateTime\>  
  \</rsm:ExchangedDocument\>  
  \<rsm:SupplyChainTradeTransaction\>  
    \<\!-- lignes de facture (BG-25) : au moins une \--\>  
    \<ram:ApplicableHeaderTradeAgreement\>  
      \<ram:SellerTradeParty\>  
        \<ram:Name\>TECH LAB SOLUTIONS SAS\</ram:Name\>   \<\!-- BT-27 \--\>  
        \<ram:SpecifiedLegalOrganization\>  
          \<ram:ID schemeID='0002'\>834567893\</ram:ID\>    \<\!-- SIREN du vendeur \--\>  
        \</ram:SpecifiedLegalOrganization\>  
        \<\!-- adresse, TVA, adresse électronique \--\>  
      \</ram:SellerTradeParty\>  
      \<\!-- acheteur \--\>  
    \</ram:ApplicableHeaderTradeAgreement\>  
    \<ram:ApplicableHeaderTradeSettlement\>  
      \<ram:InvoiceCurrencyCode\>EUR\</ram:InvoiceCurrencyCode\>  \<\!-- BT-5 \--\>  
      \<\!-- ventilation de TVA, paiement, totaux \--\>  
    \</ram:ApplicableHeaderTradeSettlement\>  
  \</rsm:SupplyChainTradeTransaction\>  
\</rsm:CrossIndustryInvoice\>

#### **Factur-X, UBL, CII : quelle différence ?**

D’après les sources consultées, trois formats sont acceptés pour la facturation électronique en France.

| Format | PDF lisible inclus ? | Usage |
| :---- | :---- | :---- |
| Factur-X | Oui (PDF/A-3 avec XML) | PME, TPE, échanges avec des humains |
| UBL | Non (XML seul) | Grandes entreprises, échanges automatisés |
| CII | Non (XML seul) | Idem |

Factur-X est le plus adapté aux petites structures parce qu’il garde une facture **lisible** par tous.

#### **FAQ**

**Factur-X est-il la même chose que ZUGFeRD ?** Techniquement oui à partir de la version 2.x de ZUGFeRD, d’après les sources consultées.

**Factur-X est-il obligatoire ?** Non : trois formats sont acceptés (Factur-X, UBL, CII). Ce qui devient obligatoire, c’est la facturation électronique entre assujettis, selon le calendrier (voir le calendrier).

**Quel profil pour une TPE ?** Visez EN 16931 avec les règles françaises, sauf indication contraire de votre plateforme.

**Peut-on lire un Factur-X sans logiciel particulier ?** Oui : la partie PDF s’ouvre dans n’importe quel lecteur. Pour voir le XML, voir ce que contrôle un validateur.

**Comment envoyer un Factur-X ?** Voir envoyer un Factur-X.

**Sources à consulter** : spécification Factur-X (fnfe-mpe.org) ; spécifications externes de la facturation électronique (impots.gouv.fr).

### **A17 · Facture électronique : calendrier 2026-2027 pour vos PDF**

**URL** : /ressources/calendrier-facturation-electronique-2026-2027 · **Title** : Facture électronique : calendrier 2026-2027 pour vos PDF · **Meta** : Réception depuis le 1er septembre 2026, émission des PME au 1er septembre 2027 : ce que cela change pour vos factures PDF existantes.

**Page de contexte à mettre à jour chaque mois. Indiquez la date de dernière vérification en haut de page. Toutes les dates et montants sont à confirmer sur impots.gouv.fr avant publication.**

Le calendrier de la facturation électronique est l’un des sujets les plus couverts du web. Cette page ne cherche pas à tout dire : elle résume **ce qui compte pour quelqu’un qui a déjà des factures en PDF** et se demande quand et comment les convertir. Dernière vérification : \[À COMPLÉTER : date\].

#### **Les dates à retenir**

D’après les sources que j’ai consultées en octobre 2026 :

| Date | Entreprises concernées | Obligation |
| :---- | :---- | :---- |
| 1er septembre 2026 | Toutes les entreprises assujetties à la TVA et établies en France | Pouvoir **recevoir** des factures électroniques |
| 1er septembre 2026 | Grandes entreprises et ETI | **Émettre** des factures électroniques et transmettre les données de transaction (e-reporting) |
| 1er septembre 2027 | PME, TPE et micro-entreprises | **Émettre** des factures électroniques et transmettre les données (e-reporting) |
| Au plus tard 1er décembre 2027 | PME, TPE et micro-entreprises | Date limite d’un éventuel décalage par décret (faculté prévue par la loi, selon une source) |

\[À VÉRIFIER : chaque date et la situation des entreprises en franchise en base de TVA\]

#### **Sanctions et tolérance**

Les sources consultées indiquent : une amende de **50 € par facture** non émise sous forme électronique (plafonnée à 15 000 € par an), **500 € par transmission** d’e-reporting manquante, et une tolérance pour la première infraction si elle est régularisée dans un délai de 30 jours. \[À VÉRIFIER sur le site de la DGFiP\]

#### **Suis-je une PME, une ETI, une grande entreprise ?**

Les catégories reposent sur les définitions statistiques de l’INSEE : effectif, chiffre d’affaires, total de bilan. Les seuils exacts figurent sur le site de l’INSEE ; vérifiez-les avant d’indiquer votre catégorie. \[À VÉRIFIER\]

#### **Que faire de vos factures PDF selon votre situation**

| Votre situation | Dès maintenant | Avant la date d’émission |
| :---- | :---- | :---- |
| Grande entreprise ou ETI | Émettre et recevoir via une plateforme agréée | Contrôler la qualité des fichiers |
| PME, TPE, micro-entreprise | Pouvoir recevoir ; choisir une plateforme | Préparer le modèle de facture, tester la conversion de vos PDF en Factur-X |
| Cabinet comptable | Informer et organiser vos clients | Méthode par lots |
| Micro-entrepreneur | Pouvoir recevoir ; vérifier ses clients | Franchise en base et Factur-X |
| Vous recevez des PDF simples | Ne pas les refuser sans raison | Fournisseur qui envoie un PDF simple |

#### **Un plan d’action en cinq étapes**

1. **Maintenant** : choisir une plateforme agréée et s’inscrire dans l’annuaire (comment envoyer un Factur-X).  
2. **Dans les prochains mois** : mettre à jour votre modèle de facture (SIREN du client, nature de l’opération, mentions de TVA).  
3. **Premier semestre 2027** : tester la conversion de vos PDF existants et valider le résultat (validateur Factur-X).  
4. **Été 2027** : émettre quelques factures réelles via votre plateforme pour détecter les rejets.  
5. **1er septembre 2027** : émission en production, si vous êtes concerné.

Pour comprendre le format lui-même, lisez Factur-X : définition et profils.

#### **FAQ**

**Quand dois-je émettre des factures électroniques ?** Selon votre taille : depuis le 1er septembre 2026 pour les grandes entreprises et les ETI, à compter du 1er septembre 2027 pour les PME, TPE et micro-entreprises.

**Dois-je pouvoir recevoir dès 2026 ?** Oui, toutes les entreprises assujetties à la TVA et établies en France.

**Mes factures à des particuliers sont-elles concernées ?** Elles relèvent de l’e-reporting, pas de la facture électronique. \[À VÉRIFIER\]

**Où trouver les informations officielles ?** Sur impots.gouv.fr, dans les pages consacrées à la facturation électronique.

**Sources à consulter** : impots.gouv.fr ; textes de loi et décrets en vigueur (legifrance.gouv.fr).

### **A18 · Étude : quels exports PDF passent le contrôle Factur-X ?**

**URL** : /ressources/etude-exports-pdf-factur-x · **Title** : Étude : quels exports PDF passent le contrôle Factur-X ? · **Meta** : Nous avons testé des exports PDF de logiciels de facturation avec un validateur : résultats, méthode et pistes de correction.

**Cet article est un squelette : il ne peut être publié qu’avec des mesures réelles. Aucun chiffre n’est fourni ici, volontairement.**

**Objectif de l’étude** : mesurer, avec un protocole reproductible, ce que produisent réellement les exports PDF des outils que les entreprises utilisent pour facturer, et combien sont directement utilisables comme conteneur Factur-X. C’est l’actif de votre stratégie qui peut générer le plus de liens et de citations, à condition que les données soient solides.

#### **Résumé (à rédiger en dernier)**

* Nombre d’outils testés : \[À COMPLÉTER\]  
* Part dont l’export PDF par défaut est conforme PDF/A-3 : \[À COMPLÉTER\]  
* Part dont les polices sont incorporées : \[À COMPLÉTER\]  
* Principale cause d’échec : \[À COMPLÉTER\]  
* Outils testés avec réglage particulier qui corrige le problème : \[À COMPLÉTER\]

#### **Méthode**

1. **Une facture de test unique**, fictive, avec des données valides (identifiants cohérents), reproduite à l’identique dans chaque outil.  
2. **Exporter** en PDF avec les réglages par défaut, puis avec chaque option de conformité proposée.  
3. **Contrôler** chaque PDF avec :  
   * veraPDF (profil PDF/A-3b) ;  
   * le validateur Factur-X après conversion ;  
   * une inspection des polices (pdffonts).  
4. **Consigner** : nom et version de l’outil, système d’exploitation, date, réglages, résultats.  
5. **Publier** les données brutes (fichier CSV) et les PDF de test pour que chacun puisse reproduire.

#### **Outils à tester (liste proposée)**

Outils bureautiques : Word (Windows, Mac), Excel, LibreOffice Writer et Calc, Google Docs et Sheets, Pages. Navigateurs : impression en PDF depuis Chrome, Firefox, Safari. Outils de conception : Canva. Logiciels de facturation et de gestion : Odoo, Sage, EBP, QuickBooks, Zoho Invoice, Dolibarr, Pennylane, etc. \[Choisissez ceux que vos lecteurs utilisent vraiment ; au moins 20 pour que l’étude soit citable\]

#### **Tableau de résultats**

| Outil | Version | Système | Date du test | PDF/A déclaré | Polices incorporées | Métadonnées XMP | Profil de sortie couleur | PDF/A-3b valide (veraPDF) | Commentaire |
| :---- | :---- | :---- | :---- | :---- | :---- | :---- | :---- | :---- | :---- |
| \[À COMPLÉTER\] |  |  |  |  |  |  |  |  |  |

#### **Analyse**

\[À rédiger à partir des résultats : causes d’échec par ordre de fréquence ; différences entre versions ; réglages qui améliorent le résultat ; outils où aucune correction n’est possible côté utilisateur.\]

Un constat de première main à développer : dans un de nos tests, un PDF produit par WeasyPrint avait ses polices incorporées mais ne contenait ni métadonnées XMP ni profil de sortie couleur. Un PDF peut donc sembler irréprochable et ne pas être PDF/A. Voir PDF/A-3 : pourquoi votre facture est refusée.

#### **Limites de l’étude**

* Un échantillon n’est pas un recensement : précisez la taille et la logique de choix.  
* Les outils évoluent : indiquez les versions et la date.  
* Un test sur une facture simple ne couvre pas tous les cas (images, logos, polices exotiques).  
* veraPDF ne contrôle pas la sémantique Factur-X.

#### **Que faire si votre export n’est pas conforme ?**

1. Testez votre fichier avec le validateur.  
2. Passez par un convertisseur qui produit réellement du PDF/A-3 (Factur-X Facile).  
3. Dans les cas les plus difficiles, régénérez la facture à partir des données.

#### **Données et mise à jour**

* Jeu de données (CSV) : \[À PUBLIER\]. PDF de test : \[À PUBLIER\].  
* Mise à jour prévue : \[À COMPLÉTER : au moins une fois par an\].  
* Pour citer cette étude : nom du site, titre, date, URL.

#### **FAQ**

**Pourquoi tester avec une facture fictive ?** Pour publier les fichiers et permettre la reproduction sans exposer de données réelles.

**L’export PDF de mon logiciel peut-il être conforme PDF/A-3 ?** Certains outils le proposent, d’autres non : voir les résultats.

**Pourquoi veraPDF et pas seulement un validateur Factur-X ?** Parce que veraPDF contrôle le conteneur ; voir ce que contrôle un validateur.

**Pouvez-vous tester mon logiciel ?** Écrivez-nous : nous ajouterons les outils demandés lors de la prochaine mise à jour.

### **A19 · Convertisseur Factur-X et IA : que deviennent vos factures ?**

**URL** : /ressources/convertisseur-factur-x-confidentialite-ia · **Title** : Convertisseur Factur-X et IA : que deviennent vos factures ? · **Meta** : Votre facture passe-t-elle par une IA ou un serveur étranger, est-elle conservée ? Les questions à poser à tout convertisseur Factur-X, et nos réponses.

**Ne publiez pas cet article avant d’avoir arrêté et documenté votre traitement réel des données. Chaque réponse marquée \[À ALIGNER\] doit refléter exactement ce que fait le produit. Faites relire par un juriste ou un DPO.**

Une facture contient des noms, des adresses, des identifiants d’entreprise, parfois un IBAN et des montants. Quand vous la déposez dans un convertisseur en ligne, vous la confiez à un service dont vous ne voyez pas le fonctionnement. Beaucoup de convertisseurs utilisent aujourd’hui une **intelligence artificielle** pour lire les factures. Que devient votre fichier ? Voici les questions à poser à n’importe quel outil, et nos réponses.

***Convertir une facture** : Factur-X Facile : voir la page confidentialité pour le détail du traitement.*

#### **Comment fonctionne l’extraction par IA**

Quand vous déposez un PDF, un modèle d’IA lit le texte du document et propose des valeurs (numéro, dates, parties, lignes, totaux). Ces valeurs sont ensuite **vérifiées par du code classique** (identifiants, additions, présence de chaque valeur dans le PDF) puis **confirmées par vous**. L’IA est donc une aide à la saisie, pas un décideur. Elle peut se tromper : c’est pourquoi une vérification humaine reste indispensable (voir XML et PDF qui divergent).

#### **Les 8 questions à poser à tout convertisseur**

| \# | Question | Pourquoi elle compte | Notre réponse |
| :---- | :---- | :---- | :---- |
| 1 | Mon fichier est-il lu par une IA ? Laquelle ? | Vous devez savoir qui voit vos données | \[À ALIGNER : ex. API Gemini de Google\] |
| 2 | Mes données servent-elles à entraîner un modèle ? | Risque de réutilisation | \[À ALIGNER selon l’offre utilisée et ses conditions\] |
| 3 | Où les données sont-elles traitées ? | Droit applicable, transferts hors UE | \[À ALIGNER\] |
| 4 | Combien de temps le fichier est-il conservé ? | Minimisation | \[À ALIGNER : durée exacte, y compris chez le sous-traitant\] |
| 5 | Puis-je supprimer mes données ? | Droit à l’effacement | \[À ALIGNER\] |
| 6 | Qui sont les sous-traitants ? | Chaîne de responsabilité | \[À ALIGNER : liste\] |
| 7 | Un accord de sous-traitance (DPA) est-il disponible ? | Obligation RGPD du responsable de traitement | \[À ALIGNER\] |
| 8 | Qui est responsable en cas d’erreur d’extraction ? | Vous restez responsable de votre facture | Voir ci-dessous |

#### **Ce que disent les conditions des fournisseurs d’IA**

D’après notre lecture des conditions d’utilisation de l’API Gemini de Google : avec l’**offre payante**, les requêtes et les réponses ne sont pas utilisées pour améliorer les produits de Google, mais les entrées peuvent être conservées temporairement pour détecter les abus et respecter des obligations légales. Dans l’Espace économique européen, en Suisse et au Royaume-Uni, ces conditions précisent que seule l’offre payante peut être proposée aux utilisateurs finaux. Les données peuvent être traitées dans plusieurs pays. \[À VÉRIFIER dans les conditions en vigueur à la date de publication, et dans la configuration réelle de votre compte\]

Retenez deux choses : **l’offre gratuite d’un fournisseur d’IA n’a pas les mêmes garanties que l’offre payante**, et **un outil qui ne dit pas quel fournisseur il utilise ne peut pas vous renseigner sur le traitement de vos données**.

#### **Ce que dit le RGPD, en pratique**

* Les factures contiennent des **données personnelles** : noms de dirigeants et de salariés, adresses, parfois l’IBAN d’un entrepreneur individuel.  
* **Vous êtes responsable du traitement** des données de vos clients ; le convertisseur agit comme **sous-traitant**. Un contrat de sous-traitance est attendu.  
* Les **transferts hors de l’Union européenne** demandent des garanties.  
* Faites relire votre situation par un DPO ou un juriste. \[Information générale, pas un conseil juridique\]

#### **Les bonnes pratiques côté utilisateur**

1. **Testez d’abord avec une facture fictive**.  
2. **Lisez la politique de confidentialité** : fournisseur d’IA, durée de conservation, pays.  
3. **Privilégiez un outil local ou un traitement dans le navigateur** pour les documents sensibles quand c’est possible (voir le comparatif des validateurs).  
4. **Vérifiez la possibilité de supprimer** vos fichiers et votre compte.  
5. **Ne déposez pas de documents qui ne sont pas des factures.**

#### **Ce que nous faisons, et ce que nous ne disons pas**

\[À ALIGNER : remplacez par la description exacte, point par point\]

* Traitement de l’extraction : \[fournisseur, offre payante, configuration\].  
* Conservation : \[fichier envoyé pour extraction : durée ; Factur-X généré : stockage uniquement si vous activez l’historique ; durée ; suppression\].  
* Hébergement : \[pays et fournisseur\].  
* Journalisation : \[aucun contenu de facture dans les journaux, si c’est vrai\].  
* Contrat de sous-traitance : \[disponible sur demande, si c’est vrai\].

**Ce que nous ne promettons pas** : un « zéro stockage » (l’historique est facultatif mais il stocke vos fichiers si vous l’activez), ni un taux d’erreur nul. Chaque donnée est vérifiée par des contrôles automatiques puis confirmée par vous.

#### **Et si l’IA se trompe ?**

L’IA peut lire un chiffre de travers ou prendre un total pour un autre. Les contrôles automatiques détectent une partie de ces erreurs : valeur absente du PDF, SIREN invalide, additions incohérentes. Ils ne détectent pas un chiffre faux mais cohérent. D’où la vérification **côte à côte** avant toute génération, et la règle : **vous restez responsable du contenu de votre facture**.

#### **FAQ**

**Mon fichier sert-il à entraîner une IA ?** \[À ALIGNER selon l’offre et la configuration\]

**Mes factures sont-elles hébergées en France ?** \[À ALIGNER\]

**Combien de temps conservez-vous mes fichiers ?** \[À ALIGNER\]

**Puis-je utiliser votre outil pour des factures de clients (cabinet comptable) ?** Oui, sous réserve d’un contrat de sous-traitance et d’une information claire de vos clients : voir cabinet comptable.

**Existe-t-il un convertisseur sans IA ?** Certains outils utilisent des règles fixes pour l’extraction ; ils fonctionnent bien sur des mises en page connues et moins bien sur des factures variées.

**Sources à consulter** : CNIL (cnil.fr) ; conditions d’utilisation du fournisseur d’IA ; politique de confidentialité de chaque outil.

## **12\. Où poser les CTA**

### **12.1 Les deux CTA et leurs textes**

| Code | Destination | Texte du bouton | Quand l’utiliser |
| :---- | :---- | :---- | :---- |
| C1 | Convertisseur (/) | Convertir ma facture en Factur-X | L’utilisateur veut obtenir un Factur-X |
| C2 | Convertisseur (/) | Corriger en reconvertissant mon PDF | L’utilisateur a un fichier invalide ou un PDF non conforme |
| V1 | Validateur (/validateur-factur-x) | Valider mon fichier Factur-X | L’utilisateur veut contrôler un fichier |
| V2 | Validateur (/validateur-factur-x) | Vérifier le fichier obtenu | Après une conversion ou une correction |

### **12.2 Les trois emplacements**

1. **Bloc 1 : après l’introduction** (avant 25 % de la page). Pour les CTA vers le convertisseur : un encadré avec la **zone de dépôt** du convertisseur (le même composant que le hero, avec le même parcours de reprise du fichier après inscription). Pour le validateur : un encadré avec un lien vers la page du validateur (n’intégrez pas l’outil dans l’article : il alourdirait la page).  
2. **Bloc 2 : encadré contextuel**, au moment précis où l’article résout le problème (une phrase et un bouton).  
3. **Bloc 3 : fin d’article**, avec deux boutons : l’action principale puis l’action complémentaire.

### **12.3 Règles**

* **Trois CTA au maximum par article.** Au-delà, le texte devient publicitaire.  
* **Jamais au milieu d’une définition ou d’un tableau.**  
* **Pas de pop-up ni de bandeau** qui masque le contenu (pénalisé sur mobile).  
* **Pas de paramètre UTM sur les liens internes** (cela pollue les statistiques et crée des URLs parasites). Mesurez avec des attributs de suivi (par exemple data-cta='c1-top') et des évènements.  
* Le texte du CTA décrit l’action et le résultat, pas « cliquez ici ».  
* Les CTA du validateur **ne demandent aucune inscription** ; ceux du convertisseur peuvent mener à l’inscription après le dépôt (voir la recommandation de la section 3).

### **12.4 Matrice par page**

| Page | CTA principal | CTA secondaire | Emplacements |
| :---- | :---- | :---- | :---- |
| / (P1) | C1 (zone de dépôt) | V1 vers le validateur | Hero ; après « comment ça marche » ; fin de page ; V1 dans la section « Vérifier un fichier existant » |
| /validateur-factur-x (P2) | V1 (outil) | C2 selon le résultat | Outil en haut ; C2 dans le résultat (fichier invalide ou PDF sans XML) |
| A1 Word | C1 | V2 | Bloc 1 ; Bloc 2 après l’étape 2 ; Bloc 3 |
| A2 Excel | C1 | V2 | Bloc 1 ; Bloc 2 après l’étape 2 ; Bloc 3 |
| A3 XML et PDF divergents | C1 | V1 | Bloc 1 ; Bloc 2 dans « comment l’éviter » ; Bloc 3 |
| A4 PDF/A-3 refusé | V1 | C2 | Bloc 1 (V1) ; Bloc 2 dans « comment corriger » (C2) ; Bloc 3 |
| A5 Cabinet | C1 | Lien vers l’offre cabinet | Bloc 1 ; Bloc 2 après la méthode ; Bloc 3 avec contact |
| A6 Micro-entrepreneur | C1 | V2 | Bloc 1 ; Bloc 2 avant la marche à suivre ; Bloc 3 |
| A7 Avoir | C1 | V2 | Bloc 1 ; Bloc 2 dans « convertir un avoir PDF » ; Bloc 3 |
| A8 Multi-TVA | C1 | V2 | Bloc 1 ; Bloc 2 après l’exemple chiffré ; Bloc 3 |
| A9 Fournisseur PDF simple | C1 (avec rappel : import interne) | Lien A10 | Bloc 1 ; Bloc 3 |
| A10 Envoyer un Factur-X | V1 (dans la checklist) | C1 pour ceux qui n’ont pas de Factur-X | Bloc 1 (C1) ; Bloc 2 dans la checklist (V1) ; Bloc 3 |
| A11 Guide des codes | V1 | C2 | Bloc 1 (V1) ; Bloc 2 dans « erreurs propres aux conversions » (C2) ; Bloc 3 |
| A12 BR-CO-15 | V1 | C2 | Bloc 1 (V1) ; Bloc 2 dans « comment corriger » (C2) ; Bloc 3 |
| A13 BR-FR-12 et 13 | V1 | C2 | Bloc 1 ; Bloc 3 |
| A14 Ce que contrôle un validateur | V1 | C1 | Bloc 1 ; Bloc 3 |
| A15 Comparatif | V1 | C1 | Bloc 1 ; Bloc 3 (comparaison honnête, pas de promotion appuyée) |
| A16 Définition et profils | C1 | V1 | Bloc 1 ; Bloc 3 |
| A17 Calendrier | C1 | V1 | Bloc 2 dans « que faire de vos PDF » ; Bloc 3 |
| A18 Étude | V1 (tester son propre export) | C2 | Bloc 1 ; Bloc 3 |
| A19 Confidentialité et IA | C1 | Lien /confidentialite | Bloc 3 seulement (la confiance avant l’action) |

## **13\. Stratégie de maillage interne**

### **13.1 Principes**

1. **Structure en grappes** : chaque article appartient à un cluster (Conversion, Validation, Bases) et soutient un pilier.  
2. **Profondeur** : toute page est à **deux clics maximum de l’accueil**, trois au pire.  
3. **Le pilier est lié dès le début** : chaque article contient un lien vers son pilier principal dans les 150 premiers mots.  
4. **Piliers ↔ piliers** : l’accueil et le validateur se lient mutuellement par des blocs dédiés, pas uniquement par le menu.  
5. **Du pilier vers les articles** : chaque pilier a une section qui renvoie vers ses articles de soutien.  
6. **Entre articles frères** : 2 à 4 liens contextuels par article vers les articles du même cluster ou d’un cluster voisin, uniquement quand ils aident vraiment le lecteur.  
7. **Fil d’Ariane** : Accueil \> Ressources \> Cluster \> Article, avec données structurées.  
8. **Bloc « À lire aussi »** : 3 liens choisis à la main par article (table ci-dessous), jamais générés au hasard.  
9. **Aucune page orpheline** : toute page a au moins 2 liens entrants internes.  
10. **Règle de publication** : chaque nouvel article reçoit **3 liens entrants** depuis des articles existants le jour de sa mise en ligne.

### **13.2 Navigation globale**

* **En-tête** : Convertisseur Factur-X (/), Validateur Factur-X, Ressources, Tarifs, Connexion.  
* **Pied de page** : les 8 articles prioritaires (A4, A10, A11, A12, A13, A14, A16, A5), les hubs, et les pages de confiance (À propos, Confidentialité, Mentions légales, CGU).  
* **Le menu ne doit pas dépasser 6 entrées.**

### **13.3 Règles d’ancres**

| Cible | Ancres autorisées | Limite |
| :---- | :---- | :---- |
| Convertisseur (/) | convertisseur PDF en Factur-X (exacte) ; convertir votre PDF en Factur-X ; convertir votre facture en Factur-X ; le convertisseur de Factur-X Facile ; Factur-X Facile | **L’ancre exacte une seule fois par page** ; variantes pour les autres liens |
| Validateur | validateur Factur-X (exacte) ; vérifier votre fichier ; tester votre Factur-X ; le validateur gratuit | Idem |
| Articles | Une ancre descriptive qui reprend le sujet (ex. « erreur BR-CO-15 », « plusieurs taux de TVA ») | Jamais « cliquez ici » ni « en savoir plus » |

Autres règles :

* Pas de lien vers la même URL **deux fois** dans le corps d’un article avec des ancres différentes (les blocs CTA sont l’exception).  
* Pas plus d’une dizaine de liens internes dans le corps pour 1 500 mots.  
* Tous les liens internes sont **relatifs et propres** : pas de paramètre, pas de slash final.  
* Les liens vers les sources officielles (DGFiP, FNFE-MPE) sont des liens sortants normaux, sans nofollow (ce sont des sources fiables). Les liens vers des outils concurrents dans l’article comparatif sont des liens normaux.

### **13.4 Liens depuis les piliers**

| Pilier | Section | Liens vers |
| :---- | :---- | :---- |
| / | Pour qui ? | A5 (cabinets), A6 (micro-entrepreneurs) |
| / | Ma facture est dans Word ou Excel | A1, A2 |
| / | Cas particuliers | A7 (avoir), A8 (plusieurs taux de TVA) |
| / | Pourquoi mon PDF est refusé / cohérence | A4, A3 |
| / | Après la conversion | A10 |
| / | Confidentialité | A19 et /confidentialite |
| / | Vérifier un fichier existant | P2 |
| /validateur-factur-x | Lire le rapport | A11, A12, A13 |
| /validateur-factur-x | Ce que nous vérifions | A14 |
| /validateur-factur-x | Si le fichier est invalide | A4, P1 |
| /validateur-factur-x | Autres outils | A15 |
| /validateur-factur-x | Notre étude | A18 |
| /validateur-factur-x | Et ensuite ? | A10 |

### **13.5 Hubs de cluster**

| Hub | Articles listés |
| :---- | :---- |
| /ressources/conversion | A1, A2, A3, A5, A6, A7, A8, A9, A10 |
| /ressources/validation | A4, A11, A12, A13, A14, A15, A18 |
| /ressources/bases | A16, A17, A19 |

Chaque hub contient une introduction unique de 250 mots, un lien vers le pilier correspondant et la liste commentée de ses articles. /ressources renvoie vers les trois hubs, les 6 articles les plus récents et les deux piliers.

### **13.6 Liens « À lire aussi » (3 par article)**

| Article | À lire aussi |
| :---- | :---- |
| A1 | A2, A4, A10 |
| A2 | A1, A12, A8 |
| A3 | A14, A4, A1 |
| A4 | A14, A18, A1 |
| A5 | A9, A10, A6 |
| A6 | A7, A10, A17 |
| A7 | A8, A12, A10 |
| A8 | A7, A12, A2 |
| A9 | A10, A17, A5 |
| A10 | A17, A9, A16 |
| A11 | A12, A13, A14 |
| A12 | A11, A8, A2 |
| A13 | A11, A10, A14 |
| A14 | A15, A4, A11 |
| A15 | A14, A19, A11 |
| A16 | A17, A10, A14 |
| A17 | A10, A6, A5 |
| A18 | A4, A14, A15 |
| A19 | A15, A5, A3 |

### **13.7 Contrôle de cohérence**

Les textes de la section 15 contiennent déjà ces liens dans le corps. Avant publication, vérifiez avec un crawler (Screaming Frog ou équivalent) que : chaque URL répond 200 ; chaque article a au moins 2 liens entrants ; aucune ancre exacte n’est répétée ; aucun lien ne pointe vers une URL redirigée ; la profondeur maximale est de 3 clics. Refaites ce contrôle chaque trimestre.

## **14\. Prompt maître pour rédiger ou mettre à jour un article**

Les 19 articles de la section 15 sont déjà rédigés. Ce prompt sert à **mettre à jour** un article quand une règle change, à **ajouter** de nouveaux articles dans le même style et à **vérifier** les textes avant publication. Copiez-le, puis collez en dessous la fiche de l’article (URL, mot-clé, intention, plan, liens, CTA).

Rôle : tu es rédacteur technique spécialisé en facturation électronique en France. Tu écris pour un site qui édite un convertisseur et un validateur Factur-X.

Public : dirigeants de TPE et PME, indépendants, comptables. Niveau : non technique, curieux. Vouvoiement. Phrases courtes. Pas de jargon sans définition.

Règles non négociables :  
1\. N'invente aucun fait, chiffre, code d'erreur, date ou règle. Si tu n'es pas certain, écris \[À VÉRIFIER\] et indique la source officielle à consulter (DGFiP, FNFE-MPE, Schematron EN 16931).  
2\. N'invente aucun résultat de test ni aucune statistique. Utilise \[À COMPLÉTER\] pour toute donnée à mesurer.  
3\. Ne promets jamais un taux d'erreur nul, une conformité garantie, ni que l'outil transmet les factures à l'administration. N'affirme pas que les concurrents obligent à ressaisir les données.  
4\. Ne décris dans l'outil que les fonctionnalités listées dans la fiche produit ci-dessous. Marque \[À ALIGNER SUR LE PRODUIT\] tout ce que tu supposes.  
5\. Paraphrase les sources, ne les recopie pas. Aucune citation de plus de quinze mots.  
6\. Écris un contenu utile à lui seul : exemples chiffrés, tableaux, étapes concrètes, erreurs fréquentes. Pas de remplissage.  
7\. Aucun conseil juridique ou comptable définitif : renvoie vers un expert quand c'est sensible.

Structure : réponse directe dans les 100 premiers mots ; plan en H2 conforme à la fiche ; au moins un exemple chiffré ou un extrait de XML annoté (single quotes pour les attributs) ; FAQ de 3 à 5 questions avec des réponses de 40 à 60 mots ; section sources à consulter ; CTA aux emplacements indiqués ; liens internes de la fiche avec les ancres prescrites (une seule ancre exacte par page).

Preuve originale : intègre la preuve demandée dans la fiche (test, capture, mesure). Si elle n'existe pas encore, laisse un emplacement balisé \[À COMPLÉTER\].

Sortie : Markdown avec en-tête (URL, title de 60 caractères maximum, meta description de 120 à 155 caractères, H1), puis le corps, puis la FAQ, puis les sources. Termine par une liste de tous les marqueurs \[À VÉRIFIER\], \[À COMPLÉTER\] et \[À ALIGNER\] à traiter avant publication.

Fiche produit (à remplir) : extraction automatique : oui/non ; vérification côte à côte : oui/non ; contrôles SIREN, TVA, IBAN, arithmétique : oui/non ; multi-entreprises : oui/non ; lots : oui/non ; historique : oui/non ; validateur gratuit sans inscription : oui/non ; traitement de l'extraction : fournisseur et offre ; conservation des fichiers : durée.

Fiche de l'article : \[coller ici\]

## **16\. Plan d’action immédiat (10 points)**

1. **Trancher le nom de marque** avec un contrôle INPI, noms de domaine et recherche Google (section 4). Le nom « Factur-X Facile » est déjà utilisé par un concurrent direct : prenez un avis juridique avant d’investir dans le contenu.  
2. **Valider les mots-clés** (volumes et pages de résultats) pour les 19 articles (section 8).  
3. **Mettre en place la technique** : hôte unique, canonicals, noindex, sitemap, JSON-LD (section 9).  
4. **Publier les pages de confiance** : À propos, Confidentialité, Mentions légales, CGU, Tarifs.  
5. **Livrer le validateur** (EN 16931 et BR-FR) avant la page /validateur-factur-x.  
6. **Rédiger les deux piliers** à partir des fiches de la section 10\.  
7. **Réaliser les tests** qui conditionnent la vague 1 : A3 (validateurs), A4 (avant et après sur 3 PDF), A1 (export Word). Remplacer les marqueurs \[À COMPLÉTER\].  
8. **Vérifier chaque marqueur \[À VÉRIFIER\]** dans les sources officielles, en commençant par A11, A12, A13, A16 et A17.  
9. **Publier la vague 1** (semaines 1 à 4), puis suivre Search Console.  
10. **Lancer l’étude A18** (au moins 20 outils) et préparer la campagne de liens.