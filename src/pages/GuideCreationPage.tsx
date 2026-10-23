import { Link } from 'react-router-dom';
import { Wrench, BookOpen, Users, Award, ArrowRight, ListChecks, Eye, Upload } from 'lucide-react';

export default function GuideCreationPage() {
  const steps = [
    { num: 1, icon: BookOpen, title: 'Choisir un appareil', desc: 'Sélectionnez l\'appareil concerné par votre tutoriel parmi notre base ou ajoutez-en un nouveau.' },
    { num: 2, icon: Eye, title: 'Décrire la réparation', desc: 'Indiquez le titre, la difficulté, le temps estimé et un résumé clair de la réparation.' },
    { num: 3, icon: Upload, title: 'Documenter les étapes', desc: 'Ajoutez chaque étape avec une description détaillée et des photos pour guider les réparateurs.' },
    { num: 4, icon: Award, title: 'Publier et aider', desc: 'Votre tutoriel est relu par la communauté puis publié. Gagnez en réputation à chaque contribution.' },
  ];

  const rules = [
    'Photos claires et bien éclairées, sans main dedans',
    'Descriptions précises, étape par étape, sans jargon inutile',
    'Indication des outils nécessaires et des précautions de sécurité',
    'Aucune publicité ou lien commercial dans le contenu',
    'Respect de la propriété intellectuelle (vos propres photos)',
  ];

  return (
    <div className="pt-16 min-h-screen bg-slate-50">
      <div className="bg-white border-b border-slate-100">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-primary-50 flex items-center justify-center">
              <Wrench className="w-6 h-6 text-primary-600" />
            </div>
            <div>
              <h1 className="font-display text-3xl font-bold text-slate-900">Créer un tutoriel</h1>
              <p className="text-slate-500 text-sm mt-1">Partagez votre savoir-faire avec la communauté FlamOfreparation</p>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-8">
        {/* Process */}
        <h2 className="font-display text-2xl font-bold text-slate-900 mb-6">Comment ça marche</h2>
        <div className="grid sm:grid-cols-2 gap-5 mb-12">
          {steps.map((s) => {
            const Icon = s.icon;
            return (
              <div key={s.num} className="card p-6">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-primary-600 flex items-center justify-center">
                    <span className="font-display text-lg font-bold text-white">{s.num}</span>
                  </div>
                  <Icon className="w-5 h-5 text-primary-500" />
                </div>
                <h3 className="font-display font-semibold text-slate-900 text-base">{s.title}</h3>
                <p className="mt-2 text-sm text-slate-500 leading-relaxed">{s.desc}</p>
              </div>
            );
          })}
        </div>

        {/* Rules */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 mb-8">
          <h2 className="font-display text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
            <ListChecks className="w-5 h-5 text-primary-500" /> Règles de contribution
          </h2>
          <ul className="space-y-2.5">
            {rules.map((r, i) => (
              <li key={i} className="flex items-start gap-2.5 text-sm text-slate-600">
                <span className="w-5 h-5 rounded-full bg-primary-50 flex items-center justify-center shrink-0 mt-0.5">
                  <span className="text-xs font-bold text-primary-600">{i + 1}</span>
                </span>
                {r}
              </li>
            ))}
          </ul>
        </div>

        {/* CTA */}
        <div className="bg-gradient-to-r from-primary-700 to-primary-900 rounded-3xl p-8 sm:p-12 text-center">
          <Users className="w-12 h-12 text-primary-300 mx-auto mb-4" />
          <h2 className="font-display text-2xl font-bold text-white">Prêt à partager votre expertise ?</h2>
          <p className="mt-3 text-primary-100 max-w-lg mx-auto">Créez un compte gratuit pour commencer à publier vos tutoriels et aider des milliers de réparateurs.</p>
          <Link to="/join" className="mt-6 inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-semibold text-primary-700 hover:bg-primary-50 transition-colors">
            Créer un compte
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
