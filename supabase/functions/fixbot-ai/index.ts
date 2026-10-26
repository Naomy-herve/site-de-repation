// Edge Function Supabase : assistant FixBot IA
// Déployer avec : supabase functions deploy fixbot-ai
// Secret requis    : supabase secrets set OPENAI_API_KEY=sk-...
//
// Sécurité :
// - La clé API n'est JAMAIS exposée au navigateur (elle vit côté serveur)
// - Rate-limit simple par IP pour éviter les abus
// - CORS restreint à l'origine du site

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': (Deno.env.get('FIXBOT_ALLOWED_ORIGIN') ?? '*'),
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

const SYSTEM_PROMPT = `Tu es FixBot, l'assistant expert de FlamOfreparation — la plateforme francophone de réparation collaborative (tutoriels, communauté, boutique de pièces et d'outils).

RÔLE ET PERSONNALITÉ
- Tu aides les utilisateurs à diagnostiquer et réparer leurs appareils : smartphones, ordinateurs, consoles de jeux, électroménager, TV, audio...
- Ton ton : chaleureux, patient, pédagogue, léger (comme Ashna, l'assistant d'AshnaAI). Tu parles français.
- Ta mission : transformer une panne floue en plan de réparation clair et réalisable.

MÉTHODE DE RÉPONSE
1. Diagnostic d'abord : pose 1 ou 2 questions ciblées si la panne est floue (modèle exact, symptômes, depuis quand, ce qui a changé).
2. Plan structuré : causes probables → test de vérification pour chaque cause → remède.
3. Outils et pièces : liste précise (ex. tournevis pentalobe P2, kit batterie). Oriente vers la boutique FlamOfreparation pour les pièces.
4. Tutoriels : oriente vers la page /tutoriels avec le mot-clé de recherche pertinent.
5. Sécurité TOUJOURS : débrancher, batterie déconnectée, lunettes de protection pour toute intervention sous tension.
6. Honnêteté : si la réparation est trop risquée pour un débutant (ex. micro-soudure carte mère), dis-le clairement et recommande un professionnel.

STYLE
- Réponses concises (max ~200 mots), listes numérotées pour les étapes.
- Jamais de jargon non expliqué.
- Emoji discret autorisé (🔧 ⚠️ ✅) mais avec modération.`;

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

// Rate-limit mémoire simple (par instance Deno) : 20 requêtes / 5 min / IP
const RATE_LIMIT = 20;
const RATE_WINDOW_MS = 5 * 60 * 1000;
const hits = new Map<string, { count: number; resetAt: number }>();

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = hits.get(ip);
  if (!entry || entry.resetAt < now) {
    hits.set(ip, { count: 1, resetAt: now + RATE_WINDOW_MS });
    return false;
  }
  entry.count += 1;
  return entry.count > RATE_LIMIT;
}

Deno.serve(async (req: Request) => {
  // CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: CORS_HEADERS });
  }
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Méthode non autorisée' }), {
      status: 405,
      headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
    });
  }

  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown';
  if (isRateLimited(ip)) {
    return new Response(
      JSON.stringify({ error: 'Trop de requêtes. Réessayez dans quelques minutes.' }),
      { status: 429, headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' } }
    );
  }

  const apiKey = Deno.env.get('OPENAI_API_KEY');
  if (!apiKey) {
    return new Response(
      JSON.stringify({ error: 'Assistant IA non configuré. Réessayez plus tard.' }),
      { status: 503, headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' } }
    );
  }

  let body: { messages?: ChatMessage[] };
  try {
    body = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: 'Corps de requête invalide' }), {
      status: 400,
      headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
    });
  }

  if (!body.messages || !Array.isArray(body.messages) || body.messages.length === 0) {
    return new Response(JSON.stringify({ error: 'Messages requis' }), {
      status: 400,
      headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
    });
  }

  // Garde les 20 derniers messages maximum (limite les coûts/tokens)
  const history = body.messages.slice(-20);

  try {
    const openaiRes = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        temperature: 0.7,
        max_tokens: 500,
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          ...history,
        ],
      }),
    });

    if (!openaiRes.ok) {
      throw new Error(`OpenAI ${openaiRes.status}`);
    }

    const data = await openaiRes.json();
    const reply = data?.choices?.[0]?.message?.content;
    if (!reply) throw new Error('Réponse IA vide');

    return new Response(JSON.stringify({ reply }), {
      headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('fixbot-ai error:', err);
    return new Response(
      JSON.stringify({ error: 'Assistant momentanément indisponible. Réessayez dans un instant.' }),
      { status: 502, headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' } }
    );
  }
});
