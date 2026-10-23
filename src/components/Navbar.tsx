import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Search, Menu, X, Wrench, ShoppingBag, BookOpen, Users, Newspaper } from 'lucide-react';
import { useCart } from '@/lib/cart';

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { totalCount: cartCount } = useCart();

  useEffect(() => {
    setOpen(false);
    setShowSearch(false);
  }, [location.pathname]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/tutoriels?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
      setShowSearch(false);
    }
  };

  const navLinks = [
    { to: '/tutoriels', label: 'Tutoriels', icon: BookOpen },
    { to: '/appareils', label: 'Appareils', icon: Wrench },
    { to: '/communaute', label: 'Communauté', icon: Users },
    { to: '/blog', label: 'Actualités', icon: Newspaper },
    { to: '/boutique', label: 'Boutique', icon: ShoppingBag },
  ];

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'bg-white/90 backdrop-blur-lg shadow-md' : 'bg-white'}`}>
      <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2.5 shrink-0">
            <div className="w-9 h-9 rounded-xl bg-primary-600 flex items-center justify-center shadow-md">
              <Wrench className="w-5 h-5 text-white" strokeWidth={2.5} />
            </div>
            <span className="font-display font-bold text-lg text-slate-900 hidden sm:block">
              Flam<span className="text-primary-600">O</span>freparation
            </span>
          </Link>

          <div className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => {
              const active = location.pathname.startsWith(link.to);
              const Icon = link.icon;
              return (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-all ${active ? 'bg-primary-50 text-primary-700' : 'text-slate-600 hover:text-primary-600 hover:bg-slate-50'}`}
                >
                  <Icon className="w-4 h-4" />
                  {link.label}
                </Link>
              );
            })}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowSearch(!showSearch)}
              className="p-2 rounded-full hover:bg-slate-100 transition-colors"
              aria-label="Rechercher"
            >
              <Search className="w-5 h-5 text-slate-600" />
            </button>
            <Link to="/panier" className="relative p-2 rounded-full hover:bg-slate-100 transition-colors" aria-label="Panier">
              <ShoppingBag className="w-5 h-5 text-slate-600" />
              {cartCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-5 h-5 rounded-full bg-accent-500 text-white text-[10px] font-bold flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </Link>
            <Link to="/join" className="hidden sm:inline-flex btn-primary text-sm py-2 px-4">
              Rejoindre
            </Link>
            <button
              onClick={() => setOpen(!open)}
              className="lg:hidden p-2 rounded-full hover:bg-slate-100 transition-colors"
              aria-label="Menu"
            >
              {open ? <X className="w-5 h-5 text-slate-600" /> : <Menu className="w-5 h-5 text-slate-600" />}
            </button>
          </div>
        </div>

        {showSearch && (
          <div className="pb-3 animate-fade-in">
            <form onSubmit={handleSearch} className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Rechercher un tutoriel, un appareil, une solution..."
                className="w-full rounded-full border border-slate-200 bg-slate-50 py-3 pl-12 pr-4 text-sm focus:outline-none focus:border-primary-400 focus:bg-white transition-all"
                autoFocus
              />
            </form>
          </div>
        )}

        {open && (
          <div className="lg:hidden border-t border-slate-100 py-3 animate-fade-in">
            <div className="space-y-1">
              {navLinks.map((link) => {
                const Icon = link.icon;
                return (
                  <Link
                    key={link.to}
                    to={link.to}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-slate-700 hover:bg-primary-50 hover:text-primary-700 transition-all"
                  >
                    <Icon className="w-5 h-5 text-slate-400" />
                    {link.label}
                  </Link>
                );
              })}
              <Link to="/join" className="flex items-center justify-center btn-primary w-full mt-2">
                Rejoindre la communauté
              </Link>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}
