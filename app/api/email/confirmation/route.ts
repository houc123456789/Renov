import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';

// Initialize Resend only if API key is present and not a placeholder
const resendApiKey = process.env.RESEND_API_KEY;
const resend = resendApiKey && !resendApiKey.includes('placeholder')
  ? new Resend(resendApiKey)
  : null;

export async function POST(request: NextRequest) {
  try {
    const { email, firstName, leadId } = await request.json();

    if (!email || !firstName) {
      return NextResponse.json(
        { error: 'Paramètres manquants' },
        { status: 400 }
      );
    }

    const emailHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Confirmation de votre demande - VerifRenov</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #0a0a0b; color: #ffffff; margin: 0; padding: 0;">
  <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
    <!-- Logo -->
    <div style="text-align: center; margin-bottom: 40px;">
      <h1 style="color: #00ff88; font-size: 28px; margin: 0;">Verif<span style="color: #ffffff;">Renov</span></h1>
      <p style="color: #8a8a8e; margin-top: 8px; font-size: 14px;">Le comparateur anti-arnaque</p>
    </div>

    <!-- Success Icon -->
    <div style="text-align: center; margin-bottom: 30px;">
      <div style="display: inline-block; width: 80px; height: 80px; border-radius: 50%; background: rgba(0, 255, 136, 0.2); border: 2px solid #00ff88; line-height: 80px; font-size: 40px;">
        ✓
      </div>
    </div>

    <!-- Content -->
    <div style="background-color: #131316; border: 1px solid #2a2a2f; border-radius: 20px; padding: 30px; margin-bottom: 30px;">
      <h2 style="color: #ffffff; font-size: 24px; margin-top: 0;">Bonjour ${firstName} ! 👋</h2>

      <p style="color: #8a8a8e; line-height: 1.6;">
        Votre demande de devis a bien été enregistrée. Nous sommes en train d'analyser votre projet et de sélectionner les meilleures entreprises certifiées RGE de votre secteur.
      </p>

      <div style="background: rgba(0, 255, 136, 0.1); border-left: 4px solid #00ff88; padding: 15px; margin: 20px 0;">
        <p style="margin: 0; color: #00ff88; font-weight: 600;">
          Maximum 2 entreprises vous contacteront sous 24-48h
        </p>
      </div>

      <h3 style="color: #ffffff; font-size: 18px; margin-top: 30px;">Prochaines étapes :</h3>

      <ol style="color: #8a8a8e; line-height: 1.8; padding-left: 20px;">
        <li>Vérification des entreprises RGE de votre secteur</li>
        <li>Sélection des 2 meilleurs installateurs selon vos critères</li>
        <li>Transmission de votre demande aux entreprises</li>
        <li>Contact direct par les installateurs pour rendez-vous</li>
      </ol>

      <p style="color: #8a8a8e; line-height: 1.6; margin-top: 20px;">
        En attendant, nous vous recommandons de consulter notre guide pour bien préparer votre rendez-vous avec l'installateur.
      </p>

      <div style="text-align: center; margin-top: 30px;">
        <a href="https://verifrenov.fr/devis/resultat?id=${leadId}" style="display: inline-block; background: linear-gradient(to right, #00ff88, #00d770); color: #0a0a0b; padding: 14px 28px; border-radius: 100px; text-decoration: none; font-weight: 600;">
          Voir mon estimation détaillée
        </a>
      </div>
    </div>

    <!-- Resources -->
    <div style="background-color: #131316; border: 1px solid #2a2a2f; border-radius: 20px; padding: 30px; margin-bottom: 30px;">
      <h3 style="color: #ffffff; font-size: 18px; margin-top: 0;">Ressources utiles</h3>

      <div style="margin-bottom: 15px;">
        <a href="https://verifrenov.fr/verifier-entreprise" style="color: #00ff88; text-decoration: none; font-weight: 500;">
          🔍 Vérifier le certificat RGE d'une entreprise
        </a>
      </div>

      <div style="margin-bottom: 15px;">
        <a href="https://verifrenov.fr/guide/questions-installateur" style="color: #00ff88; text-decoration: none; font-weight: 500;">
          📋 Questions à poser à l'installateur
        </a>
      </div>

      <div>
        <a href="https://verifrenov.fr/guide/arnaque-pompe-a-chaleur" style="color: #00ff88; text-decoration: none; font-weight: 500;">
          ⚠️ Comment détecter les arnaques
        </a>
      </div>
    </div>

    <!-- Security Notice -->
    <div style="background: rgba(255, 71, 87, 0.1); border: 1px solid rgba(255, 71, 87, 0.3); border-radius: 15px; padding: 20px; margin-bottom: 30px;">
      <p style="margin: 0; color: #ff4757; font-size: 14px; font-weight: 600;">
        ⚠️ Attention aux arnaques
      </p>
      <p style="margin: 10px 0 0 0; color: #8a8a8e; font-size: 13px; line-height: 1.5;">
        Les entreprises qui vous contacteront ont été vérifiées par nos soins. Si vous recevez un appel suspect ou un démarchage abusif, ne signez rien et contactez-nous immédiatement.
      </p>
    </div>

    <!-- Footer -->
    <div style="text-align: center; padding-top: 30px; border-top: 1px solid #2a2a2f;">
      <p style="color: #5a5a5e; font-size: 13px; margin-bottom: 10px;">
        Des questions ? Répondez simplement à cet email.
      </p>
      <p style="color: #5a5a5e; font-size: 12px; margin: 10px 0;">
        VerifRenov - Le comparateur anti-arnaque pour la rénovation énergétique
      </p>
      <p style="color: #5a5a5e; font-size: 11px; margin: 10px 0;">
        <a href="https://verifrenov.fr/politique-confidentialite" style="color: #5a5a5e; text-decoration: none;">Politique de confidentialité</a> •
        <a href="https://verifrenov.fr/mentions-legales" style="color: #5a5a5e; text-decoration: none;">Mentions légales</a>
      </p>
    </div>
  </div>
</body>
</html>
    `;

    // Utiliser Resend pour envoyer l'email
    if (!resend) {
      console.warn('Resend not configured, skipping email send');
      return NextResponse.json({
        success: true,
        message: 'Email not sent (Resend not configured)'
      });
    }

    const { data, error } = await resend.emails.send({
      from: 'VerifRenov <noreply@verifrenov.fr>',
      to: [email],
      subject: `✓ Demande de devis confirmée - ${firstName}`,
      html: emailHtml,
    });

    if (error) {
      console.error('Resend error:', error);
      return NextResponse.json(
        { error: 'Erreur lors de l\'envoi de l\'email' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, id: data?.id });
  } catch (error) {
    console.error('Error sending email:', error);
    return NextResponse.json(
      { error: 'Erreur lors de l\'envoi de l\'email' },
      { status: 500 }
    );
  }
}
