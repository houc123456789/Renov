import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const { projectType, projectSubtype, surface, incomeBracket, isPrimaryResidence } = body;

    if (!projectType || !projectSubtype) {
      return NextResponse.json(
        { error: 'Type de projet manquant' },
        { status: 400 }
      );
    }

    // Récupérer les prix de référence depuis la DB
    const { data: pricingData, error } = await supabase
      .from('pricing_references')
      .select('*')
      .eq('project_type', projectType)
      .eq('project_subtype', projectSubtype)
      .single();

    if (error || !pricingData) {
      return NextResponse.json(
        { error: 'Données de prix non disponibles' },
        { status: 404 }
      );
    }

    // Ajuster les prix selon la surface si pertinent
    let priceLow = pricingData.price_low;
    let priceAvg = pricingData.price_avg;
    let priceHigh = pricingData.price_high;

    // Pour l'isolation, ajuster selon la surface
    if (projectType === 'isolation' && surface) {
      const baseSurface = 100; // Prix de référence pour 100m²
      const ratio = surface / baseSurface;

      priceLow = Math.round(priceLow * ratio);
      priceAvg = Math.round(priceAvg * ratio);
      priceHigh = Math.round(priceHigh * ratio);
    }

    // Calculer les aides potentielles
    const aids = calculateAids(
      projectType,
      projectSubtype,
      priceAvg,
      incomeBracket,
      isPrimaryResidence
    );

    const totalAids = aids.maPrimeRenov + aids.cee + aids.ecoPtz;
    const resteACharge = Math.max(0, priceAvg - totalAids);

    // Calculer les économies annuelles estimées
    const annualSavings = estimateAnnualSavings(projectType, projectSubtype, surface);

    return NextResponse.json({
      pricing: {
        low: priceLow,
        average: priceAvg,
        high: priceHigh,
      },
      aids: {
        maPrimeRenov: aids.maPrimeRenov,
        cee: aids.cee,
        ecoPtz: aids.ecoPtz,
        total: totalAids,
      },
      resteACharge,
      annualSavings,
      paybackYears: annualSavings > 0 ? Math.round(resteACharge / annualSavings) : null,
    });
  } catch (error) {
    console.error('Error in /api/estimate:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}

function calculateAids(
  projectType: string,
  projectSubtype: string,
  averagePrice: number,
  incomeBracket: string | null,
  isPrimaryResidence: boolean | null
): { maPrimeRenov: number; cee: number; ecoPtz: number } {
  let maPrimeRenov = 0;
  let cee = 0;
  const ecoPtz = 0; // Prêt à taux zéro, pas une aide directe

  // MaPrimeRénov 2025 - seulement résidence principale
  if (!isPrimaryResidence) {
    return { maPrimeRenov: 0, cee: 0, ecoPtz };
  }

  // Montants indicatifs MaPrimeRénov 2025
  if (projectType === 'pac') {
    if (projectSubtype === 'Air-Eau') {
      if (incomeBracket === 'tres-modeste') maPrimeRenov = 5000;
      else if (incomeBracket === 'modeste') maPrimeRenov = 4000;
      else if (incomeBracket === 'intermediaire') maPrimeRenov = 3000;
      else maPrimeRenov = 0;
    } else if (projectSubtype === 'Géothermique') {
      if (incomeBracket === 'tres-modeste') maPrimeRenov = 11000;
      else if (incomeBracket === 'modeste') maPrimeRenov = 9000;
      else if (incomeBracket === 'intermediaire') maPrimeRenov = 6000;
      else maPrimeRenov = 0;
    }
  } else if (projectType === 'isolation') {
    // Isolation : environ 25-75€/m² selon revenus
    if (incomeBracket === 'tres-modeste') maPrimeRenov = Math.round(averagePrice * 0.4);
    else if (incomeBracket === 'modeste') maPrimeRenov = Math.round(averagePrice * 0.3);
    else if (incomeBracket === 'intermediaire') maPrimeRenov = Math.round(averagePrice * 0.2);
    else maPrimeRenov = 0;
  } else if (projectType === 'solaire') {
    if (projectSubtype === 'Photovoltaïque') {
      if (incomeBracket === 'tres-modeste') maPrimeRenov = 2500;
      else if (incomeBracket === 'modeste') maPrimeRenov = 2000;
      else if (incomeBracket === 'intermediaire') maPrimeRenov = 1000;
      else maPrimeRenov = 0;
    }
  } else if (projectType === 'chaudiere' && projectSubtype === 'Biomasse') {
    if (incomeBracket === 'tres-modeste') maPrimeRenov = 8000;
    else if (incomeBracket === 'modeste') maPrimeRenov = 6500;
    else if (incomeBracket === 'intermediaire') maPrimeRenov = 4000;
    else maPrimeRenov = 0;
  }

  // CEE (Certificats d'Économies d'Énergie) - environ 10-20% du coût
  cee = Math.round(averagePrice * 0.15);

  return { maPrimeRenov, cee, ecoPtz };
}

function estimateAnnualSavings(
  projectType: string,
  projectSubtype: string,
  surface: number | null
): number {
  // Estimations moyennes d'économies annuelles

  if (projectType === 'pac') {
    if (projectSubtype === 'Air-Eau') return 1200;
    if (projectSubtype === 'Air-Air') return 800;
    if (projectSubtype === 'Géothermique') return 1500;
  }

  if (projectType === 'isolation') {
    const baseSavings = surface ? (surface / 100) * 400 : 400;
    if (projectSubtype === 'Combles') return Math.round(baseSavings * 0.8);
    if (projectSubtype === 'Murs extérieurs') return Math.round(baseSavings * 1.2);
    if (projectSubtype === 'Sol') return Math.round(baseSavings * 0.6);
  }

  if (projectType === 'solaire' && projectSubtype === 'Photovoltaïque') {
    return 600; // Économies + revente
  }

  if (projectType === 'chaudiere' && projectSubtype === 'Biomasse') {
    return 1000;
  }

  return 500; // Valeur par défaut
}
