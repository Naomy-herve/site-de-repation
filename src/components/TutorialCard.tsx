import { Link } from 'react-router-dom';
import { Clock, Eye, Wrench } from 'lucide-react';
import type { Tutorial } from '@/lib/types';
import { difficultyColor, timeLabel, formatNumber } from '@/lib/format';

export default function TutorialCard({ tutorial }: { tutorial: Tutorial }) {
  return (
    <Link to={`/tutoriel/${tutorial.slug}`} className="card group overflow-hidden block">
      <div className="relative aspect-[16/10] overflow-hidden bg-slate-100">
        {tutorial.image_url ? (
          <img
            src={tutorial.image_url}
            alt={tutorial.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Wrench className="w-12 h-12 text-slate-300" />
          </div>
        )}
        <div className="absolute top-3 left-3">
          <span className={`badge ${difficultyColor(tutorial.difficulty)} backdrop-blur-sm bg-opacity-90`}>
            {tutorial.difficulty}
          </span>
        </div>
      </div>
      <div className="p-4">
        <h3 className="font-display font-semibold text-slate-900 text-base leading-snug group-hover:text-primary-600 transition-colors line-clamp-2">
          {tutorial.title}
        </h3>
        {tutorial.summary && (
          <p className="mt-2 text-sm text-slate-500 line-clamp-2 leading-relaxed">
            {tutorial.summary}
          </p>
        )}
        <div className="mt-3 flex items-center gap-4 text-xs text-slate-400">
          <span className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" />
            {timeLabel(tutorial.time_minutes)}
          </span>
          <span className="flex items-center gap-1">
            <Eye className="w-3.5 h-3.5" />
            {formatNumber(tutorial.views)}
          </span>
        </div>
      </div>
    </Link>
  );
}
