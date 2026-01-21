'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';

type FormData = {
  // Étape 1
  projectType: string;
  projectSubtype: string;

  // Étape 2
  propertyType: string;
  surface: number;
  constructionYear: number;
  currentHeating: string;
  postalCode: string;
  city: string;

  // Étape 3
  isOwner: boolean;
  isPrimaryResidence: boolean;
  incomeBracket: string;

  // Étape 4
  firstName: string;
  email: string;
  phone: string;
  acceptContact: boolean;
  acceptRGPD: boolean;
};

const initialFormData: FormData = {
  projectType: '',
  projectSubtype: '',
  propertyType: '',
  surface: 0,
  constructionYear: 2000,
  currentHeating: '',
  postalCode: '',
  city: '',
  isOwner: true,
  isPrimaryResidence: true,
  incomeBracket: '',
  firstName: '',
  email: '',
  phone: '',
  acceptContact: false,
  acceptRGPD: false,
};

export default function DevisPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({});
  const [loading, setLoading] = useState(false);

  const totalSteps = 4;

  // Charger les données sauvegardées
  useEffect(() => {
    const saved = localStorage.getItem('verifrenov_form');
    if (saved) {
      try {
        setFormData(JSON.parse(saved));
      } catch (e) {
        console.error('Error loading saved form:', e);
      }
    }
  }, []);

  // Sauvegarder automatiquement
  useEffect(() => {
    localStorage.setItem('verifrenov_form', JSON.stringify(formData));
  }, [formData]);

  const updateField = (field: keyof FormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Effacer l'erreur quand on modifie le champ
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateStep = (step: number): boolean => {
    const newErrors: Partial<Record<keyof FormData, string>> = {};

    if (step === 1) {
      if (!formData.projectType) newErrors.projectType = 'Sélectionnez un type de projet';
      if (formData.projectType && !formData.projectSubtype) newErrors.projectSubtype = 'Sélectionnez une option';
    }

    if (step === 2) {
      if (!formData.propertyType) newErrors.propertyType = 'Sélectionnez le type de logement';
      if (!formData.surface || formData.surface < 10) newErrors.surface = 'Surface invalide';
      if (!formData.constructionYear || formData.constructionYear < 1800) newErrors.constructionYear = 'Année invalide';
      if (!formData.currentHeating) newErrors.currentHeating = 'Sélectionnez votre chauffage actuel';
      if (!formData.postalCode || formData.postalCode.length !== 5) newErrors.postalCode = 'Code postal invalide';
    }

    if (step === 3) {
      // Optionnel, pas d'erreurs bloquantes
    }

    if (step === 4) {
      if (!formData.firstName || formData.firstName.length < 2) newErrors.firstName = 'Prénom invalide';
      if (!formData.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = 'Email invalide';
      if (!formData.phone || !/^0[1-9][0-9]{8}$/.test(formData.phone.replace(/\s/g, ''))) newErrors.phone = 'Téléphone invalide (ex: 0612345678)';
      if (!formData.acceptContact) newErrors.acceptContact = 'Vous devez accepter d\'être contacté';
      if (!formData.acceptRGPD) newErrors.acceptRGPD = 'Vous devez accepter la politique de confidentialité';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      if (currentStep < totalSteps) {
        setCurrentStep(currentStep + 1);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        submitForm();
      }
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const submitForm = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const data = await response.json();
        localStorage.removeItem('verifrenov_form');
        router.push(`/devis/resultat?id=${data.leadId}`);
      } else {
        alert('Une erreur est survenue. Veuillez réessayer.');
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      alert('Une erreur est survenue. Veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  };

  const projectTypes = [
    { id: 'pac', name: 'Pompe à chaleur', icon: '♨️', subtypes: ['Air-Eau', 'Air-Air', 'Géothermique'] },
    { id: 'isolation', name: 'Isolation', icon: '🏠', subtypes: ['Combles', 'Murs extérieurs', 'Murs intérieurs', 'Sol'] },
    { id: 'solaire', name: 'Panneaux solaires', icon: '☀️', subtypes: ['Photovoltaïque', 'Thermique', 'Hybride'] },
    { id: 'chaudiere', name: 'Chaudière', icon: '🔥', subtypes: ['Biomasse', 'Gaz condensation', 'Électrique'] },
  ];

  return (
    <div className="min-h-screen">
      <Header />

      <main className="pt-20 pb-20">
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-3xl mx-auto">
            {/* Progress Bar */}
            <div className="mb-8">
              <div className="flex justify-between items-center mb-4">
                <span className="text-sm text-text-secondary">
                  Étape {currentStep} sur {totalSteps}
                </span>
                <span className="text-sm text-text-secondary">
                  {Math.round((currentStep / totalSteps) * 100)}% complété
                </span>
              </div>
              <div className="h-2 bg-bg-secondary rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-accent-green to-emerald-400 transition-all duration-300"
                  style={{ width: `${(currentStep / totalSteps) * 100}%` }}
                />
              </div>
            </div>

            {/* Étape 1 : Type de projet */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <div>
                  <h2 className="font-heading text-3xl font-bold mb-2">
                    Quel est votre projet ?
                  </h2>
                  <p className="text-text-secondary">
                    Sélectionnez le type de travaux que vous souhaitez réaliser
                  </p>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  {projectTypes.map((type) => (
                    <Card
                      key={type.id}
                      className={`cursor-pointer ${
                        formData.projectType === type.id
                          ? 'border-accent-green bg-accent-green-dim'
                          : 'hover:border-accent-green/50'
                      }`}
                      onClick={() => {
                        updateField('projectType', type.id);
                        updateField('projectSubtype', '');
                      }}
                    >
                      <div className="text-4xl mb-3">{type.icon}</div>
                      <h3 className="font-heading text-lg font-semibold">{type.name}</h3>
                    </Card>
                  ))}
                </div>

                {errors.projectType && (
                  <p className="text-accent-red text-sm">{errors.projectType}</p>
                )}

                {formData.projectType && (
                  <div className="space-y-3">
                    <label className="block text-sm font-medium">
                      Précisez votre choix
                    </label>
                    <div className="grid md:grid-cols-2 gap-3">
                      {projectTypes
                        .find((t) => t.id === formData.projectType)
                        ?.subtypes.map((subtype) => (
                          <button
                            key={subtype}
                            type="button"
                            className={`p-4 rounded-xl border-2 transition-all text-left ${
                              formData.projectSubtype === subtype
                                ? 'border-accent-green bg-accent-green-dim'
                                : 'border-border hover:border-accent-green/50'
                            }`}
                            onClick={() => updateField('projectSubtype', subtype)}
                          >
                            {subtype}
                          </button>
                        ))}
                    </div>
                    {errors.projectSubtype && (
                      <p className="text-accent-red text-sm">{errors.projectSubtype}</p>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Étape 2 : Logement */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <div>
                  <h2 className="font-heading text-3xl font-bold mb-2">
                    Parlez-nous de votre logement
                  </h2>
                  <p className="text-text-secondary">
                    Ces informations nous permettent d'affiner l'estimation
                  </p>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Type de logement *
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      {['Maison', 'Appartement'].map((type) => (
                        <button
                          key={type}
                          type="button"
                          className={`p-4 rounded-xl border-2 transition-all ${
                            formData.propertyType === type
                              ? 'border-accent-green bg-accent-green-dim'
                              : 'border-border hover:border-accent-green/50'
                          }`}
                          onClick={() => updateField('propertyType', type)}
                        >
                          {type}
                        </button>
                      ))}
                    </div>
                    {errors.propertyType && (
                      <p className="text-accent-red text-sm mt-1">{errors.propertyType}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Surface habitable (m²) *
                    </label>
                    <input
                      type="number"
                      className="w-full px-4 py-3 bg-bg-primary border border-border rounded-xl focus:border-accent-green focus:outline-none focus:ring-2 focus:ring-accent-green/20"
                      placeholder="Ex: 120"
                      value={formData.surface || ''}
                      onChange={(e) => updateField('surface', parseInt(e.target.value) || 0)}
                    />
                    {errors.surface && (
                      <p className="text-accent-red text-sm mt-1">{errors.surface}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Année de construction *
                    </label>
                    <input
                      type="number"
                      className="w-full px-4 py-3 bg-bg-primary border border-border rounded-xl focus:border-accent-green focus:outline-none focus:ring-2 focus:ring-accent-green/20"
                      placeholder="Ex: 1990"
                      value={formData.constructionYear || ''}
                      onChange={(e) => updateField('constructionYear', parseInt(e.target.value) || 0)}
                    />
                    {errors.constructionYear && (
                      <p className="text-accent-red text-sm mt-1">{errors.constructionYear}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Chauffage actuel *
                    </label>
                    <select
                      className="w-full px-4 py-3 bg-bg-primary border border-border rounded-xl focus:border-accent-green focus:outline-none focus:ring-2 focus:ring-accent-green/20"
                      value={formData.currentHeating}
                      onChange={(e) => updateField('currentHeating', e.target.value)}
                    >
                      <option value="">Sélectionnez</option>
                      <option value="gaz">Gaz</option>
                      <option value="fioul">Fioul</option>
                      <option value="electrique">Électrique</option>
                      <option value="bois">Bois</option>
                      <option value="pompe-chaleur">Pompe à chaleur</option>
                      <option value="autre">Autre</option>
                    </select>
                    {errors.currentHeating && (
                      <p className="text-accent-red text-sm mt-1">{errors.currentHeating}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Code postal *
                    </label>
                    <input
                      type="text"
                      className="w-full px-4 py-3 bg-bg-primary border border-border rounded-xl focus:border-accent-green focus:outline-none focus:ring-2 focus:ring-accent-green/20"
                      placeholder="Ex: 75001"
                      maxLength={5}
                      value={formData.postalCode}
                      onChange={(e) => updateField('postalCode', e.target.value)}
                    />
                    {errors.postalCode && (
                      <p className="text-accent-red text-sm mt-1">{errors.postalCode}</p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Étape 3 : Situation */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <div>
                  <h2 className="font-heading text-3xl font-bold mb-2">
                    Votre situation
                  </h2>
                  <p className="text-text-secondary">
                    Pour calculer vos aides potentielles
                  </p>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Vous êtes
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        { value: true, label: 'Propriétaire' },
                        { value: false, label: 'Locataire' },
                      ].map((option) => (
                        <button
                          key={option.label}
                          type="button"
                          className={`p-4 rounded-xl border-2 transition-all ${
                            formData.isOwner === option.value
                              ? 'border-accent-green bg-accent-green-dim'
                              : 'border-border hover:border-accent-green/50'
                          }`}
                          onClick={() => updateField('isOwner', option.value)}
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Type de résidence
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        { value: true, label: 'Résidence principale' },
                        { value: false, label: 'Résidence secondaire' },
                      ].map((option) => (
                        <button
                          key={option.label}
                          type="button"
                          className={`p-4 rounded-xl border-2 transition-all ${
                            formData.isPrimaryResidence === option.value
                              ? 'border-accent-green bg-accent-green-dim'
                              : 'border-border hover:border-accent-green/50'
                          }`}
                          onClick={() => updateField('isPrimaryResidence', option.value)}
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Revenus fiscaux annuels (optionnel)
                    </label>
                    <select
                      className="w-full px-4 py-3 bg-bg-primary border border-border rounded-xl focus:border-accent-green focus:outline-none focus:ring-2 focus:ring-accent-green/20"
                      value={formData.incomeBracket}
                      onChange={(e) => updateField('incomeBracket', e.target.value)}
                    >
                      <option value="">Préférez ne pas répondre</option>
                      <option value="tres-modeste">Très modeste (&lt; 22 461€)</option>
                      <option value="modeste">Modeste (22 461€ - 27 343€)</option>
                      <option value="intermediaire">Intermédiaire (27 343€ - 38 184€)</option>
                      <option value="superieur">Supérieur (&gt; 38 184€)</option>
                    </select>
                    <p className="text-text-muted text-xs mt-1">
                      Cette information permet de calculer vos aides MaPrimeRénov
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Étape 4 : Coordonnées */}
            {currentStep === 4 && (
              <div className="space-y-6">
                <div>
                  <h2 className="font-heading text-3xl font-bold mb-2">
                    Dernière étape !
                  </h2>
                  <p className="text-text-secondary">
                    Recevez votre estimation et soyez contacté par 2 entreprises maximum
                  </p>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Prénom *
                    </label>
                    <input
                      type="text"
                      className="w-full px-4 py-3 bg-bg-primary border border-border rounded-xl focus:border-accent-green focus:outline-none focus:ring-2 focus:ring-accent-green/20"
                      placeholder="Votre prénom"
                      value={formData.firstName}
                      onChange={(e) => updateField('firstName', e.target.value)}
                    />
                    {errors.firstName && (
                      <p className="text-accent-red text-sm mt-1">{errors.firstName}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Email *
                    </label>
                    <input
                      type="email"
                      className="w-full px-4 py-3 bg-bg-primary border border-border rounded-xl focus:border-accent-green focus:outline-none focus:ring-2 focus:ring-accent-green/20"
                      placeholder="votre@email.com"
                      value={formData.email}
                      onChange={(e) => updateField('email', e.target.value)}
                    />
                    {errors.email && (
                      <p className="text-accent-red text-sm mt-1">{errors.email}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Téléphone *
                    </label>
                    <input
                      type="tel"
                      className="w-full px-4 py-3 bg-bg-primary border border-border rounded-xl focus:border-accent-green focus:outline-none focus:ring-2 focus:ring-accent-green/20"
                      placeholder="06 12 34 56 78"
                      value={formData.phone}
                      onChange={(e) => updateField('phone', e.target.value)}
                    />
                    {errors.phone && (
                      <p className="text-accent-red text-sm mt-1">{errors.phone}</p>
                    )}
                  </div>

                  <div className="space-y-3">
                    <label className="flex items-start space-x-3 cursor-pointer">
                      <input
                        type="checkbox"
                        className="mt-1 w-5 h-5 rounded border-border bg-bg-primary checked:bg-accent-green focus:ring-2 focus:ring-accent-green/20"
                        checked={formData.acceptContact}
                        onChange={(e) => updateField('acceptContact', e.target.checked)}
                      />
                      <span className="text-sm">
                        J'accepte d'être contacté par <strong>maximum 2 entreprises certifiées</strong> pour
                        recevoir des devis détaillés pour mon projet.
                      </span>
                    </label>
                    {errors.acceptContact && (
                      <p className="text-accent-red text-sm">{errors.acceptContact}</p>
                    )}

                    <label className="flex items-start space-x-3 cursor-pointer">
                      <input
                        type="checkbox"
                        className="mt-1 w-5 h-5 rounded border-border bg-bg-primary checked:bg-accent-green focus:ring-2 focus:ring-accent-green/20"
                        checked={formData.acceptRGPD}
                        onChange={(e) => updateField('acceptRGPD', e.target.checked)}
                        />
                      <span className="text-sm">
                        J'ai lu et j'accepte la{' '}
                        <a href="/politique-confidentialite" target="_blank" className="text-accent-green hover:underline">
                          politique de confidentialité
                        </a>{' '}
                        et les{' '}
                        <a href="/cgu" target="_blank" className="text-accent-green hover:underline">
                          conditions générales d'utilisation
                        </a>
                        .
                      </span>
                    </label>
                    {errors.acceptRGPD && (
                      <p className="text-accent-red text-sm">{errors.acceptRGPD}</p>
                    )}
                  </div>

                  <Card className="bg-accent-green-dim border-accent-green/30">
                    <div className="flex items-start space-x-3">
                      <span className="text-2xl">🔒</span>
                      <div className="text-sm">
                        <p className="font-semibold mb-1">Vos données sont protégées</p>
                        <p className="text-text-secondary">
                          Elles ne seront transmises qu'à 2 entreprises maximum et jamais revendues.
                          Conformité RGPD garantie.
                        </p>
                      </div>
                    </div>
                  </Card>
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between mt-8 pt-6 border-t border-border">
              <Button
                variant="ghost"
                onClick={prevStep}
                disabled={currentStep === 1}
                className={currentStep === 1 ? 'invisible' : ''}
              >
                <svg className="mr-2 w-5 h-5" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                  <path d="M11 17l-5-5m0 0l5-5m-5 5h12"></path>
                </svg>
                Retour
              </Button>

              <Button
                variant="primary"
                onClick={nextStep}
                disabled={loading}
              >
                {loading ? (
                  'Envoi en cours...'
                ) : currentStep === totalSteps ? (
                  'Voir mon estimation'
                ) : (
                  <>
                    Continuer
                    <svg className="ml-2 w-5 h-5" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                      <path d="M13 7l5 5m0 0l-5 5m5-5H6"></path>
                    </svg>
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
