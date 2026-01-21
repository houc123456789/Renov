import React from 'react';
import Link from 'next/link';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-bg-secondary border-t border-border mt-20">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent-green to-emerald-400 flex items-center justify-center">
                <span className="text-bg-primary font-bold text-xl">V</span>
              </div>
              <span className="font-heading text-xl font-bold">
                Verif<span className="text-accent-green">Renov</span>
              </span>
            </div>
            <p className="text-text-secondary text-sm">
              Le comparateur anti-arnaque pour la rénovation énergétique
            </p>
          </div>

          {/* Services */}
          <div>
            <h3 className="font-heading text-base font-semibold mb-4">Services</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/devis" className="text-text-secondary hover:text-accent-green transition-colors">
                  Obtenir un devis
                </Link>
              </li>
              <li>
                <Link href="/verifier-entreprise" className="text-text-secondary hover:text-accent-green transition-colors">
                  Vérifier une entreprise
                </Link>
              </li>
              <li>
                <Link href="/prix" className="text-text-secondary hover:text-accent-green transition-colors">
                  Prix du marché
                </Link>
              </li>
              <li>
                <Link href="/guide" className="text-text-secondary hover:text-accent-green transition-colors">
                  Guides pratiques
                </Link>
              </li>
            </ul>
          </div>

          {/* Ressources */}
          <div>
            <h3 className="font-heading text-base font-semibold mb-4">Ressources</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/guide/arnaque-pompe-a-chaleur" className="text-text-secondary hover:text-accent-green transition-colors">
                  Arnaques courantes
                </Link>
              </li>
              <li>
                <Link href="/guide/maprimerenov-2025" className="text-text-secondary hover:text-accent-green transition-colors">
                  MaPrimeRénov 2025
                </Link>
              </li>
              <li>
                <Link href="/guide/comment-verifier-artisan-rge" className="text-text-secondary hover:text-accent-green transition-colors">
                  Vérifier un artisan RGE
                </Link>
              </li>
            </ul>
          </div>

          {/* Légal */}
          <div>
            <h3 className="font-heading text-base font-semibold mb-4">Légal</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/mentions-legales" className="text-text-secondary hover:text-accent-green transition-colors">
                  Mentions légales
                </Link>
              </li>
              <li>
                <Link href="/politique-confidentialite" className="text-text-secondary hover:text-accent-green transition-colors">
                  Politique de confidentialité
                </Link>
              </li>
              <li>
                <Link href="/cgu" className="text-text-secondary hover:text-accent-green transition-colors">
                  CGU
                </Link>
              </li>
              <li>
                <Link href="/gestion-cookies" className="text-text-secondary hover:text-accent-green transition-colors">
                  Gestion des cookies
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-border mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-text-muted text-sm">
            © {currentYear} VerifRenov. Tous droits réservés.
          </p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <a
              href="https://twitter.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-text-secondary hover:text-accent-green transition-colors"
              aria-label="Twitter"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
              </svg>
            </a>
            <a
              href="https://linkedin.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-text-secondary hover:text-accent-green transition-colors"
              aria-label="LinkedIn"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
