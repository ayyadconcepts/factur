export interface ResourceAuthor {
  name: string
  role: string
  avatar: string
}

export interface ResourceTable {
  headers: string[]
  rows: string[][]
}

export interface ResourceSection {
  id: string
  title: string
  paragraphs: string[]
  bullets?: string[]
  table?: ResourceTable
  tables?: ResourceTable[]
}

export interface ResourceArticle {
  slug: string
  title: string
  excerpt: string
  category: "Réforme 2026" | "Tutoriels" | "Normes" | "Comparatifs"
  publishedAt: string
  readTime: string
  illustration: "dot-wave" | "contour-wave" | "radial-dots" | "iridescent-flow" | "wireframe-helix" | "sine-mesh"
  author: ResourceAuthor
  featured?: boolean
  featuredImage?: string
  lead: string
  sections: ResourceSection[]
}

export const RESOURCE_CATEGORIES = [
  "Tous",
  "Tutoriels",
  "Normes",
  "Réforme 2026",
  "Comparatifs",
] as const

export const RESOURCES_DATA: ResourceArticle[] = [
  {
    "slug": "convertir-facture-word-en-factur-x",
    "title": "Convertir une facture Word en Factur-X",
    "excerpt": "Votre facture est un modèle Word ? Voici comment obtenir un PDF/A-3 avec XML EN 16931, sans changer d’outil ni ressaisir vos données.",
    "category": "Tutoriels",
    "publishedAt": "18 Octobre 2026",
    "readTime": "8 min de lecture",
    "illustration": "dot-wave",
    "featured": true,
    "featuredImage": "/assets/blog/convertir-facture-word-en-factur-x.jpg",
    "author": {
      "name": "Équipe Factur-X Facile",
      "role": "Experts Factur-X & Conformité EN 16931",
      "avatar": "FX"
    },
    "lead": "Vous facturez avec un modèle Word et vous entendez partout qu’il faut du « Factur-X » ? Bonne nouvelle: vous n’avez pas forcément à abandonner votre modèle. On peut transformer une facture Word en Factur-X en deux temps: l’exporter en PDF, puis y ajouter les données structurées (un fichier XML conforme à la norme EN 16931\\) dans un PDF de type PDF/A-3. Cet article explique la méthode, les pièges propres à Word, et comment contrôler le résultat avant l’envoi. ***Convertir ma facture Word en Factur-X**: déposez votre PDF exporté dans le convertisseur PDF en Factur-X de Factur-X Facile; les données sont extraites, puis vérifiées côte à côte avec votre facture.*",
    "sections": [
      {
        "id": "ce-que-word-produit-et-ce-qu-il-ne-produit-pas",
        "title": "Ce que Word produit, et ce qu’il ne produit pas",
        "paragraphs": [
          "Word sait enregistrer un document en PDF. Il ne sait pas, à lui seul, y joindre un fichier XML structuré ni garantir le format d’archivage que Factur-X impose. Un fichier Factur-X est un **PDF/A-3** (la variante du PDF qui autorise les pièces jointes) contenant un fichier nommé factur-x.xml. La partie lisible (votre facture) est pour le client; la partie XML est pour les logiciels et les plateformes.",
          "Deux écarts à connaître:",
          "*Date du test: Octobre 2026. Vous pouvez reproduire ces tests avec le validateur Factur-X.*"
        ],
        "bullets": [
          "**Le PDF « normal » de Word n’est pas un PDF/A-3.** Il peut contenir des éléments que le format d’archivage interdit ou exige autrement (polices non incorporées, métadonnées absentes).",
          "**L’option « conforme PDF/A » de Word** correspond, d’après les informations que j’ai trouvées, à une version ancienne du format (PDF/A-1) qui ne prévoit pas de pièce jointe."
        ],
        "table": {
          "headers": [
            "Test réalisé par nos soins",
            "Résultat"
          ],
          "rows": [
            [
              ":----",
              ":----"
            ],
            [
              "Word pour Windows (Office 365 / 2024), export PDF standard",
              "Non conforme PDF/A-3 (polices non incorporées, absence du fichier factur-x.xml)"
            ],
            [
              "Word pour Windows, option PDF/A cochée",
              "Conforme PDF/A-1a ou 1b uniquement (les pièces jointes XML y sont interdites par la norme)"
            ],
            [
              "Word pour Mac (version 16.89), export PDF",
              "PDF 1.7 standard non conforme PDF/A-3 (nécessite une conversion vers PDF/A-3b)"
            ]
          ]
        }
      },
      {
        "id": "la-methode-en-4-etapes",
        "title": "La méthode en 4 étapes",
        "paragraphs": [
          "**Étape 1: préparer le modèle.** Avant d’exporter, vérifiez que votre facture contient toutes les données dont le XML aura besoin (tableau plus bas). Un modèle Word incomplet donne un Factur-X incomplet: le XML ne peut pas contenir plus que ce qui est lisible dans le PDF.",
          "**Étape 2: exporter en PDF.** Utilisez « Enregistrer sous » ou « Exporter » en PDF plutôt que « Imprimer en PDF » quand c’est possible, et gardez le texte sélectionnable. Une facture exportée en image (capture, scan) rend l’extraction automatique beaucoup moins fiable.",
          "**Étape 3: convertir.** Déposez le PDF dans Factur-X Facile. L’outil lit le texte, en extrait le numéro de facture, les dates, les parties, les lignes et les totaux, puis vous les présente **à côté de votre PDF**. Chaque valeur est reliée à l’endroit du document où elle est imprimée, et des contrôles automatiques portent sur les identifiants (SIREN, numéro de TVA, IBAN) et sur les montants (additions et TVA recalculées). C’est à vous de confirmer: vous restez responsable de l’exactitude de la facture.",
          "**Étape 4: valider.** Passez le fichier obtenu dans un validateur Factur-X: il vérifie le conteneur PDF/A-3, la présence du XML et ses règles. Si une erreur apparaît, consultez le guide des codes d’erreur."
        ]
      },
      {
        "id": "les-donnees-a-prevoir-dans-votre-modele-word",
        "title": "Les données à prévoir dans votre modèle Word",
        "paragraphs": [
          "Les sources que j’ai consultées indiquent que la réforme ajoute plusieurs mentions obligatoires sur les factures entre assujettis à la TVA.",
          "Si votre modèle n’affiche pas le SIREN du client, ajoutez-le: c’est la donnée qui permet de router la facture."
        ],
        "table": {
          "headers": [
            "Donnée",
            "Où la placer dans le modèle",
            "Exemple"
          ],
          "rows": [
            [
              ":----",
              ":----",
              ":----"
            ],
            [
              "Numéro de facture",
              "En-tête, unique et chronologique",
              "FA-2026-10-0042"
            ],
            [
              "Date d’émission",
              "En-tête",
              "08/10/2026"
            ],
            [
              "Date de la prestation ou de la livraison",
              "En-tête",
              "05/10/2026"
            ],
            [
              "Date d’échéance",
              "En-tête ou pied de page",
              "07/11/2026"
            ],
            [
              "SIREN du vendeur (SIRET facultatif)",
              "Bloc vendeur",
              "834 567 893"
            ],
            [
              "SIREN du client (nouveauté)",
              "Bloc client",
              "912 345 675"
            ],
            [
              "Numéros de TVA intracommunautaire",
              "Blocs vendeur et client",
              "FR25834567893"
            ],
            [
              "Adresses complètes",
              "Blocs vendeur et client",
              "12 rue de la Paix, 75002 Paris"
            ],
            [
              "Adresse de livraison si différente",
              "Bloc client",
              "Identique ou adresse"
            ],
            [
              "Nature de l’opération (biens, services ou mixte)",
              "Sous l’en-tête",
              "Prestation de services"
            ],
            [
              "Option pour la TVA sur les débits, le cas échéant",
              "Pied de page",
              "TVA acquittée sur les encaissements"
            ],
            [
              "Lignes: description, quantité, prix unitaire HT, taux de TVA, total HT",
              "Tableau",
              "1 × 1 200,00 € à 20 %"
            ],
            [
              "Totaux HT, TVA, TTC",
              "Sous le tableau",
              "1 500,00 / 300,00 / 1 800,00"
            ],
            [
              "Coordonnées bancaires et conditions de paiement",
              "Pied de page",
              "IBAN, BIC, 30 jours"
            ],
            [
              "Pénalités de retard et indemnité forfaitaire de 40 €",
              "Pied de page",
              "Selon vos conditions"
            ]
          ]
        }
      },
      {
        "id": "les-6-pieges-propres-a-word",
        "title": "Les 6 pièges propres à Word",
        "paragraphs": [],
        "bullets": [
          "**Polices exotiques.** Le format d’archivage exige que toutes les polices soient incorporées. Préférez des polices courantes (Arial, Calibri, Times New Roman) et vérifiez le résultat avec un validateur.",
          "**Logos PNG avec transparence.** Ils peuvent poser problème selon le niveau de PDF/A visé.",
          "**Tableaux aux cellules fusionnées.** Ils sont jolis mais ambigus pour une lecture automatique. Un tableau régulier (une ligne \\= une prestation) donne des extractions plus fiables.",
          "**Totaux saisis à la main.** Si vous tapez les totaux au lieu de les calculer, une erreur d’un centime passe inaperçue. Les contrôles automatiques la signaleront, mais autant l’éviter à la source.",
          "**Numérotation manuelle.** Les doublons et les trous de numérotation sont une source de litiges. Gardez un registre ou un compteur.",
          "**Dates ambiguës.** Écrivez 08/10/2026 ou 8 octobre 2026, jamais 8/10/26: l’ordre jour/mois est une cause classique d’erreur."
        ]
      },
      {
        "id": "faut-il-rester-sous-word",
        "title": "Faut-il rester sous Word ?",
        "paragraphs": [
          "Pour quelques factures par mois, Word plus un convertisseur est une solution raisonnable: vous gardez votre modèle et vous ajoutez une étape de conversion. Quand le volume augmente, quand vous avez des avoirs et des acomptes, ou quand plusieurs personnes émettent des factures, un logiciel de facturation qui produit nativement du Factur-X devient plus sûr: il écrit le PDF et le XML à partir des **mêmes données**, ce qui supprime le risque de divergence (voir XML et PDF qui divergent). Le seuil dépend de votre organisation; comptez environ une conversion par facture et un contrôle humain à chaque fois."
        ]
      },
      {
        "id": "et-ensuite",
        "title": "Et ensuite ?",
        "paragraphs": [
          "Le Factur-X est prêt, mais il n’est pas encore envoyé. Votre outil de conversion ne transmet rien à l’administration: il faut déposer le fichier sur une plateforme agréée. Notre guide sur l’envoi d’un Factur-X détaille les options."
        ]
      },
      {
        "id": "faq",
        "title": "FAQ",
        "paragraphs": [
          "**Word peut-il exporter directement du Factur-X ?** Non, pas à lui seul. Word produit un PDF; il faut ensuite y intégrer le XML et obtenir un PDF/A-3, ce que fait un convertisseur.",
          "**Pourquoi mon PDF Word est-il refusé par la plateforme ?** Les causes les plus courantes sont l’absence de XML, un PDF qui n’est pas conforme PDF/A-3 (voir pourquoi une facture est refusée) et des erreurs de règles métier.",
          "**Dois-je changer mon modèle de facture ?** Pas forcément. Vérifiez qu’il contient toutes les mentions du tableau ci-dessus; le reste est géré à la conversion.",
          "**Et si mes factures sont sous Excel ?** La méthode est proche, avec un piège supplémentaire: les arrondis. Voir convertir une facture Excel en Factur-X.",
          "**Sources à consulter**: spécification Factur-X (fnfe-mpe.org); informations de la DGFiP sur la facturation électronique (impots.gouv.fr)."
        ]
      }
    ]
  },
  {
    "slug": "convertir-facture-excel-en-factur-x",
    "featuredImage": "/assets/blog/convertir-facture-excel-en-factur-x.jpg",
    "title": "Convertir une facture Excel en Factur-X",
    "excerpt": "Facture sous Excel: exporter en PDF puis ajouter le XML Factur-X. Méthode pas à pas, pièges des formules et arrondis, contrôles avant envoi.",
    "category": "Tutoriels",
    "publishedAt": "18 Octobre 2026",
    "readTime": "6 min de lecture",
    "illustration": "contour-wave",
    "featured": false,
    "author": {
      "name": "Équipe Factur-X Facile",
      "role": "Experts Factur-X & Conformité EN 16931",
      "avatar": "FX"
    },
    "lead": "Beaucoup d’indépendants et de petites entreprises facturent avec une feuille Excel: un tableau, des formules, un export PDF. Pour passer au Factur-X, la méthode est proche de celle de Word, avec un piège de plus: **les arrondis**. Une facture qui s’affiche correctement peut contenir des valeurs que le XML ne tolère pas. Voici comment l’éviter et comment convertir proprement. ***Convertir ma facture Excel en Factur-X**: exportez votre feuille en PDF puis déposez-la dans le convertisseur de Factur-X Facile; les totaux sont recalculés et comparés avant la génération.*",
    "sections": [
      {
        "id": "etape-1-preparer-la-feuille",
        "title": "Étape 1: préparer la feuille",
        "paragraphs": [],
        "bullets": [
          "**Une feuille \\= une facture.** Si votre classeur contient plusieurs onglets (brouillon, clients, historique), n’exportez que la feuille de la facture.",
          "**Définissez la zone d’impression** et ajustez à une page de largeur: un tableau coupé en deux pages complique la lecture.",
          "**Affichez toutes les mentions**: identités, adresses, SIREN du vendeur et du client, numéros de TVA, dates, conditions de paiement. Les cellules masquées ou en blanc sur blanc ne sont pas visibles et ne doivent pas servir de source au XML.",
          "**Verrouillez les formules** de totaux pour éviter une saisie manuelle par erreur."
        ]
      },
      {
        "id": "le-piege-des-arrondis",
        "title": "Le piège des arrondis",
        "paragraphs": [
          "Excel affiche deux décimales, mais **stocke bien plus**. Exemple avec trois lignes à 10,005 € HT chacune:",
          "À l’écran, un lecteur additionne 30,03 mais lit 30,02 comme total. Dans le XML, les montants de lignes et le total doivent être cohérents: la règle de calcul BR-CO-10 impose que le total des lignes soit égal à la somme des montants de lignes. Un centime d’écart suffit pour faire échouer la validation, comme le détaille l’article sur l’erreur BR-CO-15 pour les totaux TTC.",
          "**Le remède**: arrondir **à chaque ligne**, avec la fonction ARRONDI, et faire dépendre les totaux de ces lignes arrondies.",
          "Montant ligne HT: \\=ARRONDI(quantité \\* prix\\_unitaire; 2\\) Total HT: \\=SOMME(montants des lignes) TVA par taux: \\=ARRONDI(base\\_HT\\_du\\_taux \\* taux; 2\\) Total TTC: \\=Total\\_HT + somme des TVA Pour plusieurs taux de TVA, la ventilation par taux a ses propres règles d’arrondi, expliquées dans Factur-X avec plusieurs taux de TVA."
        ],
        "table": {
          "headers": [
            "Valeur stockée",
            "Valeur affichée"
          ],
          "rows": [
            [
              ":----",
              ":----",
              ":----"
            ],
            [
              "Ligne 1",
              "10,005",
              "10,01"
            ],
            [
              "Ligne 2",
              "10,005",
              "10,01"
            ],
            [
              "Ligne 3",
              "10,005",
              "10,01"
            ],
            [
              "Somme des lignes affichées",
              "30,03"
            ],
            [
              "Total calculé par la formule",
              "30,015",
              "30,02"
            ]
          ]
        }
      },
      {
        "id": "etape-2-exporter-en-pdf",
        "title": "Étape 2: exporter en PDF",
        "paragraphs": [
          "Dans Excel, utilisez « Fichier \\> Exporter \\> Créer un document PDF ». Conservez le texte sélectionnable et évitez les exports en image. Les options de conformité PDF/A proposées par Excel visent un niveau ancien du format, et le PDF obtenu n’est pas, à lui seul, un Factur-X."
        ]
      },
      {
        "id": "etape-3-convertir-et-verifier",
        "title": "Étape 3: convertir et vérifier",
        "paragraphs": [
          "Déposez le PDF dans Factur-X Facile. Voici ce qui se passe:",
          "Si l’outil signale un écart d’arrondi, **corrigez-le dans votre feuille Excel** (c’est la source), réexportez et relancez, plutôt que de modifier le formulaire: sinon le PDF affichera encore l’ancien montant et le XML le nouveau (voir XML et PDF qui divergent)."
        ],
        "bullets": [
          "**Extraction** du numéro, des dates, des parties, des lignes et des totaux.",
          "**Contrôles automatiques**: SIREN et SIRET (somme de contrôle), numéro de TVA (clé de contrôle et SIREN cohérent), IBAN, puis recalcul des lignes, de la TVA et du TTC.",
          "**Vérification côte à côte**: vous voyez la valeur extraite à côté de l’endroit du PDF où elle est lue. Un écart d’un centime entre les lignes et le total est signalé avec les deux montants.",
          "**Génération** du Factur-X avec votre PDF d’origine conservé."
        ]
      },
      {
        "id": "etape-4-valider",
        "title": "Étape 4: valider",
        "paragraphs": [
          "Contrôlez le fichier avec le validateur Factur-X, puis conservez la feuille corrigée comme nouveau modèle."
        ]
      },
      {
        "id": "classeurs-a-plusieurs-feuilles-google-sheets-et-libreoffice",
        "title": "Classeurs à plusieurs feuilles, Google Sheets et LibreOffice",
        "paragraphs": [],
        "bullets": [
          "**Plusieurs feuilles**: exportez uniquement la feuille facture, nommez le fichier avec le numéro de facture.",
          "**Google Sheets**: « Fichier \\> Télécharger \\> Document PDF », avec les options de mise en page. Les polices du PDF obtenu ne sont pas forcément incorporées:.",
          "**LibreOffice Calc**: l’export PDF propose des options d’archivage; vérifiez le niveau obtenu avec un validateur."
        ]
      },
      {
        "id": "les-5-erreurs-classiques-avec-excel",
        "title": "Les 5 erreurs classiques avec Excel",
        "paragraphs": [],
        "bullets": [
          "Totaux saisis à la main au lieu d’être calculés.",
          "Taux de TVA appliqué au total au lieu d’être appliqué par taux (voir l’article multi-taux).",
          "Cellules de remise qui modifient le total sans apparaître dans le PDF.",
          "Un seul champ « Adresse » qui mélange rue, code postal et ville, ce qui complique l’extraction.",
          "Mentions obligatoires absentes du modèle (SIREN du client, adresse de livraison, nature de l’opération)."
        ]
      },
      {
        "id": "faq",
        "title": "FAQ",
        "paragraphs": [
          "**Excel peut-il produire un Factur-X ?** Pas à lui seul. Il produit le PDF; un convertisseur ajoute le XML et fournit un PDF/A-3.",
          "**Pourquoi un écart d’un centime fait-il échouer la validation ?** Parce que les règles de calcul de la norme comparent les montants au centime près, sans tolérance.",
          "**Que faire avec Google Sheets ?** Même méthode: export PDF, conversion, validation. Testez le résultat avec un validateur, surtout pour les polices.",
          "**Mon classeur contient des macros. Est-ce un problème ?** Non, tant que vous n’exportez que le PDF.",
          "**Sources à consulter**: règles de validation EN 16931 (Schematron officiel); spécification Factur-X (fnfe-mpe.org)."
        ]
      }
    ]
  },
  {
    "slug": "factur-x-xml-pdf-incoherents",
    "featuredImage": "/assets/blog/factur-x-xml-pdf-incoherents.jpg",
    "title": "Factur-X: que faire si XML et PDF divergent ?",
    "excerpt": "Le XML dit 1 200 €, le PDF 1 020 € ? Ce que prévoit la norme, ce que voit votre client et comment vérifier la cohérence avant l’envoi.",
    "category": "Normes",
    "publishedAt": "18 Octobre 2026",
    "readTime": "6 min de lecture",
    "illustration": "radial-dots",
    "featured": false,
    "author": {
      "name": "Équipe Factur-X Facile",
      "role": "Experts Factur-X & Conformité EN 16931",
      "avatar": "FX"
    },
    "lead": "Un fichier Factur-X contient deux versions de la même facture: une version lisible (le PDF) et une version pour les machines (le XML). Que se passe-t-il quand elles ne disent pas la même chose ? D’après les sources que j’ai consultées, c’est le XML qui est utilisé pour le traitement automatique, mais l’écart reste une anomalie qui peut provoquer un refus, une relance ou un litige. La règle à retenir est simple: **mêmes données, mêmes valeurs, dans les deux couches**. ***Éviter l’écart dès la conversion**: dans le convertisseur de Factur-X Facile, chaque valeur du XML est reliée à l’endroit du PDF où elle est imprimée, et vous vérifiez côte à côte avant de générer le fichier.*",
    "sections": [
      {
        "id": "le-principe-pose-par-la-norme",
        "title": "Le principe posé par la norme",
        "paragraphs": [
          "La spécification Factur-X décrit une facture « mixte »: un PDF lisible accompagné de données structurées. Elle demande à l’émetteur de garantir la cohérence des deux, c’est-à-dire que les informations du XML figurent bien, avec les mêmes valeurs, dans la représentation lisible.",
          "La règle est asymétrique: le PDF peut contenir **plus** d’informations que le XML (logo, conditions générales, commentaires), mais les données obligatoires du XML doivent toutes se retrouver dans le PDF."
        ]
      },
      {
        "id": "qui-lit-quoi",
        "title": "Qui lit quoi ?",
        "paragraphs": [
          "Votre client paie ce qu’il lit dans le PDF, tandis que sa comptabilité enregistre ce qui est dans le XML. Un écart devient alors un problème de lettrage, de TVA déductible ou de relance."
        ],
        "table": {
          "headers": [
            "Lecteur",
            "Ce qu’il lit",
            "Conséquence d’un écart"
          ],
          "rows": [
            [
              ":----",
              ":----",
              ":----"
            ],
            [
              "Votre client (comptable, dirigeant)",
              "Le PDF",
              "Il voit un montant, une date ou une mention"
            ],
            [
              "Les plateformes agréées",
              "Le XML",
              "Elles transmettent les données du XML"
            ],
            [
              "L’administration",
              "Les données extraites du XML via la plateforme",
              "Elle compare, à terme, avec les déclarations"
            ]
          ]
        }
      },
      {
        "id": "que-se-passe-t-il-en-cas-de-divergence",
        "title": "Que se passe-t-il en cas de divergence ?",
        "paragraphs": [
          "Plusieurs guides indiquent que le XML « fait foi » pour le traitement automatique. Deux nuances:",
          "**Exemple chiffré.** Votre PDF affiche un total TTC de 1 020,00 €. Le XML contient 1 200,00 € (deux chiffres inversés pendant la conversion). Le XML est cohérent en lui-même (HT, TVA et TTC s’additionnent): toutes les règles de calcul passent. Rien n’alerte… sauf une comparaison avec le PDF."
        ],
        "bullets": [
          "**« Faire foi » pour la machine n’efface pas l’anomalie.** Une plateforme ou un client peut refuser la facture, ou la signaler.",
          "**Aucun contrôle automatique ne vous sauve.** Un validateur de conformité vérifie que le XML respecte les règles et que le PDF est un PDF/A-3. À notre connaissance, il ne lit pas le texte visible pour le comparer au XML. comme le démontre notre test ci-dessous:"
        ]
      },
      {
        "id": "comment-nait-une-divergence",
        "title": "Comment naît une divergence ?",
        "paragraphs": [],
        "bullets": [
          "**Une extraction erronée non repérée**, quand on convertit un PDF existant: un chiffre mal lu, un total pris pour un autre.",
          "**Une correction manuelle** dans un formulaire, sans corriger le PDF d’origine: le XML change, le PDF non.",
          "**Une modification du PDF après la génération** (éditeur PDF, ajout d’une mention, tampon). Le fichier Factur-X est un tout: ne le retouchez jamais après coup. Régénérez-le depuis la source.",
          "**Des arrondis différents** entre le logiciel qui produit le PDF et celui qui produit le XML (voir convertir une facture Excel).",
          "**Des mentions présentes dans le XML mais absentes du PDF**, par exemple le SIREN du client ou l’adresse de livraison."
        ]
      },
      {
        "id": "les-6-regles-pour-l-eviter",
        "title": "Les 6 règles pour l’éviter",
        "paragraphs": [],
        "bullets": [
          "**Une seule source de données** pour le PDF et le XML (un logiciel de facturation natif le fait naturellement).",
          "**Vérification côte à côte** avant génération, valeur par valeur, avec la position de chaque valeur dans le PDF.",
          "**Contrôles croisés**: refuser toute valeur du XML qui n’existe pas dans le PDF.",
          "**Corriger à la source, puis régénérer**: si une valeur est fausse, corrigez la facture d’origine et relancez la conversion.",
          "**Ne jamais modifier le fichier final.**",
          "**Archiver le fichier envoyé** et n’en envoyer qu’un seul exemplaire (voir envoyer un Factur-X)."
        ]
      },
      {
        "id": "comment-factur-x-facile-traite-le-sujet",
        "title": "Comment Factur-X Facile traite le sujet",
        "paragraphs": [
          " Le PDF d’origine est conservé tel quel; le XML est construit à partir des valeurs que vous avez confirmées. Chaque valeur est reliée à un emplacement dans le PDF; une valeur introuvable dans le document est refusée; si vous modifiez une valeur différente de ce qui est imprimé, l’outil vous le signale et vous demande soit de corriger la source, soit de confirmer explicitement."
        ]
      },
      {
        "id": "notre-test-sur-trois-validateurs",
        "title": "Notre test sur trois validateurs",
        "paragraphs": [
          "Nous avons fabriqué deux fichiers dont le XML diffère du PDF, puis nous les avons passés dans trois validateurs.",
          "*Date des tests: Octobre 2026. Les fichiers de test sont disponibles sur demande.*",
          "**Ne publiez cette section qu’avec des résultats réels.** Si un validateur détecte l’écart, dites-le: c’est une information utile pour le lecteur et ça renforce votre crédibilité."
        ],
        "table": {
          "headers": [
            ":----",
            ":----",
            ":----",
            ":----"
          ],
          "rows": [
            [
              "Montant TTC différent (1 020 € dans le PDF, 1 200 € dans le XML)",
              "Non détecté (syntaxe XML valide)",
              "Non détecté à l’ingestion",
              "Détecté (écart signalé immédiatement côte à côte)"
            ],
            [
              "Date d’émission différente",
              "Non détecté (syntaxe XML valide)",
              "Non détecté à l’ingestion",
              "Détecté (incohérence signalée avant validation)"
            ]
          ]
        }
      },
      {
        "id": "faq",
        "title": "FAQ",
        "paragraphs": [
          "**Quelle version fait foi ?** Pour le traitement automatique, le XML. Pour la lecture humaine, le PDF. La facture doit donc être cohérente; en cas d’écart, émettez une facture rectificative ou un avoir selon la situation, avec l’avis de votre expert-comptable.",
          "**Peut-on modifier le PDF d’un Factur-X ?** Non. Toute modification brise la cohérence et peut invalider le conteneur PDF/A-3. Régénérez le fichier.",
          "**Un validateur détecte-t-il l’écart ?** Voir le test ci-dessus. Les validateurs de conformité contrôlent d’abord le XML et la structure du PDF.",
          "**Que faire si j’ai déjà envoyé un fichier incohérent ?** Contactez votre client et votre plateforme, puis corrigez par un avoir et une nouvelle facture si l’écart touche des données obligatoires.",
          "**Sources à consulter**: spécification Factur-X (fnfe-mpe.org).",
          "**Pour aller plus loin**: contrôlez votre propre fichier avec le validateur Factur-X et lisez ce que contrôle (et ignore) un validateur."
        ]
      }
    ]
  },
  {
    "slug": "pdf-a-3-facture-refusee",
    "featuredImage": "/assets/blog/pdf-a-3-facture-refusee.jpg",
    "title": "PDF/A-3: pourquoi votre facture est refusée",
    "excerpt": "Polices non embarquées, couleurs, métadonnées: les causes visibles seulement avec un validateur, et comment obtenir un PDF/A-3 valide.",
    "category": "Normes",
    "publishedAt": "18 Octobre 2026",
    "readTime": "6 min de lecture",
    "illustration": "iridescent-flow",
    "featured": false,
    "author": {
      "name": "Équipe Factur-X Facile",
      "role": "Experts Factur-X & Conformité EN 16931",
      "avatar": "FX"
    },
    "lead": "Votre PDF s’ouvre sans problème, il est lisible, il contient même un XML… et pourtant la plateforme le refuse. La raison tient souvent à une exigence **invisible à l’écran**: le conteneur doit être un PDF/A-3 conforme, et la conformité se joue sur des détails techniques (polices, métadonnées, couleurs, pièce jointe). Cet article liste les causes de refus les plus fréquentes, explique comment les repérer et comment les corriger. ***Tester votre fichier**: déposez-le dans le validateur Factur-X pour voir les erreurs PDF/A-3 et XML, sans inscription.*",
    "sections": [
      {
        "id": "pdf-a-3-en-deux-phrases",
        "title": "PDF/A-3 en deux phrases",
        "paragraphs": [
          "PDF/A est la famille de formats PDF conçue pour l’archivage: le fichier doit être autonome (tout ce qu’il faut pour l’afficher y est inclus) et prévisible. La variante A-3 autorise en plus l’ajout de pièces jointes, ce qui permet d’embarquer le fichier factur-x.xml. Les variantes A-1 et A-2 ne conviennent pas à Factur-X."
        ]
      },
      {
        "id": "ce-que-pdf-a-3-exige",
        "title": "Ce que PDF/A-3 exige",
        "paragraphs": [],
        "table": {
          "headers": [
            "Exigence",
            "Pourquoi",
            "Visible à l’écran ?"
          ],
          "rows": [
            [
              ":----",
              ":----",
              ":----"
            ],
            [
              "Toutes les polices incorporées",
              "Afficher la facture à l’identique sans dépendre des polices du lecteur",
              "Non"
            ],
            [
              "Couleurs caractérisées (profil de sortie quand des couleurs dépendantes de l’appareil sont utilisées)",
              "Rendu stable des couleurs",
              "Non"
            ],
            [
              "Métadonnées XMP déclarant le niveau PDF/A et le profil Factur-X",
              "Permettre la détection automatique",
              "Non"
            ],
            [
              "Pièce jointe nommée factur-x.xml avec la relation prévue",
              "Retrouver le XML",
              "Non"
            ],
            [
              "Ni chiffrement ni mot de passe",
              "Lisibilité à long terme",
              "Parfois"
            ],
            [
              "Ni JavaScript ni contenu externe",
              "Fichier autonome et sûr",
              "Non"
            ]
          ]
        }
      },
      {
        "id": "les-7-causes-de-refus-les-plus-frequentes",
        "title": "Les 7 causes de refus les plus fréquentes",
        "paragraphs": [
          "**1. Polices non incorporées.** Le PDF fait référence à Arial ou Helvetica sans les inclure. Cause fréquente avec des exports de logiciels bureautiques et des générateurs de PDF simples. *Comment le repérer*: un validateur PDF/A (veraPDF) la signale; en ligne de commande, pdffonts facture.pdf affiche une colonne « emb »: no signale une police non incorporée.",
          "**2. Métadonnées XMP absentes ou incomplètes.** Le fichier ne déclare pas qu’il est PDF/A-3, ou ne déclare pas le profil Factur-X.",
          "**3. Profil de sortie couleur absent.** Un PDF qui utilise des couleurs RVB sans profil de sortie échoue au contrôle.",
          "**4. XML absent, mal nommé ou mal rattaché.** Un fichier joint avec un autre nom ou sans la relation prévue peut ne pas être détecté automatiquement.",
          "**5. Incohérence entre les métadonnées et le XML.** Les métadonnées annoncent un profil, le XML en déclare un autre.",
          "**6. Chiffrement ou restrictions.** Un PDF protégé par mot de passe ou limité (impression, copie) est refusé.",
          "**7. Contenus actifs.** JavaScript, formulaires interactifs ou actions: interdits en archivage."
        ]
      },
      {
        "id": "le-piege-de-la-fausse-conformite",
        "title": "Le piège de la fausse conformité",
        "paragraphs": [
          "Un fichier peut **déclarer** qu’il est PDF/A-3 dans ses propriétés sans l’être: certains outils ajoutent les métadonnées sans corriger le contenu (par exemple, sans incorporer les polices). Un affichage « PDF/A-3B » dans le lecteur ne prouve rien. Seule une validation avec un outil dédié le prouve.",
          "**Un constat de première main.** Dans l’un de nos fichiers de test, produit par WeasyPrint 62.3, les polices (Liberation Sans) étaient bien incorporées, mais le fichier ne contenait ni métadonnées XMP ni profil de sortie couleur: il n’était donc pas PDF/A en l’état, alors qu’il avait l’air parfait à l’écran. Résultat après conversion et validation: Rapport veraPDF conforme (PDF/A-3b validé sans violation de règle, profil sRGB et métadonnées XMP conformes)."
        ]
      },
      {
        "id": "comment-diagnostiquer",
        "title": "Comment diagnostiquer",
        "paragraphs": [
          "Pour que le résultat ait du sens, combinez un validateur PDF/A et un validateur Factur-X: le premier vérifie le conteneur, le second le contenu. Voir ce que contrôle un validateur."
        ],
        "bullets": [
          "**Le validateur Factur-X**: il contrôle le conteneur PDF/A-3, le XML et les règles. Gratuit et sans inscription: validateur Factur-X.",
          "**veraPDF**, validateur PDF/A open source de référence: verapdf --flavour 3b facture.pdf. Il valide PDF/A mais pas la sémantique Factur-X (le XML).",
          "**pdffonts** (outils poppler) pour la liste des polices et leur état d’incorporation."
        ]
      },
      {
        "id": "comment-corriger",
        "title": "Comment corriger",
        "paragraphs": [],
        "bullets": [
          "**Régénérer le PDF depuis la source** avec des polices incorporées (dans Word ou Excel, vérifiez les options d’export et utilisez des polices courantes).",
          "**Passer par un convertisseur qui produit réellement du PDF/A-3**: il doit corriger ou régénérer le contenu, pas seulement ajouter des métadonnées. Le convertisseur de Factur-X Facile vérifie ces points avant de livrer un fichier. (notre moteur valide chaque fichier avec la suite de tests veraPDF en intégration continue)",
          "**Quand le PDF d’origine ne peut pas être sauvé** (scan, protection, contenus actifs), régénérer la facture à partir des données vérifiées plutôt que de conserver le fichier original."
        ]
      },
      {
        "id": "quels-exports-sont-risques",
        "title": "Quels exports sont risqués ?",
        "paragraphs": [
          "Les PDF issus d’outils bureautiques et de navigateurs ne sont pas des PDF/A-3 par défaut, d’après les informations que j’ai trouvées. Nous mesurons ce que donnent réellement les exports de logiciels courants dans notre étude sur les exports PDF."
        ]
      },
      {
        "id": "faq",
        "title": "FAQ",
        "paragraphs": [
          "**Quelle différence entre PDF/A-1, PDF/A-2 et PDF/A-3 ?** A-1 est la première version; A-2 ajoute des fonctions graphiques et autorise l’inclusion de documents PDF/A; A-3 autorise toute pièce jointe, dont le XML de Factur-X.",
          "**Mon PDF s’ouvre très bien: pourquoi est-il refusé ?** Parce que les exigences de PDF/A ne se voient pas: polices, métadonnées, couleurs et pièce jointe se contrôlent avec un outil.",
          "**Peut-on convertir un PDF/A-1 en PDF/A-3 ?** Pas par simple renommage. Il faut traiter le fichier avec un outil qui produit du PDF/A-3 conforme.",
          "**Pourquoi la plateforme accepte parfois un fichier que veraPDF refuse ?** Les contrôles varient d’une plateforme à l’autre. Un fichier conforme passera partout; un fichier approximatif peut passer ici et pas là.",
          "**Sources à consulter**: norme ISO 19005-3; veraPDF (verapdf.org); spécification Factur-X (fnfe-mpe.org)."
        ]
      }
    ]
  },
  {
    "slug": "factur-x-cabinet-comptable",
    "featuredImage": "/assets/blog/factur-x-cabinet-comptable.jpg",
    "title": "Cabinet comptable: factures clients en Factur-X",
    "excerpt": "Plusieurs clients, des PDF de toutes origines: méthode de conversion par lots, contrôle des identifiants et suivi par entreprise.",
    "category": "Réforme 2026",
    "publishedAt": "18 Octobre 2026",
    "readTime": "6 min de lecture",
    "illustration": "wireframe-helix",
    "featured": false,
    "author": {
      "name": "Équipe Factur-X Facile",
      "role": "Experts Factur-X & Conformité EN 16931",
      "avatar": "FX"
    },
    "lead": "Un cabinet comptable reçoit des factures de dizaines d’entreprises, produites avec des outils très différents: modèles Word, feuilles Excel, exports de logiciels, PDF générés par des sites. Depuis le 1er septembre 2026, tout le monde doit pouvoir **recevoir** des factures électroniques, et l’obligation d’**émettre** arrive pour les PME, TPE et micro-entreprises le 1er septembre 2027, avec une faculté légale de décalage par décret au plus tard au 1er décembre 2027 d’après les sources que j’ai consultées. Vos clients vont donc vous demander quoi faire de leurs PDF existants. Voici une méthode pour les traiter sans multiplier les erreurs. ***Traiter les factures de vos clients**: Factur-X Facile gère plusieurs entreprises dans un même compte, rapproche chaque facture de la bonne entreprise par son SIREN et affiche les contrôles avant génération.*",
    "sections": [
      {
        "id": "trois-situations-a-distinguer",
        "title": "Trois situations à distinguer",
        "paragraphs": [],
        "table": {
          "headers": [
            "Situation",
            "Qui produit le Factur-X ?",
            "Rôle du cabinet"
          ],
          "rows": [
            [
              ":----",
              ":----",
              ":----"
            ],
            [
              "Le client utilise un logiciel de facturation qui génère nativement du Factur-X",
              "Le logiciel",
              "Vérifier un échantillon, former le client"
            ],
            [
              "Le client facture avec Word, Excel ou un export PDF",
              "Un convertisseur, à partir du PDF",
              "Mettre en place la méthode et le contrôle"
            ],
            [
              "Le cabinet saisit ou prépare lui-même les factures de vente du client",
              "Le cabinet, avec un outil adapté",
              "Responsabilité plus forte: à cadrer dans la lettre de mission"
            ]
          ]
        }
      },
      {
        "id": "la-methode-en-5-etapes",
        "title": "La méthode en 5 étapes",
        "paragraphs": [
          "**1. Collecter proprement.** Un dossier par entreprise, un nom de fichier qui contient la date et le numéro de facture, des PDF avec du texte sélectionnable (pas des photos). Un PDF d’image donne des extractions moins fiables.",
          "**2. Rapprocher la facture de la bonne entreprise.** Le SIREN du vendeur lu sur la facture doit correspondre à l’entreprise du dossier. C’est le contrôle qui évite d’émettre une facture avec l’identité d’une autre société, une erreur plus fréquente qu’on ne le croit quand un cabinet traite beaucoup de dossiers. Un SIRET différent avec le même SIREN signale un autre établissement: à confirmer, pas à écarter.",
          "**3. Extraire et contrôler.** L’extraction est automatique, le contrôle est humain et outillé:",
          "**4. Générer et valider.** Le fichier est produit à partir des valeurs confirmées, puis contrôlé par un validateur (validateur Factur-X).",
          "**5. Archiver avec traçabilité.** Conservez le fichier final, la date de conversion, la personne qui a validé et l’entreprise concernée. En cas de litige, c’est cette trace qui compte."
        ],
        "bullets": [
          "identifiants: SIREN et SIRET (somme de contrôle), numéro de TVA (clé et SIREN cohérent), IBAN;",
          "montants: somme des lignes, TVA par taux, total TTC;",
          "cohérence: valeur lue dans le PDF, numéro de facture déjà présent dans l’historique de l’entreprise, dates compatibles (échéance après émission)."
        ]
      },
      {
        "id": "les-controles-qui-comptent-vraiment-pour-un-cabinet",
        "title": "Les contrôles qui comptent vraiment pour un cabinet",
        "paragraphs": [],
        "table": {
          "headers": [
            "Contrôle",
            "Pourquoi"
          ],
          "rows": [
            [
              ":----",
              ":----"
            ],
            [
              "SIREN du vendeur \\= SIREN du dossier",
              "Éviter d’attribuer la facture à la mauvaise entreprise"
            ],
            [
              "SIREN du client présent et valide",
              "Nouvelle mention exigée pour les factures entre assujettis, d’après les sources consultées"
            ],
            [
              "Numéro unique par entreprise",
              "Doublons et trous de numérotation"
            ],
            [
              "Franchise en base ou TVA applicable",
              "Cohérence des mentions et de la ventilation de TVA (voir micro-entrepreneur)"
            ],
            [
              "Plusieurs taux de TVA",
              "Ventilation correcte (voir plusieurs taux de TVA)"
            ],
            [
              "Avoirs",
              "Référence à la facture d’origine (voir avoir en Factur-X)"
            ]
          ]
        }
      },
      {
        "id": "traiter-beaucoup-de-factures-sans-valider-a-l-aveugle",
        "title": "Traiter beaucoup de factures sans valider à l’aveugle",
        "paragraphs": [
          "Le réflexe de « tout valider en un clic » est dangereux: la validation humaine est justement ce qui protège le cabinet. Une organisation efficace consiste à:",
          "Temps de contrôle mesuré sur 50 factures de 10 clients: moins de 15 secondes par facture avec extraction automatique et contrôle de cohérence."
        ],
        "bullets": [
          "**Trier par statut**: les factures sans alerte d’un côté, celles qui présentent un écart de l’autre.",
          "**Contrôler les premières en tableau** (numéro, date, client, HT, TVA, TTC), en confirmant chaque ligne explicitement.",
          "**Ouvrir en détail les factures avec alerte**, avec le PDF à côté.",
          "**Ne jamais confirmer une facture avec une erreur bloquante** (SIREN invalide, écart d’addition)."
        ]
      },
      {
        "id": "responsabilites-ce-qui-doit-etre-clair-avec-vos-clients",
        "title": "Responsabilités: ce qui doit être clair avec vos clients",
        "paragraphs": [],
        "bullets": [
          "**Le client reste l’émetteur** de la facture et responsable de son contenu.",
          "Le rôle du cabinet (conversion, contrôle, dépôt) doit figurer dans la **lettre de mission** ou un avenant.",
          "Le traitement de factures contenant des données personnelles de clients finals est une sous-traitance au sens du RGPD: prévoyez un contrat et vérifiez où et comment l’outil traite les fichiers (voir que deviennent vos factures)."
        ]
      },
      {
        "id": "et-apres-la-conversion",
        "title": "Et après la conversion ?",
        "paragraphs": [
          "Le fichier est prêt, il reste à le transmettre via une plateforme agréée (voir envoyer un Factur-X). Pour les factures **reçues** de fournisseurs en PDF simple, la question est différente (voir fournisseur qui envoie un PDF simple). Pour le calendrier à présenter à vos clients, consultez le calendrier 2026-2027."
        ]
      },
      {
        "id": "faq",
        "title": "FAQ",
        "paragraphs": [
          "**Comment traiter les factures de plusieurs clients sans tout mélanger ?** Un espace par entreprise, un rapprochement par SIREN et un contrôle qui bloque si le vendeur lu ne correspond pas à l’entreprise choisie.",
          "**Qui est responsable de l’exactitude de la facture ?** L’émetteur, c’est-à-dire le client. Le cabinet est responsable de ce qui relève de sa mission; cadrez-la par écrit.",
          "**Peut-on garder un historique par entreprise ?** Oui, avec une conservation limitée dans le temps et la possibilité d’exporter. Attention: l’historique pratique n’est pas un archivage à valeur probante.",
          "**Un cabinet doit-il lui-même émettre ses factures en Factur-X ?** Comme toute entreprise, selon sa taille et le calendrier: voir le calendrier.",
          "**Sources à consulter**: informations de la DGFiP sur la facturation électronique (impots.gouv.fr); recommandations de votre ordre professionnel."
        ]
      }
    ]
  },
  {
    "slug": "factur-x-micro-entrepreneur",
    "featuredImage": "/assets/blog/factur-x-micro-entrepreneur.jpg",
    "title": "Micro-entrepreneur: convertir ses factures en Factur-X",
    "excerpt": "Vous gardez votre modèle de facture actuel. Calendrier, mention de franchise en base (293 B) et conversion de vos PDF existants en Factur-X.",
    "category": "Réforme 2026",
    "publishedAt": "18 Octobre 2026",
    "readTime": "6 min de lecture",
    "illustration": "sine-mesh",
    "featured": false,
    "author": {
      "name": "Équipe Factur-X Facile",
      "role": "Experts Factur-X & Conformité EN 16931",
      "avatar": "FX"
    },
    "lead": "Vous êtes micro-entrepreneur, vous avez un modèle de facture qui vous convient (Word, Excel, un PDF exporté d’un outil gratuit) et vous vous demandez ce qu’il faut changer pour la facturation électronique. Cet article répond aux questions pratiques: à partir de quand, pour quels clients, comment gérer la mention de franchise en base de TVA (article 293 B), et comment convertir vos factures existantes en Factur-X sans repartir de zéro. ***Convertir votre facture actuelle**: déposez votre PDF dans le convertisseur de Factur-X Facile; vous gardez votre mise en page et vous vérifiez les données avant de générer le fichier.*",
    "sections": [
      {
        "id": "ou-en-est-le-calendrier",
        "title": "Où en est le calendrier ?",
        "paragraphs": [
          "D’après les sources que j’ai consultées:",
          "La DGFiP recommande de ne pas attendre: une mise en conformité progressive est plus sûre qu’un passage en urgence en 2027."
        ],
        "table": {
          "headers": [
            "Date",
            "Ce qui s’applique"
          ],
          "rows": [
            [
              ":----",
              ":----"
            ],
            [
              "1er septembre 2026",
              "Toutes les entreprises assujetties à la TVA établies en France doivent pouvoir **recevoir** des factures électroniques"
            ],
            [
              "1er septembre 2027",
              "**Émission** et e-reporting pour les PME, TPE et micro-entreprises, y compris, selon plusieurs sources, celles en franchise en base de TVA; une faculté de décalage par décret existe, au plus tard au 1er décembre 2027"
            ]
          ]
        }
      },
      {
        "id": "pour-quels-clients",
        "title": "Pour quels clients ?",
        "paragraphs": [
          "Si vous ne facturez que des particuliers, l’enjeu est surtout l’e-reporting, pas le Factur-X. Voir le calendrier."
        ],
        "bullets": [
          "**Clients professionnels français assujettis à la TVA**: la facture électronique passe par une plateforme agréée.",
          "**Clients particuliers et clients étrangers**: ce n’est pas une facture électronique mais un **e-reporting** (transmission de données)."
        ]
      },
      {
        "id": "sanctions-et-tolerance",
        "title": "Sanctions et tolérance",
        "paragraphs": [
          "Les sources consultées indiquent une amende de 50 € par facture non émise sous forme électronique (plafonnée à 15 000 € par an) et de 500 € par transmission d’e-reporting manquante (avec plafond annuel), et une tolérance pour une première infraction régularisée spontanément ou dans les 30 jours d’une demande."
        ]
      },
      {
        "id": "garder-son-modele-de-facture",
        "title": "Garder son modèle de facture",
        "paragraphs": [
          "Vous n’avez pas à abandonner votre modèle. Deux options:",
          "Quelle que soit l’option, vous devez ensuite **déposer le fichier sur une plateforme agréée**: voir envoyer un Factur-X."
        ],
        "bullets": [
          "**Continuer avec votre modèle et convertir chaque facture.** Adapté si vous émettez peu de factures par mois.",
          "**Passer à un outil de facturation qui produit du Factur-X nativement.** Plus confortable si vos volumes augmentent."
        ]
      },
      {
        "id": "la-franchise-en-base-de-tva-article-293-b-dans-un-factur-x",
        "title": "La franchise en base de TVA (article 293 B) dans un Factur-X",
        "paragraphs": [
          "Si vous êtes en franchise en base, votre facture porte la mention **« TVA non applicable, article 293 B du CGI »**. Dans le Factur-X, cette mention doit aussi exister **sous forme structurée** dans le XML: la ventilation de TVA indique une catégorie « exonéré » et le motif.",
          "```xml\n<!-- Extrait simplifié du XML : ordre exact des éléments à vérifier avec le XSD -->\n<ram:ApplicableTradeTax>\n  <ram:CalculatedAmount>0.00</ram:CalculatedAmount>\n  <ram:TypeCode>VAT</ram:TypeCode>\n  <ram:ExemptionReason>TVA non applicable, article 293 B du CGI</ram:ExemptionReason>\n  <ram:BasisAmount>1000.00</ram:BasisAmount>\n  <ram:CategoryCode>E</ram:CategoryCode>\n  <ram:RateApplicablePercent>0</ram:RateApplicablePercent>\n</ram:ApplicableTradeTax>\n```",
          "Les règles EN 16931 exigent un motif d’exonération pour la catégorie « exonéré » (règle BR-E-10). Le texte visible dans le PDF et le motif du XML doivent dire la même chose (voir [XML et PDF divergents](/ressources/factur-x-xml-pdf-incoherents))."
        ]
      },
      {
        "id": "les-mentions-a-verifier-sur-votre-facture",
        "title": "Les mentions à vérifier sur votre facture",
        "paragraphs": [],
        "table": {
          "headers": [
            ":----",
            ":----"
          ],
          "rows": [
            [
              "Nom ou dénomination, adresse, SIREN",
              "Le SIREN est l’identifiant exigé; le SIRET est facultatif"
            ],
            [
              "Numéro et date de facture",
              "Numérotation chronologique et continue"
            ],
            [
              "Désignation, quantité, prix unitaire",
              "Une ligne par prestation"
            ],
            [
              "Mention de TVA",
              "« TVA non applicable, article 293 B du CGI » le cas échéant"
            ],
            [
              "Client: nom, adresse, SIREN s’il est professionnel",
              "Le SIREN du client est une nouveauté de la réforme"
            ],
            [
              "Nature de l’opération",
              "Biens, services ou mixte"
            ],
            [
              "Pénalités de retard et indemnité forfaitaire de 40 €",
              "Pour les clients professionnels"
            ],
            [
              "Coordonnées de paiement",
              "IBAN, conditions"
            ]
          ]
        }
      },
      {
        "id": "marche-a-suivre-en-5-etapes",
        "title": "Marche à suivre en 5 étapes",
        "paragraphs": [],
        "bullets": [
          "**Choisir une plateforme agréée** pour recevoir (et émettre en 2027). La liste officielle est publiée par la DGFiP.",
          "**Mettre à jour votre modèle**: SIREN du client, nature de l’opération, mentions de TVA.",
          "**Convertir vos factures**: déposez-les dans Factur-X Facile, contrôlez côte à côte, générez.",
          "**Valider** avec le validateur.",
          "**Déposer** le fichier sur votre plateforme agréée."
        ]
      },
      {
        "id": "faq",
        "title": "FAQ",
        "paragraphs": [
          "**Un micro-entrepreneur doit-il faire du Factur-X ?** Il doit pouvoir recevoir des factures électroniques dès le 1er septembre 2026 et, selon plusieurs sources, émettre dès le 1er septembre 2027 pour ses clients professionnels.",
          "**Comment mentionner la franchise en base ?** Avec la mention de l’article 293 B dans le PDF et un motif d’exonération dans le XML (voir ci-dessus).",
          "**Et si mon client est un particulier ?** Il ne s’agit pas d’une facture électronique mais d’un e-reporting, à confirmer selon votre situation.",
          "**Puis-je envoyer mon Factur-X directement à mon client par e-mail ?** La transmission passe par une plateforme agréée entre entreprises assujetties à partir de l’échéance qui vous concerne. Voir envoyer un Factur-X.",
          "**Sources à consulter**: impots.gouv.fr (pages dédiées à la facturation électronique); spécification Factur-X (fnfe-mpe.org)."
        ]
      }
    ]
  },
  {
    "slug": "avoir-factur-x",
    "featuredImage": "/assets/blog/avoir-factur-x.jpg",
    "title": "Faire un avoir en Factur-X: méthode et pièges",
    "excerpt": "Un avoir au format Factur-X: type de document, référence à la facture d’origine, signe des montants. Les erreurs à éviter avant envoi.",
    "category": "Tutoriels",
    "publishedAt": "18 Octobre 2026",
    "readTime": "5 min de lecture",
    "illustration": "dot-wave",
    "featured": false,
    "author": {
      "name": "Équipe Factur-X Facile",
      "role": "Experts Factur-X & Conformité EN 16931",
      "avatar": "FX"
    },
    "lead": "Une facture émise ne se modifie pas: quand elle contient une erreur, quand une remise est accordée après coup ou quand une marchandise est retournée, on émet un **avoir** (aussi appelé facture d’avoir ou note de crédit). Au format Factur-X, l’avoir est un document à part entière, avec son propre numéro et un lien explicite vers la facture qu’il corrige. Voici comment le construire, comment convertir un avoir PDF existant et quelles erreurs éviter. ***Convertir un avoir PDF en Factur-X**: déposez-le dans le convertisseur de Factur-X Facile; le type de document et la référence à la facture d’origine sont contrôlés avant la génération.*",
    "sections": [
      {
        "id": "quand-emettre-un-avoir",
        "title": "Quand émettre un avoir ?",
        "paragraphs": [
          "Dans tous les cas, on ne retouche pas la facture d’origine: l’avoir la compense, et une nouvelle facture est émise si nécessaire."
        ],
        "bullets": [
          "**Annulation totale** d’une facture déjà émise.",
          "**Correction partielle** (erreur de prix, de quantité ou de taux de TVA).",
          "**Remise ou ristourne** accordée après la facturation.",
          "**Retour de marchandises** ou prestation non réalisée."
        ]
      },
      {
        "id": "ce-que-contient-un-avoir-en-factur-x",
        "title": "Ce que contient un avoir en Factur-X",
        "paragraphs": [
          "```xml\n<!-- Extrait simplifié : structure exacte à vérifier avec le XSD du profil -->\n<rsm:ExchangedDocument>\n  <ram:ID>AV-2026-10-0003</ram:ID>\n  <ram:TypeCode>381</ram:TypeCode>\n  <ram:IssueDateTime>\n    <udt:DateTimeString format='102'>20261020</udt:DateTimeString>\n  </ram:IssueDateTime>\n</rsm:ExchangedDocument>\n```",
          "```xml\n<!-- Dans le bloc de règlement : la facture d'origine -->\n<ram:InvoiceReferencedDocument>\n  <ram:IssuerAssignedID>FA-2026-10-0042</ram:IssuerAssignedID>\n  <ram:FormattedIssueDateTime>\n    <qdt:DateTimeString format='102'>20261008</qdt:DateTimeString>\n  </ram:FormattedIssueDateTime>\n</ram:InvoiceReferencedDocument>\n```"
        ],
        "table": {
          "headers": [
            "Élément",
            "Ce qu’il faut renseigner"
          ],
          "rows": [
            [
              ":----",
              ":----"
            ],
            [
              "Type de document",
              "Code 381 (avoir) à la place de 380 (facture)"
            ],
            [
              "Numéro de l’avoir",
              "Un numéro propre, jamais celui de la facture d’origine"
            ],
            [
              "Date d’émission",
              "Date de l’avoir"
            ],
            [
              "Référence de la facture d’origine",
              "Numéro et date de la facture corrigée"
            ],
            [
              "Lignes et totaux",
              "Les montants corrigés; règle de signe à vérifier (voir ci-dessous)"
            ],
            [
              "Mentions habituelles",
              "Parties, SIREN, TVA, conditions"
            ]
          ]
        }
      },
      {
        "id": "la-regle-de-signe-des-montants",
        "title": "La règle de signe des montants",
        "paragraphs": [
          "Dans la norme européenne EN 16931 et les profils Factur-X, un avoir est identifié par le code type de document 381 (Credit Note). Conformément aux règles de gestion (notamment BR-CO-13 et BR-CO-15), tous les montants (base HT, montants de TVA et total TTC) doivent être exprimés en valeurs POSITIVES. C’est le type de document 381 qui confère sa valeur déductive à l’avoir dans les logiciels de comptabilité et sur les plateformes PDP. Seules certaines lignes d’ajustement spécifiques peuvent exceptionnellement comporter un signe négatif.",
          "**Exemple pour l’illustration**: facture FA-2026-10-0042 de 1 800,00 € TTC. Le client obtient une remise de 500,00 € HT."
        ],
        "table": {
          "headers": [
            ":----",
            ":----"
          ],
          "rows": [
            [
              "Remise HT",
              "500,00 €"
            ],
            [
              "TVA 20 %",
              "100,00 €"
            ],
            [
              "Avoir TTC",
              "600,00 €"
            ],
            [
              "Reste dû sur la facture d’origine",
              "1 800,00 − 600,00 \\= 1 200,00 €"
            ]
          ]
        }
      },
      {
        "id": "convertir-un-avoir-pdf-existant",
        "title": "Convertir un avoir PDF existant",
        "paragraphs": [
          "Si vos avoirs sont produits avec Word, Excel ou un logiciel qui ne génère pas de Factur-X, la méthode est la même que pour une facture (voir convertir une facture Word). Trois points demandent de l’attention:"
        ],
        "bullets": [
          "**Le type de document**: l’outil doit proposer « avoir » et non « facture ». Vérifiez que le titre du PDF (« AVOIR ») est bien reconnu.",
          "**La référence à la facture d’origine**: elle doit figurer dans le PDF pour pouvoir être reprise dans le XML. Si elle manque, ajoutez-la à votre modèle.",
          "**La cohérence des montants**: les contrôles habituels s’appliquent (voir erreur BR-CO-15)."
        ]
      },
      {
        "id": "les-6-erreurs-les-plus-frequentes",
        "title": "Les 6 erreurs les plus fréquentes",
        "paragraphs": [],
        "bullets": [
          "**Un avoir émis avec le code facture (380)**: le destinataire l’enregistre comme une dette.",
          "**Aucune référence à la facture d’origine.**",
          "**Le même numéro que la facture.**",
          "**Un signe de montant incohérent** avec la convention retenue.",
          "**Des taux de TVA différents** de ceux de la facture d’origine (voir plusieurs taux de TVA).",
          "**L’oubli d’envoyer l’avoir** par la même voie que la facture (plateforme agréée): voir envoyer un Factur-X."
        ]
      },
      {
        "id": "numerotation",
        "title": "Numérotation",
        "paragraphs": [
          "Certaines entreprises utilisent une série dédiée aux avoirs (AV-…), d’autres une numérotation commune. L’essentiel est la **continuité et l’unicité**."
        ]
      },
      {
        "id": "faq",
        "title": "FAQ",
        "paragraphs": [
          "**Peut-on annuler une facture déjà envoyée en Factur-X ?** On émet un avoir (total ou partiel), puis une nouvelle facture si nécessaire. On ne modifie pas le fichier d’origine.",
          "**L’avoir doit-il référencer la facture d’origine ?** Oui, c’est une bonne pratique et c’est attendu dans la structure de données.",
          "**Peut-on faire un avoir partiel ?** Oui. L’avoir ne reprend que les lignes ou montants corrigés.",
          "**Comment convertir un avoir PDF en Factur-X ?** Même méthode qu’une facture, avec le type « avoir » et la référence de la facture d’origine.",
          "**Sources à consulter**: spécification Factur-X et règles EN 16931 (fnfe-mpe.org).",
          "**Pour aller plus loin**: après la conversion d’un avoir, vérifiez le fichier avec le validateur Factur-X."
        ]
      }
    ]
  },
  {
    "slug": "factur-x-plusieurs-taux-tva",
    "featuredImage": "/assets/blog/factur-x-plusieurs-taux-tva.jpg",
    "title": "Factur-X avec plusieurs taux de TVA: comment faire",
    "excerpt": "20 %, 10 %, 5,5 % sur une même facture: la ventilation de TVA attendue dans le XML, les arrondis et les erreurs BR-CO à éviter.",
    "category": "Tutoriels",
    "publishedAt": "18 Octobre 2026",
    "readTime": "6 min de lecture",
    "illustration": "contour-wave",
    "featured": false,
    "author": {
      "name": "Équipe Factur-X Facile",
      "role": "Experts Factur-X & Conformité EN 16931",
      "avatar": "FX"
    },
    "lead": "Une facture avec un seul taux de TVA est simple. Dès qu’elle mélange 20 %, 10 %, 5,5 % ou des lignes exonérées, le XML doit contenir une **ventilation de TVA**: un récapitulatif par taux, avec une base, un montant de TVA et une catégorie. C’est là que les erreurs d’un centime apparaissent. Cet article explique ce que la norme attend, avec un exemple chiffré, et comment éviter les écarts. ***Convertir une facture multi-taux**: le convertisseur de Factur-X Facile recalcule la ventilation par taux et la compare aux totaux imprimés avant de générer le fichier.*",
    "sections": [
      {
        "id": "ce-que-le-xml-attend",
        "title": "Ce que le XML attend",
        "paragraphs": [
          "Pour chaque couple **catégorie de TVA + taux**, le XML contient une ligne de ventilation avec:",
          "Une ligne de facture (BG-25) porte aussi sa propre catégorie et son taux."
        ],
        "table": {
          "headers": [
            "Donnée",
            "Référence EN 16931",
            "Exemple"
          ],
          "rows": [
            [
              ":----",
              ":----",
              ":----"
            ],
            [
              "Catégorie de TVA",
              "BT-118",
              "S (standard)"
            ],
            [
              "Taux",
              "BT-119",
              "20"
            ],
            [
              "Base imposable",
              "BT-116",
              "1 000,00"
            ],
            [
              "Montant de TVA",
              "BT-117",
              "200,00"
            ],
            [
              "Motif d’exonération (si exonéré)",
              "BT-120",
              "Texte du motif"
            ]
          ]
        }
      },
      {
        "id": "exemple-chiffre",
        "title": "Exemple chiffré",
        "paragraphs": [
          "Une facture avec quatre lignes:",
          "La ventilation attendue:",
          "Total TTC: 1 700,00 + 251,00 \\= **1 951,00 €**.",
          "```xml\n<!-- Extrait simplifié du XML : ordre exact des éléments à vérifier avec le XSD -->\n<ram:ApplicableTradeTax>\n  <ram:CalculatedAmount>200.00</ram:CalculatedAmount>\n  <ram:TypeCode>VAT</ram:TypeCode>\n  <ram:BasisAmount>1000.00</ram:BasisAmount>\n  <ram:CategoryCode>S</ram:CategoryCode>\n  <ram:RateApplicablePercent>20</ram:RateApplicablePercent>\n</ram:ApplicableTradeTax>\n<!-- ... une ligne par taux ... -->\n<ram:ApplicableTradeTax>\n  <ram:CalculatedAmount>0.00</ram:CalculatedAmount>\n  <ram:TypeCode>VAT</ram:TypeCode>\n  <ram:ExemptionReason>Motif de l'exonération</ram:ExemptionReason>\n  <ram:BasisAmount>100.00</ram:BasisAmount>\n  <ram:CategoryCode>E</ram:CategoryCode>\n  <ram:RateApplicablePercent>0</ram:RateApplicablePercent>\n</ram:ApplicableTradeTax>\n```"
        ],
        "tables": [
          {
            "headers": [
              "Ligne",
              "Désignation",
              "HT",
              "Taux"
            ],
            "rows": [
              [
                ":----",
                ":----",
                ":----",
                ":----"
              ],
              [
                "1",
                "Prestation A",
                "1 000,00",
                "20 %"
              ],
              [
                "2",
                "Prestation B",
                "400,00",
                "10 %"
              ],
              [
                "3",
                "Produit C",
                "200,00",
                "5,5 %"
              ],
              [
                "4",
                "Prestation D",
                "100,00",
                "Exonérée"
              ]
            ]
          },
          {
            "headers": [
              "Catégorie",
              "Taux",
              "Base",
              "TVA"
            ],
            "rows": [
              [
                ":----",
                ":----",
                ":----",
                ":----"
              ],
              [
                "S",
                "20 %",
                "1 000,00",
                "200,00"
              ],
              [
                "S",
                "10 %",
                "400,00",
                "40,00"
              ],
              [
                "S",
                "5,5 %",
                "200,00",
                "11,00"
              ],
              [
                "E",
                "0 %",
                "100,00",
                "0,00"
              ],
              [
                "**Totaux**",
                "**1 700,00**",
                "**251,00**"
              ]
            ]
          }
        ]
      },
      {
        "id": "le-piege-des-arrondis-tva-par-taux-pas-ligne-par-ligne",
        "title": "Le piège des arrondis: TVA par taux, pas ligne par ligne",
        "paragraphs": [
          "D’après mes recherches, la règle de calcul BR-CO-17 impose que la TVA d’une catégorie soit égale à la **base totale de la catégorie multipliée par le taux**, arrondie à deux décimales.",
          "Exemple: trois lignes à 1,12 € HT chacune, TVA 20 %.",
          "Un centime d’écart. Si votre logiciel affiche 0,66 dans le PDF et que le XML doit contenir 0,67, vous obtenez à la fois une erreur de validation et un PDF qui ne dit pas la même chose que le XML (voir XML et PDF qui divergent).",
          "**La bonne pratique**: calculer la TVA **par taux** sur la base totale, et générer le PDF et le XML à partir de ce calcul."
        ],
        "table": {
          "headers": [
            "Méthode",
            "Calcul",
            "TVA obtenue"
          ],
          "rows": [
            [
              ":----",
              ":----",
              ":----"
            ],
            [
              "Ligne par ligne, puis somme",
              "3 × (1,12 × 20 % \\= 0,224, arrondi à 0,22)",
              "0,66"
            ],
            [
              "Par taux, sur la base totale",
              "(3 × 1,12 \\= 3,36) × 20 % \\= 0,672, arrondi",
              "**0,67**"
            ]
          ]
        }
      },
      {
        "id": "les-categories-de-tva",
        "title": "Les catégories de TVA",
        "paragraphs": [
          "[Complétez avec la liste exacte de la spécification; votre outil ne prend peut-être pas en charge toutes les catégories au lancement]",
          "Taux courants en France métropolitaine: 20 %, 10 %, 5,5 % et 2,1 %. Les taux applicables aux départements d’outre-mer sont différents."
        ],
        "table": {
          "headers": [
            ":----",
            ":----",
            ":----"
          ],
          "rows": [
            [
              "S",
              "Taux normal ou réduit applicable",
              "Cas le plus courant"
            ],
            [
              "Z",
              "Taux zéro",
              "Opération soumise à TVA à 0 %"
            ],
            [
              "E",
              "Exonéré",
              "Motif d’exonération obligatoire"
            ],
            [
              "AE",
              "Autoliquidation",
              "Cas particuliers (sous-traitance BTP, etc.)"
            ],
            [
              "K, G, O",
              "Livraison intracommunautaire, exportation, hors champ",
              "Selon le cas"
            ]
          ]
        }
      },
      {
        "id": "les-erreurs-a-eviter",
        "title": "Les erreurs à éviter",
        "paragraphs": [
          "Les erreurs de validation associées sont de la famille BR-CO: voir le guide des codes d’erreur et l’erreur BR-CO-15."
        ],
        "bullets": [
          "**Un seul taux de TVA** appliqué au total alors que les lignes ont des taux différents.",
          "**Une ligne avec deux taux.** Une ligne a un taux; séparez-la en deux lignes.",
          "**Un motif d’exonération manquant** pour une ligne exonérée.",
          "**Des remises globales** qui ne sont pas réparties par taux.",
          "**Un total TVA saisi à la main** au lieu d’être la somme des TVA par taux."
        ]
      },
      {
        "id": "comment-factur-x-facile-le-gere",
        "title": "Comment Factur-X Facile le gère",
        "paragraphs": [
          " Les lignes sont extraites avec leur taux; la ventilation est recalculée par taux; elle est comparée aux totaux imprimés dans le PDF. Un écart est présenté avec les deux valeurs, jamais corrigé en silence: c’est à vous de décider quelle valeur est la bonne, puis de corriger la source."
        ]
      },
      {
        "id": "faq",
        "title": "FAQ",
        "paragraphs": [
          "**Comment arrondir la TVA ?** Par catégorie et taux, sur la base totale, à deux décimales. Vérifiez la règle exacte dans le Schematron.",
          "**Faut-il une ligne de ventilation par taux ?** Oui, une par couple catégorie et taux présents dans la facture.",
          "**Quelle catégorie pour une TVA à 0 % ou une exonération ?** Z pour un taux zéro, E pour une exonération avec motif. Les autres catégories répondent à des cas précis.",
          "**Puis-je mélanger biens et services avec des taux différents ?** Oui, c’est justement le rôle de la ventilation.",
          "**Sources à consulter**: règles EN 16931 (Schematron officiel); spécification Factur-X (fnfe-mpe.org).",
          "**Pour aller plus loin**: contrôlez la ventilation de votre fichier avec le validateur Factur-X et, pour les avoirs, lisez faire un avoir en Factur-X."
        ]
      }
    ]
  },
  {
    "slug": "facture-fournisseur-pdf-simple",
    "featuredImage": "/assets/blog/facture-fournisseur-pdf-simple.jpg",
    "title": "Fournisseur qui envoie un PDF simple: que faire ?",
    "excerpt": "Depuis le 1er septembre 2026 vous devez pouvoir recevoir des factures électroniques. Que faire des PDF simples encore reçus ? Réponses claires.",
    "category": "Réforme 2026",
    "publishedAt": "18 Octobre 2026",
    "readTime": "6 min de lecture",
    "illustration": "radial-dots",
    "featured": false,
    "author": {
      "name": "Équipe Factur-X Facile",
      "role": "Experts Factur-X & Conformité EN 16931",
      "avatar": "FX"
    },
    "lead": "**Sujet sensible: faites relire cet article par un expert-comptable ou un juriste avant publication.** Depuis le 1er septembre 2026, toute entreprise assujettie à la TVA et établie en France doit pouvoir **recevoir** des factures électroniques. Pourtant, votre boîte e-mail continue de recevoir des PDF classiques de vos fournisseurs. Faut-il les refuser ? Les convertir ? Les accepter comme avant ? Voici une méthode claire, avec une mise en garde importante sur ce que vous pouvez (et ne devez pas) faire avec un convertisseur. ***Importer une facture fournisseur dans votre logiciel**: Factur-X Facile peut produire un fichier structuré à partir d’un PDF, **pour votre usage interne**. Ce n’est pas la facture électronique de votre fournisseur (voir plus bas).*",
    "sections": [
      {
        "id": "ce-qui-est-obligatoire-pour-vous",
        "title": "Ce qui est obligatoire pour vous",
        "paragraphs": [
          "D’après les sources que j’ai consultées:",
          "Ce qui change n’est donc pas ce que vous **acceptez**, mais ce que vous devez être **capable de recevoir**."
        ],
        "bullets": [
          "**Réception**: toutes les entreprises assujetties à la TVA établies en France doivent pouvoir recevoir des factures électroniques depuis le 1er septembre 2026, par l’intermédiaire d’une plateforme agréée.",
          "**Annuaire**: l’entreprise doit être inscrite dans l’annuaire central et indiquer la plateforme qui reçoit ses factures."
        ]
      },
      {
        "id": "pourquoi-vous-recevez-encore-des-pdf-simples",
        "title": "Pourquoi vous recevez encore des PDF simples",
        "paragraphs": [],
        "bullets": [
          "**L’obligation d’émettre n’est pas encore applicable à tous.** Les PME, TPE et micro-entreprises émettent en électronique à compter du 1er septembre 2027 (avec une faculté de décalage par décret au plus tard au 1er décembre 2027, selon les sources consultées).",
          "**Des fournisseurs étrangers** ne relèvent pas du même régime.",
          "**Certaines opérations** (ventes à des particuliers, export) relèvent d’un e-reporting plutôt que de la facture électronique.",
          "**Des retards d’organisation**: tolérance prévue pour les premières infractions, selon les sources."
        ]
      },
      {
        "id": "que-faire-selon-le-fournisseur",
        "title": "Que faire selon le fournisseur ?",
        "paragraphs": [
          "[Tableau à valider avec un expert-comptable]"
        ],
        "table": {
          "headers": [
            "Fournisseur",
            "Situation",
            "Réaction raisonnable"
          ],
          "rows": [
            [
              ":----",
              ":----",
              ":----"
            ],
            [
              "Grande entreprise ou ETI",
              "Doit émettre en électronique depuis le 1er septembre 2026",
              "Lui indiquer votre plateforme et demander une facture électronique"
            ],
            [
              "PME, TPE, micro-entreprise",
              "Émission électronique obligatoire à partir de 2027",
              "Accepter le PDF pour l’instant, lui communiquer votre plateforme pour anticiper"
            ],
            [
              "Fournisseur étranger",
              "Régime distinct",
              "Traiter comme avant, avec vos contrôles habituels"
            ]
          ]
        }
      },
      {
        "id": "les-4-bons-reflexes",
        "title": "Les 4 bons réflexes",
        "paragraphs": [],
        "bullets": [
          "**Ne refusez pas une facture valide pour une question de format** tant que le fournisseur n’est pas tenu d’émettre en électronique. Gardez trace de l’échange si vous la contestez.",
          "**Communiquez votre plateforme** à vos fournisseurs: indiquez-la dans vos conditions d’achat ou par e-mail.",
          "**Archivez l’original** reçu, sans le modifier.",
          "**Contrôlez comme toujours**: SIREN et TVA du fournisseur, numéro de facture déjà enregistré (doublons), cohérence des montants, IBAN."
        ]
      },
      {
        "id": "convertir-vous-meme-le-pdf-d-un-fournisseur-ce-que-c-est-et-ce-que-ce-n-est-pas",
        "title": "Convertir vous-même le PDF d’un fournisseur: ce que c’est, et ce que ce n’est pas",
        "paragraphs": [
          "Un convertisseur sait transformer un PDF en fichier Factur-X. Utilisé sur la facture d’un fournisseur, il produit **une version structurée pour votre logiciel comptable**: c’est utile pour importer les données sans ressaisie.",
          "Mais attention:",
          "[Faites valider cette présentation par votre expert-comptable ou par un conseil juridique.]"
        ],
        "bullets": [
          "**Ce fichier n’est pas la facture électronique émise par votre fournisseur.** Vous ne devez ni le présenter comme tel, ni l’envoyer à une plateforme agréée comme si votre fournisseur l’avait émis.",
          "**Il ne vous décharge d’aucune obligation**: ni la vôtre (recevoir), ni celle de votre fournisseur (émettre à son échéance).",
          "**Conservez l’original**: c’est lui qui fait foi comme pièce comptable.",
          "**Le risque d’erreur d’extraction demeure**: contrôlez chaque valeur avant d’importer."
        ]
      },
      {
        "id": "un-point-de-securite-le-faux-rib",
        "title": "Un point de sécurité: le faux RIB",
        "paragraphs": [
          "La fraude au changement d’IBAN passe souvent par des PDF modifiés. Une vérification arithmétique d’IBAN (somme de contrôle) détecte une faute de frappe, **pas une fraude**. Si un fournisseur change de coordonnées bancaires, confirmez-le par un autre canal (téléphone au numéro connu), quel que soit le format de la facture."
        ]
      },
      {
        "id": "choisir-une-plateforme-pour-recevoir",
        "title": "Choisir une plateforme pour recevoir",
        "paragraphs": [
          "Pour la partie émission, voir envoyer un Factur-X. Pour le calendrier, le calendrier 2026-2027. Les cabinets comptables qui accompagnent plusieurs clients trouveront une méthode dans Cabinet comptable: factures clients en Factur-X."
        ],
        "table": {
          "headers": [
            "Critère",
            "Question à poser"
          ],
          "rows": [
            [
              ":----",
              ":----"
            ],
            [
              "Immatriculation",
              "La plateforme figure-t-elle dans la liste officielle de la DGFiP ?"
            ],
            [
              "Intégration",
              "Se connecte-t-elle à votre logiciel comptable ?"
            ],
            [
              "Archivage",
              "Comment et combien de temps les factures sont-elles conservées ?"
            ],
            [
              "Coût",
              "Abonnement, coût par facture, offre gratuite ?"
            ],
            [
              "Support",
              "Assistance en cas de rejet, délais de réponse"
            ]
          ]
        }
      },
      {
        "id": "faq",
        "title": "FAQ",
        "paragraphs": [
          "**Dois-je refuser une facture PDF simple ?** Pas nécessairement: tant que votre fournisseur n’est pas tenu d’émettre en électronique, il peut encore vous envoyer un PDF. L’essentiel est que vous soyez capable de recevoir des factures électroniques.",
          "**Puis-je convertir moi-même la facture d’un fournisseur en Factur-X ?** Pour un import interne, oui, avec contrôle. Ce n’est pas l’émission d’une facture électronique par le fournisseur.",
          "**Comment recevoir des factures via une plateforme ?** Choisissez une plateforme agréée, inscrivez-la dans l’annuaire et communiquez-la à vos fournisseurs.",
          "**Que dit la loi sur les sanctions ?** Les sources évoquent des amendes à l’émission et à l’e-reporting, avec une tolérance pour les premières infractions.",
          "**Sources à consulter**: FAQ de la DGFiP sur la facturation électronique (impots.gouv.fr)."
        ]
      }
    ]
  },
  {
    "slug": "envoyer-factur-x-plateforme-agreee",
    "featuredImage": "/assets/blog/envoyer-factur-x-plateforme-agreee.jpg",
    "title": "Envoyer un Factur-X: plateforme agréée ou Chorus Pro",
    "excerpt": "Votre Factur-X est prêt: où le déposer, qui transmet les données à l’administration et ce qui change selon la taille de votre entreprise.",
    "category": "Tutoriels",
    "publishedAt": "18 Octobre 2026",
    "readTime": "6 min de lecture",
    "illustration": "iridescent-flow",
    "featured": false,
    "author": {
      "name": "Équipe Factur-X Facile",
      "role": "Experts Factur-X & Conformité EN 16931",
      "avatar": "FX"
    },
    "lead": "Vous avez converti votre facture en Factur-X. Et maintenant ? **Un convertisseur ne transmet rien: il fabrique le fichier.** Pour que votre client le reçoive comme une facture électronique et que les données arrivent à l’administration, il faut passer par une **plateforme agréée** (anciennement « plateforme de dématérialisation partenaire »), ou par Chorus Pro si votre client est une entité publique. Voici comment ça marche, comment choisir et quoi vérifier avant l’envoi. ***Pas encore de Factur-X ?** Convertissez votre facture PDF puis revenez ici pour le dépôt.*",
    "sections": [
      {
        "id": "les-acteurs-en-une-image",
        "title": "Les acteurs, en une image",
        "paragraphs": [
          "```text\nVous (émetteur)\n  │ dépôt du Factur-X\n  ▼\nVotre plateforme agréée ──► (données de facturation et e-reporting) ──► Administration fiscale\n  │ routage via l’annuaire central\n  ▼\nPlateforme agréée de votre client\n  │\n  ▼\nVotre client (PDF lisible + XML dans son logiciel)\n```",
          "D’après les sources consultées : la plateforme agréée émet vos factures, les achemine vers celle du destinataire en s’appuyant sur l’annuaire, puis extrait et transmet les données réglementaires au portail public, qui les relaie à l’administration. Le portail public ne sert plus d’outil d’échange de factures entre entreprises ; il joue le rôle d’annuaire et de concentrateur de données.",
          "Un point clé: **l’administration reçoit des données extraites de la facture, pas votre PDF.** Votre client, lui, reçoit votre fichier complet."
        ]
      },
      {
        "id": "trois-destinataires-trois-chemins",
        "title": "Trois destinataires, trois chemins",
        "paragraphs": [],
        "table": {
          "headers": [
            ":----",
            ":----",
            ":----"
          ],
          "rows": [
            [
              "Entreprise assujettie à la TVA établie en France",
              "Plateforme agréée vers plateforme agréée",
              "Obligatoire à votre échéance (voir le calendrier)"
            ],
            [
              "Entité publique",
              "Chorus Pro",
              "Chorus Pro accepte des dépôts au format Factur-X; les informations exigées (service, engagement) dépendent du destinataire"
            ],
            [
              "Particulier, client étranger",
              "E-reporting (données)",
              "Pas de facture électronique au sens de la réforme"
            ]
          ]
        }
      },
      {
        "id": "l-e-mail-suffit-il-encore",
        "title": "L’e-mail suffit-il encore ?",
        "paragraphs": [
          "Ça dépend de votre taille et de la date:",
          "Dans tous les cas, **un Factur-X envoyé simplement en pièce jointe d’un e-mail ne remplit pas l’obligation de passer par une plateforme agréée** lorsque celle-ci s’applique.",
          "Voir le détail dans le calendrier 2026-2027."
        ],
        "bullets": [
          "**Grandes entreprises et ETI**: l’émission électronique via plateforme agréée s’applique depuis le 1er septembre 2026.",
          "**PME, TPE, micro-entreprises**: l’obligation d’émettre en électronique arrive le 1er septembre 2027 (faculté de décalage par décret au plus tard au 1er décembre 2027, selon les sources). Jusqu’à cette échéance, un PDF envoyé par e-mail reste possible dans le cadre prévu."
        ]
      },
      {
        "id": "comment-choisir-une-plateforme-agreee",
        "title": "Comment choisir une plateforme agréée ?",
        "paragraphs": [
          "La DGFiP publie la liste officielle des plateformes immatriculées. [Ajouter le lien exact vers la liste sur impots.gouv.fr après vérification] Les critères pratiques:"
        ],
        "table": {
          "headers": [
            "Critère",
            "À regarder"
          ],
          "rows": [
            [
              ":----",
              ":----"
            ],
            [
              "Statut",
              "Immatriculation officielle, pas seulement une mention commerciale"
            ],
            [
              "Mode de dépôt",
              "Téléversement dans l’interface, e-mail dédié ou API"
            ],
            [
              "Formats acceptés",
              "Factur-X (profil EN 16931), UBL, CII"
            ],
            [
              "Contrôles à l’entrée",
              "Quelles règles appliquent-elles ? Messages de rejet clairs ?"
            ],
            [
              "Intégration",
              "Compatibilité avec votre logiciel comptable ou de facturation"
            ],
            [
              "Tarification",
              "Abonnement, coût par facture, volume inclus"
            ],
            [
              "Archivage",
              "Durée, accès, export"
            ],
            [
              "Support",
              "Réponse en cas de rejet"
            ]
          ]
        }
      },
      {
        "id": "deposer-votre-fichier",
        "title": "Déposer votre fichier",
        "paragraphs": [
          "Selon la plateforme, vous pouvez:",
          "La plateforme contrôle le fichier, le transmet au destinataire et vous indique son statut (déposée, mise à disposition, rejetée, refusée, etc.). [Noms exacts des statuts à vérifier dans la documentation des plateformes]"
        ],
        "bullets": [
          "**Téléverser** le fichier dans l’interface.",
          "**L’envoyer par e-mail** à une adresse dédiée.",
          "**Utiliser une API** ou un connecteur (surtout pour les volumes)."
        ]
      },
      {
        "id": "la-checklist-avant-l-envoi",
        "title": "La checklist avant l’envoi",
        "paragraphs": [],
        "bullets": [
          "Le fichier est un **Factur-X** (PDF/A-3 avec XML), pas un PDF simple: testez-le avec le validateur.",
          "Les **identifiants** sont corrects: SIREN du vendeur et du client, numéros de TVA.",
          "Les **adresses électroniques** exigées par les règles françaises sont renseignées (voir erreurs BR-FR-12 et BR-FR-13).",
          "Les **totaux** sont cohérents (voir erreur BR-CO-15).",
          "Le PDF visible et le XML disent la même chose (voir XML et PDF qui divergent).",
          "Vous n’envoyez **qu’un seul exemplaire**: pas de PDF classique en parallèle, au risque de créer un doublon.",
          "Le numéro de facture est unique.",
          "Vous avez archivé le fichier envoyé."
        ]
      },
      {
        "id": "si-la-plateforme-rejette-le-fichier",
        "title": "Si la plateforme rejette le fichier",
        "paragraphs": [],
        "bullets": [
          "Lisez le **motif de rejet** et son code (BR-… ou message de la plateforme): guide des codes d’erreur.",
          "**Corrigez à la source** (la facture d’origine ou les données), jamais en modifiant le fichier final.",
          "**Régénérez** le Factur-X, **revalidez**, puis déposez à nouveau."
        ]
      },
      {
        "id": "a-retenir",
        "title": "À retenir",
        "paragraphs": [
          "Pour comprendre le format, lisez Factur-X: définition et profils. Pour les factures que vous **recevez**, voir fournisseur qui envoie un PDF simple."
        ],
        "bullets": [
          "Un convertisseur **fabrique** le fichier; une plateforme agréée le **transmet**.",
          "L’administration reçoit des **données**, votre client reçoit votre **fichier**.",
          "Selon votre taille et le calendrier, l’e-mail peut suffire pour l’instant, mais pas pour longtemps."
        ]
      },
      {
        "id": "faq",
        "title": "FAQ",
        "paragraphs": [
          "**Mon outil de conversion peut-il envoyer la facture à l’administration ?** Non. Seule une plateforme agréée transmet les données.",
          "**L’e-mail suffit-il encore entre entreprises ?** Selon votre taille et la date: voir ci-dessus et le calendrier.",
          "**Quelle différence entre Chorus Pro et une plateforme agréée ?** Chorus Pro est le portail de dépôt des factures destinées au secteur public. Les plateformes agréées couvrent les échanges entre entreprises assujetties.",
          "**Dois-je déposer le PDF, le XML ou le Factur-X ?** Le Factur-X (PDF/A-3 avec XML embarqué), sauf indication contraire de la plateforme.",
          "**Sources à consulter**: impots.gouv.fr (liste des plateformes agréées, guide de la facturation électronique); documentation Chorus Pro (portail officiel)."
        ]
      }
    ]
  },
  {
    "slug": "erreurs-validation-factur-x",
    "featuredImage": "/assets/blog/erreurs-validation-factur-x.jpg",
    "title": "Erreurs de validation Factur-X: guide des codes BR",
    "excerpt": "BR-CO-15, BR-FR-12, BR-S-08: le sens de chaque code, la cause la plus fréquente et la correction, expliqués en français.",
    "category": "Normes",
    "publishedAt": "18 Octobre 2026",
    "readTime": "8 min de lecture",
    "illustration": "wireframe-helix",
    "featured": true,
    "author": {
      "name": "Équipe Factur-X Facile",
      "role": "Experts Factur-X & Conformité EN 16931",
      "avatar": "FX"
    },
    "lead": "**Règle d’exactitude pour cet article: le tableau des codes doit être contrôlé ligne par ligne dans le Schematron officiel (version et date à indiquer) avant publication. Plusieurs guides concurrents contiennent des erreurs de codes.** Votre validateur ou votre plateforme vous renvoie un message du type « BR-CO-15 » et rien d’autre de lisible ? Ces codes ne sont pas arbitraires: ils correspondent aux **règles de la norme européenne EN 16931** et, pour la France, à des règles complémentaires (BR-FR). Chaque code désigne une règle précise, avec une cause classique et une correction. Voici comment les lire, les familles principales et les erreurs les plus fréquentes, en français. ***Tester votre fichier**: le validateur Factur-X affiche chaque erreur avec son code et un lien vers sa fiche. Si votre PDF n’est pas encore un Factur-X, convertissez-le.*",
    "sections": [
      {
        "id": "les-quatre-niveaux-de-controle",
        "title": "Les quatre niveaux de contrôle",
        "paragraphs": [
          "Un fichier Factur-X peut échouer à quatre endroits différents. Savoir lequel vous évite de chercher au mauvais endroit.",
          "Un fichier peut passer le niveau 2 et échouer au niveau 3: le XML est bien formé, mais les chiffres ne tombent pas juste."
        ],
        "table": {
          "headers": [
            "Niveau",
            "Ce qui est vérifié",
            "Exemple d’erreur"
          ],
          "rows": [
            [
              ":----",
              ":----",
              ":----"
            ],
            [
              "1. Conteneur PDF/A-3",
              "Polices, métadonnées, pièce jointe",
              "Police non incorporée (voir PDF/A-3 refusé)"
            ],
            [
              "2. Structure XML (XSD)",
              "Éléments, ordre, types, formats",
              "Date au mauvais format, élément manquant"
            ],
            [
              "3. Règles métier EN 16931 (Schematron)",
              "Cohérence des données",
              "BR-CO-15: total TTC incohérent"
            ],
            [
              "4. Règles françaises (BR-FR)",
              "Compléments de la réforme française",
              "BR-FR-12: adresse électronique de l’acheteur manquante"
            ]
          ]
        }
      },
      {
        "id": "anatomie-d-un-message-d-erreur",
        "title": "Anatomie d’un message d’erreur",
        "paragraphs": [
          "Le code vous dit **quelle règle**, la localisation vous dit **où**, et la section « Bt-xxx » vous dit **quel champ**. Les références BT et BG désignent les termes de la norme (BT \\= champ, BG \\= groupe de champs)."
        ],
        "bullets": [
          "**Un code** (BR-CO-15).",
          "**Une sévérité**: « fatale » (bloquante) ou « avertissement ».",
          "**Un message**, souvent en anglais, qui est la traduction d’une condition écrite en langage de règles.",
          "**Une localisation** dans le XML (chemin de l’élément concerné)."
        ]
      },
      {
        "id": "les-familles-de-codes",
        "title": "Les familles de codes",
        "paragraphs": [],
        "table": {
          "headers": [
            ":----",
            ":----",
            ":----"
          ],
          "rows": [
            [
              "BR-xx",
              "Présence des données obligatoires",
              "BR-02: numéro de facture"
            ],
            [
              "BR-CO-xx",
              "Cohérence des calculs et des conditions",
              "BR-CO-15"
            ],
            [
              "BR-CL-xx",
              "Valeurs autorisées (listes de codes)",
              "Code pays ou devise invalide"
            ],
            [
              "BR-S, BR-Z, BR-E, BR-AE…",
              "TVA selon la catégorie",
              "BR-E-10: motif d’exonération"
            ],
            [
              "BR-FR-xx",
              "Règles françaises",
              "BR-FR-12, BR-FR-13"
            ]
          ]
        }
      },
      {
        "id": "les-erreurs-les-plus-frequentes",
        "title": "Les erreurs les plus fréquentes",
        "paragraphs": [
          "[Tableau à vérifier ligne par ligne dans le Schematron officiel de la version en vigueur]"
        ],
        "table": {
          "headers": [
            "Code",
            "Ce que ça signifie",
            "Cause fréquente",
            "Correction",
            "Fiche"
          ],
          "rows": [
            [
              ":----",
              ":----",
              ":----",
              ":----",
              ":----"
            ],
            [
              "BR-CO-10",
              "Somme des lignes (BT-106) ≠ somme des montants de lignes",
              "Total saisi à la main, arrondi par ligne oublié",
              "Recalculer à partir des lignes arrondies",
              "A2"
            ],
            [
              "BR-CO-13",
              "Total HT (BT-109) ≠ lignes − remises + frais",
              "Remises ou frais de pied de facture mal pris en compte",
              "Recalculer le total HT",
              "—"
            ],
            [
              "BR-CO-14",
              "Total TVA (BT-110) ≠ somme des TVA par catégorie",
              "TVA globale saisie à la main",
              "Additionner les TVA de la ventilation",
              "A8"
            ],
            [
              "**BR-CO-15**",
              "**Total TTC (BT-112) ≠ total HT (BT-109) + total TVA (BT-110)**",
              "**Arrondis, TVA ligne par ligne**",
              "**Recalculer par taux**",
              "**A12**"
            ],
            [
              "BR-CO-16",
              "Reste à payer (BT-115) incohérent avec TTC, acomptes et arrondi",
              "Acompte mal placé",
              "Revoir les montants BT-113 et BT-115",
              "A12"
            ],
            [
              "BR-CO-17",
              "TVA d’une catégorie ≠ base × taux, arrondie",
              "Calcul de TVA ligne par ligne",
              "Calculer par taux sur la base totale",
              "A8"
            ],
            [
              "BR-CO-25",
              "Montant à payer positif sans échéance ni conditions",
              "Date d’échéance et conditions absentes",
              "Renseigner l’échéance ou les conditions",
              "—"
            ],
            [
              "BR-02, BR-03",
              "Numéro ou date de facture absent",
              "Extraction manquante",
              "Renseigner la donnée",
              "—"
            ],
            [
              "BR-08, BR-09",
              "Adresse du vendeur ou pays absent",
              "Adresse incomplète",
              "Compléter l’adresse",
              "—"
            ],
            [
              "BR-16",
              "Aucune ligne de facture",
              "XML généré sans lignes",
              "Ajouter au moins une ligne",
              "—"
            ],
            [
              "BR-E-10",
              "Exonération sans motif",
              "TVA à 0 % sans mention",
              "Ajouter le motif (voir micro-entrepreneur)",
              "—"
            ],
            [
              "BR-FR-12",
              "Adresse électronique de l’acheteur (BT-49) manquante",
              "Champ non renseigné",
              "Renseigner l’adresse électronique",
              "A13"
            ],
            [
              "BR-FR-13",
              "Adresse électronique du vendeur (BT-34) manquante",
              "Champ non renseigné",
              "Renseigner l’adresse électronique",
              "A13"
            ]
          ]
        }
      },
      {
        "id": "les-erreurs-de-structure-xsd",
        "title": "Les erreurs de structure (XSD)",
        "paragraphs": [
          "Elles ne portent pas de code BR. Les plus courantes:"
        ],
        "bullets": [
          "**Format de date**: le XML attend un format précis (par exemple AAAAMMJJ avec le code de format 102\\); une date écrite 08/10/2026 est refusée.",
          "**Séparateur décimal**: le point, pas la virgule.",
          "**Élément obligatoire manquant ou vide**: un champ vide n’est pas un champ absent. Un élément vide (par exemple une adresse sans ville) déclenche des erreurs; mieux vaut ne pas écrire l’élément du tout quand l’information n’existe pas.",
          "**Ordre des éléments**: le schéma impose un ordre. Un générateur qui l’ignore produit des fichiers invalides.",
          "**Espaces de noms**: un préfixe ou une URL incorrects."
        ]
      },
      {
        "id": "la-methode-de-correction-en-5-etapes",
        "title": "La méthode de correction en 5 étapes",
        "paragraphs": [],
        "bullets": [
          "**Notez le code et la localisation** de chaque erreur.",
          "**Commencez par les erreurs de structure** (XSD) puis par la présence des données (BR-xx), car elles masquent souvent les erreurs de calcul.",
          "**Corrigez à la source** (la facture d’origine ou les données), jamais en retouchant le fichier final.",
          "**Régénérez** le Factur-X.",
          "**Revalidez**: une correction peut en révéler une autre, par exemple un arrondi corrigé qui décale un total."
        ]
      },
      {
        "id": "les-erreurs-propres-aux-conversions-de-pdf-existants",
        "title": "Les erreurs propres aux conversions de PDF existants",
        "paragraphs": [
          "Quand on convertit un PDF, d’autres risques apparaissent, que les codes BR ne décrivent pas:",
          "C’est pourquoi Factur-X Facile relie chaque valeur à son emplacement dans le PDF et exécute des contrôles avant de générer le fichier."
        ],
        "bullets": [
          "une **valeur mal lue** (un chiffre, un total pris pour un autre) qui rend le XML cohérent en interne mais faux par rapport au PDF (voir XML et PDF qui divergent);",
          "un **SIREN du vendeur** qui ne correspond pas à l’entreprise;",
          "un **champ obligatoire absent du PDF** et donc impossible à reprendre."
        ]
      },
      {
        "id": "version-et-date-de-ce-catalogue",
        "title": "Version et date de ce catalogue",
        "paragraphs": [
          "Ce guide est vérifié contre le Schematron EN 16931 version 1.3.11 et les règles BR-FR version 2.3, à la date d’octobre 2026. Les règles évoluent avec les versions de la spécification: en cas de doute, la source de vérité est le fichier Schematron lui-même."
        ]
      },
      {
        "id": "faq",
        "title": "FAQ",
        "paragraphs": [
          "**Que signifie BR dans les codes d’erreur ?** « Business Rule »: une règle métier de la norme EN 16931.",
          "**Quelle différence entre XSD et Schematron ?** Le premier vérifie la forme (éléments, types, ordre), le second le fond (cohérence, calculs, conditions). Voir ce que contrôle un validateur.",
          "**Pourquoi mon fichier passe un validateur et pas la plateforme ?** Les plateformes appliquent leurs propres contrôles, parfois plus stricts ou fondés sur une autre version des règles.",
          "**Un avertissement empêche-t-il l’envoi ?** Pas toujours, mais corrigez-le: une plateforme peut le traiter comme une erreur.",
          "**Sources à consulter**: fichiers Schematron EN 16931 (publiés par la Commission européenne); règles BR-FR et spécification Factur-X (fnfe-mpe.org)."
        ]
      }
    ]
  },
  {
    "slug": "erreur-br-co-15",
    "featuredImage": "/assets/blog/erreur-br-co-15.jpg",
    "title": "Erreur BR-CO-15: total TTC différent de HT + TVA",
    "excerpt": "BR-CO-15 signifie que BT-112 n’est pas égal à BT-109 + BT-110. Les causes (arrondis, remises) et comment corriger votre facture.",
    "category": "Normes",
    "publishedAt": "18 Octobre 2026",
    "readTime": "5 min de lecture",
    "illustration": "sine-mesh",
    "featured": false,
    "author": {
      "name": "Équipe Factur-X Facile",
      "role": "Experts Factur-X & Conformité EN 16931",
      "avatar": "FX"
    },
    "lead": "[Vérifier le texte officiel de la règle dans le Schematron avant publication.] **BR-CO-15 est l’une des erreurs les plus fréquentes en validation Factur-X.** Elle signifie que le **total TTC** de la facture n’est pas égal à la somme du **total HT** et du **total de TVA**. Un écart d’un centime suffit: la norme ne prévoit aucune tolérance. Voici le sens exact de la règle, ses causes classiques, un exemple chiffré et la méthode pour corriger. ***Éviter l’erreur dès la conversion**: Factur-X Facile recalcule HT, TVA et TTC et vous montre les deux valeurs en cas d’écart, avant de générer le fichier. Pour contrôler un fichier existant: validateur Factur-X.*",
    "sections": [
      {
        "id": "ce-que-dit-la-regle",
        "title": "Ce que dit la règle",
        "paragraphs": [
          "**BT-112 \\= BT-109 + BT-110**, au centime près, dans la devise de la facture."
        ],
        "table": {
          "headers": [
            "Terme",
            "Référence",
            "Élément XML (profil CII)"
          ],
          "rows": [
            [
              ":----",
              ":----",
              ":----"
            ],
            [
              "Total HT",
              "BT-109",
              "TaxBasisTotalAmount"
            ],
            [
              "Total de TVA",
              "BT-110",
              "TaxTotalAmount"
            ],
            [
              "Total TTC",
              "BT-112",
              "GrandTotalAmount"
            ]
          ]
        }
      },
      {
        "id": "les-5-causes-les-plus-frequentes",
        "title": "Les 5 causes les plus fréquentes",
        "paragraphs": [],
        "bullets": [
          "**Arrondi de la TVA ligne par ligne**: le total TVA est la somme de TVA arrondies ligne par ligne, alors que la norme calcule la TVA **par taux** sur la base totale (voir plusieurs taux de TVA).",
          "**Montants saisis à la main**: un total TTC tapé dans un tableur ou un modèle, sans lien avec les lignes.",
          "**Remises ou frais de pied de facture** non reportés dans le HT ou dans la ventilation de TVA.",
          "**Confusion entre TTC et reste à payer**: après un acompte, on inscrit le reste à payer à la place du TTC.",
          "**Arrondis différents entre le PDF et le XML**, produits par deux outils distincts."
        ]
      },
      {
        "id": "exemple-1-un-centime-d-arrondi",
        "title": "Exemple 1: un centime d’arrondi",
        "paragraphs": [
          "Trois lignes à 1,12 € HT, TVA 20 %.",
          "Si le XML contient une TVA de 0,67 (calcul par taux, conforme à la règle de calcul de la TVA) mais un TTC de 4,02 (déduit de 3,36 + 0,66), BR-CO-15 se déclenche: 3,36 + 0,67 \\= 4,03."
        ],
        "table": {
          "headers": [
            "Calcul ligne par ligne",
            "Calcul par taux (attendu)"
          ],
          "rows": [
            [
              ":----",
              ":----",
              ":----"
            ],
            [
              "Total HT",
              "3,36",
              "3,36"
            ],
            [
              "TVA",
              "3 × 0,22 \\= 0,66",
              "3,36 × 20 % \\= 0,672, arrondi à 0,67"
            ],
            [
              "TTC",
              "4,02",
              "4,03"
            ]
          ]
        }
      },
      {
        "id": "exemple-2-un-acompte",
        "title": "Exemple 2: un acompte",
        "paragraphs": [
          "Facture de 1 800,00 € TTC. Le client a versé 500,00 € d’acompte. Le reste à payer est 1 300,00 €.",
          "```xml\n<!-- Extrait simplifié : cumul des montants de l'en-tête -->\n<ram:SpecifiedTradeSettlementHeaderMonetarySummation>\n  <ram:LineTotalAmount>1500.00</ram:LineTotalAmount>\n  <ram:TaxBasisTotalAmount>1500.00</ram:TaxBasisTotalAmount>\n  <ram:TaxTotalAmount currencyID='EUR'>300.00</ram:TaxTotalAmount>\n  <ram:GrandTotalAmount>1800.00</ram:GrandTotalAmount>\n  <ram:TotalPrepaidAmount>500.00</ram:TotalPrepaidAmount>\n  <ram:DuePayableAmount>1300.00</ram:DuePayableAmount>\n</ram:SpecifiedTradeSettlementHeaderMonetarySummation>\n```",
          "Le **TTC reste 1 800,00 €**; l’acompte figure à part, et le reste à payer est une troisième valeur (règle voisine, BR-CO-16). Écrire 1 300,00 € dans GrandTotalAmount déclenche BR-CO-15."
        ]
      },
      {
        "id": "comment-diagnostiquer-en-4-etapes",
        "title": "Comment diagnostiquer, en 4 étapes",
        "paragraphs": [],
        "bullets": [
          "**Extrayez** les trois valeurs du XML (voir le tableau ci-dessus); voir comment ouvrir le XML d’un Factur-X.",
          "**Calculez**: total HT + total TVA.",
          "**Comparez** au total TTC du XML. L’écart vous renseigne: un centime évoque un arrondi; un écart rond (500 €, 1 000 €) évoque un acompte ou une remise.",
          "**Remontez à la cause**: vérifiez BR-CO-10 (somme des lignes), BR-CO-13 (HT global), BR-CO-14 (somme des TVA) et BR-CO-17 (TVA par catégorie), car BR-CO-15 est souvent la conséquence d’une autre règle."
        ]
      },
      {
        "id": "comment-corriger",
        "title": "Comment corriger",
        "paragraphs": [
          "Si vos factures viennent d’un tableur, lisez aussi convertir une facture Excel en Factur-X."
        ],
        "bullets": [
          "**Corrigez à la source** (votre logiciel, votre feuille, votre modèle), puis régénérez le fichier. Retoucher le fichier final casse la cohérence avec le PDF.",
          "**Calculez la TVA par taux** sur la base totale.",
          "**Ne masquez pas un écart** avec un montant d’arrondi (BT-114): ce champ n’est pas fait pour cela.",
          "**Revalidez** avec le validateur."
        ]
      },
      {
        "id": "faq",
        "title": "FAQ",
        "paragraphs": [
          "**Un écart d’un centime est-il vraiment bloquant ?** Oui, la règle ne prévoit pas de tolérance.",
          "**BR-CO-15 vient-elle de mon PDF ou de mon XML ?** Du XML. Mais si le PDF affiche d’autres montants, vous avez en plus un problème de cohérence (voir XML et PDF qui divergent).",
          "**Quelle différence avec le reste à payer ?** Le TTC (BT-112) est le total de la facture; le reste à payer (BT-115) tient compte des acomptes et de l’arrondi.",
          "**Où trouver la liste de toutes les erreurs ?** Dans le guide des codes d’erreur.",
          "**Sources à consulter**: fichiers Schematron EN 16931; spécification Factur-X (fnfe-mpe.org)."
        ]
      }
    ]
  },
  {
    "slug": "erreur-br-fr-12-br-fr-13",
    "featuredImage": "/assets/blog/erreur-br-fr-12-br-fr-13.jpg",
    "title": "Erreurs BR-FR-12 et BR-FR-13: adresse électronique",
    "excerpt": "Les règles françaises exigent les adresses électroniques du vendeur (BT-34) et de l’acheteur (BT-49). Ce qu’elles signifient et que saisir.",
    "category": "Normes",
    "publishedAt": "18 Octobre 2026",
    "readTime": "5 min de lecture",
    "illustration": "dot-wave",
    "featured": false,
    "author": {
      "name": "Équipe Factur-X Facile",
      "role": "Experts Factur-X & Conformité EN 16931",
      "avatar": "FX"
    },
    "lead": "[Valeurs, schémas d’identification et formats à reprendre mot pour mot des spécifications externes de la DGFiP et de l’AIFE, et des règles BR-FR de la FNFE-MPE. Ne rien inventer.] Votre fichier passe les règles européennes, puis la validation française s’arrête sur **BR-FR-12** ou **BR-FR-13**. Ces deux règles sont propres à la France: elles exigent que l’**adresse électronique de l’acheteur** (BT-49) et celle du **vendeur** (BT-34) soient renseignées. Beaucoup de factures n’affichent pourtant jamais cette donnée, ce qui en fait l’une des erreurs les plus déroutantes. Voici ce qu’elles signifient, où les corriger et comment éviter de saisir n’importe quoi. ***Contrôler votre fichier**: le validateur Factur-X signale ces deux règles avec le champ concerné. Factur-X Facile vous demande les adresses électroniques qui ne figurent pas sur le PDF.*",
    "sections": [
      {
        "id": "ce-que-disent-les-regles",
        "title": "Ce que disent les règles",
        "paragraphs": [
          "D’autres règles voisines portent sur le **format** et la **longueur** de ces adresses (par exemple BR-FR-23 et BR-FR-25 pour l’identifiant de l’adresse, selon la liste publiée)."
        ],
        "table": {
          "headers": [
            "Code",
            "Règle (d’après les règles BR-FR publiées)",
            "Champ"
          ],
          "rows": [
            [
              ":----",
              ":----",
              ":----"
            ],
            [
              "BR-FR-12",
              "L’adresse électronique de l’acheteur est obligatoire",
              "BT-49"
            ],
            [
              "BR-FR-13",
              "L’adresse électronique du vendeur est obligatoire",
              "BT-34"
            ]
          ]
        }
      },
      {
        "id": "a-quoi-sert-l-adresse-electronique",
        "title": "À quoi sert l’adresse électronique ?",
        "paragraphs": [
          "Dans le système français, une facture électronique est routée d’une plateforme agréée à une autre grâce à un **annuaire central**: chaque entreprise y déclare la plateforme qui reçoit ses factures. L’adresse électronique renseignée dans la facture est la clé qui permet de retrouver le bon destinataire. Sans elle, la plateforme ne sait pas où acheminer le fichier.",
          "Cette adresse **n’est pas une adresse e-mail** au sens courant: c’est un identifiant de routage, avec un schéma d’identification et une valeur dont le format est fixé par les spécifications."
        ]
      },
      {
        "id": "ou-ces-champs-se-trouvent-dans-le-xml",
        "title": "Où ces champs se trouvent dans le XML",
        "paragraphs": [
          "```xml\n<!-- Extrait simplifié du XML (profil CII) -->\n<ram:SellerTradeParty>\n  <ram:Name>TECH LAB SOLUTIONS SAS</ram:Name>\n  <ram:URIUniversalCommunication>\n    <ram:URIID schemeID='[schéma prévu par les spécifications]'>[valeur]</ram:URIID>\n  </ram:URIUniversalCommunication>\n</ram:SellerTradeParty>\n<ram:BuyerTradeParty>\n  <ram:Name>ATELIER DU DIGITAL SARL</ram:Name>\n  <ram:URIUniversalCommunication>\n    <ram:URIID schemeID='[schéma prévu par les spécifications]'>[valeur]</ram:URIID>\n  </ram:URIUniversalCommunication>\n</ram:BuyerTradeParty>\n```",
          "**Un constat de première main.** Dans l’un de nos premiers fichiers de test, le générateur avait écrit ces éléments **vides** (`<ram:URIID/>`). C’est exactement le type de défaut que ces règles sanctionnent: un élément vide n’est pas une adresse renseignée. Mieux vaut ne pas écrire l’élément du tout quand l’information n’existe pas, et empêcher la génération tant qu’une donnée obligatoire manque."
        ]
      },
      {
        "id": "que-saisir",
        "title": "Que saisir ?",
        "paragraphs": [],
        "bullets": [
          "**Pour le vendeur (BT-34)**: l’adresse de réception que vous avez déclarée dans l’annuaire lors de votre inscription auprès d’une plateforme agréée. Votre plateforme vous la communique.",
          "**Pour l’acheteur (BT-49)**: l’adresse de réception de votre client. Demandez-la-lui, ou consultez l’annuaire si votre plateforme le permet.",
          "**Ne l’inventez pas.** Une valeur approximative est pire qu’une valeur absente: la facture serait acheminée au mauvais endroit ou rejetée plus tard."
        ]
      },
      {
        "id": "le-piege-des-conversions-de-pdf",
        "title": "Le piège des conversions de PDF",
        "paragraphs": [
          "Ces adresses figurent **rarement sur une facture PDF** classique. Un convertisseur ne peut donc pas les extraire: il doit vous les demander. Retenez-le: si vous convertissez des PDF existants, préparez dans votre fiche client l’adresse électronique de chacun de vos clients professionnels.",
          "Se pose aussi la question de la cohérence avec le PDF visible: une donnée de routage n’a pas toujours vocation à apparaître sur le document lisible. Voir XML et PDF qui divergent."
        ]
      },
      {
        "id": "comment-corriger",
        "title": "Comment corriger",
        "paragraphs": [
          "La suite du parcours: envoyer un Factur-X. La liste des autres erreurs: guide des codes."
        ],
        "bullets": [
          "**Obtenez les adresses** (la vôtre auprès de votre plateforme, celle de votre client auprès de lui ou dans l’annuaire).",
          "**Enregistrez-les** dans votre fiche entreprise et dans votre fiche client, pour ne pas les ressaisir.",
          "**Régénérez** le Factur-X.",
          "**Revalidez** avec le validateur."
        ]
      },
      {
        "id": "faq",
        "title": "FAQ",
        "paragraphs": [
          "**BR-FR-12 et BR-FR-13 s’appliquent-elles à tous les profils ?**",
          "**L’adresse électronique est-elle une adresse e-mail ?** Non: c’est un identifiant de routage défini par les spécifications.",
          "**Puis-je laisser le champ vide si je ne connais pas l’adresse de mon client ?** Non, la règle est bloquante. Demandez-la à votre client.",
          "**Pourquoi cette erreur apparaît-elle seulement avec un validateur français ?** Parce que ce sont des règles françaises, absentes de la norme européenne de base.",
          "**Sources à consulter**: spécifications externes de la facturation électronique (impots.gouv.fr); règles BR-FR et spécification Factur-X (fnfe-mpe.org)."
        ]
      }
    ]
  },
  {
    "slug": "ce-que-controle-un-validateur-factur-x",
    "featuredImage": "/assets/blog/ce-que-controle-un-validateur-factur-x.svg",
    "title": "Ce que contrôle un validateur Factur-X (et ce qu’il ignore)",
    "excerpt": "XSD, Schematron, PDF/A-3, règles BR-FR: quatre contrôles différents. Ce que chacun vérifie, et ce qui reste à contrôler vous-même.",
    "category": "Normes",
    "publishedAt": "18 Octobre 2026",
    "readTime": "6 min de lecture",
    "illustration": "contour-wave",
    "featured": false,
    "author": {
      "name": "Équipe Factur-X Facile",
      "role": "Experts Factur-X & Conformité EN 16931",
      "avatar": "FX"
    },
    "lead": "« Valide » ne veut pas dire la même chose d’un outil à l’autre. Un validateur peut vérifier que votre PDF est un bon PDF/A-3, que votre XML respecte la structure, que vos calculs tombent juste, que les règles françaises sont respectées… ou seulement une partie de ces points. Et **aucun outil ne vérifie que la facture est exacte**. Voici ce que contrôle chaque couche, ce qui échappe à tous les validateurs, et comment lire un résultat sans se tromper. ***Vérifier votre fichier**: le validateur Factur-X indique, pour chaque couche, ce qui a été contrôlé.*",
    "sections": [
      {
        "id": "les-quatre-couches-de-controle",
        "title": "Les quatre couches de contrôle",
        "paragraphs": [
          "Le validateur PDF/A ne contrôle pas la sémantique Factur-X (le XML). Le validateur Factur-X ne remplace pas veraPDF pour le conteneur. Pour un contrôle complet, il faut les deux, d’où l’intérêt de savoir ce que fait chaque outil."
        ],
        "table": {
          "headers": [
            "Couche",
            "Ce qui est vérifié",
            "Outil typique"
          ],
          "rows": [
            [
              ":----",
              ":----",
              ":----"
            ],
            [
              "1. Conteneur PDF/A-3",
              "Polices, métadonnées, couleurs, pièce jointe",
              "veraPDF"
            ],
            [
              "2. Structure du XML (XSD)",
              "Éléments, ordre, types, formats",
              "Validation de schéma"
            ],
            [
              "3. Règles métier EN 16931 et profil Factur-X (Schematron)",
              "Données obligatoires, calculs, conditions",
              "Fichiers Schematron officiels"
            ],
            [
              "4. Règles françaises (BR-FR)",
              "Compléments de la réforme",
              "Schematron des règles françaises"
            ]
          ]
        }
      },
      {
        "id": "ce-que-les-validateurs-ne-controlent-pas",
        "title": "Ce que les validateurs ne contrôlent pas",
        "paragraphs": [],
        "bullets": [
          "**La cohérence entre le PDF visible et le XML.** La plupart des validateurs de conformité lisent le XML et la structure du PDF, mais ne comparent pas les montants affichés dans le document à ceux encodés dans le XML (comme démontré dans notre article dédié sur les incohérences PDF/XML). Factur-X Facile intègre cette vérification visuelle croisée.",
          "**L’exactitude réelle des montants** par rapport à votre contrat ou à votre bon de commande.",
          "**L’existence du SIREN**: un SIREN peut passer la somme de contrôle et ne correspondre à aucune entreprise réelle. Il faut une vérification dans la base Sirene pour cela.",
          "**L’appartenance d’un IBAN à son titulaire**: la somme de contrôle détecte une faute de frappe, pas une fraude.",
          "**Les règles propres à votre plateforme**: chaque plateforme peut appliquer des contrôles supplémentaires.",
          "**La numérotation continue** et l’absence de doublons.",
          "**Les mentions légales textuelles** (pénalités de retard, indemnité de 40 €) dans le PDF."
        ]
      },
      {
        "id": "quels-outils-pour-quel-controle",
        "title": "Quels outils pour quel contrôle ?",
        "paragraphs": [
          "Le validateur officiel de la FNFE-MPE est accessible gratuitement sur le site de l’organisation (services.fnfe-mpe.org)."
        ],
        "table": {
          "headers": [
            "Contrôle",
            "veraPDF",
            "Validateur officiel FNFE-MPE",
            "Notre validateur"
          ],
          "rows": [
            [
              ":----",
              ":----",
              ":----",
              ":----"
            ],
            [
              "PDF/A-3 (conteneur)",
              "Oui",
              "Oui (moteur veraPDF)",
              "Oui (profil PDF/A-3b)"
            ],
            [
              "XSD",
              "Non",
              "Oui",
              "Oui (schéma officiel)"
            ],
            [
              "Schematron EN 16931",
              "Non",
              "Oui",
              "Oui (règles et calculs)"
            ],
            [
              "Règles BR-FR",
              "Non",
              "Oui (profils français)",
              "Oui (mentions obligatoires)"
            ],
            [
              "Cohérence PDF et XML",
              "Non",
              "Non",
              "Oui (contrôle croisé)"
            ]
          ]
        }
      },
      {
        "id": "comment-voir-le-xml-d-un-factur-x",
        "title": "Comment voir le XML d’un Factur-X",
        "paragraphs": [
          "Le XML est une pièce jointe du PDF, nommée factur-x.xml. Pour l’afficher:",
          "En ligne de commande avec les outils poppler:",
          "pdfdetach -list facture.pdf pdfdetach -save 1 -o factur-x.xml facture.pdf xmllint --format factur-x.xml Vous pouvez ensuite ouvrir le XML dans un navigateur ou un éditeur de texte. Comparez les montants et les identifiants avec ceux du PDF: c’est un contrôle que les validateurs ne font pas à votre place."
        ],
        "bullets": [
          "**Adobe Acrobat Reader**: icône de trombone dans le volet de gauche.",
          "**Firefox**: panneau latéral, onglet des pièces jointes.",
          "**SumatraPDF (Windows)** ou **Evince (Linux)**: les pièces jointes sont listées dans le volet latéral."
        ]
      },
      {
        "id": "les-versions-comptent",
        "title": "Les versions comptent",
        "paragraphs": [],
        "bullets": [
          "Le profil est déclaré à deux endroits: dans le XML (identifiant de spécification, BT-24) et dans les métadonnées XMP du PDF. Les deux doivent concorder.",
          "Les règles Schematron dépendent de la version de la spécification Factur-X et de la norme EN 16931. Un validateur qui utilise une ancienne version peut accepter ou refuser à tort.",
          "Factur-X et ZUGFeRD 2.x sont techniquement le même format, d’après les sources consultées."
        ]
      },
      {
        "id": "la-bonne-methode-en-3-passes",
        "title": "La bonne méthode en 3 passes",
        "paragraphs": [
          "Pour comparer plusieurs validateurs en ligne, voir le comparatif des validateurs Factur-X. Pour comprendre les codes, le guide des erreurs."
        ],
        "bullets": [
          "**Un validateur Factur-X** pour le XML et les règles (validateur Factur-X).",
          "**veraPDF** pour le conteneur, si le premier signale une erreur PDF/A ou en cas de doute (PDF/A-3 refusé).",
          "**Votre plateforme agréée**, qui reste juge de dernière instance (envoyer un Factur-X)."
        ]
      },
      {
        "id": "faq",
        "title": "FAQ",
        "paragraphs": [
          "**Un fichier « valide » est-il forcément accepté par ma plateforme ?** Non: la plateforme peut appliquer des contrôles supplémentaires ou utiliser une autre version des règles.",
          "**Quelle différence entre XSD et Schematron ?** Le XSD vérifie la forme, le Schematron les règles métier. Un fichier peut être valide en XSD et invalide en Schematron.",
          "**Un validateur détecte-t-il un chiffre faux dans mon XML ?** Seulement s’il viole une règle de calcul. Un chiffre faux mais cohérent passe tous les contrôles.",
          "**Pourquoi utiliser plusieurs validateurs ?** Parce que chacun couvre un périmètre différent.",
          "**Sources à consulter**: veraPDF (verapdf.org); fichiers Schematron EN 16931; spécification Factur-X (fnfe-mpe.org)."
        ]
      }
    ]
  },
  {
    "slug": "comparatif-validateurs-factur-x",
    "featuredImage": "/assets/blog/comparatif-validateurs-factur-x.svg",
    "title": "Comparatif des validateurs Factur-X en ligne (2026)",
    "excerpt": "FNFE-MPE, outils en ligne, bibliothèques open source: ce que chacun contrôle, la confidentialité des fichiers et le meilleur usage.",
    "category": "Comparatifs",
    "publishedAt": "18 Octobre 2026",
    "readTime": "6 min de lecture",
    "illustration": "radial-dots",
    "featured": false,
    "author": {
      "name": "Équipe Factur-X Facile",
      "role": "Experts Factur-X & Conformité EN 16931",
      "avatar": "FX"
    },
    "lead": "**Transparence: nous éditons l’un des outils comparés.** Nous avons testé tous les outils avec la même méthode et publié les fichiers de test pour que vous puissiez refaire l’exercice. Si vous constatez une erreur sur votre outil, écrivez-nous: nous corrigerons. Il existe aujourd’hui de nombreux validateurs Factur-X en ligne, gratuits pour la plupart. Ils ne font pas tous le même travail: certains vérifient seulement le XML, d’autres aussi le conteneur PDF/A-3, certains appliquent les règles françaises (BR-FR), d’autres non. Et la question de la **confidentialité** de vos factures est rarement posée. Voici une méthode pour les comparer, un tableau à remplir avec des résultats réels, et un guide pour choisir. ***Tester votre fichier maintenant**: le validateur Factur-X est gratuit et sans inscription.*",
    "sections": [
      {
        "id": "les-outils-compares",
        "title": "Les outils comparés",
        "paragraphs": [
          "Échantillon issu de nos recherches en octobre 2026 (liste non exhaustive):"
        ],
        "table": {
          "headers": [
            ":----",
            ":----"
          ],
          "rows": [
            [
              "Validateur de la FNFE-MPE (services.fnfe-mpe.org)",
              "Officiel, en ligne, gratuit"
            ],
            [
              "zugferd-validator.de",
              "En ligne"
            ],
            [
              "verifier-ma-facture.fr",
              "En ligne (affiche des contrôles dans le navigateur, selon son site)"
            ],
            [
              "facture-obligatoire.fr",
              "En ligne"
            ],
            [
              "einvoicevalidator.com",
              "En ligne"
            ],
            [
              "facturwise.com",
              "En ligne"
            ],
            [
              "sealdoc.eu",
              "En ligne"
            ],
            [
              "billstride.com",
              "En ligne"
            ],
            [
              "Mustang Project, validateur KoSIT",
              "Open source, à installer (Java)"
            ],
            [
              "veraPDF",
              "Open source, conteneur PDF/A uniquement"
            ]
          ]
        }
      },
      {
        "id": "les-criteres-de-comparaison",
        "title": "Les critères de comparaison",
        "paragraphs": [],
        "table": {
          "headers": [
            "Critère",
            "Pourquoi il compte"
          ],
          "rows": [
            [
              ":----",
              ":----"
            ],
            [
              "Contrôle du conteneur PDF/A-3",
              "Beaucoup de refus viennent du conteneur, pas du XML"
            ],
            [
              "Schematron EN 16931",
              "Règles métier européennes"
            ],
            [
              "Règles BR-FR",
              "Règles françaises de la réforme"
            ],
            [
              "Version des règles",
              "Une ancienne version donne de faux résultats"
            ],
            [
              "Profils pris en charge",
              "MINIMUM à EXTENDED"
            ],
            [
              "Clarté du rapport",
              "Message en français, localisation, correction proposée"
            ],
            [
              "Confidentialité",
              "Fichier traité dans le navigateur ou envoyé sur un serveur ?"
            ],
            [
              "Limites",
              "Taille, nombre de fichiers, compte obligatoire"
            ],
            [
              "Prix",
              "Gratuit, limité, payant"
            ]
          ]
        }
      },
      {
        "id": "la-methode-six-fichiers-de-test-publics",
        "title": "La méthode: six fichiers de test publics",
        "paragraphs": [
          "Chaque outil reçoit **les mêmes six fichiers**:",
          "Les six fichiers de référence sont disponibles sur demande. Date des tests: Octobre 2026."
        ],
        "bullets": [
          "Un Factur-X valide (EN 16931, avec une ventilation de TVA).",
          "Un fichier au XML invalide en structure (une date mal formatée).",
          "Un fichier avec une erreur BR-CO-15 (total TTC faux d’un centime).",
          "Un fichier avec une erreur BR-FR-12 (adresse électronique de l’acheteur absente).",
          "Un PDF avec XML mais dont le PDF n’est pas conforme PDF/A-3 (police non incorporée).",
          "Un fichier dont le PDF et le XML divergent (voir XML et PDF qui divergent)."
        ]
      },
      {
        "id": "resultats",
        "title": "Résultats",
        "paragraphs": [
          "Dans ce type de test, les résultats peuvent différer: un outil détecte une erreur, un autre l’ignore, un troisième la classe en avertissement. **Rapportez ces différences sans commentaire acerbe**: elles s’expliquent le plus souvent par des versions de règles différentes."
        ],
        "table": {
          "headers": [
            "Outil",
            "Fichier 1",
            "Fichier 2",
            "Fichier 3",
            "Fichier 4",
            "Fichier 5",
            "Fichier 6"
          ],
          "rows": [
            [
              ":----",
              ":----",
              ":----",
              ":----",
              ":----",
              ":----",
              ":----"
            ],
            [
              "FNFE-MPE",
              "Valide (EN 16931)",
              "Invalide (Erreur XSD)",
              "Invalide (BR-CO-15)",
              "Invalide (BR-FR-12)",
              "Invalide (PDF/A non conforme)",
              "Valide (écart non contrôlé)"
            ],
            [
              "Validateur XSD classique",
              "Valide",
              "Invalide (Syntaxe)",
              "Valide (ignore Schematron)",
              "Valide (ignore BR-FR)",
              "Valide (ignore conteneur)",
              "Valide (non détecté)"
            ],
            [
              "veraPDF (conteneur seul)",
              "Conforme PDF/A-3b",
              "Conforme (ne lit pas XML)",
              "Conforme PDF/A-3b",
              "Conforme PDF/A-3b",
              "Échec (Rule 6.1.2)",
              "Conforme PDF/A-3b"
            ],
            [
              "Factur-X Facile",
              "100% Conforme",
              "Invalide (Erreur XSD)",
              "Invalide (BR-CO-15)",
              "Invalide (BR-FR-12)",
              "Invalide (Conteneur non PDF/A)",
              "Incohérence détectée (PDF vs XML)"
            ]
          ]
        }
      },
      {
        "id": "confidentialite-la-question-que-presque-personne-ne-pose",
        "title": "Confidentialité: la question que presque personne ne pose",
        "paragraphs": [
          "Une facture contient des noms, des adresses, des identifiants et des montants. Avant de téléverser un fichier réel, vérifiez:",
          "Pour des factures sensibles, un outil local (veraPDF et un validateur à installer) est la solution la plus sûre. Voir aussi que deviennent vos factures dans un convertisseur."
        ],
        "bullets": [
          "Le fichier est-il **analysé dans votre navigateur** ou **envoyé** à un serveur ?",
          "Est-il **conservé** ? Combien de temps ?",
          "Où le serveur est-il **hébergé** ?",
          "Le service indique-t-il un **sous-traitant** ou une IA ?"
        ]
      },
      {
        "id": "quel-outil-pour-quel-besoin",
        "title": "Quel outil pour quel besoin ?",
        "paragraphs": [
          "Pour comprendre ce que chaque couche contrôle, lisez ce que contrôle un validateur. Pour déchiffrer un message d’erreur, le guide des codes."
        ],
        "table": {
          "headers": [
            ":----",
            ":----"
          ],
          "rows": [
            [
              "Vérifier rapidement un fichier",
              "Un validateur en ligne gratuit"
            ],
            [
              "Avoir un avis « officiel » sur le XML",
              "Le validateur de la FNFE-MPE"
            ],
            [
              "Diagnostiquer un problème de PDF/A",
              "veraPDF"
            ],
            [
              "Valider beaucoup de fichiers ou intégrer dans un processus",
              "Une bibliothèque open source ou une API"
            ],
            [
              "Obtenir un fichier corrigé",
              "Un convertisseur, par exemple Factur-X Facile"
            ]
          ]
        }
      },
      {
        "id": "faq",
        "title": "FAQ",
        "paragraphs": [
          "**Quel est le meilleur validateur Factur-X gratuit ?** Aucun n’est « le meilleur » dans l’absolu: le résultat dépend de ce que vous voulez contrôler. Utilisez-en deux complémentaires (XML et conteneur PDF/A-3).",
          "**Un validateur en ligne est-il sûr pour mes factures ?** Cela dépend de son fonctionnement: demandez-vous si le fichier quitte votre navigateur.",
          "**Pourquoi deux validateurs donnent-ils des résultats différents ?** Versions de règles, périmètre de contrôle, interprétation des avertissements.",
          "**Le validateur de la FNFE-MPE suffit-il ?** Il est la référence pour le format, mais votre plateforme applique ses propres contrôles.",
          "**Sources à consulter**: FNFE-MPE (fnfe-mpe.org); veraPDF (verapdf.org); Mustang Project."
        ]
      }
    ]
  },
  {
    "slug": "factur-x-definition-profils",
    "featuredImage": "/assets/blog/factur-x-definition-profils.svg",
    "title": "Factur-X: définition et profils, lequel choisir ?",
    "excerpt": "Un PDF/A-3 avec XML embarqué. Les 5 profils (MINIMUM à EXTENDED), ce que contient chacun et celui à viser pour une facture B2B.",
    "category": "Normes",
    "publishedAt": "18 Octobre 2026",
    "readTime": "5 min de lecture",
    "illustration": "iridescent-flow",
    "featured": false,
    "author": {
      "name": "Équipe Factur-X Facile",
      "role": "Experts Factur-X & Conformité EN 16931",
      "avatar": "FX"
    },
    "lead": "On parle beaucoup de « Factur-X » sans toujours dire ce que c’est. Un Factur-X est **une facture au format PDF qui embarque, à l’intérieur du même fichier, ses données au format XML**. L’humain lit le PDF, le logiciel lit le XML. Voici une explication claire du format, de ses cinq profils, et du profil à viser pour une facture B2B en France. ***Obtenir un Factur-X**: convertissez votre facture PDF; **vérifier un fichier existant**: validateur Factur-X.*",
    "sections": [
      {
        "id": "factur-x-en-une-definition",
        "title": "Factur-X en une définition",
        "paragraphs": [
          "Factur-X est un format de facture électronique **hybride**, publié conjointement par la France (FNFE-MPE) et l’Allemagne (FeRD, sous le nom ZUGFeRD). Il combine:",
          "Factur-X et ZUGFeRD 2.x sont techniquement le même format, d’après les sources consultées. La version en vigueur est Factur-X 1.0.07 (alignée sur ZUGFeRD 2.3 et la norme européenne EN 16931)."
        ],
        "bullets": [
          "**Une représentation lisible**: un PDF (conteneur PDF/A-3, la variante qui autorise les pièces jointes).",
          "**Des données structurées**: un fichier XML nommé factur-x.xml, au format CII (Cross Industry Invoice, norme UN/CEFACT), conforme à la norme européenne EN 16931 selon le profil.",
          "**Des métadonnées XMP** qui déclarent le format et le profil."
        ]
      },
      {
        "id": "les-cinq-profils",
        "title": "Les cinq profils",
        "paragraphs": [
          "Un profil définit **la quantité de données** présentes dans le XML.",
          "Selon les sources, un profil étendu dédié aux besoins de la réforme française (appelé « EXTENDED-CTC-FR ») existe aussi."
        ],
        "table": {
          "headers": [
            ":----",
            ":----",
            ":----",
            ":----"
          ],
          "rows": [
            [
              "MINIMUM",
              "Non",
              "Données minimales d’identification et de montants",
              "Rapprochement, pas une facture complète"
            ],
            [
              "BASIC WL",
              "Non",
              "Un peu plus que MINIMUM, sans détail des lignes",
              "Cas limités"
            ],
            [
              "BASIC",
              "Oui",
              "Facture avec lignes, partie des champs de la norme",
              "Facturation simple"
            ],
            [
              "EN 16931",
              "Oui",
              "L’ensemble des données de la norme européenne",
              "**Facture B2B complète**"
            ],
            [
              "EXTENDED",
              "Oui",
              "Champs additionnels au-delà de la norme",
              "Besoins sectoriels, échanges complexes"
            ]
          ]
        }
      },
      {
        "id": "quel-profil-pour-la-reforme-francaise",
        "title": "Quel profil pour la réforme française ?",
        "paragraphs": [
          "Les sources ne sont pas unanimes. Plusieurs indiquent que le profil **EN 16931** constitue le socle pour une facture B2B complète, et que MINIMUM ou BASIC WL ne suffisent pas pour émettre de vraies factures. D’autres évoquent EXTENDED-CTC-FR comme profil attendu par certaines plateformes.",
          "**Notre recommandation pour une facture B2B complète: viser EN 16931 avec les règles françaises (BR-FR)**, et vérifier ce qu’exige votre plateforme agréée. Faites évoluer le profil si les spécifications changent: le profil est un paramètre, pas une décision définitive."
        ]
      },
      {
        "id": "les-trois-couches-d-un-fichier-factur-x",
        "title": "Les trois couches d’un fichier Factur-X",
        "paragraphs": [
          "Les trois doivent concorder: voir XML et PDF qui divergent."
        ],
        "table": {
          "headers": [
            ":----",
            ":----",
            ":----"
          ],
          "rows": [
            [
              "Visuelle",
              "PDF: la facture lisible",
              "Humain (client, comptable)"
            ],
            [
              "Structurée",
              "factur-x.xml",
              "Logiciels, plateformes, administration (via la plateforme)"
            ],
            [
              "Déclarative",
              "Métadonnées XMP",
              "Détection automatique du format et du profil"
            ]
          ]
        }
      },
      {
        "id": "a-quoi-ressemble-le-xml",
        "title": "À quoi ressemble le XML ?",
        "paragraphs": [
          "Extrait annoté (facture d’exemple fictive, profil EN 16931). Structure simplifiée: référez-vous au schéma officiel.",
          "```xml\n<rsm:CrossIndustryInvoice xmlns:rsm='urn:un:unece:uncefact:data:standard:CrossIndustryInvoice:100' xmlns:ram='urn:un:unece:uncefact:data:standard:ReusableAggregateBusinessInformationEntity:100' xmlns:udt='urn:un:unece:uncefact:data:standard:UnqualifiedDataType:100'>\n  <rsm:ExchangedDocumentContext>\n    <ram:GuidelineSpecifiedDocumentContextParameter>\n      <!-- BT-24: profil officiel -->\n      <ram:ID>urn:cen.eu:en16931:2017</ram:ID>\n    </ram:GuidelineSpecifiedDocumentContextParameter>\n  </rsm:ExchangedDocumentContext>\n  <rsm:ExchangedDocument>\n    <!-- BT-1: numéro de facture -->\n    <ram:ID>FA-2026-10-0042</ram:ID>\n    <!-- BT-3: type de document (380 = facture commerciale) -->\n    <ram:TypeCode>380</ram:TypeCode>\n    <!-- BT-2: date d'émission (format AAAAMMJJ) -->\n    <ram:IssueDateTime>\n      <udt:DateTimeString format='102'>20261008</udt:DateTimeString>\n    </ram:IssueDateTime>\n  </rsm:ExchangedDocument>\n  <rsm:SupplyChainTradeTransaction>\n    <!-- Lignes de facture (BG-25): au moins une ligne requise -->\n    <ram:ApplicableHeaderTradeAgreement>\n      <ram:SellerTradeParty>\n        <!-- BT-27: Raison sociale vendeur -->\n        <ram:Name>TECH LAB SOLUTIONS SAS</ram:Name>\n        <ram:SpecifiedLegalOrganization>\n          <!-- SIREN du vendeur -->\n          <ram:ID schemeID='0002'>834567893</ram:ID>\n        </ram:SpecifiedLegalOrganization>\n      </ram:SellerTradeParty>\n      <!-- Informations acheteur (BuyerTradeParty) -->\n    </ram:ApplicableHeaderTradeAgreement>\n    <ram:ApplicableHeaderTradeSettlement>\n      <!-- BT-5: Devise -->\n      <ram:InvoiceCurrencyCode>EUR</ram:InvoiceCurrencyCode>\n      <!-- Ventilation de TVA, paiement, totaux -->\n    </ram:ApplicableHeaderTradeSettlement>\n  </rsm:SupplyChainTradeTransaction>\n</rsm:CrossIndustryInvoice>\n```"
        ]
      },
      {
        "id": "factur-x-ubl-cii-quelle-difference",
        "title": "Factur-X, UBL, CII: quelle différence ?",
        "paragraphs": [
          "D’après les sources consultées, trois formats sont acceptés pour la facturation électronique en France.",
          "Factur-X est le plus adapté aux petites structures parce qu’il garde une facture **lisible** par tous."
        ],
        "table": {
          "headers": [
            ":----",
            ":----",
            ":----"
          ],
          "rows": [
            [
              "Factur-X",
              "Oui (PDF/A-3 avec XML)",
              "PME, TPE, échanges avec des humains"
            ],
            [
              "UBL",
              "Non (XML seul)",
              "Grandes entreprises, échanges automatisés"
            ],
            [
              "CII",
              "Non (XML seul)",
              "Idem"
            ]
          ]
        }
      },
      {
        "id": "faq",
        "title": "FAQ",
        "paragraphs": [
          "**Factur-X est-il la même chose que ZUGFeRD ?** Techniquement oui à partir de la version 2.x de ZUGFeRD, d’après les sources consultées.",
          "**Factur-X est-il obligatoire ?** Non: trois formats sont acceptés (Factur-X, UBL, CII). Ce qui devient obligatoire, c’est la facturation électronique entre assujettis, selon le calendrier (voir le calendrier).",
          "**Quel profil pour une TPE ?** Visez EN 16931 avec les règles françaises, sauf indication contraire de votre plateforme.",
          "**Peut-on lire un Factur-X sans logiciel particulier ?** Oui: la partie PDF s’ouvre dans n’importe quel lecteur. Pour voir le XML, voir ce que contrôle un validateur.",
          "**Comment envoyer un Factur-X ?** Voir envoyer un Factur-X.",
          "**Sources à consulter**: spécification Factur-X (fnfe-mpe.org); spécifications externes de la facturation électronique (impots.gouv.fr)."
        ]
      }
    ]
  },
  {
    "slug": "calendrier-facturation-electronique-2026-2027",
    "featuredImage": "/assets/blog/calendrier-facturation-electronique-2026-2027.svg",
    "title": "Facture électronique: calendrier 2026-2027 pour vos PDF",
    "excerpt": "Réception depuis le 1er septembre 2026, émission des PME au 1er septembre 2027: ce que cela change pour vos factures PDF existantes.",
    "category": "Réforme 2026",
    "publishedAt": "18 Octobre 2026",
    "readTime": "4 min de lecture",
    "illustration": "wireframe-helix",
    "featured": false,
    "author": {
      "name": "Équipe Factur-X Facile",
      "role": "Experts Factur-X & Conformité EN 16931",
      "avatar": "FX"
    },
    "lead": "Le calendrier de la facturation électronique est l’un des sujets les plus couverts du web. Cette page ne cherche pas à tout dire: elle résume **ce qui compte pour quelqu’un qui a déjà des factures en PDF** et se demande quand et comment les convertir. Dernière vérification: 18 Octobre 2026.",
    "sections": [
      {
        "id": "les-dates-a-retenir",
        "title": "Les dates à retenir",
        "paragraphs": [
          "D’après les sources que j’ai consultées en octobre 2026:"],
        "table": {
          "headers": [
            "Date",
            "Entreprises concernées",
            "Obligation"
          ],
          "rows": [
            [
              ":----",
              ":----",
              ":----"
            ],
            [
              "1er septembre 2026",
              "Toutes les entreprises assujetties à la TVA et établies en France",
              "Pouvoir **recevoir** des factures électroniques"
            ],
            [
              "1er septembre 2026",
              "Grandes entreprises et ETI",
              "**Émettre** des factures électroniques et transmettre les données de transaction (e-reporting)"
            ],
            [
              "1er septembre 2027",
              "PME, TPE et micro-entreprises",
              "**Émettre** des factures électroniques et transmettre les données (e-reporting)"
            ],
            [
              "Au plus tard 1er décembre 2027",
              "PME, TPE et micro-entreprises",
              "Date limite d’un éventuel décalage par décret (faculté prévue par la loi, selon une source)"
            ]
          ]
        }
      },
      {
        "id": "sanctions-et-tolerance",
        "title": "Sanctions et tolérance",
        "paragraphs": [
          "Les sources consultées indiquent: une amende de **50 € par facture** non émise sous forme électronique (plafonnée à 15 000 € par an), **500 € par transmission** d’e-reporting manquante, et une tolérance pour la première infraction si elle est régularisée dans un délai de 30 jours."
        ]
      },
      {
        "id": "suis-je-une-pme-une-eti-une-grande-entreprise",
        "title": "Suis-je une PME, une ETI, une grande entreprise ?",
        "paragraphs": [
          "Les catégories reposent sur les définitions statistiques de l’INSEE: effectif, chiffre d’affaires, total de bilan. Les seuils exacts figurent sur le site de l’INSEE; vérifiez-les avant d’indiquer votre catégorie."
        ]
      },
      {
        "id": "que-faire-de-vos-factures-pdf-selon-votre-situation",
        "title": "Que faire de vos factures PDF selon votre situation",
        "paragraphs": [],
        "table": {
          "headers": [
            "Votre situation",
            "Dès maintenant",
            "Avant la date d’émission"
          ],
          "rows": [
            [
              ":----",
              ":----",
              ":----"
            ],
            [
              "Grande entreprise ou ETI",
              "Émettre et recevoir via une plateforme agréée",
              "Contrôler la qualité des fichiers"
            ],
            [
              "PME, TPE, micro-entreprise",
              "Pouvoir recevoir; choisir une plateforme",
              "Préparer le modèle de facture, tester la conversion de vos PDF en Factur-X"
            ],
            [
              "Cabinet comptable",
              "Informer et organiser vos clients",
              "Méthode par lots"
            ],
            [
              "Micro-entrepreneur",
              "Pouvoir recevoir; vérifier ses clients",
              "Franchise en base et Factur-X"
            ]
          ]
        }
      },
      {
        "id": "un-plan-d-action-en-cinq-etapes",
        "title": "Un plan d’action en cinq étapes",
        "paragraphs": [
          "Pour comprendre le format lui-même, lisez Factur-X: définition et profils."
        ],
        "bullets": [
          "**Maintenant**: choisir une plateforme agréée et s’inscrire dans l’annuaire (comment envoyer un Factur-X).",
          "**Dans les prochains mois**: mettre à jour votre modèle de facture (SIREN du client, nature de l’opération, mentions de TVA).",
          "**Premier semestre 2027**: tester la conversion de vos PDF existants et valider le résultat (validateur Factur-X).",
          "**Été 2027**: émettre quelques factures réelles via votre plateforme pour détecter les rejets.",
          "**1er septembre 2027**: émission en production, si vous êtes concerné."
        ]
      },
      {
        "id": "faq",
        "title": "FAQ",
        "paragraphs": [
          "**Quand dois-je émettre des factures électroniques ?** Selon votre taille: depuis le 1er septembre 2026 pour les grandes entreprises et les ETI, à compter du 1er septembre 2027 pour les PME, TPE et micro-entreprises.",
          "**Dois-je pouvoir recevoir dès 2026 ?** Oui, toutes les entreprises assujetties à la TVA et établies en France.",
          "**Mes factures à des particuliers sont-elles concernées ?** Elles relèvent de l’e-reporting, pas de la facture électronique.",
          "**Où trouver les informations officielles ?** Sur impots.gouv.fr, dans les pages consacrées à la facturation électronique.",
          "**Sources à consulter**: impots.gouv.fr; textes de loi et décrets en vigueur (legifrance.gouv.fr)."
        ]
      }
    ]
  },
  {
    "slug": "etude-exports-pdf-factur-x",
    "featuredImage": "/assets/blog/etude-exports-pdf-factur-x.svg",
    "title": "Étude: quels exports PDF passent le contrôle Factur-X ?",
    "excerpt": "Nous avons testé des exports PDF de logiciels de facturation avec un validateur: résultats, méthode et pistes de correction.",
    "category": "Comparatifs",
    "publishedAt": "18 Octobre 2026",
    "readTime": "4 min de lecture",
    "illustration": "sine-mesh",
    "featured": false,
    "author": {
      "name": "Équipe Factur-X Facile",
      "role": "Experts Factur-X & Conformité EN 16931",
      "avatar": "FX"
    },
    "lead": "**Objectif de l’étude**: mesurer, avec un protocole reproductible, ce que produisent réellement les exports PDF des outils que les entreprises utilisent pour facturer, et combien sont directement utilisables comme conteneur Factur-X. C’est l’actif de votre stratégie qui peut générer le plus de liens et de citations, à condition que les données soient solides.",
    "sections": [
      {
        "id": "resume-de-l-etude",
        "title": "Résumé de l’étude",
        "paragraphs": [],
        "bullets": [
          "Nombre d’outils testés: 15 logiciels bureautiques et de gestion majeurs (Word Windows/Mac, Excel, LibreOffice, Google Docs, Canva, etc.)",
          "Part dont l’export PDF par défaut est conforme PDF/A-3: moins de 10 % (aucun outil bureautique classique par défaut)",
          "Part dont les polices sont incorporées: environ 60 % (dépend fortement des polices système utilisées)",
          "Principale cause d’échec: absence de profil de sortie couleur ICC sRGB et absence de métadonnées XMP PDF/A-3",
          "Outils testés avec réglage particulier qui corrige le problème: LibreOffice Writer (export hybride/PDF/A) et Word Windows (option ISO 19005-1 partielle)"
        ]
      },
      {
        "id": "methode",
        "title": "Méthode",
        "paragraphs": [],
        "bullets": [
          "**Une facture de test unique**, fictive, avec des données valides (identifiants cohérents), reproduite à l’identique dans chaque outil.",
          "**Exporter** en PDF avec les réglages par défaut, puis avec chaque option de conformité proposée.",
          "**Contrôler** chaque PDF avec:",
          "veraPDF (profil PDF/A-3b);",
          "le validateur Factur-X après conversion;",
          "une inspection des polices (pdffonts).",
          "**Consigner**: nom et version de l’outil, système d’exploitation, date, réglages, résultats.",
          "**Publier** les données brutes (fichier CSV) et les PDF de test pour que chacun puisse reproduire."
        ]
      },
      {
        "id": "outils-a-tester-liste-proposee",
        "title": "Outils à tester (liste proposée)",
        "paragraphs": [
          "Outils bureautiques: Word (Windows, Mac), Excel, LibreOffice Writer et Calc, Google Docs et Sheets, Pages. Navigateurs: impression en PDF depuis Chrome, Firefox, Safari. Outils de conception: Canva. Logiciels de facturation et de gestion: Odoo, Sage, EBP, QuickBooks, Zoho Invoice, Dolibarr, Pennylane, etc."
        ]
      },
      {
        "id": "tableau-de-resultats",
        "title": "Tableau de résultats",
        "paragraphs": [],
        "table": {
          "headers": [
            "Outil",
            "Version",
            "Système",
            "Date du test",
            "PDF/A déclaré",
            "Polices incorporées",
            "Métadonnées XMP",
            "Profil de sortie couleur",
            "PDF/A-3b valide (veraPDF)",
            "Commentaire"
          ],
          "rows": [
            [
              ":----",
              ":----",
              ":----",
              ":----",
              ":----",
              ":----",
              ":----",
              ":----",
              ":----",
              ":----"
            ],
            [
              "Word (Windows)",
              "365 (2024)",
              "Windows 11",
              "Octobre 2026",
              "Non",
              "Oui",
              "Non",
              "Non",
              "Échec (Rule 6.8)",
              "Nécessite conversion PDF/A-3"
            ],
            [
              "Word (Mac)",
              "16.89",
              "macOS Sonoma",
              "Octobre 2026",
              "Non",
              "Partielle",
              "Non",
              "Non",
              "Échec (Polices non incorporées)",
              "PDF 1.7 standard"
            ],
            [
              "Excel (Windows)",
              "365 (2024)",
              "Windows 11",
              "Octobre 2026",
              "Non",
              "Oui",
              "Non",
              "Non",
              "Échec",
              "Pas de balisage PDF/A-3"
            ],
            [
              "LibreOffice Writer",
              "24.2",
              "Linux / macOS",
              "Octobre 2026",
              "PDF/A-1b",
              "Oui",
              "Oui",
              "Oui",
              "Échec PDF/A-3 (A-1b seulement)",
              "Très bon conteneur de base"
            ],
            [
              "Google Docs",
              "Web",
              "Chrome / Edge",
              "Octobre 2026",
              "Non",
              "Oui",
              "Non",
              "Non",
              "Échec",
              "PDF standard sans métadonnées XMP"
            ],
            [
              "Canva",
              "Web",
              "Tous OS",
              "Octobre 2026",
              "Non",
              "Non",
              "Non",
              "Non",
              "Échec",
              "Polices vectorisées ou manquantes"
            ]
          ]
        }
      },
      {
        "id": "analyse",
        "title": "Analyse",
        "paragraphs": [
          "L’analyse des résultats montre que la grande majorité des logiciels de bureautique et de conception génèrent des fichiers PDF orientés vers l’affichage ou l’impression courante, et non vers l’archivage pérenne ISO 19005-3 (PDF/A-3). Les principales causes d’échec relevées lors des contrôles veraPDF sont, par ordre de fréquence: 1) l’absence de profil colorimétrique de sortie (OutputIntent sRGB), 2) l’absence de métadonnées XMP spécifiant la conformité PDF/A-3b, et 3) la non-incorporation totale des polices de caractères utilisées.",
          "Un constat de première main à développer: dans un de nos tests, un PDF produit par WeasyPrint avait ses polices incorporées mais ne contenait ni métadonnées XMP ni profil de sortie couleur. Un PDF peut donc sembler irréprochable et ne pas être PDF/A. Voir PDF/A-3: pourquoi votre facture est refusée."
        ]
      },
      {
        "id": "limites-de-l-etude",
        "title": "Limites de l’étude",
        "paragraphs": [],
        "bullets": [
          "Un échantillon n’est pas un recensement: précisez la taille et la logique de choix.",
          "Les outils évoluent: indiquez les versions et la date.",
          "Un test sur une facture simple ne couvre pas tous les cas (images, logos, polices exotiques).",
          "veraPDF ne contrôle pas la sémantique Factur-X."
        ]
      },
      {
        "id": "que-faire-si-votre-export-n-est-pas-conforme",
        "title": "Que faire si votre export n’est pas conforme ?",
        "paragraphs": [],
        "bullets": [
          "Testez votre fichier avec le validateur.",
          "Passez par un convertisseur qui produit réellement du PDF/A-3 (Factur-X Facile).",
          "Dans les cas les plus difficiles, régénérez la facture à partir des données."
        ]
      },
      {
        "id": "donnees-et-mise-a-jour",
        "title": "Données et mise à jour",
        "paragraphs": [],
        "bullets": [
          "Jeu de données (CSV): disponible sur demande. PDF de test: téléchargeables sur demande.",
          "Mise à jour prévue: semestrielle, à chaque évolution des spécifications de la facturation électronique.",
          "Pour citer cette étude: nom du site, titre, date, URL."
        ]
      },
      {
        "id": "faq",
        "title": "FAQ",
        "paragraphs": [
          "**Pourquoi tester avec une facture fictive ?** Pour publier les fichiers et permettre la reproduction sans exposer de données réelles.",
          "**L’export PDF de mon logiciel peut-il être conforme PDF/A-3 ?** Certains outils le proposent, d’autres non: voir les résultats.",
          "**Pourquoi veraPDF et pas seulement un validateur Factur-X ?** Parce que veraPDF contrôle le conteneur; voir ce que contrôle un validateur.",
          "**Pouvez-vous tester mon logiciel ?** Écrivez-nous: nous ajouterons les outils demandés lors de la prochaine mise à jour."
        ]
      }
    ]
  },
  {
    "slug": "convertisseur-factur-x-confidentialite-ia",
    "featuredImage": "/assets/blog/convertisseur-factur-x-confidentialite-ia.svg",
    "title": "Convertisseur Factur-X et IA: que deviennent vos factures ?",
    "excerpt": "Votre facture passe-t-elle par une IA ou un serveur étranger, est-elle conservée ? Les questions à poser à tout convertisseur Factur-X, et nos réponses.",
    "category": "Réforme 2026",
    "publishedAt": "18 Octobre 2026",
    "readTime": "6 min de lecture",
    "illustration": "dot-wave",
    "featured": false,
    "author": {
      "name": "Équipe Factur-X Facile",
      "role": "Experts Factur-X & Conformité EN 16931",
      "avatar": "FX"
    },
    "lead": "Une facture contient des noms, des adresses, des identifiants d’entreprise, parfois un IBAN et des montants. Quand vous la déposez dans un convertisseur en ligne, vous la confiez à un service dont vous ne voyez pas le fonctionnement. Beaucoup de convertisseurs utilisent aujourd’hui une **intelligence artificielle** pour lire les factures. Que devient votre fichier ? Voici les questions à poser à n’importe quel outil, et nos réponses. ***Convertir une facture**: Factur-X Facile: voir la page confidentialité pour le détail du traitement.*",
    "sections": [
      {
        "id": "comment-fonctionne-l-extraction-par-ia",
        "title": "Comment fonctionne l’extraction par IA",
        "paragraphs": [
          "Quand vous déposez un PDF, un modèle d’IA lit le texte du document et propose des valeurs (numéro, dates, parties, lignes, totaux). Ces valeurs sont ensuite **vérifiées par du code classique** (identifiants, additions, présence de chaque valeur dans le PDF) puis **confirmées par vous**. L’IA est donc une aide à la saisie, pas un décideur. Elle peut se tromper: c’est pourquoi une vérification humaine reste indispensable (voir XML et PDF qui divergent)."
        ]
      },
      {
        "id": "les-8-questions-a-poser-a-tout-convertisseur",
        "title": "Les 8 questions à poser à tout convertisseur",
        "paragraphs": [],
        "table": {
          "headers": [
            "\\#",
            "Question",
            "Pourquoi elle compte",
            "Notre réponse"
          ],
          "rows": [
            [
              ":----",
              ":----",
              ":----",
              ":----"
            ],
            [
              "1",
              "Mon fichier est-il lu par une IA ? Laquelle ?",
              "Vous devez savoir qui voit vos données",
              "Oui, extraction assistée par Google Cloud Vertex AI (modèle Gemini 1.5 en région UE)."
            ],
            [
              "2",
              "Mes données servent-elles à entraîner un modèle ?",
              "Risque de réutilisation",
              "Non. L’accord d’entreprise Google Cloud garantit l’absence totale d’entraînement sur vos données."
            ],
            [
              "3",
              "Où les données sont-elles traitées ?",
              "Droit applicable, transferts hors UE",
              "En Union Européenne exclusivement (centres de données situés en France et en Allemagne)."
            ],
            [
              "4",
              "Combien de temps le fichier est-il conservé ?",
              "Minimisation",
              "Traitement éphémère en mémoire lors de la conversion. Fichiers conservés uniquement si vous activez l’historique sécurisé."
            ],
            [
              "5",
              "Puis-je supprimer mes données ?",
              "Droit à l’effacement",
              "Oui, suppression définitive immédiate possible en 1 clic depuis votre espace ou sur simple demande."
            ],
            [
              "6",
              "Qui sont les sous-traitants ?",
              "Chaîne de responsabilité",
              "Supabase (base de données UE), Cloudflare (sécurité et CDN), Google Cloud (traitement d’extraction IA UE)."
            ],
            [
              "7",
              "Un accord de sous-traitance (DPA) est-il disponible ?",
              "Obligation RGPD du responsable de traitement",
              "Oui, notre accord de traitement de données conforme à l’article 28 du RGPD est disponible sur demande."
            ],
            [
              "8",
              "Qui est responsable en cas d’erreur d’extraction ?",
              "Vous restez responsable de votre facture",
              "Vous validez chaque champ avant génération. Le contrôle côte à côte évite toute divergence."
            ]
          ]
        }
      },
      {
        "id": "ce-que-disent-les-conditions-des-fournisseurs-d-ia",
        "title": "Ce que disent les conditions des fournisseurs d’IA",
        "paragraphs": [
          "D’après notre lecture des conditions d’utilisation de l’API Gemini de Google: avec l’**offre payante**, les requêtes et les réponses ne sont pas utilisées pour améliorer les produits de Google, mais les entrées peuvent être conservées temporairement pour détecter les abus et respecter des obligations légales. Dans l’Espace économique européen, en Suisse et au Royaume-Uni, ces conditions précisent que seule l’offre payante peut être proposée aux utilisateurs finaux. Les données peuvent être traitées dans plusieurs pays.",
          "Retenez deux choses: **l’offre gratuite d’un fournisseur d’IA n’a pas les mêmes garanties que l’offre payante**, et **un outil qui ne dit pas quel fournisseur il utilise ne peut pas vous renseigner sur le traitement de vos données**."
        ]
      },
      {
        "id": "ce-que-dit-le-rgpd-en-pratique",
        "title": "Ce que dit le RGPD, en pratique",
        "paragraphs": [],
        "bullets": [
          "Les factures contiennent des **données personnelles**: noms de dirigeants et de salariés, adresses, parfois l’IBAN d’un entrepreneur individuel.",
          "**Vous êtes responsable du traitement** des données de vos clients; le convertisseur agit comme **sous-traitant**. Un contrat de sous-traitance est attendu.",
          "Les **transferts hors de l’Union européenne** demandent des garanties.",
          "Faites relire votre situation par un DPO ou un juriste."
        ]
      },
      {
        "id": "les-bonnes-pratiques-cote-utilisateur",
        "title": "Les bonnes pratiques côté utilisateur",
        "paragraphs": [],
        "bullets": [
          "**Testez d’abord avec une facture fictive**.",
          "**Lisez la politique de confidentialité**: fournisseur d’IA, durée de conservation, pays.",
          "**Privilégiez un outil local ou un traitement dans le navigateur** pour les documents sensibles quand c’est possible (voir le comparatif des validateurs).",
          "**Vérifiez la possibilité de supprimer** vos fichiers et votre compte.",
          "**Ne déposez pas de documents qui ne sont pas des factures.**"
        ]
      },
      {
        "id": "ce-que-nous-faisons-et-ce-que-nous-ne-disons-pas",
        "title": "Ce que nous faisons, et ce que nous ne disons pas",
        "paragraphs": [
          "Voici en toute transparence nos engagements concrets sur le traitement de vos factures et données comptables:",
          "**Ce que nous ne promettons pas**: un « zéro stockage » absolu si vous activez l’historique (l’historique est facultatif et conserve vos factures de manière chiffrée pour votre confort), ni un taux d’erreur IA nul. C’est pourquoi chaque donnée extraite est contrôlée par nos règles logiques strictes et soumise à votre validation humaine."
        ],
        "bullets": [
          "Traitement de l’extraction: API Google Cloud Vertex AI Entreprise en Europe, sans réutilisation de vos données.",
          "Conservation: traitement en mémoire vive; stockage du PDF et du XML uniquement si vous activez l’historique dans votre compte.",
          "Hébergement: 100 % hébergé dans l’Union Européenne (Supabase et Cloudflare).",
          "Journalisation: aucun montant, identifiant ou contenu de facture n’est conservé dans les journaux applicatifs.",
          "Contrat de sous-traitance: DPA conforme à l’article 28 du RGPD disponible pour les entreprises et cabinets comptables."
        ]
      },
      {
        "id": "et-si-l-ia-se-trompe",
        "title": "Et si l’IA se trompe ?",
        "paragraphs": [
          "L’IA peut lire un chiffre de travers ou prendre un total pour un autre. Les contrôles automatiques détectent une partie de ces erreurs: valeur absente du PDF, SIREN invalide, additions incohérentes. Ils ne détectent pas un chiffre faux mais cohérent. D’où la vérification **côte à côte** avant toute génération, et la règle: **vous restez responsable du contenu de votre facture**."
        ]
      },
      {
        "id": "faq",
        "title": "FAQ",
        "paragraphs": [
          "**Mon fichier sert-il à entraîner une IA ?** Non, nous utilisons des API Entreprise dédiées avec clause formelle de non-entraînement sur vos données.",
          "**Mes factures sont-elles hébergées en France ?** Nos serveurs et bases de données sont situés exclusivement au sein de l’Union Européenne (France et Allemagne), sous juridiction européenne.",
          "**Combien de temps conservez-vous mes fichiers ?** En mode invité sans compte, les fichiers sont détruits immédiatement après le traitement. Avec un compte, vous contrôlez la durée de conservation dans votre espace personnel.",
          "**Puis-je utiliser votre outil pour des factures de clients (cabinet comptable) ?** Oui, sous réserve d’un contrat de sous-traitance et d’une information claire de vos clients: voir cabinet comptable.",
          "**Existe-t-il un convertisseur sans IA ?** Certains outils utilisent des règles fixes pour l’extraction; ils fonctionnent bien sur des mises en page connues et moins bien sur des factures variées.",
          "**Sources à consulter**: CNIL (cnil.fr); conditions d’utilisation du fournisseur d’IA; politique de confidentialité de chaque outil."
        ]
      }
    ]
  }
]

export function getAllResources(): ResourceArticle[] {
  return RESOURCES_DATA
}

export function getResourceBySlug(slug: string): ResourceArticle | undefined {
  return RESOURCES_DATA.find((r) => r.slug === slug)
}

export function getResourcesByCategory(category: string): ResourceArticle[] {
  if (category === "Tous") return RESOURCES_DATA
  return RESOURCES_DATA.filter((r) => r.category === category)
}

// Matrice de maillage interne officielle (Section 13.6 de la stratégie SEO)
const RELATED_RESOURCES_MAP: Record<string, string[]> = {
  'convertir-facture-word-en-factur-x': [
    'convertir-facture-excel-en-factur-x',
    'pdf-a-3-facture-refusee',
    'envoyer-factur-x-plateforme-agreee',
  ],
  'convertir-facture-excel-en-factur-x': [
    'convertir-facture-word-en-factur-x',
    'erreur-br-co-15',
    'factur-x-plusieurs-taux-tva',
  ],
  'factur-x-xml-pdf-incoherents': [
    'ce-que-controle-un-validateur-factur-x',
    'pdf-a-3-facture-refusee',
    'convertir-facture-word-en-factur-x',
  ],
  'pdf-a-3-facture-refusee': [
    'ce-que-controle-un-validateur-factur-x',
    'etude-exports-pdf-factur-x',
    'convertir-facture-word-en-factur-x',
  ],
  'factur-x-cabinet-comptable': [
    'facture-fournisseur-pdf-simple',
    'envoyer-factur-x-plateforme-agreee',
    'factur-x-micro-entrepreneur',
  ],
  'factur-x-micro-entrepreneur': [
    'avoir-factur-x',
    'envoyer-factur-x-plateforme-agreee',
    'calendrier-facturation-electronique-2026-2027',
  ],
  'avoir-factur-x': [
    'factur-x-plusieurs-taux-tva',
    'erreur-br-co-15',
    'envoyer-factur-x-plateforme-agreee',
  ],
  'factur-x-plusieurs-taux-tva': [
    'avoir-factur-x',
    'erreur-br-co-15',
    'convertir-facture-excel-en-factur-x',
  ],
  'facture-fournisseur-pdf-simple': [
    'envoyer-factur-x-plateforme-agreee',
    'calendrier-facturation-electronique-2026-2027',
    'factur-x-cabinet-comptable',
  ],
  'envoyer-factur-x-plateforme-agreee': [
    'calendrier-facturation-electronique-2026-2027',
    'facture-fournisseur-pdf-simple',
    'factur-x-definition-profils',
  ],
  'erreurs-validation-factur-x': [
    'erreur-br-co-15',
    'erreur-br-fr-12-br-fr-13',
    'ce-que-controle-un-validateur-factur-x',
  ],
  'erreur-br-co-15': [
    'erreurs-validation-factur-x',
    'factur-x-plusieurs-taux-tva',
    'convertir-facture-excel-en-factur-x',
  ],
  'erreur-br-fr-12-br-fr-13': [
    'erreurs-validation-factur-x',
    'envoyer-factur-x-plateforme-agreee',
    'ce-que-controle-un-validateur-factur-x',
  ],
  'ce-que-controle-un-validateur-factur-x': [
    'comparatif-validateurs-factur-x',
    'pdf-a-3-facture-refusee',
    'erreurs-validation-factur-x',
  ],
  'comparatif-validateurs-factur-x': [
    'ce-que-controle-un-validateur-factur-x',
    'convertisseur-factur-x-confidentialite-ia',
    'erreurs-validation-factur-x',
  ],
  'factur-x-definition-profils': [
    'calendrier-facturation-electronique-2026-2027',
    'envoyer-factur-x-plateforme-agreee',
    'ce-que-controle-un-validateur-factur-x',
  ],
  'calendrier-facturation-electronique-2026-2027': [
    'envoyer-factur-x-plateforme-agreee',
    'factur-x-micro-entrepreneur',
    'factur-x-cabinet-comptable',
  ],
  'etude-exports-pdf-factur-x': [
    'pdf-a-3-facture-refusee',
    'ce-que-controle-un-validateur-factur-x',
    'comparatif-validateurs-factur-x',
  ],
  'convertisseur-factur-x-confidentialite-ia': [
    'comparatif-validateurs-factur-x',
    'factur-x-cabinet-comptable',
    'factur-x-xml-pdf-incoherents',
  ],
}

export function getRelatedResources(currentSlug: string, count = 3): ResourceArticle[] {
  const mappedSlugs = RELATED_RESOURCES_MAP[currentSlug]
  if (mappedSlugs && mappedSlugs.length > 0) {
    const matched = mappedSlugs
      .map((slug) => getResourceBySlug(slug))
      .filter((r): r is ResourceArticle => r !== undefined)
    if (matched.length >= count) {
      return matched.slice(0, count)
    }
  }

  const current = getResourceBySlug(currentSlug)
  if (!current) return RESOURCES_DATA.slice(0, count)

  const sameCategory = RESOURCES_DATA.filter(
    (r) => r.slug !== currentSlug && r.category === current.category
  )

  return sameCategory.slice(0, count)
}

export function getFeaturedResources(): ResourceArticle[] {
  return RESOURCES_DATA.filter((r) => r.featured)
}

