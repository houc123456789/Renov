import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import Card from '@/components/ui/Card';

export default function PolitiqueConfidentialitePage() {
  return (
    <div className="min-h-screen">
      <Header />

      <main className="pt-20 pb-20">
        <div className="container mx-auto px-4 py-12 max-w-4xl">
          <h1 className="font-heading text-4xl font-bold mb-4">
            Politique de confidentialité
          </h1>
          <p className="text-text-secondary mb-8">
            Dernière mise à jour : 21 janvier 2025
          </p>

          <Card className="mb-8 bg-accent-green-dim border-accent-green/30">
            <p className="text-sm">
              <strong className="text-text-primary">En résumé :</strong> Nous collectons uniquement les données nécessaires pour vous mettre en relation avec des installateurs certifiés. Vos données sont transmises à maximum 2 entreprises et ne sont jamais revendues. Vous gardez le contrôle total sur vos informations.
            </p>
          </Card>

          <div className="prose prose-invert max-w-none space-y-8">
            <section>
              <h2 className="font-heading text-2xl font-semibold mb-4">1. Qui sommes-nous ?</h2>
              <p className="text-text-secondary leading-relaxed">
                VerifRenov est un service de mise en relation entre particuliers et installateurs certifiés RGE pour la rénovation énergétique. Notre mission est de vous protéger contre les arnaques et de vous garantir des devis transparents.
              </p>
              <p className="text-text-secondary leading-relaxed mt-4">
                <strong>Responsable du traitement :</strong> [Votre nom/raison sociale]<br />
                <strong>Contact :</strong> contact@verifrenov.fr
              </p>
            </section>

            <section>
              <h2 className="font-heading text-2xl font-semibold mb-4">
                2. Quelles données collectons-nous ?
              </h2>

              <h3 className="font-heading text-xl font-semibold mb-3 mt-6">
                Données obligatoires (formulaire de devis)
              </h3>
              <ul className="text-text-secondary space-y-2 list-disc pl-6">
                <li>Prénom</li>
                <li>Adresse email</li>
                <li>Numéro de téléphone</li>
                <li>Code postal et ville</li>
                <li>Type de projet de rénovation</li>
                <li>Caractéristiques du logement (type, surface, année de construction)</li>
              </ul>

              <h3 className="font-heading text-xl font-semibold mb-3 mt-6">
                Données facultatives
              </h3>
              <ul className="text-text-secondary space-y-2 list-disc pl-6">
                <li>Tranche de revenus fiscaux (pour calcul des aides)</li>
                <li>Type de résidence (principale ou secondaire)</li>
              </ul>

              <h3 className="font-heading text-xl font-semibold mb-3 mt-6">
                Données collectées automatiquement
              </h3>
              <ul className="text-text-secondary space-y-2 list-disc pl-6">
                <li>Adresse IP</li>
                <li>Type de navigateur et appareil</li>
                <li>Pages visitées et durée de visite</li>
                <li>Source de trafic (UTM, référent)</li>
              </ul>
            </section>

            <section>
              <h2 className="font-heading text-2xl font-semibold mb-4">
                3. Pourquoi collectons-nous ces données ?
              </h2>

              <div className="space-y-4">
                <Card>
                  <h4 className="font-semibold mb-2">🎯 Mise en relation avec des installateurs</h4>
                  <p className="text-sm text-text-secondary">
                    Vos coordonnées et informations de projet sont transmises à maximum 2 entreprises certifiées RGE de votre secteur pour qu'elles puissent vous contacter et établir un devis.
                  </p>
                  <p className="text-xs text-text-muted mt-2">Base légale : Consentement (article 6.1.a du RGPD)</p>
                </Card>

                <Card>
                  <h4 className="font-semibold mb-2">📊 Estimation personnalisée</h4>
                  <p className="text-sm text-text-secondary">
                    Les caractéristiques de votre logement nous permettent de calculer une estimation de prix réaliste et les aides auxquelles vous avez droit.
                  </p>
                  <p className="text-xs text-text-muted mt-2">Base légale : Exécution du contrat (article 6.1.b du RGPD)</p>
                </Card>

                <Card>
                  <h4 className="font-semibold mb-2">📧 Communications transactionnelles</h4>
                  <p className="text-sm text-text-secondary">
                    Envoi d'emails de confirmation, de récapitulatif de votre demande et de suivi.
                  </p>
                  <p className="text-xs text-text-muted mt-2">Base légale : Exécution du contrat (article 6.1.b du RGPD)</p>
                </Card>

                <Card>
                  <h4 className="font-semibold mb-2">📈 Amélioration du service</h4>
                  <p className="text-sm text-text-secondary">
                    Analyse anonymisée du trafic pour améliorer l'expérience utilisateur et détecter les bugs.
                  </p>
                  <p className="text-xs text-text-muted mt-2">Base légale : Intérêt légitime (article 6.1.f du RGPD)</p>
                </Card>
              </div>
            </section>

            <section>
              <h2 className="font-heading text-2xl font-semibold mb-4">
                4. Avec qui partageons-nous vos données ?
              </h2>

              <Card className="mb-4 bg-bg-secondary">
                <h4 className="font-semibold mb-3">🔒 Principe fondamental</h4>
                <p className="text-sm text-text-secondary">
                  Vos données personnelles ne sont <strong className="text-accent-green">JAMAIS vendues</strong> à des tiers. Nous ne sommes pas une "usine à leads" qui revend vos coordonnées à 50 entreprises.
                </p>
              </Card>

              <h3 className="font-heading text-xl font-semibold mb-3 mt-6">
                Partenaires installateurs (maximum 2)
              </h3>
              <p className="text-text-secondary leading-relaxed">
                Vos coordonnées et informations de projet sont transmises à <strong>maximum 2 entreprises certifiées RGE</strong> sélectionnées selon votre localisation et le type de travaux. Cette transmission se fait uniquement après votre consentement explicite.
              </p>

              <h3 className="font-heading text-xl font-semibold mb-3 mt-6">
                Prestataires techniques
              </h3>
              <ul className="text-text-secondary space-y-2 list-disc pl-6">
                <li><strong>Vercel</strong> : Hébergement du site (USA, certifié RGPD)</li>
                <li><strong>Supabase</strong> : Stockage base de données (Europe, certifié RGPD)</li>
                <li><strong>Resend</strong> : Envoi d'emails transactionnels (USA, certifié RGPD)</li>
              </ul>
              <p className="text-text-secondary text-sm mt-3">
                Tous ces prestataires sont conformes au RGPD et ne peuvent utiliser vos données qu'aux fins pour lesquelles nous les avons transmises.
              </p>
            </section>

            <section>
              <h2 className="font-heading text-2xl font-semibold mb-4">
                5. Combien de temps conservons-nous vos données ?
              </h2>

              <div className="overflow-x-auto">
                <table className="w-full border border-border rounded-xl overflow-hidden">
                  <thead className="bg-bg-secondary">
                    <tr>
                      <th className="text-left p-4">Type de données</th>
                      <th className="text-left p-4">Durée de conservation</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-t border-border">
                      <td className="p-4">Demandes de devis (leads)</td>
                      <td className="p-4 text-text-secondary">3 ans maximum</td>
                    </tr>
                    <tr className="border-t border-border">
                      <td className="p-4">Emails transactionnels</td>
                      <td className="p-4 text-text-secondary">1 an</td>
                    </tr>
                    <tr className="border-t border-border">
                      <td className="p-4">Données analytics (anonymisées)</td>
                      <td className="p-4 text-text-secondary">25 mois</td>
                    </tr>
                    <tr className="border-t border-border">
                      <td className="p-4">Logs techniques</td>
                      <td className="p-4 text-text-secondary">6 mois</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <p className="text-text-secondary text-sm mt-4">
                Passés ces délais, vos données sont automatiquement supprimées ou anonymisées de manière irréversible.
              </p>
            </section>

            <section>
              <h2 className="font-heading text-2xl font-semibold mb-4">
                6. Quels sont vos droits ?
              </h2>

              <p className="text-text-secondary mb-4">
                Conformément au RGPD, vous disposez des droits suivants :
              </p>

              <div className="space-y-3">
                <Card className="bg-bg-secondary">
                  <h4 className="font-semibold mb-1">✓ Droit d'accès</h4>
                  <p className="text-sm text-text-secondary">
                    Vous pouvez demander une copie de toutes les données personnelles que nous détenons sur vous.
                  </p>
                </Card>

                <Card className="bg-bg-secondary">
                  <h4 className="font-semibold mb-1">✓ Droit de rectification</h4>
                  <p className="text-sm text-text-secondary">
                    Vous pouvez corriger des données inexactes ou incomplètes.
                  </p>
                </Card>

                <Card className="bg-bg-secondary">
                  <h4 className="font-semibold mb-1">✓ Droit à l'effacement ("droit à l'oubli")</h4>
                  <p className="text-sm text-text-secondary">
                    Vous pouvez demander la suppression de vos données personnelles.
                  </p>
                </Card>

                <Card className="bg-bg-secondary">
                  <h4 className="font-semibold mb-1">✓ Droit d'opposition</h4>
                  <p className="text-sm text-text-secondary">
                    Vous pouvez vous opposer au traitement de vos données pour des motifs légitimes.
                  </p>
                </Card>

                <Card className="bg-bg-secondary">
                  <h4 className="font-semibold mb-1">✓ Droit à la portabilité</h4>
                  <p className="text-sm text-text-secondary">
                    Vous pouvez récupérer vos données dans un format structuré et couramment utilisé.
                  </p>
                </Card>

                <Card className="bg-bg-secondary">
                  <h4 className="font-semibold mb-1">✓ Droit de retirer votre consentement</h4>
                  <p className="text-sm text-text-secondary">
                    Vous pouvez retirer votre consentement à tout moment sans justification.
                  </p>
                </Card>
              </div>

              <Card className="mt-6 bg-accent-green-dim border-accent-green/30">
                <h4 className="font-semibold mb-2">Comment exercer vos droits ?</h4>
                <p className="text-sm text-text-secondary">
                  Envoyez un email à <strong className="text-text-primary">contact@verifrenov.fr</strong> avec :
                </p>
                <ul className="text-sm text-text-secondary mt-2 space-y-1 list-disc pl-6">
                  <li>Votre nom et prénom</li>
                  <li>Votre adresse email utilisée sur le site</li>
                  <li>La nature de votre demande (accès, suppression, etc.)</li>
                  <li>Une copie de votre pièce d'identité (pour vérification)</li>
                </ul>
                <p className="text-sm text-text-secondary mt-3">
                  Nous traiterons votre demande dans un délai maximum de <strong>1 mois</strong>.
                </p>
              </Card>
            </section>

            <section>
              <h2 className="font-heading text-2xl font-semibold mb-4">
                7. Sécurité de vos données
              </h2>
              <p className="text-text-secondary leading-relaxed">
                Nous mettons en œuvre des mesures techniques et organisationnelles appropriées pour protéger vos données contre la perte, l'utilisation abusive, l'accès non autorisé et la divulgation :
              </p>
              <ul className="text-text-secondary space-y-2 list-disc pl-6 mt-4">
                <li>Chiffrement SSL/TLS pour toutes les transmissions de données</li>
                <li>Hébergement sécurisé avec sauvegardes quotidiennes</li>
                <li>Accès aux données strictement limité et contrôlé</li>
                <li>Surveillance continue des accès et des activités suspectes</li>
                <li>Mise à jour régulière des systèmes de sécurité</li>
              </ul>
            </section>

            <section>
              <h2 className="font-heading text-2xl font-semibold mb-4">
                8. Cookies et technologies similaires
              </h2>
              <p className="text-text-secondary leading-relaxed">
                Notre site utilise des cookies pour améliorer votre expérience et analyser le trafic.
                Consultez notre{' '}
                <a href="/gestion-cookies" className="text-accent-green hover:underline">
                  page de gestion des cookies
                </a>{' '}
                pour plus de détails et pour gérer vos préférences.
              </p>
            </section>

            <section>
              <h2 className="font-heading text-2xl font-semibold mb-4">
                9. Modifications de cette politique
              </h2>
              <p className="text-text-secondary leading-relaxed">
                Nous nous réservons le droit de modifier cette politique de confidentialité à tout moment. En cas de modification substantielle, nous vous en informerons par email ou via un bandeau sur le site. La version en vigueur est toujours celle affichée sur cette page avec la date de mise à jour.
              </p>
            </section>

            <section>
              <h2 className="font-heading text-2xl font-semibold mb-4">
                10. Réclamation auprès de la CNIL
              </h2>
              <p className="text-text-secondary leading-relaxed">
                Si vous estimez que vos droits ne sont pas respectés, vous avez le droit de déposer une réclamation auprès de la Commission Nationale de l'Informatique et des Libertés (CNIL) :
              </p>
              <p className="text-text-secondary mt-4">
                <strong>CNIL</strong><br />
                3 Place de Fontenoy - TSA 80715<br />
                75334 PARIS CEDEX 07<br />
                Tél : 01 53 73 22 22<br />
                Site web : <a href="https://www.cnil.fr" target="_blank" rel="noopener" className="text-accent-green hover:underline">www.cnil.fr</a>
              </p>
            </section>

            <section>
              <h2 className="font-heading text-2xl font-semibold mb-4">
                11. Contact
              </h2>
              <p className="text-text-secondary">
                Pour toute question concernant cette politique de confidentialité ou l'utilisation de vos données personnelles :
              </p>
              <p className="text-text-secondary mt-4">
                <strong>Email :</strong> contact@verifrenov.fr<br />
                <strong>Délai de réponse :</strong> Maximum 48 heures ouvrées
              </p>
            </section>

            <p className="text-text-muted text-sm mt-12">
              Dernière mise à jour : 21 janvier 2025
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
