import React, { useMemo, useState } from 'react';
import { Calendar, ChevronLeft, ChevronRight, Filter, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { LandingHighlight } from '@/lib/api';

interface Props {
  highlights: LandingHighlight[];
}

const formatDate = (iso?: string): string => {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

/**
 * Renders the church "Highlights" gallery — visitors can filter by title,
 * pick a date, and open a lightbox to scrub through each collection.
 *
 * The component owns all UI state (active filters, lightbox cursor) so the
 * page sections that consume it stay declarative.
 */
const HighlightsGallery: React.FC<Props> = ({ highlights }) => {
  const [activeId, setActiveId] = useState<string>('all');
  const [activeDate, setActiveDate] = useState<string>('all');
  const [lightboxFor, setLightboxFor] = useState<{ highlight: LandingHighlight; index: number } | null>(null);

  /** Stable display id per highlight (date-based fallback if no `id`). */
  const idOf = (h: LandingHighlight, i: number) => h.id || `hl_${i}`;

  const dateOptions = useMemo(() => {
    const set = new Set<string>();
    highlights.forEach((h) => h.date && set.add(h.date));
    return Array.from(set).sort((a, b) => (a < b ? 1 : -1));
  }, [highlights]);

  const visible = useMemo(() => {
    return highlights.filter((h, i) => {
      const id = idOf(h, i);
      if (activeId !== 'all' && id !== activeId) return false;
      if (activeDate !== 'all' && h.date !== activeDate) return false;
      return true;
    });
  }, [highlights, activeId, activeDate]);

  const clearFilters = () => {
    setActiveId('all');
    setActiveDate('all');
  };

  const openLightbox = (h: LandingHighlight, i: number) =>
    setLightboxFor({ highlight: h, index: i });
  const closeLightbox = () => setLightboxFor(null);

  const stepLightbox = (delta: number) => {
    if (!lightboxFor) return;
    const { highlight, index } = lightboxFor;
    const len = highlight.images.length;
    const next = (index + delta + len) % len;
    setLightboxFor({ highlight, index: next });
  };

  if (highlights.length === 0) return null;

  return (
    <section className="bg-slate-50/80 border-y border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-24">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <p
            className="text-sm font-semibold uppercase tracking-wider"
            style={{ color: 'var(--brand)' }}
          >
            Highlights
          </p>
          <h2 className="mt-3 text-3xl sm:text-4xl font-bold text-slate-900">
            Moments together
          </h2>
          <p className="mt-3 text-slate-600">
            Browse our recent services, events and outreaches.
          </p>
        </div>

        {/* Filter bar */}
        <div className="flex flex-wrap items-center gap-2 mb-6">
          <Button
            type="button"
            size="sm"
            variant={activeId === 'all' ? 'default' : 'outline'}
            onClick={() => setActiveId('all')}
            className={activeId === 'all' ? 'text-white' : ''}
            style={activeId === 'all' ? { background: 'var(--brand)' } : undefined}
          >
            All
          </Button>
          {highlights.map((h, i) => {
            const id = idOf(h, i);
            const active = id === activeId;
            return (
              <Button
                key={id}
                type="button"
                size="sm"
                variant={active ? 'default' : 'outline'}
                onClick={() => setActiveId(active ? 'all' : id)}
                className={active ? 'text-white' : ''}
                style={active ? { background: 'var(--brand)' } : undefined}
              >
                {h.title}
              </Button>
            );
          })}
          {dateOptions.length > 0 && (
            <div className="ml-auto flex items-center gap-2">
              <Filter className="h-4 w-4 text-slate-500" />
              <select
                value={activeDate}
                onChange={(e) => setActiveDate(e.target.value)}
                className="text-sm rounded-md border border-slate-200 bg-white px-2 py-1.5"
              >
                <option value="all">All dates</option>
                {dateOptions.map((d) => (
                  <option key={d} value={d}>
                    {formatDate(d)}
                  </option>
                ))}
              </select>
              {(activeId !== 'all' || activeDate !== 'all') && (
                <Button type="button" size="sm" variant="ghost" onClick={clearFilters}>
                  Clear
                </Button>
              )}
            </div>
          )}
        </div>

        {visible.length === 0 ? (
          <p className="text-center text-slate-500 py-12 text-sm">
            No highlights match your filters.
          </p>
        ) : (
          <div className="space-y-12">
            {visible.map((h, i) => (
              <div key={idOf(h, i)}>
                <div className="flex items-end justify-between flex-wrap gap-2 mb-4">
                  <div>
                    <h3 className="text-xl font-semibold text-slate-900">{h.title}</h3>
                    {h.description && (
                      <p className="mt-1 text-sm text-slate-600 max-w-2xl">{h.description}</p>
                    )}
                  </div>
                  {h.date && (
                    <p className="flex items-center gap-1.5 text-xs text-slate-500">
                      <Calendar className="h-3.5 w-3.5" />
                      {formatDate(h.date)}
                    </p>
                  )}
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                  {h.images.map((url, imageIdx) => (
                    <button
                      type="button"
                      key={imageIdx}
                      className="aspect-square rounded-lg overflow-hidden bg-slate-100 group cursor-pointer focus:outline-none focus:ring-2 focus:ring-offset-2"
                      style={{ ['--tw-ring-color' as any]: 'var(--brand)' }}
                      onClick={() => openLightbox(h, imageIdx)}
                    >
                      <img
                        src={url}
                        alt={`${h.title} ${imageIdx + 1}`}
                        loading="lazy"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Lightbox */}
      {lightboxFor && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
          onClick={closeLightbox}
        >
          <button
            type="button"
            className="absolute top-4 right-4 text-white/80 hover:text-white"
            onClick={closeLightbox}
            aria-label="Close"
          >
            <X className="h-6 w-6" />
          </button>
          <button
            type="button"
            className="absolute left-4 text-white/80 hover:text-white"
            onClick={(e) => {
              e.stopPropagation();
              stepLightbox(-1);
            }}
            aria-label="Previous"
          >
            <ChevronLeft className="h-8 w-8" />
          </button>
          <button
            type="button"
            className="absolute right-4 text-white/80 hover:text-white"
            onClick={(e) => {
              e.stopPropagation();
              stepLightbox(1);
            }}
            aria-label="Next"
          >
            <ChevronRight className="h-8 w-8" />
          </button>
          <img
            src={lightboxFor.highlight.images[lightboxFor.index]}
            alt={lightboxFor.highlight.title}
            className="max-h-[85vh] max-w-[90vw] object-contain rounded-lg"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </section>
  );
};

export default HighlightsGallery;
