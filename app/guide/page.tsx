import Link from 'next/link';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';

const guides = [
  {
    slug: 'arnaque-pompe-a-chaleur',
    title: 'Arnaque pompe à chaleur : comment les éviter en 2025',
    description:
      'Démarchage abusif, prix gonflés, faux labels RGE... Tous les pièges à éviter et comment vous protéger.',
    category: 'Arnaques',
    readTime: '8 min',
    icon: '⚠️',
  },
  {
    slug: 'prix-pompe-a-chaleur-2025',
    title: 'Prix pompe à chaleur 2025 : tarifs réels et aides',
    description:
      'Les vrais prix du marché pour PAC air-eau, air-air et géothermique. MaPrimeRénov, CEE, toutes les aides détaillées.',
    category: 'Prix & Aides',
    readTime: '10 min',
    icon: '💰',
  },
  {
    slug: 'comment-verifier-artisan-rge',
    title: 'Comment vérifier un artisan RGE',
    description:
      'Guide complet pour contrôler le certificat RGE d\'un installateur et ne pas se faire avoir par un faux label.',
    category: 'Guides pratiques',
    readTime: '6 min',
    icon: '🔍',
  },
];

export default function GuidesPage() {
  return (
    <div className="min-h-screen">
      <Header />

      <main className="pt-20 pb-20">
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-6xl mx-auto">
            {/* Hero */}
            <div className="text-center mb-12">
              <Badge variant="green" className="mb-4">
                📚 Guides gratuits
              </Badge>

              <h1 className="font-heading text-4xl md:text-5xl font-bold mb-4">
                Guides de rénovation énergétique
              </h1>

              <p className="text-lg text-text-secondary max-w-2xl mx-auto">
                Tout ce que vous devez savoir pour rénover sereinement :
                prix, aides, arnaques à éviter, conseils d'experts.
              </p>
            </div>

            {/* Articles Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {guides.map((guide) => (
                <Link key={guide.slug} href={`/guide/${guide.slug}`}>
                  <Card hover className="h-full">
                    <div className="text-4xl mb-4">{guide.icon}</div>

                    <Badge variant="neutral" className="mb-3 text-xs">
                      {guide.category}
                    </Badge>

                    <h3 className="font-heading text-xl font-semibold mb-3 line-clamp-2">
                      {guide.title}
                    </h3>

                    <p className="text-text-secondary text-sm mb-4 line-clamp-3">
                      {guide.description}
                    </p>

                    <div className="flex items-center text-text-muted text-xs">
                      <svg
                        className="w-4 h-4 mr-1"
                        fill="none"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                      </svg>
                      {guide.readTime}
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
