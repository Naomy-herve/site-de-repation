import { Link } from 'react-router-dom';
import { Wrench, FileText, ArrowLeft } from 'lucide-react';

export default function LegalPage({ type }: { type: 'terms' | 'privacy' }) {
  const isTerms = type === 'terms';

  const termsContent = [
    { h: '1. Acceptation des conditions', p: 'En accédant et en utilisant le site FlamOfreparation, vous acceptez les présentes conditions d\'utilisation. Si vous n\'acceptez pas ces conditions, veuillez ne pas utiliser le site.' },
    { h: '2. Inscription et compte', p: 'L\'inscription à la communauté est gratuite. Le nom d\'utilisateur est obligatoire et doit être unique. Vous êtes responsable de la confidentialité de votre mot de passe et de toutes les activités effectuées sous votre compte. Le mot de passe doit contenir au moins 6 caractères.' },
    { h: '3. Contenu utilisateur', p: 'Vous conservez la propriété de vos tutoriels et solutions. En publiant sur FlamOfreparation, vous accordez une licence non exclusive, gratuite et mondiale permettant l\'affichage et la diffusion de votre contenu sur la plateforme. Tout contenu illégal, diffamatoire ou publicitaire sera supprimé.' },
    { h: '4. Modération', p: 'Les tutoriels sont soumis à une modération par la communauté avant publication. Les administrateurs se réservent le droit de refuser, modifier ou supprimer un contenu ne respectant pas les règles de contribution.' },
    { h: '5. Responsabilité', p: 'FlamOfreparation fournit des tutoriels à titre informatif. Les réparations sont effectuées à vos propres risques. Nous ne saurions être tenus responsables des dommages matériels ou corporels résultant d\'une réparation.' },
    { h: '6. Boutique', p: 'Les prix sont indiqués en euros (EUR) et toutes taxes comprises. La disponibilité des produits peut varier. Les commandes sont traitées sous 48h ouvrées. Un droit de rétractation de 30 jours est applicable conformément à la législation française.' },
    { h: '7. Propriété intellectuelle', p: 'Le design, les logos et les contenus éditoriaux de FlamOfreparation sont protégés par le droit de la propriété intellectuelle. Toute reproduction sans autorisation est interdite.' },
    { h: '8. Modifications', p: 'Les présentes conditions peuvent être modifiées à tout moment. Les modifications entrent en vigueur dès leur publication sur cette page.' },
  ];

  const privacyContent = [
    { h: '1. Responsable du traitement', p: 'FlamOfreparation est responsable du traitement des données personnelles collectées sur le site, conformément au RGPD et à la loi française.' },
    { h: '2. Données collectées', p: 'Nous collectons : votre adresse email, nom d\'utilisateur, et le contenu que vous publiez (tutoriels, solutions). Les cookies techniques sont nécessaires au fonctionnement du site. Aucun cookie marketing ou publicitaire n\'est déposé sans votre consentement.' },
    { h: '3. Finalités', p: 'Vos données sont utilisées pour : créer et gérer votre compte, afficher vos contributions, vous permettre d\'interagir avec la communauté, et traiter vos commandes si vous utilisez la boutique.' },
    { h: '4. Base légale', p: 'Le traitement de vos données repose sur : l\'exécution du contrat (création de compte), votre consentement (cookies non essentiels), et notre intérêt légitime (sécurité du site).' },
    { h: '5. Durée de conservation', p: 'Vos données sont conservées tant que votre compte est actif. Vous pouvez demander la suppression de votre compte à tout moment. Les données de commande sont conservées 10 ans pour des raisons légales.' },
    { h: '6. Sous-traitants', p: 'Vos données sont traitées par Supabase (hébergement base de données) et notre prestataire de paiement. Aucune donnée n\'est vendue à des tiers.' },
    { h: '7. Vos droits', p: 'Vous disposez des droits d\'accès, de rectification, d\'effacement, de limitation, d\'opposition et de portabilité. Pour exercer ces droits, contactez-nous à : contact@flameofreparation.com.' },
    { h: '8. Cookies', p: 'Seuls les cookies strictement nécessaires au fonctionnement du site sont déposés sans votre consentement. Aucun cookie de suivi marketing, publicité ou analyse tierce n\'est chargé avant votre consentement explicite.' },
  ];

  const content = isTerms ? termsContent : privacyContent;

  return (
    <div className="pt-16 min-h-screen bg-slate-50">
      <div className="bg-white border-b border-slate-100">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-8">
          <Link to="/" className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-primary-600 mb-4">
            <ArrowLeft className="w-4 h-4" /> Retour à l'accueil
          </Link>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-primary-50 flex items-center justify-center">
              <FileText className="w-6 h-6 text-primary-600" />
            </div>
            <div>
              <h1 className="font-display text-2xl font-bold text-slate-900">{isTerms ? 'Conditions d\'utilisation' : 'Politique de confidentialité'}</h1>
              <p className="text-slate-500 text-sm mt-0.5">Dernière mise à jour : 23 octobre 2026</p>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-8">
          <div className="space-y-6">
            {content.map((s, i) => (
              <div key={i}>
                <h2 className="font-display font-semibold text-slate-900 text-lg mb-2">{s.h}</h2>
                <p className="text-sm text-slate-600 leading-relaxed">{s.p}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-6 bg-primary-50 rounded-2xl p-5 flex items-center gap-3">
          <Wrench className="w-5 h-5 text-primary-600 shrink-0" />
          <p className="text-sm text-primary-700">
            Des questions ? Écrivez-nous à <a href="mailto:contact@flameofreparation.com" className="font-semibold underline">contact@flameofreparation.com</a>
          </p>
        </div>
      </div>
    </div>
  );
}
