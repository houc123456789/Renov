'use client';

import { useState } from 'react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';

type VerificationResult = {
  found: boolean;
  companyName?: string;
  siret?: string;
  rgeStatus?: 'valid' | 'expired' | 'not_found';
  validUntil?: string;
  qualifications?: string[];
  trustScore?: number;
};

export default function VerifierEntreprisePage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<VerificationResult | null>(null);
  const [error, setError] = useState('');

  const handleSearch = async () => {
    if (!searchQuery || searchQuery.length < 3) {
      setError('Veuillez entrer un nom d\'entreprise ou un SIRET');
      return;
    }

    setLoading(true);
    setError('');
    setResult(null);

    try {
      const response = await fetch('/api/verify-rge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: searchQuery }),
      });

      const data = await response.json();

      if (response.ok) {
        setResult(data);
      } else {
        setError(data.error || 'Erreur lors de la vérification');
      }
    } catch (err) {
      setError('Erreur de connexion. Veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen">
      <Header />

      <main className="pt-20 pb-20">
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-4xl mx-auto">
            {/* Hero */}
            <div className="text-center mb-12">
              <Badge variant="green" className="mb-4">
                🔍 Outil gratuit
              </Badge>

              <h1 className="font-heading text-4xl md:text-5xl font-bold mb-4">
                Vérifier une entreprise RGE
              </h1>

              <p className="text-lg text-text-secondary max-w-2xl mx-auto">
                Contrôlez le certificat RGE d'un installateur avant de signer.
                Détectez les faux labels et les entreprises non qualifiées.
              </p>
            </div>

            {/* Search Form */}
            <Card className="mb-8">
              <h2 className="font-heading text-xl font-semibold mb-4">
                Rechercher une entreprise
              </h2>

              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  type="text"
                  className="flex-1 px-4 py-3 bg-bg-primary border border-border rounded-xl focus:border-accent-green focus:outline-none focus:ring-2 focus:ring-accent-green/20"
                  placeholder="Nom de l'entreprise ou numéro SIRET"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                />
                <Button
                  variant="primary"
                  onClick={handleSearch}
                  disabled={loading}
                  className="sm:w-auto"
                >
                  {loading ? 'Vérification...' : 'Vérifier'}
                </Button>
              </div>

              {error && (
                <p className="text-accent-red text-sm mt-3">{error}</p>
              )}

              <p className="text-text-muted text-xs mt-3">
                Données officielles de l'ADEME • Mise à jour quotidienne
              </p>
            </Card>

            {/* Results */}
            {result && (
              <div className="space-y-6">
                {result.found ? (
                  <>
                    {/* Company Info */}
                    <Card>
                      <div className="flex items-start justify-between mb-6">
                        <div>
                          <h3 className="font-heading text-2xl font-bold mb-2">
                            {result.companyName}
                          </h3>
                          <p className="text-text-secondary">SIRET : {result.siret}</p>
                        </div>

                        {result.rgeStatus === 'valid' && (
                          <Badge variant="green" className="text-lg">
                            ✓ RGE Valide
                          </Badge>
                        )}
                        {result.rgeStatus === 'expired' && (
                          <Badge variant="red" className="text-lg">
                            ⚠️ RGE Expiré
                          </Badge>
                        )}
                        {result.rgeStatus === 'not_found' && (
                          <Badge variant="red" className="text-lg">
                            ❌ Pas de RGE
                          </Badge>
                        )}
                      </div>

                      {result.rgeStatus === 'valid' && result.validUntil && (
                        <div className="p-4 bg-accent-green-dim border border-accent-green/30 rounded-xl mb-4">
                          <p className="text-sm">
                            <strong>Certificat valide jusqu'au :</strong>{' '}
                            {new Date(result.validUntil).toLocaleDateString('fr-FR', {
                              day: 'numeric',
                              month: 'long',
                              year: 'numeric',
                            })}
                          </p>
                        </div>
                      )}

                      {result.rgeStatus === 'expired' && (
                        <div className="p-4 bg-accent-red-dim border border-accent-red/30 rounded-xl mb-4">
                          <p className="text-sm text-accent-red">
                            <strong>⚠️ Attention :</strong> Le certificat RGE de cette entreprise a expiré le{' '}
                            {result.validUntil &&
                              new Date(result.validUntil).toLocaleDateString('fr-FR', {
                                day: 'numeric',
                                month: 'long',
                                year: 'numeric',
                              })}
                            . Sans RGE valide, vous ne pourrez pas bénéficier des aides MaPrimeRénov et CEE.
                          </p>
                        </div>
                      )}

                      {result.qualifications && result.qualifications.length > 0 && (
                        <div>
                          <h4 className="font-heading font-semibold mb-3">
                            Domaines de qualification :
                          </h4>
                          <div className="flex flex-wrap gap-2">
                            {result.qualifications.map((qual, index) => (
                              <Badge key={index} variant="neutral">
                                {qual}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </Card>

                    {/* Trust Score */}
                    {result.trustScore !== undefined && (
                      <Card>
                        <h3 className="font-heading text-xl font-semibold mb-4">
                          Score de confiance VerifRenov
                        </h3>

                        <div className="flex items-center mb-4">
                          <div className="flex-1">
                            <div className="h-4 bg-bg-primary rounded-full overflow-hidden">
                              <div
                                className={`h-full transition-all ${
                                  result.trustScore >= 70
                                    ? 'bg-accent-green'
                                    : result.trustScore >= 40
                                    ? 'bg-yellow-400'
                                    : 'bg-accent-red'
                                }`}
                                style={{ width: `${result.trustScore}%` }}
                              ></div>
                            </div>
                          </div>
                          <div className="ml-4 font-heading text-3xl font-bold">
                            {result.trustScore}
                            <span className="text-base text-text-secondary">/100</span>
                          </div>
                        </div>

                        <div className="space-y-2 text-sm text-text-secondary">
                          <p>
                            ✓ Certificat RGE{' '}
                            {result.rgeStatus === 'valid' ? 'valide' : 'invalide ou expiré'}
                          </p>
                          <p>✓ Avis clients analysés</p>
                          <p>✓ Ancienneté vérifiée</p>
                          <p>✓ Aucun signalement détecté</p>
                        </div>

                        {result.trustScore < 70 && (
                          <div className="mt-4 p-3 bg-accent-red-dim border border-accent-red/30 rounded-xl">
                            <p className="text-sm text-accent-red">
                              <strong>⚠️ Prudence recommandée</strong> : Cette entreprise présente
                              des éléments qui nécessitent une attention particulière.
                            </p>
                          </div>
                        )}
                      </Card>
                    )}

                    {/* Recommendations */}
                    <Card className="bg-bg-secondary">
                      <h3 className="font-heading text-xl font-semibold mb-4">
                        💡 Nos recommandations
                      </h3>

                      <ul className="space-y-3 text-sm text-text-secondary">
                        <li className="flex items-start space-x-3">
                          <span className="text-accent-green mt-0.5">✓</span>
                          <span>
                            Demandez systématiquement une copie du certificat RGE lors du rendez-vous
                          </span>
                        </li>
                        <li className="flex items-start space-x-3">
                          <span className="text-accent-green mt-0.5">✓</span>
                          <span>
                            Vérifiez que les qualifications correspondent à vos travaux
                          </span>
                        </li>
                        <li className="flex items-start space-x-3">
                          <span className="text-accent-green mt-0.5">✓</span>
                          <span>Ne signez jamais le jour même, prenez le temps de comparer</span>
                        </li>
                        <li className="flex items-start space-x-3">
                          <span className="text-accent-green mt-0.5">✓</span>
                          <span>Méfiez-vous des offres "trop belles pour être vraies"</span>
                        </li>
                      </ul>
                    </Card>
                  </>
                ) : (
                  <Card>
                    <div className="text-center py-8">
                      <div className="text-6xl mb-4">🔍</div>
                      <h3 className="font-heading text-xl font-semibold mb-2">
                        Entreprise non trouvée
                      </h3>
                      <p className="text-text-secondary mb-6">
                        Aucune entreprise ne correspond à votre recherche dans la base RGE de
                        l'ADEME.
                      </p>

                      <div className="p-4 bg-accent-red-dim border border-accent-red/30 rounded-xl max-w-md mx-auto">
                        <p className="text-sm text-accent-red">
                          <strong>⚠️ Attention :</strong> Si une entreprise prétend être
                          certifiée RGE mais n'apparaît pas dans cette base, c'est un signal
                          d'alerte. Ne signez rien et vérifiez directement sur le site de
                          l'ADEME.
                        </p>
                      </div>
                    </div>
                  </Card>
                )}
              </div>
            )}

            {/* Info Section */}
            {!result && (
              <div className="grid md:grid-cols-2 gap-6">
                <Card hover>
                  <div className="text-3xl mb-3">🎓</div>
                  <h3 className="font-heading text-lg font-semibold mb-2">
                    C'est quoi le label RGE ?
                  </h3>
                  <p className="text-text-secondary text-sm">
                    "Reconnu Garant de l'Environnement" : certification obligatoire pour
                    bénéficier des aides MaPrimeRénov, CEE et éco-PTZ.
                  </p>
                </Card>

                <Card hover>
                  <div className="text-3xl mb-3">⚠️</div>
                  <h3 className="font-heading text-lg font-semibold mb-2">
                    Pourquoi vérifier ?
                  </h3>
                  <p className="text-text-secondary text-sm">
                    Des entreprises utilisent de faux certificats RGE ou des certificats
                    expirés. Sans RGE valide, vous perdez vos aides (jusqu'à 10 000€).
                  </p>
                </Card>

                <Card hover>
                  <div className="text-3xl mb-3">📋</div>
                  <h3 className="font-heading text-lg font-semibold mb-2">
                    Vérification officielle
                  </h3>
                  <p className="text-text-secondary text-sm">
                    Nos données proviennent directement de l'ADEME et sont mises à jour
                    quotidiennement. C'est la source officielle de référence.
                  </p>
                </Card>

                <Card hover>
                  <div className="text-3xl mb-3">🛡️</div>
                  <h3 className="font-heading text-lg font-semibold mb-2">Protection totale</h3>
                  <p className="text-text-secondary text-sm">
                    En plus du RGE, notre score analyse les avis, l'ancienneté et les
                    éventuels signalements pour vous protéger au maximum.
                  </p>
                </Card>
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
