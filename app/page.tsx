import Link from 'next/link';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';

export default function Home() {
  return (
    <div className="min-h-screen">
      <Header />

      <main className="pt-20">
        {/* Hero Section */}
        <section className="container mx-auto px-4 py-20 md:py-32">
          <div className="max-w-5xl mx-auto text-center">
            <Badge variant="green" className="mb-6 animate-fade-in-up">
              <span className="mr-2">🛡️</span> 847 arnaques détectées ce mois
            </Badge>

            <h1 className="font-heading text-4xl md:text-6xl lg:text-7xl font-bold mb-6 animate-fade-in-up text-balance">
              Rénovez votre logement{' '}
              <span className="text-accent-green">sans vous faire arnaquer</span>
            </h1>

            <p className="text-lg md:text-xl text-text-secondary mb-10 max-w-3xl mx-auto animate-fade-in-up text-balance">
              Obtenez les <strong className="text-text-primary">vrais prix du marché</strong> AVANT de donner vos coordonnées.
              Maximum <strong className="text-accent-green">2 entreprises certifiées</strong> vous contactent. Zéro spam, 100% transparent.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in-up">
              <Link href="/devis">
                <Button variant="primary" size="lg" className="w-full sm:w-auto">
                  Obtenir mon devis gratuit
                  <svg className="ml-2 w-5 h-5" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                    <path d="M13 7l5 5m0 0l-5 5m5-5H6"></path>
                  </svg>
                </Button>
              </Link>
              <Link href="/verifier-entreprise">
                <Button variant="secondary" size="lg" className="w-full sm:w-auto">
                  Vérifier une entreprise
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Stats Bar */}
        <section className="border-y border-border bg-bg-secondary/50 backdrop-blur">
          <div className="container mx-auto px-4 py-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
              <div>
                <div className="text-4xl font-heading font-bold text-accent-green mb-2">1 247</div>
                <div className="text-text-secondary">Entreprises analysées</div>
              </div>
              <div>
                <div className="text-4xl font-heading font-bold text-accent-green mb-2">385</div>
                <div className="text-text-secondary">Pros certifiés RGE</div>
              </div>
              <div>
                <div className="text-4xl font-heading font-bold text-accent-green mb-2">2 max</div>
                <div className="text-text-secondary">Entreprises qui vous contactent</div>
              </div>
            </div>
          </div>
        </section>

        {/* Arnaques Section */}
        <section className="container mx-auto px-4 py-20">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <Badge variant="red" className="mb-4">
                ⚠️ Vigilance
              </Badge>
              <h2 className="font-heading text-3xl md:text-5xl font-bold mb-4">
                Les arnaques les plus courantes
              </h2>
              <p className="text-text-secondary text-lg">
                Nous les détectons pour vous protéger
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              <Card hover>
                <div className="text-4xl mb-4">📞</div>
                <h3 className="font-heading text-xl font-semibold mb-3">Démarchage abusif</h3>
                <p className="text-text-secondary mb-4">
                  10+ entreprises vous harcèlent après une simple demande de devis. Vos coordonnées vendues à des dizaines d'installateurs.
                </p>
                <Badge variant="red">Très fréquent</Badge>
              </Card>

              <Card hover>
                <div className="text-4xl mb-4">🎭</div>
                <h3 className="font-heading text-xl font-semibold mb-3">Faux labels RGE</h3>
                <p className="text-text-secondary mb-4">
                  Entreprises se prétendant certifiées RGE avec des faux documents. Vous perdez vos aides et la garantie qualité.
                </p>
                <Badge variant="red">Dangereux</Badge>
              </Card>

              <Card hover>
                <div className="text-4xl mb-4">💰</div>
                <h3 className="font-heading text-xl font-semibold mb-3">Prix gonflés</h3>
                <p className="text-text-secondary mb-4">
                  Devis 2 à 3 fois supérieurs au prix du marché. Vous payez 25 000€ pour des travaux valant 12 000€.
                </p>
                <Badge variant="red">Très fréquent</Badge>
              </Card>
            </div>

            <div className="mt-10 text-center">
              <Link href="/guide/arnaque-pompe-a-chaleur" className="text-accent-green hover:underline inline-flex items-center">
                Lire notre guide complet sur les arnaques
                <svg className="ml-2 w-4 h-4" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                  <path d="M13 7l5 5m0 0l-5 5m5-5H6"></path>
                </svg>
              </Link>
            </div>
          </div>
        </section>

        {/* Comment ça marche */}
        <section className="bg-bg-secondary py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-6xl mx-auto">
              <div className="text-center mb-16">
                <h2 className="font-heading text-3xl md:text-5xl font-bold mb-4">
                  Comment ça marche ?
                </h2>
                <p className="text-text-secondary text-lg">
                  Simple, transparent, et sans surprises
                </p>
              </div>

              <div className="grid md:grid-cols-4 gap-8">
                <div className="text-center">
                  <div className="w-16 h-16 rounded-full bg-accent-green-dim border-2 border-accent-green text-accent-green flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                    1
                  </div>
                  <h3 className="font-heading text-lg font-semibold mb-2">Décrivez votre projet</h3>
                  <p className="text-text-secondary text-sm">
                    Type de travaux, surface, localisation. Ça prend 2 minutes.
                  </p>
                </div>

                <div className="text-center">
                  <div className="w-16 h-16 rounded-full bg-accent-green-dim border-2 border-accent-green text-accent-green flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                    2
                  </div>
                  <h3 className="font-heading text-lg font-semibold mb-2">On analyse le marché</h3>
                  <p className="text-text-secondary text-sm">
                    Estimation basée sur 3000+ devis réels. Prix transparent immédiatement.
                  </p>
                </div>

                <div className="text-center">
                  <div className="w-16 h-16 rounded-full bg-accent-green-dim border-2 border-accent-green text-accent-green flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                    3
                  </div>
                  <h3 className="font-heading text-lg font-semibold mb-2">On vérifie les pros</h3>
                  <p className="text-text-secondary text-sm">
                    Labels RGE, avis clients, signalements. Seulement les meilleurs.
                  </p>
                </div>

                <div className="text-center">
                  <div className="w-16 h-16 rounded-full bg-accent-green-dim border-2 border-accent-green text-accent-green flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                    4
                  </div>
                  <h3 className="font-heading text-lg font-semibold mb-2">2 pros vous contactent</h3>
                  <p className="text-text-secondary text-sm">
                    Maximum. Pas de spam. Devis détaillés sous 48h.
                  </p>
                </div>
              </div>

              <div className="mt-12 text-center">
                <Link href="/devis">
                  <Button variant="primary" size="lg">
                    Commencer maintenant
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Prix du marché */}
        <section className="container mx-auto px-4 py-20">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <Badge variant="green" className="mb-4">
                💰 Transparence totale
              </Badge>
              <h2 className="font-heading text-3xl md:text-5xl font-bold mb-4">
                Les vrais prix du marché
              </h2>
              <p className="text-text-secondary text-lg">
                Basés sur l'analyse de 3 247 devis réels
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full border border-border rounded-2xl overflow-hidden">
                <thead className="bg-bg-secondary">
                  <tr>
                    <th className="text-left p-4 font-heading">Type de travaux</th>
                    <th className="text-right p-4 font-heading">Prix min</th>
                    <th className="text-right p-4 font-heading">Prix moyen</th>
                    <th className="text-right p-4 font-heading">Prix max</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-t border-border hover:bg-bg-secondary/50 transition-colors">
                    <td className="p-4">Pompe à chaleur air-eau</td>
                    <td className="text-right p-4 text-text-secondary">8 000€</td>
                    <td className="text-right p-4 font-semibold text-accent-green">12 500€</td>
                    <td className="text-right p-4 text-text-secondary">18 000€</td>
                  </tr>
                  <tr className="border-t border-border hover:bg-bg-secondary/50 transition-colors">
                    <td className="p-4">Pompe à chaleur air-air</td>
                    <td className="text-right p-4 text-text-secondary">5 000€</td>
                    <td className="text-right p-4 font-semibold text-accent-green">7 500€</td>
                    <td className="text-right p-4 text-text-secondary">11 000€</td>
                  </tr>
                  <tr className="border-t border-border hover:bg-bg-secondary/50 transition-colors">
                    <td className="p-4">Isolation combles (100m²)</td>
                    <td className="text-right p-4 text-text-secondary">3 000€</td>
                    <td className="text-right p-4 font-semibold text-accent-green">5 000€</td>
                    <td className="text-right p-4 text-text-secondary">7 500€</td>
                  </tr>
                  <tr className="border-t border-border hover:bg-bg-secondary/50 transition-colors">
                    <td className="p-4">Isolation murs extérieurs (100m²)</td>
                    <td className="text-right p-4 text-text-secondary">8 000€</td>
                    <td className="text-right p-4 font-semibold text-accent-green">12 000€</td>
                    <td className="text-right p-4 text-text-secondary">16 000€</td>
                  </tr>
                  <tr className="border-t border-border hover:bg-bg-secondary/50 transition-colors">
                    <td className="p-4">Panneaux solaires (3 kWc)</td>
                    <td className="text-right p-4 text-text-secondary">6 000€</td>
                    <td className="text-right p-4 font-semibold text-accent-green">9 000€</td>
                    <td className="text-right p-4 text-text-secondary">13 000€</td>
                  </tr>
                  <tr className="border-t border-border hover:bg-bg-secondary/50 transition-colors">
                    <td className="p-4">Chaudière biomasse</td>
                    <td className="text-right p-4 text-text-secondary">10 000€</td>
                    <td className="text-right p-4 font-semibold text-accent-green">15 000€</td>
                    <td className="text-right p-4 text-text-secondary">22 000€</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="mt-8 p-6 bg-bg-secondary border border-border rounded-2xl">
              <div className="flex items-start space-x-4">
                <div className="text-3xl">ℹ️</div>
                <div>
                  <h4 className="font-heading font-semibold mb-2">Prix hors aides</h4>
                  <p className="text-text-secondary text-sm">
                    Ces prix n'incluent pas MaPrimeRénov, les Certificats d'Économies d'Énergie (CEE) et autres aides locales.
                    Votre reste à charge peut être réduit de 30% à 90% selon votre situation.
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-8 text-center">
              <Link href="/devis">
                <Button variant="primary" size="lg">
                  Obtenir mon estimation personnalisée
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Section Confiance */}
        <section className="bg-bg-secondary py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-6xl mx-auto">
              <div className="text-center mb-12">
                <h2 className="font-heading text-3xl md:text-5xl font-bold mb-4">
                  Pourquoi nous faire confiance ?
                </h2>
              </div>

              <div className="grid md:grid-cols-2 gap-8 mb-12">
                <Card>
                  <div className="flex items-start space-x-4">
                    <div className="text-3xl">✅</div>
                    <div>
                      <h3 className="font-heading text-lg font-semibold mb-2">100% transparent</h3>
                      <p className="text-text-secondary text-sm">
                        Vous voyez les prix AVANT de donner vos coordonnées. Pas de mauvaises surprises.
                      </p>
                    </div>
                  </div>
                </Card>

                <Card>
                  <div className="flex items-start space-x-4">
                    <div className="text-3xl">🛡️</div>
                    <div>
                      <h3 className="font-heading text-lg font-semibold mb-2">Entreprises vérifiées</h3>
                      <p className="text-text-secondary text-sm">
                        Tous nos partenaires sont certifiés RGE et vérifiés manuellement. Leurs avis sont analysés.
                      </p>
                    </div>
                  </div>
                </Card>

                <Card>
                  <div className="flex items-start space-x-4">
                    <div className="text-3xl">🚫</div>
                    <div>
                      <h3 className="font-heading text-lg font-semibold mb-2">Zéro spam garanti</h3>
                      <p className="text-text-secondary text-sm">
                        Maximum 2 entreprises. Vos données ne sont jamais revendues. Conforme RGPD.
                      </p>
                    </div>
                  </div>
                </Card>

                <Card>
                  <div className="flex items-start space-x-4">
                    <div className="text-3xl">📚</div>
                    <div>
                      <h3 className="font-heading text-lg font-semibold mb-2">Conseils gratuits</h3>
                      <p className="text-text-secondary text-sm">
                        Guides, outils de vérification, calculateurs d'aides. Tout pour prendre la bonne décision.
                      </p>
                    </div>
                  </div>
                </Card>
              </div>

              {/* Témoignages */}
              <div className="grid md:grid-cols-3 gap-6">
                <Card>
                  <div className="mb-4">
                    <div className="flex text-accent-green mb-2">
                      {[...Array(5)].map((_, i) => (
                        <svg key={i} className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                    </div>
                    <p className="text-text-secondary text-sm italic mb-4">
                      "Enfin un site honnête ! J'ai vu le prix avant de m'engager et seulement 2 entreprises m'ont appelé. J'ai économisé 6000€ par rapport à mon premier devis."
                    </p>
                    <div className="text-sm">
                      <div className="font-semibold">Marie D.</div>
                      <div className="text-text-muted">Pompe à chaleur - Lyon</div>
                    </div>
                  </div>
                </Card>

                <Card>
                  <div className="mb-4">
                    <div className="flex text-accent-green mb-2">
                      {[...Array(5)].map((_, i) => (
                        <svg key={i} className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                    </div>
                    <p className="text-text-secondary text-sm italic mb-4">
                      "L'outil de vérification RGE m'a sauvé : l'entreprise qui me démarché avait un certificat expiré ! Merci VerifRenov."
                    </p>
                    <div className="text-sm">
                      <div className="font-semibold">Thomas L.</div>
                      <div className="text-text-muted">Isolation - Bordeaux</div>
                    </div>
                  </div>
                </Card>

                <Card>
                  <div className="mb-4">
                    <div className="flex text-accent-green mb-2">
                      {[...Array(5)].map((_, i) => (
                        <svg key={i} className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                    </div>
                    <p className="text-text-secondary text-sm italic mb-4">
                      "Simple, rapide, et surtout pas de harcèlement téléphonique. Les 2 artisans étaient sérieux et les prix cohérents."
                    </p>
                    <div className="text-sm">
                      <div className="font-semibold">Sophie M.</div>
                      <div className="text-text-muted">Panneaux solaires - Nantes</div>
                    </div>
                  </div>
                </Card>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Final */}
        <section className="container mx-auto px-4 py-20">
          <div className="max-w-4xl mx-auto text-center">
            <div className="bg-gradient-to-br from-bg-secondary to-bg-tertiary border border-border rounded-3xl p-12">
              <h2 className="font-heading text-3xl md:text-5xl font-bold mb-6">
                Prêt à rénover sereinement ?
              </h2>
              <p className="text-text-secondary text-lg mb-8">
                Obtenez votre estimation personnalisée en 2 minutes
              </p>
              <Link href="/devis">
                <Button variant="primary" size="lg">
                  Commencer mon projet
                  <svg className="ml-2 w-5 h-5" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                    <path d="M13 7l5 5m0 0l-5 5m5-5H6"></path>
                  </svg>
                </Button>
              </Link>
              <p className="text-text-muted text-sm mt-4">
                Gratuit • Sans engagement • 2 contacts maximum
              </p>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
