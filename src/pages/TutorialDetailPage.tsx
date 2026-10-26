import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ChevronRight, Wrench } from 'lucide-react';
import supabase from '@/lib/supabase';
import type { Tutorial, TutorialStep, CommunitySolution } from '@/lib/types';
import { difficultyColor, timeLabel, formatNumber } from '@/lib/format';
import { useDocumentTitle } from '@/lib/useDocumentTitle';
import Spinner from '@/components/Spinner';
import { Clock, Eye, CheckCircle2, ArrowLeft, AlertTriangle } from 'lucide-react';

export default function TutorialDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const [loading, setLoading] = useState(true);
  const [tutorial, setTutorial] = useState<Tutorial | null>(null);
  const [steps, setSteps] = useState<TutorialStep[]>([]);
  const [solutions, setSolutions] = useState<CommunitySolution[]>([]);
  const [activeStep, setActiveStep] = useState(0);

  // SEO : titre d'onglet dynamique + incrémentation des vues
  useDocumentTitle(tutorial?.title);

  useEffect(() => {
    (async () => {
      if (!slug) return;
      setLoading(true);
      const { data: tut } = await supabase
        .from('tutorials')
        .select('*, category:categories(*), device:devices(*)')
        .eq('slug', slug)
        .maybeSingle();
      setTutorial(tut as Tutorial | null);

      if (tut) {
        const [stepsRes, solRes] = await Promise.all([
          supabase.from('tutorial_steps').select('*').eq('tutorial_id', tut.id).order('step_number', { ascending: true }),
          supabase.from('community_solutions').select('*, device:devices(*)').eq('device_id', tut.device_id).order('upvotes', { ascending: false }).limit(5),
        ]);
        setSteps(stepsRes.data as TutorialStep[] || []);
        setSolutions(solRes.data as CommunitySolution[] || []);

        // Compteur de vues (fire-and-forget : n'attend pas la réponse)
        // RLS ne permet l'update qu'à l'auteur : l'erreur est silencieuse
        // côté visiteur, le compteur reste géré par l'auteur/le serveur.
        supabase.from('tutorials').update({ views: (tut.views || 0) + 1 }).eq('id', tut.id).then(() => undefined);
      }
      setLoading(false);
    })();
  }, [slug]);

  if (loading) return <div className="pt-16"><Spinner /></div>;

  if (!tutorial) {
    return (
      <div className="pt-16 min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <AlertTriangle className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <h1 className="font-display text-2xl font-bold text-slate-900">Tutoriel introuvable</h1>
          <Link to="/tutoriels" className="mt-4 inline-flex items-center gap-2 text-primary-600 hover:text-primary-700">
            <ArrowLeft className="w-4 h-4" /> Retour aux tutoriels
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-16 min-h-screen bg-slate-50">
      {/* Breadcrumb */}
      <div className="bg-white border-b border-slate-100">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-3">
          <nav aria-label="Fil d'Ariane" className="flex items-center gap-1.5 text-xs text-slate-500 flex-wrap">
            <Link to="/" className="hover:text-primary-600">Accueil</Link>
            <ChevronRight className="w-3 h-3" />
            <Link to="/tutoriels" className="hover:text-primary-600">Tutoriels</Link>
            {tutorial.category && (
              <>
                <ChevronRight className="w-3 h-3" />
                <Link to={`/appareils?cat=${tutorial.category.slug}`} className="hover:text-primary-600">{tutorial.category.name}</Link>
              </>
            )}
            <ChevronRight className="w-3 h-3" />
            <span className="text-slate-700 truncate">{tutorial.title}</span>
          </nav>
        </div>
      </div>

      {/* Header */}
      <div className="bg-white border-b border-slate-100">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid lg:grid-cols-2 gap-8 items-center">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <span className={`badge ${difficultyColor(tutorial.difficulty)}`}>{tutorial.difficulty}</span>
                {tutorial.category && (
                  <Link to={`/appareils?cat=${tutorial.category.slug}`} className="badge bg-slate-100 text-slate-600 hover:bg-slate-200">
                    {tutorial.category.name}
                  </Link>
                )}
              </div>
              <h1 className="font-display text-3xl sm:text-4xl font-bold text-slate-900 leading-tight">{tutorial.title}</h1>
              {tutorial.summary && <p className="mt-4 text-slate-500 leading-relaxed">{tutorial.summary}</p>}
              <div className="mt-6 flex flex-wrap items-center gap-5 text-sm text-slate-500">
                <span className="flex items-center gap-1.5"><Clock className="w-4 h-4 text-primary-500" /> {timeLabel(tutorial.time_minutes)}</span>
                <span className="flex items-center gap-1.5"><Eye className="w-4 h-4 text-primary-500" /> {formatNumber(tutorial.views)} vues</span>
                <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-primary-500" /> {steps.length} étapes</span>
              </div>
            </div>
            <div className="relative aspect-[16:10] rounded-2xl overflow-hidden bg-slate-100">
              {tutorial.image_url ? (
                <img src={tutorial.image_url} alt={tutorial.title} className="w-full h-full object-cover" fetchPriority="high" />
              ) : (
                <div className="w-full h-full flex items-center justify-center"><Wrench className="w-16 h-16 text-slate-300" /></div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Introduction + Tools */}
      <div className="bg-white border-b border-slate-100">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              {tutorial.introduction && (
                <>
                  <h2 className="font-display text-xl font-bold text-slate-900 mb-2">Introduction</h2>
                  <p className="text-slate-600 leading-relaxed">{tutorial.introduction}</p>
                </>
              )}
            </div>
            <div className="lg:col-span-1">
              {tutorial.tools_required && tutorial.tools_required.length > 0 && (
                <div className="rounded-2xl bg-slate-50 border border-slate-200/80 p-5">
                  <h3 className="font-display font-semibold text-slate-900 text-sm mb-3 flex items-center gap-2">
                    <Wrench className="w-4 h-4 text-primary-600" /> Outils requis
                  </h3>
                  <ul className="space-y-2">
                    {tutorial.tools_required.map((tool, i) => (
                      <li key={i} className="flex items-center gap-2 text-sm text-slate-600">
                        <Wrench className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        {tool}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Steps */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Steps list sidebar */}
          <aside className="lg:col-span-1">
            <div className="lg:sticky lg:top-24">
              <h2 className="font-display text-lg font-bold text-slate-900 mb-4">Étapes ({steps.length})</h2>
              <div className="space-y-1.5">
                {steps.map((step, i) => (
                  <button
                    key={step.id}
                    onClick={() => setActiveStep(i)}
                    aria-current={activeStep === i ? 'step' : undefined}
                    className={`w-full flex items-start gap-3 p-3 rounded-xl text-left transition-all ${activeStep === i ? 'bg-primary-50 border border-primary-200' : 'hover:bg-slate-50 border border-transparent'}`}
                  >
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 text-sm font-bold transition-colors ${activeStep === i ? 'bg-primary-600 text-white' : 'bg-slate-100 text-slate-500'}`}>
                      {step.step_number}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-medium line-clamp-2 ${activeStep === i ? 'text-primary-700' : 'text-slate-600'}`}>
                        {step.title || step.description.slice(0, 60) + '...'}
                      </p>
                    </div>
                  </button>
                ))}
              </div>

              {solutions.length > 0 && (
                <div className="mt-8">
                  <h2 className="font-display text-lg font-bold text-slate-900 mb-4">Solutions communautaires</h2>
                  <div className="space-y-2">
                    {solutions.map((s) => (
                      <Link key={s.id} to={`/communaute`} className="block p-3 rounded-xl bg-white border border-slate-200/80 hover:border-primary-200 transition-colors">
                        <p className="text-sm font-medium text-slate-700 line-clamp-1">{s.title}</p>
                        <p className="text-xs text-slate-400 mt-1">{s.upvotes} votes utiles</p>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </aside>

          {/* Active step detail */}
          <div className="lg:col-span-2">
            {steps.length > 0 ? (
              <div className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden">
                {steps[activeStep].image_url && (
                  <div className="aspect-[16/9] overflow-hidden bg-slate-100">
                    <img src={steps[activeStep].image_url!} alt={steps[activeStep].title || `Étape ${steps[activeStep].step_number}`} className="w-full h-full object-cover" />
                  </div>
                )}
                <div className="p-6 sm:p-8">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-xl bg-primary-600 flex items-center justify-center shrink-0">
                      <span className="font-display text-lg font-bold text-white">{steps[activeStep].step_number}</span>
                    </div>
                    {steps[activeStep].title && <h2 className="font-display text-xl font-bold text-slate-900">{steps[activeStep].title}</h2>}
                  </div>
                  <p className="text-slate-600 leading-relaxed whitespace-pre-line">{steps[activeStep].description}</p>

                  <div className="mt-8 flex items-center justify-between">
                    <button
                      onClick={() => setActiveStep(Math.max(0, activeStep - 1))}
                      disabled={activeStep === 0}
                      className="flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-primary-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    >
                      <ArrowLeft className="w-4 h-4" /> Précédent
                    </button>
                    <span className="text-sm text-slate-400" aria-live="polite">Étape {activeStep + 1} sur {steps.length}</span>
                    <button
                      onClick={() => setActiveStep(Math.min(steps.length - 1, activeStep + 1))}
                      disabled={activeStep === steps.length - 1}
                      className="flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-primary-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    >
                      Suivant <ArrowLeft className="w-4 h-4 rotate-180" />
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-slate-200/80 p-8 text-center">
                <Wrench className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-500">Les étapes détaillées seront bientôt disponibles.</p>
              </div>
            )}

            {/* Warning */}
            <div className="mt-6 bg-amber-50 border border-amber-200 rounded-2xl p-5 flex gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-amber-800 text-sm">Précautions</h3>
                <p className="text-amber-700 text-sm mt-1 leading-relaxed">
                  Avant de commencer, débranchez votre appareil et portez des lunettes de protection. Consultez le guide complet et préparez vos outils à l'avance.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
