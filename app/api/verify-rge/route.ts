import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const { query } = await request.json();

    if (!query || query.length < 3) {
      return NextResponse.json(
        { error: 'Recherche trop courte' },
        { status: 400 }
      );
    }

    // Vérifier d'abord le cache dans Supabase
    const { data: cachedData } = await supabase
      .from('verified_companies')
      .select('*')
      .or(`siret.eq.${query},company_name.ilike.%${query}%`)
      .single();

    // Si trouvé dans le cache et récent (< 24h), le renvoyer
    if (cachedData) {
      const lastVerified = new Date(cachedData.last_verified_at);
      const now = new Date();
      const hoursDiff = (now.getTime() - lastVerified.getTime()) / (1000 * 60 * 60);

      if (hoursDiff < 24) {
        return NextResponse.json({
          found: true,
          companyName: cachedData.company_name,
          siret: cachedData.siret,
          rgeStatus: cachedData.rge_status as 'valid' | 'expired' | 'not_found',
          validUntil: cachedData.rge_valid_until,
          qualifications: cachedData.rge_qualifications || [],
          trustScore: cachedData.trust_score || calculateTrustScore(cachedData),
        });
      }
    }

    // Sinon, appeler l'API ADEME
    // Note: L'API ADEME nécessite de télécharger le dataset complet
    // Pour le MVP, on va simuler avec des données réalistes
    const rgeData = await fetchRGEData(query);

    if (!rgeData.found) {
      return NextResponse.json({
        found: false,
      });
    }

    // Calculer le trust score
    const trustScore = calculateTrustScore({
      rge_status: rgeData.rgeStatus || null,
      rge_valid_until: rgeData.validUntil || null,
      google_rating: null,
      google_reviews_count: null,
    });

    // Sauvegarder dans le cache
    await supabase.from('verified_companies').upsert({
      siret: rgeData.siret,
      company_name: rgeData.companyName,
      rge_status: rgeData.rgeStatus,
      rge_valid_until: rgeData.validUntil,
      rge_qualifications: rgeData.qualifications,
      trust_score: trustScore,
      last_verified_at: new Date().toISOString(),
    });

    return NextResponse.json({
      found: true,
      companyName: rgeData.companyName,
      siret: rgeData.siret,
      rgeStatus: rgeData.rgeStatus,
      validUntil: rgeData.validUntil,
      qualifications: rgeData.qualifications,
      trustScore,
    });
  } catch (error) {
    console.error('Error verifying RGE:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la vérification' },
      { status: 500 }
    );
  }
}

// Fonction pour récupérer les données RGE (à implémenter avec la vraie API ADEME)
async function fetchRGEData(query: string): Promise<{
  found: boolean;
  companyName?: string;
  siret?: string;
  rgeStatus?: 'valid' | 'expired' | 'not_found';
  validUntil?: string;
  qualifications?: string[];
}> {
  // Pour le MVP, simuler quelques entreprises connues
  // Dans la version finale, il faut télécharger le dataset ADEME et le stocker en DB

  const mockData: Record<string, any> = {
    '12345678901234': {
      found: true,
      companyName: 'Entreprise RGE Exemple',
      siret: '12345678901234',
      rgeStatus: 'valid',
      validUntil: '2026-12-31',
      qualifications: ['Pompes à chaleur', 'Isolation thermique', 'Panneaux solaires'],
    },
    '98765432109876': {
      found: true,
      companyName: 'Installateur Test',
      siret: '98765432109876',
      rgeStatus: 'expired',
      validUntil: '2023-06-30',
      qualifications: ['Pompes à chaleur'],
    },
  };

  // Recherche par SIRET
  if (mockData[query]) {
    return mockData[query];
  }

  // Recherche par nom (simulation)
  const foundByName = Object.values(mockData).find((company: any) =>
    company.companyName.toLowerCase().includes(query.toLowerCase())
  );

  if (foundByName) {
    return foundByName;
  }

  // Non trouvé
  return {
    found: false,
  };

  // IMPLEMENTATION REELLE :
  // 1. Télécharger le dataset ADEME : https://data.ademe.fr/datasets/liste-des-entreprises-rge
  // 2. L'importer dans Supabase dans la table verified_companies
  // 3. Faire une recherche SQL : SELECT * FROM verified_companies WHERE siret = $1 OR company_name ILIKE $2
  // 4. Checker si la date d'expiration est passée pour déterminer le status
}

function calculateTrustScore(data: {
  rge_status: string | null;
  rge_valid_until: string | null;
  google_rating: number | null;
  google_reviews_count: number | null;
}): number {
  let score = 0;

  // RGE valide : +50 points
  if (data.rge_status === 'valid') {
    const validUntil = data.rge_valid_until ? new Date(data.rge_valid_until) : null;
    const now = new Date();

    if (validUntil && validUntil > now) {
      score += 50;

      // Bonus si le RGE est valide pour plus de 6 mois
      const monthsLeft = (validUntil.getTime() - now.getTime()) / (1000 * 60 * 60 * 24 * 30);
      if (monthsLeft > 6) {
        score += 10;
      }
    }
  }

  // Avis Google (si disponibles)
  if (data.google_rating && data.google_reviews_count) {
    // Note : +0 à +30 points selon la note
    score += Math.round((data.google_rating / 5) * 30);

    // Nombre d'avis : +0 à +10 points
    if (data.google_reviews_count > 50) score += 10;
    else if (data.google_reviews_count > 20) score += 5;
  } else {
    // Par défaut, on donne 20 points si pas d'avis (neutre)
    score += 20;
  }

  return Math.min(100, score);
}
