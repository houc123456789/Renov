'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Button from '@/components/ui/Button';

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="fixed top-0 w-full z-50 bg-bg-primary/80 backdrop-blur-lg border-b border-border">
      <nav className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent-green to-emerald-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <span className="text-bg-primary font-bold text-xl">V</span>
            </div>
            <span className="font-heading text-xl font-bold">
              Verif<span className="text-accent-green">Renov</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link href="/guide" className="text-text-secondary hover:text-text-primary transition-colors">
              Guides
            </Link>
            <Link href="/verifier-entreprise" className="text-text-secondary hover:text-text-primary transition-colors">
              Vérifier une entreprise
            </Link>
            <Link href="/prix" className="text-text-secondary hover:text-text-primary transition-colors">
              Prix du marché
            </Link>
            <Link href="/devis">
              <Button variant="primary" size="md">
                Obtenir mon devis
              </Button>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden text-text-primary"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              {mobileMenuOpen ? (
                <path d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden mt-4 pb-4 space-y-4">
            <Link
              href="/guide"
              className="block text-text-secondary hover:text-text-primary transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              Guides
            </Link>
            <Link
              href="/verifier-entreprise"
              className="block text-text-secondary hover:text-text-primary transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              Vérifier une entreprise
            </Link>
            <Link
              href="/prix"
              className="block text-text-secondary hover:text-text-primary transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              Prix du marché
            </Link>
            <Link href="/devis" onClick={() => setMobileMenuOpen(false)}>
              <Button variant="primary" size="md" className="w-full">
                Obtenir mon devis
              </Button>
            </Link>
          </div>
        )}
      </nav>
    </header>
  );
}
