/**
 * MOTEUR D'ANALYSE AUTOMATIQUE ET D'INSIGHTS LOCAUX
 * SME Marsa Maroc — Port d'Agadir (Réf. 12/DEPA/2026)
 * Moteur basé sur des règles déterministes locales (sans IA externe)
 */

import { DEMO_SUBSTATIONS } from '../data/demo/substationsData';
import { DEMO_DAILY_RECORDS } from '../data/demo/timeSeriesData';
import { AutomaticInsight } from '../types';

export function generateAutomatedInsights(): AutomaticInsight[] {
  const insights: AutomaticInsight[] = [];
  const now = new Date().toISOString();

  // Règle 1 : Détection de dégradation du facteur de puissance (ONEE cos phi < 0.90)
  const lowPfSubstations = DEMO_SUBSTATIONS.filter((s) => s.powerFactor < 0.90);
  lowPfSubstations.forEach((sub) => {
    insights.push({
      id: `INS-PF-${sub.id}`,
      type: 'WARNING',
      title: `Facteur de puissance sous le seuil contractuel (${sub.code})`,
      description: `Le facteur de puissance moyen du ${sub.name} est mesuré à ${sub.powerFactor.toFixed(3)}, inférieur au seuil contractuel de 0.90. Risque de pénalité de dépassement d'énergie réactive sur la facture ONEE.`,
      substationId: sub.id,
      metric: 'Cosinus Phi',
      deltaPercent: Math.round(((sub.powerFactor - 0.90) / 0.90) * 1000) / 10,
      actionRecommendation: 'Enclencher manuellement ou vérifier le gradin automatique de la batterie de condensateurs.',
      timestamp: now,
    });
  });

  // Règle 2 : Détection des incidents de communication récents
  const commLostSubstations = DEMO_SUBSTATIONS.filter((s) => s.status === 'COMM_LOST');
  if (commLostSubstations.length > 0) {
    insights.push({
      id: 'INS-COMM-INCIDENT',
      type: 'CRITICAL',
      title: `${commLostSubstations.length} poste(s) en perte de communication Modbus TCP`,
      description: `Aucune réponse socket depuis plus de 6 minutes sur ${commLostSubstations.map((s) => s.code).join(', ')}. Les index d’énergie ne sont plus télé-relevés en direct.`,
      metric: 'Disponibilité Réseau OT',
      actionRecommendation: 'Vérifier la liaison optique inter-postes et l’état du switch industriel de quai.',
      timestamp: now,
    });
  }

  // Règle 3 : Comparaison consommation réelle vs SER sur les 7 derniers jours
  const last7DaysRecords = DEMO_DAILY_RECORDS.slice(-42); // 7 jours * 6 postes
  const totalActual7d = last7DaysRecords.reduce((acc, r) => acc + r.activeEnergyKwh, 0);
  const totalSer7d = last7DaysRecords.reduce((acc, r) => acc + r.serBaselineKwh, 0);
  const deltaPercent7d = Math.round(((totalActual7d - totalSer7d) / totalSer7d) * 1000) / 10;

  if (deltaPercent7d <= 0) {
    insights.push({
      id: 'INS-SER-FAVORABLE',
      type: 'POSITIVE',
      title: `Performance globale favorable vs Référence SER (-${Math.abs(deltaPercent7d)}%)`,
      description: `Sur les 7 derniers jours, l’ensemble des postes a consommé ${Math.abs(deltaPercent7d)}% de moins que la baseline SER normalisée, représentant environ ${Math.round((totalSer7d - totalActual7d) * 1.15).toLocaleString('fr-FR')} MAD d’économies estimées.`,
      metric: 'Écart SER 7 jours',
      deltaPercent: deltaPercent7d,
      actionRecommendation: 'Maintenir les consignes d’optimisation des auxiliaires à quai et de modulation d’éclairage.',
      timestamp: now,
    });
  } else {
    insights.push({
      id: 'INS-SER-UNFAVORABLE',
      type: 'WARNING',
      title: `Surconsommation modérée vs Référence SER (+${deltaPercent7d}%)`,
      description: `Consommation consolidée supérieure de ${deltaPercent7d}% à la situation de référence SER ISO 50001 sur la semaine écoulée.`,
      metric: 'Écart SER 7 jours',
      deltaPercent: deltaPercent7d,
      actionRecommendation: 'Vérifier les pointages de navires et contrôler les marches à vide des convoyeurs vrac.',
      timestamp: now,
    });
  }

  // Règle 4 : Détection de surconsommation spécifique sur le Poste P3 (convoyeurs vrac)
  const p3Records = DEMO_DAILY_RECORDS.filter((r) => r.substationId === 'P3');
  if (p3Records.length >= 7) {
    const avgRecentP3 = p3Records.slice(-7).reduce((acc, r) => acc + r.activeEnergyKwh, 0) / 7;
    const avgPrevP3 = p3Records.slice(0, 7).reduce((acc, r) => acc + r.activeEnergyKwh, 0) / 7;
    const p3Growth = Math.round(((avgRecentP3 - avgPrevP3) / avgPrevP3) * 1000) / 10;

    if (p3Growth > 5) {
      insights.push({
        id: 'INS-P3-SURGE',
        type: 'INFO',
        title: `Hausse de charge sur Poste P3 Silos & Vrac (+${p3Growth}%)`,
        description: `La consommation moyenne du Poste P3 a augmenté de ${p3Growth}% par rapport au début de période, en cohérence avec le pic de déchargement céréalier au quai Ouest.`,
        substationId: 'P3',
        metric: 'Consommation Vrac',
        deltaPercent: p3Growth,
        actionRecommendation: 'Superviser les heures de pointe tarifaires ONEE pour différer les opérations non critiques.',
        timestamp: now,
      });
    }
  }

  return insights;
}
