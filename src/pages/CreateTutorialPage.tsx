import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Plus, Trash2, ArrowLeft, Eye, Save, ArrowRight, Wrench, AlertTriangle, Camera } from 'lucide-react';
import supabase from '@/lib/supabase';
import type { Category, Device, Difficulty } from '@/lib/types';
import Spinner from '@/components/Spinner';

interface StepDraft {
  title: string;
  description: string;
}

export default function CreateTutorialPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [authed, setAuthed] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [devices, setDevices] = useState<Device[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [showPreview, setShowPreview] = useState(false);

  const [title, setTitle] = useState('');
  const [summary, setSummary] = useState('');
  const [introduction, setIntroduction] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [deviceId, setDeviceId] = useState('');
  const [difficulty, setDifficulty] = useState<Difficulty>('Modérée');
  const [timeMinutes, setTimeMinutes] = useState(30);
  const [tools, setTools] = useState<string[]>(['']);
  const [steps, setSteps] = useState<StepDraft[]>([{ title: '', description: '' }]);

  useEffect(() => {
    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate('/join');
        return;
      }
      setAuthed(true);
      const [{ data: cats }, { data: devs }] = await Promise.all([
        supabase.from('categories').select('*').order('display_order'),
        supabase.from('devices').select('*, category:categories(*)').order('name'),
      ]);
      setCategories(cats as Category[] || []);
      setDevices(devs as Device[] || []);
      setLoading(false);
    })();
  }, [navigate]);

  if (loading) return <div className="pt-16"><Spinner label="Chargement..." /></div>;
  if (!authed) return null;

  const filteredDevices = deviceId ? devices : (categoryId ? devices.filter(d => d.category_id === categoryId) : devices);

  const addTool = () => setTools([...tools, '']);
  const updateTool = (i: number, val: string) => setTools(tools.map((t, idx) => idx === i ? val : t));
  const removeTool = (i: number) => setTools(tools.filter((_, idx) => idx !== i));

  const addStep = () => setSteps([...steps, { title: '', description: '' }]);
  const updateStep = (i: number, field: 'title' | 'description', val: string) =>
    setSteps(steps.map((s, idx) => idx === i ? { ...s, [field]: val } : s));
  const removeStep = (i: number) => setSteps(steps.filter((_, idx) => idx !== i));

  const slugify = (s: string) =>
    s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

  const handleSubmit = async (publish: boolean) => {
    setError('');
    if (!title.trim() || !summary.trim() || !introduction.trim() || !categoryId) {
      setError('Veuillez remplir tous les champs obligatoires (titre, résumé, introduction, catégorie).');
      return;
    }
    const validSteps = steps.filter(s => s.description.trim());
    if (validSteps.length < 3) {
      setError('Un tutoriel doit contenir au moins 3 étapes avec une description.');
      return;
    }
    setSubmitting(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const slug = `${slugify(title)}-${Date.now().toString(36)}`;
      const { data: tut, error: tutErr } = await supabase.from('tutorials').insert({
        title: title.trim(),
        slug,
        category_id: categoryId,
        device_id: deviceId || null,
        author_id: session?.user.id,
        summary: summary.trim(),
        introduction: introduction.trim(),
        tools_required: tools.filter(t => t.trim()),
        difficulty,
        time_minutes: timeMinutes,
        published: publish,
        views: 0,
      }).select().single();

      if (tutErr || !tut) throw new Error(tutErr?.message || 'Erreur lors de la création');

      const stepInserts = validSteps.map((s, i) => ({
        tutorial_id: tut.id,
        step_number: i + 1,
        title: s.title.trim() || null,
        description: s.description.trim(),
      }));
      const { error: stepsErr } = await supabase.from('tutorial_steps').insert(stepInserts);
      if (stepsErr) throw new Error(stepsErr.message);

      navigate(`/tutoriel/${slug}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
    } finally {
      setSubmitting(false);
    }
  };

  const difficulties: Difficulty[] = ['Facile', 'Modérée', 'Difficile', 'Très difficile'];

  return (
    <div className="pt-16 min-h-screen bg-slate-50">
      <div className="bg-white border-b border-slate-100">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-6">
          <Link to="/guide-creation" className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-primary-600 mb-3">
            <ArrowLeft className="w-4 h-4" /> Guide de création
          </Link>
          <h1 className="font-display text-2xl font-bold text-slate-900">Créer un tutoriel</h1>
          <p className="mt-1 text-sm text-slate-500">Renseignez tous les champs pour aider la communauté à réparer.</p>
        </div>
      </div>

      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="mb-6 rounded-xl bg-red-50 border border-red-200 p-4 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        <div className="space-y-6">
          {/* Section 1: Basic info */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6">
            <h2 className="font-display font-semibold text-slate-900 text-lg mb-4 flex items-center gap-2">
              <span className="w-7 h-7 rounded-lg bg-primary-600 text-white text-sm font-bold flex items-center justify-center">1</span>
              Informations générales
            </h2>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-slate-700 mb-1.5 block">Titre *</label>
                <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Remplacement écran iPhone 12"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm focus:outline-none focus:border-primary-400 focus:bg-white transition-all" />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700 mb-1.5 block">Résumé *</label>
                <textarea value={summary} onChange={(e) => setSummary(e.target.value)} rows={2} placeholder="Guide complet pour remplacer l'écran Super Retina XDR d'un iPhone 12."
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm focus:outline-none focus:border-primary-400 focus:bg-white transition-all" />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700 mb-1.5 block">Introduction *</label>
                <textarea value={introduction} onChange={(e) => setIntroduction(e.target.value)} rows={3} placeholder="Ce guide vous explique comment..."
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm focus:outline-none focus:border-primary-400 focus:bg-white transition-all" />
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-slate-700 mb-1.5 block">Catégorie *</label>
                  <select value={categoryId} onChange={(e) => { setCategoryId(e.target.value); setDeviceId(''); }}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm focus:outline-none focus:border-primary-400 focus:bg-white transition-all">
                    <option value="">Sélectionner...</option>
                    {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700 mb-1.5 block">Appareil</label>
                  <select value={deviceId} onChange={(e) => setDeviceId(e.target.value)} disabled={!categoryId}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm focus:outline-none focus:border-primary-400 focus:bg-white transition-all disabled:opacity-50">
                    <option value="">Aucun / Autre</option>
                    {filteredDevices.map((d) => <option key={d.id} value={d.id}>{d.manufacturer ? `${d.manufacturer} ` : ''}{d.name}</option>)}
                  </select>
                </div>
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-slate-700 mb-1.5 block">Difficulté</label>
                  <select value={difficulty} onChange={(e) => setDifficulty(e.target.value as Difficulty)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm focus:outline-none focus:border-primary-400 focus:bg-white transition-all">
                    {difficulties.map((d) => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700 mb-1.5 block">Durée estimée (minutes)</label>
                  <input type="number" value={timeMinutes} onChange={(e) => setTimeMinutes(Number(e.target.value))} min={5} max={600}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm focus:outline-none focus:border-primary-400 focus:bg-white transition-all" />
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Tools */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6">
            <h2 className="font-display font-semibold text-slate-900 text-lg mb-4 flex items-center gap-2">
              <span className="w-7 h-7 rounded-lg bg-primary-600 text-white text-sm font-bold flex items-center justify-center">2</span>
              Outils requis
            </h2>
            <div className="space-y-2">
              {tools.map((tool, i) => (
                <div key={i} className="flex items-center gap-2">
                  <Wrench className="w-4 h-4 text-slate-400 shrink-0" />
                  <input value={tool} onChange={(e) => updateTool(i, e.target.value)} placeholder="Tournevis Pentalobe P2"
                    className="flex-1 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm focus:outline-none focus:border-primary-400 focus:bg-white transition-all" />
                  {tools.length > 1 && (
                    <button onClick={() => removeTool(i)} className="p-2 text-red-400 hover:text-red-600 transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
              <button onClick={addTool} className="flex items-center gap-1.5 text-sm font-medium text-primary-600 hover:text-primary-700 mt-2">
                <Plus className="w-4 h-4" /> Ajouter un outil
              </button>
            </div>
          </div>

          {/* Section 3: Steps */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6">
            <h2 className="font-display font-semibold text-slate-900 text-lg mb-4 flex items-center gap-2">
              <span className="w-7 h-7 rounded-lg bg-primary-600 text-white text-sm font-bold flex items-center justify-center">3</span>
              Étapes ({steps.length})
            </h2>
            <div className="space-y-4">
              {steps.map((step, i) => (
                <div key={i} className="rounded-xl border border-slate-200 p-4 bg-slate-50/50">
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-display font-semibold text-slate-900 text-sm">Étape {i + 1}</span>
                    {steps.length > 1 && (
                      <button onClick={() => removeStep(i)} className="text-xs text-red-400 hover:text-red-600 flex items-center gap-1 transition-colors">
                        <Trash2 className="w-3.5 h-3.5" /> Supprimer
                      </button>
                    )}
                  </div>
                  <input value={step.title} onChange={(e) => updateStep(i, 'title', e.target.value)} placeholder="Titre de l'étape (optionnel)"
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm focus:outline-none focus:border-primary-400 transition-all mb-2" />
                  <textarea value={step.description} onChange={(e) => updateStep(i, 'description', e.target.value)} rows={3} placeholder="Décrivez cette étape en détail..."
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm focus:outline-none focus:border-primary-400 transition-all" />
                  <div className="mt-2 flex items-center gap-2 text-xs text-slate-400">
                    <Camera className="w-3.5 h-3.5" /> Ajouter une photo (bientôt disponible)
                  </div>
                </div>
              ))}
              <button onClick={addStep} className="flex items-center gap-1.5 text-sm font-medium text-primary-600 hover:text-primary-700">
                <Plus className="w-4 h-4" /> Ajouter une étape
              </button>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3">
            <button onClick={() => setShowPreview(!showPreview)} className="btn-secondary flex-1">
              <Eye className="w-4 h-4" /> {showPreview ? "Masquer l'aper\u00e7u" : 'Prévisualiser'}
            </button>
            <button onClick={() => handleSubmit(false)} disabled={submitting} className="btn-secondary flex-1">
              <Save className="w-4 h-4" /> Sauvegarder en brouillon
            </button>
            <button onClick={() => handleSubmit(true)} disabled={submitting} className="btn-primary flex-1">
              {submitting ? 'Publication...' : 'Publier'}
              {!submitting && <ArrowRight className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Preview */}
        {showPreview && (
          <div className="mt-8 bg-white rounded-2xl border border-slate-200/80 p-6 animate-fade-in">
            <h2 className="font-display text-xl font-bold text-slate-900 mb-2">{title || 'Sans titre'}</h2>
            <p className="text-sm text-slate-500 mb-2">{summary || 'Aucun résumé'}</p>
            <p className="text-sm text-slate-600 mb-4">{introduction || 'Aucune introduction'}</p>
            {tools.filter(t => t.trim()).length > 0 && (
              <div className="mb-4">
                <h3 className="font-semibold text-sm text-slate-900 mb-2">Outils requis :</h3>
                <ul className="text-sm text-slate-600 list-disc list-inside space-y-1">
                  {tools.filter(t => t.trim()).map((t, i) => <li key={i}>{t}</li>)}
                </ul>
              </div>
            )}
            <div className="space-y-3">
              {steps.filter(s => s.description.trim()).map((s, i) => (
                <div key={i} className="border-l-2 border-primary-200 pl-4">
                  <span className="text-xs font-bold text-primary-600">Étape {i + 1}</span>
                  {s.title && <h4 className="font-semibold text-slate-900 text-sm mt-0.5">{s.title}</h4>}
                  <p className="text-sm text-slate-600 mt-1">{s.description}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
