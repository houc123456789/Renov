import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validation basique
    if (!body.projectType || !body.firstName || !body.email || !body.phone || !body.postalCode) {
      return NextResponse.json(
        { error: 'Champs obligatoires manquants' },
        { status: 400 }
      );
    }

    // Récupérer la ville depuis le code postal (API Geo Gouv)
    let city = '';
    try {
      const geoResponse = await fetch(
        `https://geo.api.gouv.fr/communes?codePostal=${body.postalCode}&fields=nom&format=json&geometry=centre`
      );
      const geoData = await geoResponse.json();
      if (geoData && geoData.length > 0) {
        city = geoData[0].nom;
      }
    } catch (error) {
      console.error('Error fetching city:', error);
      // Continue même si l'API échoue
    }

    // Récupérer les UTM params et landing page depuis les headers/query
    const utmSource = request.nextUrl.searchParams.get('utm_source') || null;
    const utmMedium = request.nextUrl.searchParams.get('utm_medium') || null;
    const utmCampaign = request.nextUrl.searchParams.get('utm_campaign') || null;
    const referer = request.headers.get('referer') || null;

    // Insérer dans Supabase si disponible
    if (!supabase) {
      // Si pas de Supabase, simuler un ID et continuer
      console.warn('Supabase not configured, skipping database insert');
      const mockLeadId = `mock-${Date.now()}`;

      return NextResponse.json({
        success: true,
        leadId: mockLeadId,
        message: 'Lead enregistré (mode démo)',
      });
    }

    const { data, error } = await supabase
      .from('leads')
      .insert([
        {
          project_type: body.projectType,
          project_subtype: body.projectSubtype || null,
          property_type: body.propertyType || null,
          surface_m2: body.surface || null,
          construction_year: body.constructionYear || null,
          current_heating: body.currentHeating || null,
          postal_code: body.postalCode,
          city: city || null,
          is_owner: body.isOwner !== undefined ? body.isOwner : null,
          is_primary_residence: body.isPrimaryResidence !== undefined ? body.isPrimaryResidence : null,
          income_bracket: body.incomeBracket || null,
          first_name: body.firstName,
          email: body.email,
          phone: body.phone,
          utm_source: utmSource,
          utm_medium: utmMedium,
          utm_campaign: utmCampaign,
          landing_page: referer,
          status: 'new',
        },
      ])
      .select();

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json(
        { error: 'Erreur lors de l\'enregistrement' },
        { status: 500 }
      );
    }

    // Envoyer un email de confirmation (via API Resend)
    try {
      await fetch('/api/email/confirmation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: body.email,
          firstName: body.firstName,
          leadId: data[0].id,
        }),
      });
    } catch (emailError) {
      console.error('Error sending email:', emailError);
      // Continue même si l'email échoue
    }

    return NextResponse.json({
      success: true,
      leadId: data[0].id,
      message: 'Lead enregistré avec succès',
    });
  } catch (error) {
    console.error('Error in /api/leads:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  // Pour récupérer un lead par ID (page résultats)
  const leadId = request.nextUrl.searchParams.get('id');

  if (!leadId) {
    return NextResponse.json({ error: 'ID manquant' }, { status: 400 });
  }

  try {
    // Si c'est un mock lead, retourner des données simulées
    if (leadId.startsWith('mock-')) {
      return NextResponse.json({
        lead: {
          id: leadId,
          project_type: 'pac',
          project_subtype: 'Air-Eau',
          first_name: 'Démo',
          postal_code: '75001',
          surface_m2: 100,
          income_bracket: 'intermediaire',
          is_primary_residence: true,
        },
      });
    }

    if (!supabase) {
      return NextResponse.json({ error: 'Base de données non configurée' }, { status: 503 });
    }

    const { data, error } = await supabase
      .from('leads')
      .select('*')
      .eq('id', leadId)
      .single();

    if (error) {
      return NextResponse.json({ error: 'Lead non trouvé' }, { status: 404 });
    }

    return NextResponse.json({ lead: data });
  } catch (error) {
    console.error('Error fetching lead:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
