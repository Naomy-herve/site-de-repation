import { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, Bot, Trash2 } from 'lucide-react';
import type { FixbotMessage } from '@/lib/types';

const SESSION_KEY = 'flam_fixbot_session';

const suggestions = [
  'Mon iPhone 12 ne s\'allume plus',
  'Comment remplacer la batterie d\'un iPhone 13 ?',
  'Le joystick de ma Switch dérive',
  'Mon lave-linge ne vidange plus',
];

function generateReply(userMessage: string): string {
  const msg = userMessage.toLowerCase();
  if (msg.includes('batterie') && (msg.includes('iphone') || msg.includes('13'))) {
    return 'Pour remplacer la batterie d\'un iPhone 13 : 1) Retirez les vis pentalobe en bas, 2) Chauffez et ouvrez l\'écran, 3) Débranchez la batterie, 4) Retirez les adhésifs, 5) Installez la nouvelle batterie. Consultez le tutoriel complet sur notre page dédiée. Vous aurez besoin d\'un kit batterie (39,90 €) et d\'outils de précision.';
  }
  if (msg.includes('écran') && msg.includes('iphone')) {
    return 'Le remplacement d\'écran iPhone nécessite : pentalobe P2, tri-point Y000, spudger, ventouse. Comptez environ 45-50 minutes. Nous proposons des écrans de remplacement à partir de 59,90 €. Vérifiez la compatibilité avec votre modèle exact dans la boutique.';
  }
  if (msg.includes('switch') || msg.includes('joystick') || msg.includes('drift')) {
    return 'Le drift du joystick Joy-Con est très courant. Solutions : 1) Étalonnage dans Paramètres > Manettes, 2) Nettoyage à l\'air comprimé, 3) Remplacement du module joystick (14,90 €). Le remplacement prend environ 30 minutes avec un tournevis tri-point Y00.';
  }
  if (msg.includes('lave') || msg.includes('vidange') || msg.includes('pompe')) {
    return 'Si votre lave-linge ne vidange plus, vérifiez d\'abord le filtre de la pompe en bas à droite. S\'il est propre mais que le problème persiste, la pompe de vidange est peut-être défectueuse. Nous proposons une pompe de remplacement universelle à 34,90 € compatible Bosch, Samsung, Whirlpool.';
  }
  if (msg.includes('allume') || msg.includes('s\'allume') || msg.includes('démarr')) {
    return 'Un appareil qui ne s\'allume plus peut avoir plusieurs causes : 1) Batterie déchargée ou défectueuse, 2) Port de charge endommagé, 3) Court-circuit sur la carte mère. Commencez par tester avec un autre chargeur et câble. Si le problème persiste, la batterie est souvent en cause. Recherchez votre appareil dans nos tutoriels pour un guide de diagnostic.';
  }
  return 'Je suis FixBot, votre assistant réparation ! Décrivez votre problème et je vous suggérerai des tutoriels, pièces et outils. Vous pouvez aussi consulter notre catalogue de 63 548 tutoriels gratuits ou chercher dans la boutique les pièces dont vous avez besoin.';
}

export default function FixBotChat() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<FixbotMessage[]>([]);
  const [input, setInput] = useState('');
  const [consented, setConsented] = useState(false);
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const c = localStorage.getItem('flam_fixbot_consent');
    if (c === 'true') setConsented(true);
    const s = localStorage.getItem(SESSION_KEY);
    if (s) setSessionId(s);
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, open]);

  const handleConsent = () => {
    localStorage.setItem('flam_fixbot_consent', 'true');
    setConsented(true);
  };

  const handleSend = async () => {
    if (!input.trim() || !consented) return;
    const userMsg = input.trim();
    setInput('');
    setLoading(true);

    const sid = sessionId || crypto.randomUUID();
    if (!sessionId) {
      setSessionId(sid);
      localStorage.setItem(SESSION_KEY, sid);
    }

    const userMessage: FixbotMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      message: userMsg,
      created_at: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, userMessage]);

    setTimeout(() => {
      const reply = generateReply(userMsg);
      const assistantMessage: FixbotMessage = {
        id: crypto.randomUUID(),
        role: 'assistant',
        message: reply,
        created_at: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, assistantMessage]);
      setLoading(false);
    }, 800);
  };

  // Les messages ne sont pas persistés côté serveur : la suppression
  // est purement locale (le code supabase était mort — les messages
  // ne sont jamais insérés dans fixbot_conversations).
  const handleDeleteConversation = () => {
    setMessages([]);
    localStorage.removeItem(SESSION_KEY);
    setSessionId('');
  };

  return (
    <>
      {/* Floating button */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="fixed bottom-5 right-5 z-50 flex items-center gap-2 rounded-full bg-primary-600 px-5 py-3.5 text-sm font-semibold text-white shadow-xl hover:bg-primary-700 hover:shadow-2xl transition-all active:scale-95"
        >
          <MessageSquare className="w-5 h-5" />
          <span className="hidden sm:inline">FixBot</span>
          <span className="absolute -top-1 -right-1 w-3 h-3 bg-accent-500 rounded-full border-2 border-primary-600" />
        </button>
      )}

      {/* Chat panel */}
      {open && (
        <div className="fixed bottom-0 right-0 sm:bottom-5 sm:right-5 z-50 w-full sm:w-96 animate-slide-up">
          <div className="bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl border border-slate-200 flex flex-col max-h-[85vh] sm:max-h-[600px]">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-slate-100 bg-gradient-to-r from-primary-700 to-primary-900 rounded-t-3xl">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-white/15 flex items-center justify-center">
                  <Bot className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-display font-semibold text-white text-sm">FixBot</h3>
                  <p className="text-xs text-primary-200">Assistant réparation IA</p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                {messages.length > 0 && consented && (
                  <button onClick={handleDeleteConversation} title="Supprimer la conversation" className="p-2 rounded-lg text-primary-200 hover:bg-white/10 transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
                <button onClick={() => setOpen(false)} className="p-2 rounded-lg text-primary-200 hover:bg-white/10 transition-colors">
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50">
              {!consented ? (
                <div className="text-center py-6">
                  <Bot className="w-12 h-12 text-primary-300 mx-auto mb-3" />
                  <h4 className="font-display font-semibold text-slate-900 text-sm">Bienvenue, je suis FixBot</h4>
                  <p className="mt-2 text-xs text-slate-500 leading-relaxed max-w-xs mx-auto">
                    Je peux vous aider à diagnostiquer vos pannes et trouver des tutoriels et pièces. Vos conversations sont privées et supprimables à tout moment.
                  </p>
                  <button onClick={handleConsent} className="mt-4 btn-primary py-2 px-4 text-xs">
                    Accepter et discuter
                  </button>
                </div>
              ) : messages.length === 0 ? (
                <div>
                  <div className="bg-white rounded-2xl rounded-tl-sm p-3 border border-slate-200/80">
                    <p className="text-sm text-slate-700">Bonjour ! Décrivez votre problème de réparation et je vous aiderai. Voici quelques sujets courants :</p>
                  </div>
                  <div className="mt-3 space-y-2">
                    {suggestions.map((s, i) => (
                      <button
                        key={i}
                        onClick={() => { setInput(s); }}
                        className="w-full text-left px-3 py-2 rounded-xl bg-white border border-slate-200/80 text-xs text-slate-600 hover:border-primary-300 hover:text-primary-600 transition-colors"
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                messages.map((m) => (
                  <div key={m.id} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[85%] rounded-2xl p-3 text-sm ${
                      m.role === 'user'
                        ? 'bg-primary-600 text-white rounded-tr-sm'
                        : 'bg-white text-slate-700 border border-slate-200/80 rounded-tl-sm'
                    }`}>
                      {m.message}
                    </div>
                  </div>
                ))
              )}
              {loading && (
                <div className="flex justify-start">
                  <div className="bg-white rounded-2xl rounded-tl-sm p-3 border border-slate-200/80 flex items-center gap-2">
                    <div className="w-2 h-2 bg-primary-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-2 h-2 bg-primary-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-2 h-2 bg-primary-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              )}
            </div>

            {/* Input */}
            {consented && (
              <div className="p-3 border-t border-slate-100 bg-white rounded-b-3xl">
                <form
                  onSubmit={(e) => { e.preventDefault(); handleSend(); }}
                  className="flex items-center gap-2"
                >
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Décrivez votre problème..."
                    className="flex-1 rounded-full bg-slate-100 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-300"
                  />
                  <button type="submit" disabled={!input.trim()} className="w-10 h-10 rounded-full bg-primary-600 flex items-center justify-center text-white hover:bg-primary-700 disabled:opacity-40 transition-colors shrink-0">
                    <Send className="w-4 h-4" />
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
