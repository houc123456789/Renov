import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

export default function MentionsLegalesPage() {
  return (
    <div className="min-h-screen">
      <Header />

      <main className="pt-20 pb-20">
        <div className="container mx-auto px-4 py-12 max-w-4xl">
          <h1 className="font-heading text-4xl font-bold mb-8">Mentions légales</h1>

          <div className="prose prose-invert max-w-none space-y-8">
            <section>
              <h2 className="font-heading text-2xl font-semibold mb-4">Éditeur du site</h2>
              <p className="text-text-secondary">
                <strong>Raison sociale :</strong> [À compléter]<br />
                <strong>Forme juridique :</strong> [Auto-entrepreneur / SASU / etc.]<br />
                <strong>Numéro SIRET :</strong> [À compléter]<br />
                <strong>Adresse :</strong> [À compléter]<br />
                <strong>Email :</strong> contact@verifrenov.fr<br />
                <strong>Responsable de publication :</strong> [Votre nom]
              </p>
            </section>

            <section>
              <h2 className="font-heading text-2xl font-semibold mb-4">Hébergement</h2>
              <p className="text-text-secondary">
                <strong>Hébergeur :</strong> Vercel Inc.<br />
                <strong>Adresse :</strong> 340 S Lemon Ave #4133, Walnut, CA 91789, USA<br />
                <strong>Site web :</strong>{' '}
                <a href="https://vercel.com" target="_blank" rel="noopener" className="text-accent-green hover:underline">
                  vercel.com
                </a>
              </p>
            </section>

            <section>
              <h2 className="font-heading text-2xl font-semibold mb-4">Propriété intellectuelle</h2>
              <p className="text-text-secondary leading-relaxed">
                L'ensemble du contenu de ce site (textes, images, vidéos, logos, graphismes) est la propriété exclusive de VerifRenov,
                sauf mention contraire. Toute reproduction, distribution, modification ou exploitation, même partielle, sans autorisation
                préalable écrite est strictement interdite et peut constituer une contrefaçon sanctionnée par les articles L.335-2 et
                suivants du Code de la propriété intellectuelle.
              </p>
            </section>

            <section>
              <h2 className="font-heading text-2xl font-semibold mb-4">Données personnelles</h2>
              <p className="text-text-secondary leading-relaxed">
                Conformément au Règlement Général sur la Protection des Données (RGPD) et à la loi Informatique et Libertés,
                vous disposez d'un droit d'accès, de rectification, de suppression et d'opposition aux données personnelles vous concernant.
              </p>
              <p className="text-text-secondary leading-relaxed mt-4">
                Pour exercer ces droits, contactez-nous à : <strong>contact@verifrenov.fr</strong>
              </p>
              <p className="text-text-secondary leading-relaxed mt-4">
                Consultez notre{' '}
                <a href="/politique-confidentialite" className="text-accent-green hover:underline">
                  Politique de confidentialité
                </a>{' '}
                pour plus de détails.
              </p>
            </section>

            <section>
              <h2 className="font-heading text-2xl font-semibold mb-4">Cookies</h2>
              <p className="text-text-secondary leading-relaxed">
                Ce site utilise des cookies pour améliorer votre expérience utilisateur et analyser le trafic.
                Vous pouvez gérer vos préférences de cookies à tout moment via notre{' '}
                <a href="/gestion-cookies" className="text-accent-green hover:underline">
                  page de gestion des cookies
                </a>.
              </p>
            </section>

            <section>
              <h2 className="font-heading text-2xl font-semibold mb-4">Limitation de responsabilité</h2>
              <p className="text-text-secondary leading-relaxed">
                VerifRenov s'efforce de fournir des informations précises et à jour. Cependant, nous ne pouvons garantir l'exactitude,
                la complétude ou l'actualité des informations présentes sur ce site. Les prix, aides et estimations sont donnés à titre
                indicatif et peuvent varier selon votre situation personnelle.
              </p>
              <p className="text-text-secondary leading-relaxed mt-4">
                VerifRenov ne peut être tenu responsable des dommages directs ou indirects résultant de l'utilisation de ce site ou
                des services proposés par nos partenaires installateurs.
              </p>
            </section>

            <section>
              <h2 className="font-heading text-2xl font-semibold mb-4">Loi applicable</h2>
              <p className="text-text-secondary leading-relaxed">
                Les présentes mentions légales sont soumises au droit français. En cas de litige et à défaut d'accord amiable,
                le tribunal compétent sera celui du ressort du siège social de VerifRenov.
              </p>
            </section>

            <section>
              <h2 className="font-heading text-2xl font-semibold mb-4">Contact</h2>
              <p className="text-text-secondary">
                Pour toute question concernant ces mentions légales, vous pouvez nous contacter :
              </p>
              <p className="text-text-secondary mt-2">
                <strong>Email :</strong> contact@verifrenov.fr<br />
                <strong>Formulaire de contact :</strong>{' '}
                <a href="/contact" className="text-accent-green hover:underline">
                  Page de contact
                </a>
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
