# AGENTS.md — Instructions permanentes pour l’agent CLI
## Projet : SME Marsa Maroc — Port d’Agadir — Réf. 12/DEPA/2026

Ce fichier doit être lu comme un **contrat de travail permanent** par tout agent de codage CLI (Codex CLI, Gemini CLI, Claude Code ou équivalent) intervenant sur ce dépôt.

---

## 1. Mission du dépôt

Construire une application web de démonstration professionnelle pour un **Système de Monitoring Énergétique (SME)** des postes électriques du Port d’Agadir.

Le système doit montrer une compréhension sérieuse de :
- l’instrumentation électrique ;
- l’acquisition Modbus TCP/IP ;
- la qualité de données ;
- le management de l’énergie ;
- les IPE ;
- la SER ;
- les alertes ;
- le reporting ;
- la cybersécurité ;
- la traçabilité ;
- la recette.

Le projet n’est pas un simple dashboard de dataviz.

---

## 2. Sources d’autorité

Ordre de priorité :

1. Cahier des charges / CPS et spécification fonctionnelle du projet.
2. Règlement de consultation AOO 12/DEPA/2026.
3. Présent AGENTS.md.
4. Prompt maître du projet.
5. Choix techniques de l’agent.

En cas de conflit :
- ne jamais remplacer une exigence source par une invention ;
- documenter l’écart ;
- préférer une implémentation configurable.

---

## 3. Règle « ne pas inventer »

Sont NON CONFIRMÉS et ne doivent jamais être présentés comme données contractuelles :

- noms exacts des six postes ;
- quantités exactes des compteurs ;
- modèles/marques réels ;
- registres Modbus réels ;
- formules officielles IPE ;
- méthode officielle SER ;
- seuils d’alertes officiels ;
- adresses IP ;
- architecture d’hébergement finale ;
- niveaux SLA ;
- prix.

Toute donnée de démonstration doit porter un indicateur clair :
**Démonstration — à valider DEPA**.

---

## 4. Référence de notation à garder en tête

L’offre technique est structurée autour de quatre grands ensembles :

### Méthodologie
- conformité technique aux exigences ;
- clarté et pertinence de l’approche ;
- prise en compte des références ;
- aucune omission d’une étape substantielle.

### Équipe
Non directement représentée par l’application, mais la documentation du projet doit montrer les rôles nécessaires.

### Solution technique
L’application doit particulièrement matérialiser :
- architecture du SME et protocoles de communication ;
- compatibilité des équipements ;
- moyens techniques de mesure ;
- cybersécurité et fiabilité des données.

### Programme / planning
Le dépôt doit contenir une page projet/planning et une méthodologie visible.

Objectif : l’application doit devenir une **preuve de maturité de l’offre**, pas seulement une maquette.

---

## 5. Stack

Stack cible si aucun dépôt n’existe :

```text
React
TypeScript
Vite
Tailwind CSS
React Router
Recharts
Lucide React
date-fns
Zod
Vitest
```

Utiliser des composants UI accessibles et cohérents.

Éviter :
- dépendances lourdes inutiles ;
- services payants ;
- API externes obligatoires ;
- secrets ;
- code non typé.

---

## 6. Commandes obligatoires

Le projet doit supporter :

```bash
npm install
npm run dev
npm run build
npm run test
```

Avant toute livraison :
```bash
npm run build
npm run test
```

Corriger les erreurs au lieu de les masquer.

---

## 7. Organisation du code

Préférer :

```text
src/
  components/
  pages/
  features/
  data/
  services/
  hooks/
  lib/
  types/
  utils/
```

Séparer :
- UI ;
- métier ;
- données ;
- calculs ;
- mocks ;
- exports.

Ne pas mettre toute l’application dans App.tsx.

---

## 8. Modèle métier minimum

Types à prévoir :

```text
Site
ElectricalPost
MeasurementPoint
Meter
MeasurementDefinition
Measurement
DataQuality
EnergyIndicator
EnergyBaseline
Alert
AlertEvent
User
Role
Permission
AuditEvent
Report
AcceptanceTest
ProjectMilestone
```

---

## 9. Six postes

Créer exactement six postes de démonstration :
P1, P2, P3, P4, P5, P6.

Ils doivent partager la même structure de données mais avoir :
- profils de charge différents ;
- niveaux de consommation différents ;
- quelques anomalies différentes ;
- compteurs différents de démonstration.

Ne pas leur attribuer de noms officiels inventés.

---

## 10. Données énergétiques

Grandeurs possibles de démo :

- énergie active importée ;
- énergie active exportée si utile ;
- puissance active ;
- puissance réactive ;
- tension ;
- courant ;
- fréquence ;
- facteur de puissance.

Chaque mesure doit avoir :
- timestamp de mesure ;
- timestamp de réception ;
- unité ;
- qualité ;
- source.

---

## 11. Qualité de données

Enum recommandé :

```text
GOOD
STALE
MISSING
INVALID
COMM_ERROR
ESTIMATED
```

Ne pas confondre :
- 0 ;
- null ;
- undefined ;
- mesure absente ;
- mesure invalide.

---

## 12. Temps réel simulé

Le temps réel est une simulation.

Exigences :
- intervalle visible ;
- dernière mise à jour ;
- possibilité pause/reprise ;
- évolution stable ;
- simulation seedée ;
- pas de valeur aléatoire qui saute à chaque rerender.

---

## 13. Modbus

Créer une couche de service dédiée :

```text
services/modbusSimulator.ts
```

Elle simule :
- connexion ;
- lecture ;
- timeout ;
- offline ;
- reconnexion ;
- mapping registre ;
- facteur d’échelle.

Ne jamais utiliser de vraies IP ni prétendre communiquer avec Marsa Maroc.

---

## 14. IPE

Les IPE officiels étant à valider :
- utiliser des exemples ;
- afficher la formule ;
- marquer « démo » ;
- historiser la version ;
- rendre le moteur configurable.

Ne pas cacher une formule magique dans le code.

---

## 15. SER

La SER doit être versionnée.

Chaque baseline possède :
- id ;
- version ;
- période de référence ;
- méthode ;
- paramètres ;
- date d’effet ;
- statut ;
- justification.

---

## 16. Alertes

Une alerte doit avoir un vrai cycle :

```text
NEW
ACKNOWLEDGED
IN_PROGRESS
CLOSED
```

Inclure :
- priorité ;
- source ;
- règle ;
- valeur ;
- seuil ;
- timestamps ;
- utilisateur ;
- commentaires ;
- historique.

---

## 17. Dashboard

Le dashboard doit résumer l’état du système, pas seulement afficher des graphes.

Toujours couvrir :
- énergie ;
- puissance ;
- performance ;
- SER ;
- disponibilité ;
- qualité ;
- alertes ;
- communication.

Chaque carte doit avoir une action ou drill-down lorsque pertinent.

---

## 18. Graphiques

Chaque graphique doit :
- avoir un titre ;
- une unité ;
- une légende utile ;
- des tooltips ;
- un état vide ;
- un comportement responsive.

Ne pas afficher trois graphiques différents qui racontent exactement la même chose.

---

## 19. Sécurité

Implémenter dans la démo :

- rôles ;
- permissions ;
- routes protégées ;
- actions conditionnées ;
- journal d’audit ;
- secrets masqués ;
- session de démonstration.

Documenter :
- segmentation OT/IT ;
- limites de Modbus TCP/IP ;
- sauvegarde/restauration ;
- synchronisation horaire.

---

## 20. Audit

Toute action sensible doit produire un événement d’audit simulé :
- modification compteur ;
- IPE ;
- SER ;
- seuil ;
- rôle ;
- utilisateur ;
- clôture alerte.

---

## 21. Reporting

Les rapports doivent être générables depuis les données de l’app.

Implémenter :
- aperçu ;
- CSV ;
- impression/PDF.

Ne pas afficher un bouton « Exporter » qui ne fait rien.

---

## 22. Filtres

Les filtres doivent être cohérents :
- période ;
- poste ;
- compteur ;
- grandeur.

Réutiliser un composant de filtre commun.

---

## 23. Conformité CPS

Créer un fichier :

```text
docs/TRACEABILITY_MATRIX.md
```

Avec colonnes :

```text
Requirement
Source
Implementation
Route
Status
Validation note
```

Créer aussi une page UI équivalente.

---

## 24. Tests de recette

Les quinze tests fonctionnels doivent être représentés et, lorsque possible, simulables.

IDs :
T01 à T15.

Ne pas modifier les IDs.

---

## 25. Méthodologie

La page Projet doit refléter les étapes suivantes :

1. visite/inventaire ;
2. validation liste compteurs ;
3. architecture/adressage ;
4. installation ;
5. Modbus ;
6. plateforme ;
7. intégration existants ;
8. vérification ;
9. essais ;
10. formation ;
11. remise/réception.

Ne supprimer aucune étape.

---

## 26. Planning

Créer un Gantt ou timeline avec :
- phase ;
- début ;
- fin ;
- progression ;
- dépendances ;
- jalons.

Les dates peuvent être fictives et doivent être marquées démonstration.

---

## 27. UX

Principes :
- 3 clics maximum pour atteindre une donnée importante ;
- navigation persistante ;
- breadcrumb ;
- actions primaires visibles ;
- détails via drawer/modal/page ;
- feedback systématique.

---

## 28. Responsive

Tester au minimum :
- 1440 px ;
- 1024 px ;
- 768 px ;
- 390 px.

Pas de sidebar fixe cassée sur mobile.

---

## 29. États UI

Chaque vue de données doit prévoir :
- loading ;
- success ;
- empty ;
- error.

---

## 30. Accessibilité

Minimum :
- aria-label ;
- focus visible ;
- navigation clavier ;
- contraste suffisant ;
- bouton avec texte ou label accessible.

---

## 31. Internationalisation

Interface principale : français.

Structurer les libellés de façon à rendre possible une future traduction.

Ne pas mélanger anglais/français dans l’interface sauf termes techniques normalisés :
- Modbus TCP/IP ;
- Online/Offline si accompagnés d’un libellé compréhensible.

---

## 32. Logos et branding

Ne pas utiliser un logo récupéré sans autorisation dans le dépôt.

Prévoir une zone branding :
**Marsa Maroc — SME Port d’Agadir**
avec icône neutre si aucun asset officiel fourni.

---

## 33. Performance

Éviter :
- rerenders inutiles ;
- datasets énormes dans DOM ;
- graphes avec trop de points.

Agrégation :
- 5 min ;
- 15 min ;
- heure ;
- jour.

---

## 34. Dataset

Créer les données dans :

```text
src/data/demo/
```

Utiliser seed fixe.

Inclure minimum :
- 30 jours ;
- 6 postes ;
- données horaires ou 15 min ;
- plusieurs alertes ;
- plusieurs défauts de communication.

---

## 35. Analyse automatique

Créer un moteur de règles local :

```text
services/insightEngine.ts
```

Exemples :
- dépassement moyenne ;
- dégradation facteur de puissance ;
- hausse consommation ;
- problème disponibilité.

Les insights doivent être explicables.

---

## 36. Calculs énergétiques

Centraliser les calculs :

```text
lib/energyCalculations.ts
```

Tester :
- agrégation ;
- delta ;
- variation % ;
- comparaison baseline ;
- score qualité.

---

## 37. Export

Centraliser :

```text
lib/exportUtils.ts
```

Vérifier :
- encodage UTF-8 ;
- séparateurs ;
- dates ;
- unités ;
- nom de fichier.

---

## 38. Gestion des erreurs

Créer Error Boundary ou mécanisme équivalent.

Les erreurs utilisateur doivent être lisibles.
Pas de stack trace affichée dans l’UI.

---

## 39. Documentation obligatoire

Maintenir :

```text
README.md
AGENTS.md
docs/ARCHITECTURE.md
docs/TRACEABILITY_MATRIX.md
docs/ASSUMPTIONS.md
docs/TEST_PLAN.md
```

---

## 40. README

Le README doit expliquer :
- but ;
- stack ;
- installation ;
- scripts ;
- architecture ;
- comptes/profils de démo ;
- limites ;
- données fictives ;
- déploiement.

---

## 41. ASSUMPTIONS

Dans `docs/ASSUMPTIONS.md`, lister tout ce qui est :
- démonstration ;
- hypothèse ;
- à confirmer ;
- non contractuel.

C’est obligatoire.

---

## 42. Tests

Utiliser Vitest.

Minimum :
- energyCalculations.test.ts ;
- alerts.test.ts ;
- permissions.test.ts ;
- dataQuality.test.ts.

---

## 43. Définition de Done

Une fonctionnalité n’est DONE que si :

- visible ;
- fonctionnelle ;
- responsive ;
- typée ;
- sans erreur console ;
- reliée aux données ;
- testée si logique métier ;
- documentée si hypothèse.

---

## 44. Interdictions

Ne jamais :
- supprimer une fonctionnalité pour gagner du temps sans la documenter ;
- inventer une donnée contractuelle ;
- laisser des boutons morts ;
- mettre « TODO » dans l’interface finale ;
- ignorer les erreurs TypeScript ;
- masquer les erreurs avec `any` partout ;
- utiliser des secrets réels ;
- committer node_modules ;
- présenter des mock data comme données réelles.

---

## 45. Audit final obligatoire

Avant livraison, parcourir chaque route.

Checklist :
- navigation ;
- filtres ;
- formulaires ;
- modales ;
- exports ;
- graphiques ;
- mobile ;
- permissions ;
- alertes ;
- audit ;
- tests ;
- build.

Puis corriger tout problème constaté.

---

## 46. Commande de validation finale

Exécuter :

```bash
npm run test
npm run build
```

Le résultat final doit être un dépôt directement exploitable.

---

## 47. Mode d’exécution recommandé pour l’agent

Quand l’utilisateur demande « améliore », « continue » ou « rends plus riche » :

1. inspecter l’existant ;
2. identifier les écarts par rapport à AGENTS.md ;
3. prioriser les écarts fonctionnels ;
4. corriger ;
5. enrichir l’UX ;
6. tester ;
7. compiler ;
8. résumer exactement les changements.

Ne pas repartir de zéro si une base saine existe.

---

## 48. Priorité de réalisation

Ordre :
1. Shell + navigation
2. Dataset
3. Dashboard
4. Postes
5. Temps réel / Modbus
6. Historique
7. IPE
8. SER
9. Alertes
10. Reporting
11. Qualité
12. Utilisateurs
13. Audit
14. Cyber
15. Architecture
16. Conformité
17. Tests recette
18. Planning
19. Documentation
20. Polish responsive

---

## 49. Résultat attendu

L’application doit permettre, lors d’une présentation, de raconter cette histoire :

> « Le système collecte les données des six postes, contrôle leur qualité et leur fraîcheur, les transforme en indicateurs énergétiques, compare la performance à une référence, détecte les anomalies, permet le traitement des alertes et génère des rapports traçables, tout en assurant les contrôles d’accès, l’audit et la préparation de la recette. »

Si cette histoire n’est pas démontrable en naviguant dans l’application, le projet n’est pas terminé.
