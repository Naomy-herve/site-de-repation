import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, TrendingUp, Users, BookOpen, Award, Recycle, ChevronRight, Zap, Clock, Eye, Star, ArrowRight, Wrench, ShoppingBag } from 'lucide-react';
import supabase from '@/lib/supabase';
import type { Tutorial, Product, BlogPost, Category } from '@/lib/types';
import { difficultyColor, timeLabel, formatNumber, formatDate } from '@/lib/format';
import TutorialCard from '@/components/TutorialCard';
import ProductCard from '@/components/ProductCard';
import CategoryGrid from '@/components/CategoryGrid';
import SectionHeading from '@/components/SectionHeading';
import Spinner from '@/components/Spinner';
import NewsletterSection from '@/components/NewsletterSection';

export default function HomePage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [featuredTutorials, setFeaturedTutorials] = useState<Tutorial[]>([]);
  const [popularTutorials, setPopularTutorials] = useState<Tutorial[]>([]);
  const [recentTutorials, setRecentTutorials] = useState<Tutorial[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    (async () => {
      try {
        const [
          featured, popular, recent, prods, blog, cats,
        ] = await Promise.all([
          supabase.from('tutorials').select('*, category:categories(*), device:devices(*)').eq('featured', true).eq('published', true).order('views', { ascending: false }).limit(6),
          supabase.from('tutorials').select('*, category:categories(*), device:devices(*)').eq('published', true).order('views', { ascending: false }).limit(8),
          supabase.from('tutorials').select('*, category:categories(*), device:devices(*)').eq('published', true).order('created_at', { ascending: false }).limit(4),
          supabase.from('products').select('*').order('rating', { ascending: false }).limit(8),
          supabase.from('blog_posts').select('*').order('published_at', { ascending: false }).limit(3),
          supabase.from('categories').select('*').order('display_order', { ascending: true }),
        ]);
        setFeaturedTutorials(featured.data as Tutorial[] || []);
        setPopularTutorials(popular.data as Tutorial[] || []);
        setRecentTutorials(recent.data as Tutorial[] || []);
        setProducts(prods.data as Product[] || []);
        setPosts(blog.data as BlogPost[] || []);
        setCategories(cats.data as Category[] || []);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (search.trim()) navigate(`/tutoriels?q=${encodeURIComponent(search.trim())}`);
  };

  if (loading) return <Spinner label="Chargement de la plateforme..." />;

  const stats = [
    { value: '63 548', label: 'Tutoriels gratuits', icon: BookOpen },
    { value: '100 M+', label: 'Réparations réussies', icon: TrendingUp },
    { value: '249 323', label: 'Solutions communautaires', icon: Users },
  ];

  return (
    <div className="pt-16">
      {/* Hero */}
      <section className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-primary-900 overflow-hidden">
        <div className="absolute inset-0 opacity-10" style={{
          backgroundImage: 'url(https://images.pexels.com/photos/39885412/pexels-photo-39885412.jpeg?auto=compress&cs=tinysrgb&h=650&w=940)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }} />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-900/95 to-slate-900/60" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full bg-primary-500/15 border border-primary-400/20 px-4 py-1.5 mb-6 animate-fade-in">
              <Recycle className="w-4 h-4 text-primary-300" />
              <span className="text-sm font-medium text-primary-200">La réparation collaborative, en français</span>
            </div>
            <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight animate-slide-up">
              Réparez tout,<br />
              <span className="text-primary-400">apprenez ensemble</span>
            </h1>
            <p className="mt-6 text-lg text-slate-300 leading-relaxed max-w-xl">
              La plus grande plateforme francophone de tutoriels de réparation. Des milliers de guides gratuits, une communauté passionnée, et une boutique pour tous vos outils et pièces.
            </p>

            <form onSubmit={handleSearch} className="mt-8 relative max-w-xl">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Rechercher : iPhone, PS5, lave-linge..."
                className="w-full rounded-full border-0 bg-white py-4 pl-12 pr-32 text-sm text-slate-800 shadow-2xl focus:outline-none focus:ring-4 focus:ring-primary-400/30"
              />
              <button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 btn-primary py-2.5 px-5 text-sm">
                Rechercher
              </button>
            </form>

            <div className="mt-6 flex flex-wrap gap-2">
              <span className="text-sm text-slate-400 self-center">Populaire :</span>
              {['iPhone 12', 'PS5', 'Switch', 'MacBook', 'Lave-linge'].map((tag) => (
                <Link key={tag} to={`/tutoriels?q=${encodeURIComponent(tag)}`} className="text-sm text-primary-300 hover:text-primary-200 underline-offset-2 hover:underline transition-colors">
                  {tag}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-white border-b border-slate-100">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {stats.map((stat, i) => {
              const Icon = stat.icon;
              return (
                <div key={i} className="text-center group">
                  <div className="inline-flex w-12 h-12 rounded-2xl bg-primary-50 items-center justify-center mb-3 group-hover:bg-primary-100 transition-colors">
                    <Icon className="w-6 h-6 text-primary-600" />
                  </div>
                  <div className="font-display text-3xl sm:text-4xl font-bold text-slate-900">{stat.value}</div>
                  <div className="mt-1 text-sm text-slate-500">{stat.label}</div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
        <SectionHeading
          title="Parcourir par catégorie"
          subtitle="Trouvez des guides de réparation pour chaque type d'appareil"
          linkTo="/appareils"
        />
        <CategoryGrid categories={categories} />
      </section>

      {/* Featured tutorials */}
      <section className="bg-slate-50 border-y border-slate-100">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
          <SectionHeading
            title="Tutoriels à la une"
            subtitle="Les guides les plus consultés de la communauté"
            linkTo="/tutoriels"
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {featuredTutorials.map((t) => (
              <TutorialCard key={t.id} tutorial={t} />
            ))}
          </div>
        </div>
      </section>

      {/* Popular tutorials */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
        <SectionHeading
          title="Les plus populaires"
          subtitle="Ce que la communauté répare en ce moment"
          linkTo="/tutoriels?sort=views"
        />
        <div className="space-y-3">
          {popularTutorials.slice(0, 5).map((t, i) => (
            <Link key={t.id} to={`/tutoriel/${t.slug}`} className="card group flex items-center gap-4 p-4">
              <div className="w-12 h-12 rounded-xl bg-primary-50 flex items-center justify-center shrink-0">
                <span className="font-display text-xl font-bold text-primary-600">{i + 1}</span>
              </div>
              <div className="relative w-20 h-20 sm:w-28 sm:h-20 rounded-xl overflow-hidden bg-slate-100 shrink-0">
                {t.image_url && (
                  <img src={t.image_url} alt={t.title} className="w-full h-full object-cover" loading="lazy" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-display font-semibold text-slate-900 text-sm sm:text-base group-hover:text-primary-600 transition-colors line-clamp-1">
                  {t.title}
                </h3>
                {t.summary && <p className="text-xs sm:text-sm text-slate-500 line-clamp-1 mt-1 hidden sm:block">{t.summary}</p>}
                <div className="mt-2 flex items-center gap-3 text-xs text-slate-400">
                  <span className={`badge ${difficultyColor(t.difficulty)} !py-0.5`}>{t.difficulty}</span>
                  <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{timeLabel(t.time_minutes)}</span>
                  <span className="flex items-center gap-1"><Eye className="w-3 h-3" />{formatNumber(t.views)}</span>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-primary-500 group-hover:translate-x-1 transition-all shrink-0" />
            </Link>
          ))}
        </div>
      </section>

      {/* Community + Tools callout */}
      <section className="bg-gradient-to-br from-primary-700 to-primary-900 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10" style={{
          backgroundImage: 'url(https://images.pexels.com/photos/38145576/pexels-photo-38145576.jpeg?auto=compress&cs=tinysrgb&h=650&w=940)',
          backgroundSize: 'cover',
        }} />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-white/10 backdrop-blur-md rounded-3xl p-8 border border-white/10">
              <div className="w-12 h-12 rounded-2xl bg-accent-500 flex items-center justify-center mb-4">
                <Users className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-display text-2xl font-bold text-white mb-2">Partagez votre solution</h3>
              <p className="text-primary-100 text-sm leading-relaxed mb-6">
                Vous avez réparé quelque chose ? Partagez votre astuce avec des milliers de réparateurs. Chaque solution compte pour réduire le gaspillage électronique.
              </p>
              <Link to="/communaute" className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-primary-700 hover:bg-primary-50 transition-colors">
                Voir les solutions
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-3xl p-8 border border-white/10">
              <div className="w-12 h-12 rounded-2xl bg-accent-500 flex items-center justify-center mb-4">
                <ShoppingBag className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-display text-2xl font-bold text-white mb-2">Tout pour réparer</h3>
              <p className="text-primary-100 text-sm leading-relaxed mb-6">
                Pièces détachées, outils de précision, kits complets : tout ce qu'il vous faut pour réussir vos réparations, livré chez vous.
              </p>
              <Link to="/boutique" className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-primary-700 hover:bg-primary-50 transition-colors">
                Visiter la boutique
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Recent tutorials */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
        <SectionHeading
          title="Nouveautés"
          subtitle="Les derniers tutoriels ajoutés par la communauté"
          linkTo="/tutoriels?sort=recent"
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {recentTutorials.map((t) => (
            <TutorialCard key={t.id} tutorial={t} />
          ))}
        </div>
      </section>

      {/* Featured products */}
      <section className="bg-slate-50 border-y border-slate-100">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
          <SectionHeading
            title="Boutique : pièces & outils"
            subtitle="Les meilleurs équipements pour vos réparations"
            linkTo="/boutique"
          />
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
            {products.slice(0, 8).map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      </section>

      {/* Blog */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
        <SectionHeading
          title="Actualités & guides"
          subtitle="Le droit à la réparation, les techniques, et les conseils de la rédaction"
          linkTo="/blog"
        />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {posts.map((post) => (
            <Link key={post.id} to={`/blog/${post.slug}`} className="card group overflow-hidden block">
              <div className="aspect-[16/10] overflow-hidden bg-slate-100">
                {post.image_url && (
                  <img src={post.image_url} alt={post.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" loading="lazy" />
                )}
              </div>
              <div className="p-5">
                <div className="flex items-center gap-2 mb-2">
                  <span className="badge bg-primary-50 text-primary-700 capitalize">{post.category}</span>
                  <span className="text-xs text-slate-400">{formatDate(post.published_at)}</span>
                </div>
                <h3 className="font-display font-semibold text-slate-900 text-base leading-snug group-hover:text-primary-600 transition-colors line-clamp-2">
                  {post.title}
                </h3>
                <p className="mt-2 text-sm text-slate-500 line-clamp-2 leading-relaxed">{post.excerpt}</p>
                <div className="mt-3 flex items-center gap-2 text-xs text-slate-400">
                  <Award className="w-3.5 h-3.5" />
                  <span>{post.author}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Partners */}
      <section className="bg-white border-y border-slate-100">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
          <p className="text-center text-xs font-semibold uppercase tracking-wider text-slate-400 mb-6">Ils soutiennent la réparation</p>
          <div className="flex flex-wrap items-center justify-center gap-x-12 gap-y-6">
            {['ADEME', 'Indice de Réparabilité', 'European Right to Repair', "Halte à l'Obsolescence", 'Longevity', 'Eco-systèmes'].map((name, i) => (
              <div key={i} className="flex items-center gap-2 text-slate-400 hover:text-slate-600 transition-colors">
                <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center">
                  <Recycle className="w-4 h-4 text-slate-400" />
                </div>
                <span className="font-display font-semibold text-sm">{name}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <NewsletterSection />

      {/* CTA Join */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pb-16">
        <div className="relative rounded-3xl bg-slate-900 overflow-hidden p-8 sm:p-12 lg:p-16 text-center">
          <div className="absolute inset-0 opacity-5" style={{
            backgroundImage: 'url(https://images.pexels.com/photos/6963695/pexels-photo-6963695.jpeg?auto=compress&cs=tinysrgb&h=650&w=940)',
            backgroundSize: 'cover',
          }} />
          <div className="relative">
            <div className="inline-flex w-14 h-14 rounded-2xl bg-primary-500 items-center justify-center mb-4">
              <Zap className="w-7 h-7 text-white" />
            </div>
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-white">Rejoignez 500 000+ réparateurs</h2>
            <p className="mt-4 text-slate-400 max-w-xl mx-auto">
              Créez un compte gratuit pour publier des tutoriels, partager des solutions, et accéder à votre tableau de bord personnel.
            </p>
            <Link to="/join" className="mt-8 inline-flex items-center gap-2 btn-accent">
              Créer un compte gratuit
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
