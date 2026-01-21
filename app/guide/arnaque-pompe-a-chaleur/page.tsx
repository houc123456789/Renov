import Link from 'next/link';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Arnaque Pompe à Chaleur 2025 : Comment les Éviter | VerifRenov',
  description:
    'Démarchage abusif, faux labels RGE, prix gonflés... Découvrez les 7 arnaques les plus courantes aux pompes à chaleur et comment vous protéger efficacement.',
  keywords:
    'arnaque pompe à chaleur, démarchage abusif PAC, faux RGE, escroquerie rénovation, prix PAC gonflés',
};

export default function ArnaquesPACPage() {
  return (
    <div className="min-h-screen">
      <Header />

      <main className="pt-20 pb-20">
        <article className="container mx-auto px-4 py-12 max-w-4xl">
          {/* Header */}
          <div className="mb-12">
            <Badge variant="red" className="mb-4">
              ⚠️ Arnaques
            </Badge>

            <h1 className="font-heading text-4xl md:text-5xl font-bold mb-6">
              Arnaque pompe à chaleur : comment les éviter en 2025
            </h1>

            <div className="flex items-center text-text-secondary text-sm space-x-4 mb-6">
              <span>Mis à jour le 21 janvier 2025</span>
              <span>•</span>
              <span>8 min de lecture</span>
            </div>

            <p className="text-xl text-text-secondary leading-relaxed">
              Le marché des pompes à chaleur explose en France, et avec lui, les arnaques.
              Démarchage téléphonique agressif, prix multipliés par 3, faux labels RGE... Ce
              guide vous révèle les 7 arnaques les plus courantes et comment vous en protéger.
            </p>
          </div>

          {/* Table of Contents */}
          <Card className="mb-12 bg-bg-secondary">
            <h2 className="font-heading text-xl font-semibold mb-4">Sommaire</h2>
            <ul className="space-y-2 text-text-secondary">
              <li>
                <a href="#ampleur" className="hover:text-accent-green transition-colors">
                  1. L'ampleur du problème en 2025
                </a>
              </li>
              <li>
                <a href="#demarchage" className="hover:text-accent-green transition-colors">
                  2. Le démarchage téléphonique abusif
                </a>
              </li>
              <li>
                <a href="#prix-gonfles" className="hover:text-accent-green transition-colors">
                  3. Prix gonflés de 50% à 200%
                </a>
              </li>
              <li>
                <a href="#faux-rge" className="hover:text-accent-green transition-colors">
                  4. Faux labels RGE et arnaques aux aides
                </a>
              </li>
              <li>
                <a href="#installation-baclee" className="hover:text-accent-green transition-colors">
                  5. Installation bâclée et matériel bas de gamme
                </a>
              </li>
              <li>
                <a href="#comment-proteger" className="hover:text-accent-green transition-colors">
                  6. Comment se protéger efficacement
                </a>
              </li>
              <li>
                <a href="#victimes" className="hover:text-accent-green transition-colors">
                  7. Que faire si vous êtes victime
                </a>
              </li>
            </ul>
          </Card>

          {/* Content */}
          <div className="prose prose-invert max-w-none">
            <h2 id="ampleur" className="font-heading text-3xl font-bold mt-12 mb-6">
              1. L'ampleur du problème en 2025
            </h2>

            <p className="text-text-secondary leading-relaxed mb-6">
              Selon la DGCCRF (Direction Générale de la Concurrence et de la Répression des
              Fraudes), <strong className="text-text-primary">plus de 40% des signalements</strong>{' '}
              concernant la rénovation énergétique portent sur les pompes à chaleur.
            </p>

            <Card className="my-8 bg-accent-red-dim border-accent-red/30">
              <div className="flex items-start space-x-4">
                <span className="text-4xl">📊</span>
                <div>
                  <h4 className="font-heading font-semibold mb-2 text-text-primary">
                    Chiffres clés 2024-2025
                  </h4>
                  <ul className="text-sm text-text-secondary space-y-1">
                    <li>• 12 847 signalements pour arnaque à la PAC en 2024</li>
                    <li>• Préjudice moyen : 8 500€ par victime</li>
                    <li>• 68% des victimes ont plus de 60 ans</li>
                    <li>• 1 installateur sur 5 présente des irrégularités</li>
                  </ul>
                </div>
              </div>
            </Card>

            <h2 id="demarchage" className="font-heading text-3xl font-bold mt-12 mb-6">
              2. Le démarchage téléphonique abusif
            </h2>

            <p className="text-text-secondary leading-relaxed mb-6">
              <strong className="text-text-primary">L'arnaque la plus répandue</strong> : vous
              recevez un appel d'une "entreprise mandatée par l'État" pour vos travaux de
              rénovation. On vous promet une PAC "gratuite" ou "à 1€" grâce aux aides.
            </p>

            <Card className="my-8">
              <h4 className="font-heading font-semibold mb-3">🚨 Signes d'alerte</h4>
              <ul className="text-text-secondary space-y-2 text-sm">
                <li className="flex items-start">
                  <span className="text-accent-red mr-2">•</span>
                  <span>
                    Appel non sollicité avec pression ("offre limitée", "dernière chance")
                  </span>
                </li>
                <li className="flex items-start">
                  <span className="text-accent-red mr-2">•</span>
                  <span>Promesse de "PAC à 1€" ou "totalement gratuite"</span>
                </li>
                <li className="flex items-start">
                  <span className="text-accent-red mr-2">•</span>
                  <span>Demande de signature immédiate "pour bloquer les aides"</span>
                </li>
                <li className="flex items-start">
                  <span className="text-accent-red mr-2">•</span>
                  <span>Refus de vous laisser le temps de réfléchir</span>
                </li>
              </ul>
            </Card>

            <p className="text-text-secondary leading-relaxed mb-6">
              <strong className="text-accent-green">Réalité</strong> : Aucun organisme officiel
              ne démarche par téléphone pour proposer des travaux. C'est interdit depuis 2020
              (loi n°2020-901).
            </p>

            <h2 id="prix-gonfles" className="font-heading text-3xl font-bold mt-12 mb-6">
              3. Prix gonflés de 50% à 200%
            </h2>

            <p className="text-text-secondary leading-relaxed mb-6">
              De nombreuses victimes paient leur PAC{' '}
              <strong className="text-text-primary">25 000€ à 35 000€</strong> alors que le prix
              du marché est entre <strong className="text-accent-green">8 000€ et 15 000€</strong>{' '}
              pour une installation complète.
            </p>

            <div className="my-8 overflow-x-auto">
              <table className="w-full border border-border rounded-xl overflow-hidden">
                <thead className="bg-bg-secondary">
                  <tr>
                    <th className="text-left p-4 font-heading">Type de PAC</th>
                    <th className="text-right p-4 font-heading">Prix marché</th>
                    <th className="text-right p-4 font-heading text-accent-red">
                      Prix arnaque
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-t border-border">
                    <td className="p-4">PAC air-eau (maison 100m²)</td>
                    <td className="text-right p-4 text-accent-green font-semibold">
                      10 000 - 14 000€
                    </td>
                    <td className="text-right p-4 text-accent-red font-semibold">
                      22 000 - 35 000€
                    </td>
                  </tr>
                  <tr className="border-t border-border">
                    <td className="p-4">PAC air-air (4 splits)</td>
                    <td className="text-right p-4 text-accent-green font-semibold">
                      5 000 - 8 000€
                    </td>
                    <td className="text-right p-4 text-accent-red font-semibold">
                      12 000 - 18 000€
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <Card className="my-8 bg-accent-green-dim border-accent-green/30">
              <h4 className="font-heading font-semibold mb-3 text-text-primary">
                💡 Astuce anti-arnaque
              </h4>
              <p className="text-sm text-text-secondary">
                <strong className="text-accent-green">Demandez TOUJOURS 2 à 3 devis</strong> avant
                de signer. Si un prix est 40% plus élevé que les autres sans justification
                technique, c'est suspect.
              </p>
            </Card>

            <h2 id="faux-rge" className="font-heading text-3xl font-bold mt-12 mb-6">
              4. Faux labels RGE et arnaques aux aides
            </h2>

            <p className="text-text-secondary leading-relaxed mb-6">
              Certaines entreprises utilisent de{' '}
              <strong className="text-text-primary">faux certificats RGE</strong> ou des
              certificats expirés. Résultat : vous perdez vos aides (MaPrimeRénov, CEE) et vous
              ne pouvez pas les récupérer.
            </p>

            <Card className="my-8 bg-bg-secondary">
              <h4 className="font-heading font-semibold mb-3">Cas réel (2024)</h4>
              <p className="text-sm text-text-secondary italic">
                "J'ai payé 28 000€ pour ma pompe à chaleur. On m'avait promis 9 000€ d'aides.
                Après installation, j'ai découvert que l'entreprise n'était plus RGE depuis 6
                mois. J'ai tout perdu. Il me reste 28 000€ à payer pour des travaux qui en
                valent 12 000€."
              </p>
              <p className="text-xs text-text-muted mt-2">— Marie D., Bordeaux</p>
            </Card>

            <div className="my-8 p-6 bg-accent-green-dim border-2 border-accent-green rounded-xl">
              <h4 className="font-heading font-semibold mb-3 flex items-center text-text-primary">
                <span className="mr-2">✓</span> Comment vérifier un label RGE
              </h4>
              <ol className="text-sm text-text-secondary space-y-2">
                <li>
                  1. Demandez le <strong>numéro de SIRET</strong> et le{' '}
                  <strong>certificat RGE</strong>
                </li>
                <li>
                  2. Vérifiez sur{' '}
                  <Link href="/verifier-entreprise" className="text-accent-green hover:underline">
                    notre outil gratuit
                  </Link>{' '}
                  ou sur france-renov.gouv.fr
                </li>
                <li>3. Contrôlez la date d'expiration du certificat</li>
                <li>
                  4. Vérifiez que les <strong>qualifications</strong> correspondent à vos travaux
                </li>
              </ol>
            </div>

            <h2 id="installation-baclee" className="font-heading text-3xl font-bold mt-12 mb-6">
              5. Installation bâclée et matériel bas de gamme
            </h2>

            <p className="text-text-secondary leading-relaxed mb-6">
              Vous payez pour une PAC haut de gamme (Daikin, Mitsubishi, Atlantic) mais on vous
              installe du matériel chinois bas de gamme. Ou pire : l'installation est
              techniquement incorrecte.
            </p>

            <Card className="my-8">
              <h4 className="font-heading font-semibold mb-3">⚠️ Erreurs d'installation courantes</h4>
              <ul className="text-text-secondary space-y-2 text-sm">
                <li>• Dimensionnement incorrect (PAC trop petite ou surdimensionnée)</li>
                <li>• Isolation insuffisante des tuyaux → perte de rendement</li>
                <li>• Mauvais emplacement de l'unité extérieure → nuisances sonores</li>
                <li>• Absence d'étude thermique préalable</li>
                <li>• Matériel différent de celui promis dans le devis</li>
              </ul>
            </Card>

            <h2 id="comment-proteger" className="font-heading text-3xl font-bold mt-12 mb-6">
              6. Comment se protéger efficacement
            </h2>

            <div className="space-y-4 my-8">
              <Card hover>
                <div className="flex items-start space-x-4">
                  <span className="text-3xl">1️⃣</span>
                  <div>
                    <h4 className="font-semibold mb-1">Ne répondez JAMAIS au démarchage</h4>
                    <p className="text-sm text-text-secondary">
                      Raccrochez immédiatement. Les entreprises sérieuses ne démarchent pas par
                      téléphone.
                    </p>
                  </div>
                </div>
              </Card>

              <Card hover>
                <div className="flex items-start space-x-4">
                  <span className="text-3xl">2️⃣</span>
                  <div>
                    <h4 className="font-semibold mb-1">Vérifiez le RGE AVANT tout engagement</h4>
                    <p className="text-sm text-text-secondary">
                      Utilisez{' '}
                      <Link
                        href="/verifier-entreprise"
                        className="text-accent-green hover:underline"
                      >
                        notre outil gratuit
                      </Link>{' '}
                      ou le site officiel france-renov.gouv.fr
                    </p>
                  </div>
                </div>
              </Card>

              <Card hover>
                <div className="flex items-start space-x-4">
                  <span className="text-3xl">3️⃣</span>
                  <div>
                    <h4 className="font-semibold mb-1">Demandez 3 devis minimum</h4>
                    <p className="text-sm text-text-secondary">
                      Comparez les prix, le matériel proposé, les garanties. Un écart de + de 40%
                      est suspect.
                    </p>
                  </div>
                </div>
              </Card>

              <Card hover>
                <div className="flex items-start space-x-4">
                  <span className="text-3xl">4️⃣</span>
                  <div>
                    <h4 className="font-semibold mb-1">Ne signez JAMAIS le jour même</h4>
                    <p className="text-sm text-text-secondary">
                      Vous avez 14 jours de rétractation. Prenez le temps de vérifier tout.
                    </p>
                  </div>
                </div>
              </Card>

              <Card hover>
                <div className="flex items-start space-x-4">
                  <span className="text-3xl">5️⃣</span>
                  <div>
                    <h4 className="font-semibold mb-1">Exigez un devis détaillé</h4>
                    <p className="text-sm text-text-secondary">
                      Marque et modèle de la PAC, puissance, COP, garanties, détail des travaux,
                      aides déduites.
                    </p>
                  </div>
                </div>
              </Card>
            </div>

            <h2 id="victimes" className="font-heading text-3xl font-bold mt-12 mb-6">
              7. Que faire si vous êtes victime
            </h2>

            <div className="space-y-4 my-8">
              <Card className="bg-bg-secondary">
                <h4 className="font-heading font-semibold mb-3">📞 Numéros utiles</h4>
                <ul className="text-sm text-text-secondary space-y-2">
                  <li>
                    • <strong>SignalConso</strong> :{' '}
                    <a
                      href="https://signal.conso.gouv.fr"
                      target="_blank"
                      rel="noopener"
                      className="text-accent-green hover:underline"
                    >
                      signal.conso.gouv.fr
                    </a>
                  </li>
                  <li>
                    • <strong>Info Escroqueries</strong> : 0 805 805 817 (gratuit)
                  </li>
                  <li>
                    • <strong>France Rénov'</strong> : 0 808 800 700 (service public gratuit)
                  </li>
                  <li>
                    • <strong>Bloctel</strong> : inscription pour bloquer le démarchage
                  </li>
                </ul>
              </Card>

              <Card className="bg-bg-secondary">
                <h4 className="font-heading font-semibold mb-3">⚖️ Démarches légales</h4>
                <ol className="text-sm text-text-secondary space-y-2">
                  <li>
                    1. <strong>Lettre recommandée</strong> avec AR pour annulation (14 jours de
                    rétractation)
                  </li>
                  <li>
                    2. <strong>Signalement à la DGCCRF</strong> via SignalConso
                  </li>
                  <li>
                    3. <strong>Dépôt de plainte</strong> au commissariat ou en ligne
                  </li>
                  <li>
                    4. <strong>Contact d'une association de consommateurs</strong> (UFC-Que Choisir,
                    CLCV)
                  </li>
                </ol>
              </Card>
            </div>
          </div>

          {/* CTA */}
          <div className="mt-16">
            <Card className="bg-gradient-to-br from-bg-secondary to-bg-tertiary border-accent-green/30 text-center">
              <h3 className="font-heading text-2xl font-bold mb-4">
                Obtenez un devis transparent et sécurisé
              </h3>
              <p className="text-text-secondary mb-6">
                Maximum 2 entreprises certifiées RGE • Prix affichés avant de donner vos
                coordonnées • Zéro démarchage abusif
              </p>
              <Link href="/devis">
                <Button variant="primary" size="lg">
                  Obtenir mon devis gratuit
                </Button>
              </Link>
            </Card>
          </div>
        </article>
      </main>

      <Footer />
    </div>
  );
}
