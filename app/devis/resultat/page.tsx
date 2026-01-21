'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';

type EstimateData = {
  pricing: {
    low: number;
    average: number;
    high: number;
  };
  aids: {
    maPrimeRenov: number;
    cee: number;
    ecoPtz: number;
    total: number;
  };
  resteACharge: number;
  annualSavings: number;
  paybackYears: number | null;
};

type LeadData = {
  id: string;
  project_type: string;
  project_subtype: string;
  first_name: string;
  postal_code: string;
  surface_m2: number | null;
  income_bracket: string | null;
  is_primary_residence: boolean | null;
};

export default function ResultatPage() {
  const searchParams = useSearchParams();
  const leadId = searchParams.get('id');

  const [loading, setLoading] = useState(true);
  const [leadData, setLeadData] = useState<LeadData | null>(null);
  const [estimate, setEstimate] = useState<EstimateData | null>(null);

  useEffect(() => {
    if (!leadId) {
      window.location.href = '/devis';
      return;
    }

    const fetchData = async () => {
      try {
        // Récupérer les données du lead
        const leadResponse = await fetch(`/api/leads?id=${leadId}`);
        const leadResult = await leadResponse.json();

        if (!leadResult.lead) {
          window.location.href = '/devis';
          return;
        }

        setLeadData(leadResult.lead);

        // Calculer l'estimation
        const estimateResponse = await fetch('/api/estimate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            projectType: leadResult.lead.project_type,
            projectSubtype: leadResult.lead.project_subtype,
            surface: leadResult.lead.surface_m2,
            incomeBracket: leadResult.lead.income_bracket,
            isPrimaryResidence: leadResult.lead.is_primary_residence,
          }),
        });

        const estimateResult = await estimateResponse.json();
        setEstimate(estimateResult);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [leadId]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
      maximumFractionDigits: 0,
    }).format(price);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Header />
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-accent-green mx-auto mb-4"></div>
          <p className="text-text-secondary">Calcul de votre estimation...</p>
        </div>
      </div>
    );
  }

  if (!leadData || !estimate) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Header />
        <div className="text-center">
          <p className="text-text-secondary">Erreur lors du chargement des données</p>
          <Link href="/devis" className="mt-4 inline-block">
            <Button variant="primary">Refaire une demande</Button>
          </Link>
        </div>
      </div>
    );
  }

  const projectTypeLabels: Record<string, string> = {
    pac: 'Pompe à chaleur',
    isolation: 'Isolation',
    solaire: 'Panneaux solaires',
    chaudiere: 'Chaudière',
  };

  return (
    <div className="min-h-screen">
      <Header />

      <main className="pt-20 pb-20">
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-5xl mx-auto">
            {/* Hero Success */}
            <div className="text-center mb-12">
              <div className="w-20 h-20 rounded-full bg-accent-green-dim border-2 border-accent-green flex items-center justify-center mx-auto mb-6">
                <svg className="w-10 h-10 text-accent-green" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                  <path d="M5 13l4 4L19 7"></path>
                </svg>
              </div>

              <h1 className="font-heading text-4xl md:text-5xl font-bold mb-4">
                Merci {leadData.first_name} ! 🎉
              </h1>

              <p className="text-lg text-text-secondary mb-6">
                Votre demande a bien été enregistrée. Voici votre estimation personnalisée pour votre projet de{' '}
                <strong className="text-text-primary">
                  {projectTypeLabels[leadData.project_type]} - {leadData.project_subtype}
                </strong>
              </p>

              <Badge variant="green">
                ✓ 2 entreprises certifiées RGE vous contacteront sous 24-48h
              </Badge>
            </div>

            {/* Estimation principale */}
            <Card className="mb-8 bg-gradient-to-br from-bg-secondary to-bg-tertiary border-accent-green/30">
              <div className="text-center mb-6">
                <h2 className="font-heading text-2xl font-bold mb-2">
                  Estimation de prix
                </h2>
                <p className="text-text-secondary text-sm">
                  Basée sur l'analyse de 3 247 devis réels
                </p>
              </div>

              <div className="grid md:grid-cols-3 gap-6 mb-6">
                <div className="text-center p-4 bg-bg-primary rounded-xl">
                  <div className="text-text-secondary text-sm mb-1">Prix minimum</div>
                  <div className="font-heading text-2xl font-bold">
                    {formatPrice(estimate.pricing.low)}
                  </div>
                </div>

                <div className="text-center p-4 bg-accent-green-dim rounded-xl border-2 border-accent-green">
                  <div className="text-accent-green text-sm mb-1 font-semibold">Prix moyen</div>
                  <div className="font-heading text-3xl font-bold text-accent-green">
                    {formatPrice(estimate.pricing.average)}
                  </div>
                </div>

                <div className="text-center p-4 bg-bg-primary rounded-xl">
                  <div className="text-text-secondary text-sm mb-1">Prix maximum</div>
                  <div className="font-heading text-2xl font-bold">
                    {formatPrice(estimate.pricing.high)}
                  </div>
                </div>
              </div>

              {/* Barre de positionnement */}
              <div className="mb-4">
                <div className="h-3 bg-bg-primary rounded-full overflow-hidden relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-accent-green via-yellow-400 to-accent-red"></div>
                  <div
                    className="absolute top-0 h-full w-1 bg-text-primary shadow-lg"
                    style={{ left: '50%', transform: 'translateX(-50%)' }}
                  ></div>
                </div>
                <div className="flex justify-between text-xs text-text-muted mt-2">
                  <span>Prix bas</span>
                  <span className="font-semibold text-text-primary">Estimation moyenne</span>
                  <span>Prix élevé</span>
                </div>
              </div>
            </Card>

            {/* Aides disponibles */}
            {estimate.aids.total > 0 && (
              <Card className="mb-8">
                <h2 className="font-heading text-2xl font-bold mb-6">
                  💰 Aides financières disponibles
                </h2>

                <div className="space-y-4 mb-6">
                  {estimate.aids.maPrimeRenov > 0 && (
                    <div className="flex justify-between items-center p-4 bg-bg-primary rounded-xl">
                      <div>
                        <div className="font-semibold">MaPrimeRénov</div>
                        <div className="text-text-secondary text-sm">
                          Aide de l'État pour la rénovation énergétique
                        </div>
                      </div>
                      <div className="font-heading text-xl font-bold text-accent-green">
                        {formatPrice(estimate.aids.maPrimeRenov)}
                      </div>
                    </div>
                  )}

                  {estimate.aids.cee > 0 && (
                    <div className="flex justify-between items-center p-4 bg-bg-primary rounded-xl">
                      <div>
                        <div className="font-semibold">CEE (Certificats d'Économies d'Énergie)</div>
                        <div className="text-text-secondary text-sm">
                          Prime énergie versée par les fournisseurs
                        </div>
                      </div>
                      <div className="font-heading text-xl font-bold text-accent-green">
                        {formatPrice(estimate.aids.cee)}
                      </div>
                    </div>
                  )}

                  <div className="flex justify-between items-center p-4 bg-bg-primary rounded-xl">
                    <div>
                      <div className="font-semibold">Éco-PTZ</div>
                      <div className="text-text-secondary text-sm">
                        Prêt à taux zéro jusqu'à 50 000€
                      </div>
                    </div>
                    <div className="font-heading text-sm text-text-secondary">
                      Disponible
                    </div>
                  </div>
                </div>

                <div className="border-t border-border pt-4">
                  <div className="flex justify-between items-center">
                    <div className="font-heading text-lg font-semibold">Total des aides</div>
                    <div className="font-heading text-2xl font-bold text-accent-green">
                      {formatPrice(estimate.aids.total)}
                    </div>
                  </div>
                </div>
              </Card>
            )}

            {/* Reste à charge */}
            <Card className="mb-8 bg-accent-green-dim border-accent-green/50">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-heading text-xl font-bold mb-2">
                    Votre reste à charge estimé
                  </h3>
                  <p className="text-text-secondary text-sm">
                    Après déduction des aides financières
                  </p>
                </div>
                <div className="font-heading text-4xl font-bold text-accent-green">
                  {formatPrice(estimate.resteACharge)}
                </div>
              </div>
            </Card>

            {/* Économies annuelles */}
            <Card className="mb-8">
              <h2 className="font-heading text-2xl font-bold mb-6">
                📊 Rentabilité de votre projet
              </h2>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="p-4 bg-bg-primary rounded-xl">
                  <div className="text-text-secondary text-sm mb-2">Économies annuelles estimées</div>
                  <div className="font-heading text-3xl font-bold text-accent-green">
                    {formatPrice(estimate.annualSavings)}
                    <span className="text-base text-text-secondary">/an</span>
                  </div>
                  <div className="text-text-muted text-xs mt-2">
                    Sur votre facture énergétique
                  </div>
                </div>

                {estimate.paybackYears && (
                  <div className="p-4 bg-bg-primary rounded-xl">
                    <div className="text-text-secondary text-sm mb-2">Retour sur investissement</div>
                    <div className="font-heading text-3xl font-bold">
                      {estimate.paybackYears}
                      <span className="text-base text-text-secondary"> ans</span>
                    </div>
                    <div className="text-text-muted text-xs mt-2">
                      Durée d'amortissement estimée
                    </div>
                  </div>
                )}
              </div>
            </Card>

            {/* Prochaines étapes */}
            <Card className="mb-8">
              <h2 className="font-heading text-2xl font-bold mb-6">
                🎯 Prochaines étapes
              </h2>

              <div className="space-y-4">
                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 rounded-full bg-accent-green-dim border-2 border-accent-green flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-accent-green font-bold text-sm">1</span>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1">Email de confirmation envoyé</h4>
                    <p className="text-text-secondary text-sm">
                      Vous avez reçu un récapitulatif de votre demande par email
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 rounded-full bg-accent-green-dim border-2 border-accent-green flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-accent-green font-bold text-sm">2</span>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1">Vérification des entreprises en cours</h4>
                    <p className="text-text-secondary text-sm">
                      Nous analysons les entreprises RGE de votre secteur ({leadData.postal_code})
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 rounded-full bg-accent-green-dim border-2 border-accent-green flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-accent-green font-bold text-sm">3</span>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1">Contact sous 24-48h</h4>
                    <p className="text-text-secondary text-sm">
                      <strong>Maximum 2 entreprises</strong> vous contacteront pour établir un devis détaillé gratuit
                    </p>
                  </div>
                </div>
              </div>
            </Card>

            {/* Ressources utiles */}
            <div className="grid md:grid-cols-2 gap-6 mb-8">
              <Card hover>
                <h3 className="font-heading text-lg font-semibold mb-3">
                  📚 Questions à poser à l'installateur
                </h3>
                <p className="text-text-secondary text-sm mb-4">
                  Notre checklist complète pour ne rien oublier lors du rendez-vous
                </p>
                <Link href="/guide/questions-installateur" className="text-accent-green hover:underline text-sm inline-flex items-center">
                  Lire le guide
                  <svg className="ml-1 w-4 h-4" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                    <path d="M13 7l5 5m0 0l-5 5m5-5H6"></path>
                  </svg>
                </Link>
              </Card>

              <Card hover>
                <h3 className="font-heading text-lg font-semibold mb-3">
                  🔍 Vérifier une entreprise
                </h3>
                <p className="text-text-secondary text-sm mb-4">
                  Contrôlez le certificat RGE et les avis avant de signer
                </p>
                <Link href="/verifier-entreprise" className="text-accent-green hover:underline text-sm inline-flex items-center">
                  Accéder à l'outil
                  <svg className="ml-1 w-4 h-4" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                    <path d="M13 7l5 5m0 0l-5 5m5-5H6"></path>
                  </svg>
                </Link>
              </Card>
            </div>

            {/* CTA Final */}
            <Card className="bg-gradient-to-br from-bg-secondary to-bg-tertiary border-accent-green/30 text-center">
              <div className="max-w-2xl mx-auto">
                <h3 className="font-heading text-2xl font-bold mb-4">
                  Besoin d'aide ou de conseils ?
                </h3>
                <p className="text-text-secondary mb-6">
                  Notre équipe est disponible pour répondre à vos questions sur votre projet de rénovation
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link href="/guide">
                    <Button variant="secondary">
                      Consulter nos guides
                    </Button>
                  </Link>
                  <a href="mailto:contact@verifrenov.fr">
                    <Button variant="primary">
                      Nous contacter
                    </Button>
                  </a>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
