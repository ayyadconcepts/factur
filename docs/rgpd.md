# RGPD et Historique

Conformément à la réglementation sur la protection des données personnelles (RGPD) et aux obligations de conservation des documents comptables, ce système implémente les principes suivants :

## 1. Principe de minimisation
Les données stockées dans la base de données (Supabase) se limitent strictement aux champs nécessaires à l'identification d'une facture pour faciliter sa recherche (Numéro, Date, Client, SIREN, Montants). 
Le fichier PDF (et son XML embarqué) est stocké de manière sécurisée (privée) sur Cloudflare R2.
L'enregistrement de l'historique est purement OPTIONNEL. Sans consentement explicite ("Enregistrer dans mon historique"), rien n'est stocké.

## 2. Accès et isolation
L'isolation entre les utilisateurs est garantie par les politiques **Row Level Security (RLS)** de PostgreSQL. 
Les téléchargements depuis R2 nécessitent la génération de Signed URLs d'une courte durée de vie (60 secondes), vérifiées par le backend.

## 3. Suppression et conservation (TODO)
// TODO(legal): La suppression d'un compte utilisateur ou l'effacement de ses données via le RGPD peut entrer en conflit avec les obligations légales de conservation des factures (généralement 10 ans en France).
Actuellement, **AUCUNE** suppression automatique de factures ou de fichiers R2 n'est implémentée côté backend en réponse à une demande RGPD, afin de ne pas détruire accidentellement des archives comptables légales. 
Une procédure humaine validée par un juriste doit être mise en place pour purger ces archives à expiration légale.
