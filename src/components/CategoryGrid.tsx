import { Link } from 'react-router-dom';
import * as Icons from 'lucide-react';
import type { Category } from '@/lib/types';

type IconType = React.ComponentType<{ className?: string; strokeWidth?: number }>;

export default function CategoryGrid({ categories }: { categories: Category[] }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">
      {categories.map((cat) => {
        const Icon = (Icons as unknown as Record<string, IconType>)[cat.icon] ?? Icons.Wrench;
        return (
          <Link
            key={cat.id}
            to={`/appareils?cat=${cat.slug}`}
            className="group relative rounded-2xl overflow-hidden bg-white border border-slate-200/80 shadow-sm hover:shadow-xl hover:border-primary-300 transition-all duration-300"
          >
            <div className="aspect-[4/3] overflow-hidden bg-slate-100 relative">
              {cat.image_url && (
                <img
                  src={cat.image_url}
                  alt={cat.name}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  loading="lazy"
                />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/70 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-primary-500/90 backdrop-blur-sm flex items-center justify-center shrink-0">
                    <Icon className="w-4 h-4 text-white" strokeWidth={2} />
                  </div>
                  <span className="font-display font-semibold text-white text-sm">{cat.name}</span>
                </div>
              </div>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
