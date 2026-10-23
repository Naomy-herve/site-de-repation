import { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Newspaper, ChevronRight, ArrowLeft, Calendar, User } from 'lucide-react';
import supabase from '@/lib/supabase';
import type { BlogPost } from '@/lib/types';
import { formatDate } from '@/lib/format';
import Spinner from '@/components/Spinner';

export default function BlogPage() {
  const { slug } = useParams<{ slug: string }>();
  const [loading, setLoading] = useState(true);
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [post, setPost] = useState<BlogPost | null>(null);

  useEffect(() => {
    (async () => {
      if (slug) {
        setLoading(true);
        const { data } = await supabase.from('blog_posts').select('*').eq('slug', slug).maybeSingle();
        setPost(data as BlogPost | null);
        const { data: rel } = await supabase.from('blog_posts').select('*').neq('slug', slug).order('published_at', { ascending: false }).limit(3);
        setPosts(rel as BlogPost[] || []);
        setLoading(false);
      } else {
        setLoading(true);
        const { data } = await supabase.from('blog_posts').select('*').order('published_at', { ascending: false });
        setPosts(data as BlogPost[] || []);
        setLoading(false);
      }
    })();
  }, [slug]);

  if (loading) return <div className="pt-16"><Spinner /></div>;

  if (slug && post) {
    return (
      <div className="pt-16 min-h-screen bg-slate-50">
        <div className="bg-white border-b border-slate-100">
          <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-3">
            <nav className="flex items-center gap-1.5 text-xs text-slate-500">
              <Link to="/" className="hover:text-primary-600">Accueil</Link>
              <ChevronRight className="w-3 h-3" />
              <Link to="/blog" className="hover:text-primary-600">Actualités</Link>
              <ChevronRight className="w-3 h-3" />
              <span className="text-slate-700 truncate">{post.title}</span>
            </nav>
          </div>
        </div>

        <article className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-8">
          <Link to="/blog" className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-primary-600 mb-6">
            <ArrowLeft className="w-4 h-4" /> Retour aux actualités
          </Link>

          <span className="badge bg-primary-50 text-primary-700 capitalize">{post.category}</span>
          <h1 className="mt-3 font-display text-3xl sm:text-4xl font-bold text-slate-900 leading-tight">{post.title}</h1>

          <div className="mt-4 flex items-center gap-4 text-sm text-slate-400">
            <span className="flex items-center gap-1.5"><User className="w-4 h-4" /> {post.author}</span>
            <span className="flex items-center gap-1.5"><Calendar className="w-4 h-4" /> {formatDate(post.published_at)}</span>
          </div>

          {post.image_url && (
            <div className="mt-6 aspect-[16/9] rounded-2xl overflow-hidden bg-slate-100">
              <img src={post.image_url} alt={post.title} className="w-full h-full object-cover" />
            </div>
          )}

          <div className="mt-8 prose prose-slate max-w-none">
            <p className="text-lg text-slate-600 leading-relaxed font-medium">{post.excerpt}</p>
            <div className="mt-6 text-slate-700 leading-relaxed whitespace-pre-line">{post.content}</div>
          </div>
        </article>

        {posts.length > 0 && (
          <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 pb-12">
            <h2 className="font-display text-xl font-bold text-slate-900 mb-5">À lire aussi</h2>
            <div className="space-y-4">
              {posts.map((p) => (
                <Link key={p.id} to={`/blog/${p.slug}`} className="card group flex gap-4 p-4">
                  <div className="w-24 h-24 rounded-xl overflow-hidden bg-slate-100 shrink-0">
                    {p.image_url && <img src={p.image_url} alt={p.title} className="w-full h-full object-cover" loading="lazy" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="text-xs text-slate-400">{formatDate(p.published_at)}</span>
                    <h3 className="font-display font-semibold text-slate-900 text-base group-hover:text-primary-600 transition-colors line-clamp-2">{p.title}</h3>
                    <p className="text-sm text-slate-500 line-clamp-1 mt-1">{p.excerpt}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="pt-16 min-h-screen bg-slate-50">
      <div className="bg-white border-b border-slate-100">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-primary-50 flex items-center justify-center">
              <Newspaper className="w-6 h-6 text-primary-600" />
            </div>
            <div>
              <h1 className="font-display text-3xl font-bold text-slate-900">Actualités & blog</h1>
              <p className="text-slate-500 text-sm mt-1">Droit à la réparation, techniques, conseils et actualités produits</p>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        {/* Featured post */}
        {posts[0] && (
          <Link to={`/blog/${posts[0].slug}`} className="card group grid md:grid-cols-2 overflow-hidden mb-8">
            <div className="aspect-[16/10] md:aspect-auto overflow-hidden bg-slate-100">
              {posts[0].image_url && (
                <img src={posts[0].image_url} alt={posts[0].title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
              )}
            </div>
            <div className="p-6 sm:p-8 flex flex-col justify-center">
              <span className="badge bg-accent-100 text-accent-700 w-fit">À la une</span>
              <h2 className="mt-3 font-display text-2xl font-bold text-slate-900 group-hover:text-primary-600 transition-colors">{posts[0].title}</h2>
              <p className="mt-3 text-slate-500 leading-relaxed">{posts[0].excerpt}</p>
              <div className="mt-4 flex items-center gap-4 text-sm text-slate-400">
                <span>{posts[0].author}</span>
                <span>{formatDate(posts[0].published_at)}</span>
              </div>
            </div>
          </Link>
        )}

        {/* Rest */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {posts.slice(1).map((p) => (
            <Link key={p.id} to={`/blog/${p.slug}`} className="card group overflow-hidden block">
              <div className="aspect-[16/10] overflow-hidden bg-slate-100">
                {p.image_url && (
                  <img src={p.image_url} alt={p.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" loading="lazy" />
                )}
              </div>
              <div className="p-5">
                <span className="badge bg-primary-50 text-primary-700 capitalize">{p.category}</span>
                <h3 className="mt-2 font-display font-semibold text-slate-900 text-base leading-snug group-hover:text-primary-600 transition-colors line-clamp-2">{p.title}</h3>
                <p className="mt-2 text-sm text-slate-500 line-clamp-2 leading-relaxed">{p.excerpt}</p>
                <div className="mt-3 flex items-center gap-3 text-xs text-slate-400">
                  <span>{p.author}</span>
                  <span>{formatDate(p.published_at)}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
