import React from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  BookOpen,
  Calendar,
  Church,
  Heart,
  Mail,
  MapPin,
  Music2,
  Phone,
  Sparkles,
  Users,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useDomain } from '@/components/domain/DomainProvider';
import BrandedFooter from '@/components/domain/BrandedFooter';
import DomainUnavailable from '@/pages/DomainUnavailable';
import BrandedHeader from '@/components/domain/BrandedHeader';
import HighlightsGallery from '@/components/domain/HighlightsGallery';
import type { LandingCoreValue, LandingHighlight } from '@/lib/api';

/* ─── icon registry & defaults (kept local — only used here) ─────────── */

const VALUE_ICON: Record<string, React.ElementType> = {
  Heart,
  Users,
  Sparkles,
  BookOpen,
  Music2,
  Church,
  Calendar,
};

const DEFAULT_VALUES: LandingCoreValue[] = [
  { title: 'Love', description: 'We pursue God with our whole hearts and love our neighbours as ourselves.', icon: 'Heart' },
  { title: 'Community', description: 'Faith grows in relationship. We do life together in genuine community.', icon: 'Users' },
  { title: 'Purpose', description: 'Every person has a God-given calling. We help you discover and live yours.', icon: 'Sparkles' },
];

/* ─── page ────────────────────────────────────────────────────────────── */

const CustomDomainAbout: React.FC = () => {
  const { branding, isDeactivated } = useDomain();
  if (isDeactivated) return <DomainUnavailable />;

  const accent = branding?.primary_color || '#4F46E5';
  const churchName = branding?.church_name || branding?.display_name || 'Our Church';
  const cfg = branding?.landing_config ?? null;
  const about =
    cfg?.about ||
    `Welcome to ${churchName}. We are a vibrant community of believers committed to knowing Christ and making Him known. Whether you are new to faith or have walked with God for years, there is a place for you here.`;
  const mission = cfg?.mission;
  const social = cfg?.social ?? null;

  const values: LandingCoreValue[] =
    cfg?.core_values && cfg.core_values.length > 0 ? cfg.core_values : DEFAULT_VALUES;

  const highlights: LandingHighlight[] =
    cfg?.highlights && cfg.highlights.length > 0
      ? cfg.highlights
      : cfg?.gallery_urls && cfg.gallery_urls.length > 0
        ? [{ id: 'legacy', title: 'Gallery', images: cfg.gallery_urls }]
        : [];

  const themeStyle: React.CSSProperties = {
    ['--brand' as any]: accent,
    ['--brand-soft' as any]: `${accent}15`,
  };

  return (
    <div style={themeStyle} className="min-h-screen bg-white text-slate-900 antialiased">
      {/* ── Header ── */}
      <BrandedHeader />

      {/* ── Hero banner ── */}
      <section
        className="relative py-20 sm:py-24"
        style={{
          background: 'linear-gradient(135deg, var(--brand-soft) 0%, white 60%)',
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-sm font-semibold uppercase tracking-wider" style={{ color: 'var(--brand)' }}>
            About us
          </p>
          <h1 className="mt-3 text-4xl sm:text-5xl font-bold text-slate-900 leading-tight">
            Who we are
          </h1>
          <p className="mt-4 text-lg text-slate-600 max-w-2xl">
            {branding?.tagline || `A place to belong, believe and become.`}
          </p>
        </div>
      </section>

      {/* ── Story ── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 items-start">
          <div className="lg:col-span-3 space-y-6">
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">Our story</h2>
            <p className="text-lg leading-relaxed text-slate-600 whitespace-pre-line">{about}</p>
          </div>

          <div className="lg:col-span-2 space-y-4">
            {/* Quick info card */}
            <Card className="border-slate-200">
              <CardContent className="p-6 space-y-4">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Quick info</p>
                {branding?.pastor_name && (
                  <div className="flex items-start gap-3 text-sm">
                    <Users className="h-4 w-4 mt-0.5 flex-shrink-0" style={{ color: 'var(--brand)' }} />
                    <div>
                      <p className="text-xs text-slate-500">Led by</p>
                      <p className="font-medium text-slate-900">{branding.pastor_name}</p>
                    </div>
                  </div>
                )}
                {branding?.address && (
                  <div className="flex items-start gap-3 text-sm">
                    <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0" style={{ color: 'var(--brand)' }} />
                    <div>
                      <p className="text-xs text-slate-500">Location</p>
                      <p className="font-medium text-slate-900">{branding.address}</p>
                    </div>
                  </div>
                )}
                {branding?.contact_email && (
                  <div className="flex items-start gap-3 text-sm">
                    <Mail className="h-4 w-4 mt-0.5 flex-shrink-0" style={{ color: 'var(--brand)' }} />
                    <div>
                      <p className="text-xs text-slate-500">Email</p>
                      <a href={`mailto:${branding.contact_email}`} className="font-medium text-slate-900 hover:underline">
                        {branding.contact_email}
                      </a>
                    </div>
                  </div>
                )}
                {branding?.contact_phone && (
                  <div className="flex items-start gap-3 text-sm">
                    <Phone className="h-4 w-4 mt-0.5 flex-shrink-0" style={{ color: 'var(--brand)' }} />
                    <div>
                      <p className="text-xs text-slate-500">Phone</p>
                      <a href={`tel:${branding.contact_phone}`} className="font-medium text-slate-900 hover:underline">
                        {branding.contact_phone}
                      </a>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* ── Mission ── */}
      {mission && (
        <section
          className="py-14 sm:py-18"
          style={{ background: 'var(--brand-soft)' }}
        >
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <BookOpen className="h-10 w-10 mx-auto mb-4" style={{ color: 'var(--brand)' }} />
            <p className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: 'var(--brand)' }}>
              Our mission
            </p>
            <blockquote className="text-2xl sm:text-3xl font-medium text-slate-800 italic leading-snug">
              "{mission}"
            </blockquote>
          </div>
        </section>
      )}

      {/* ── Values ── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
        <div className="text-center max-w-xl mx-auto mb-12">
          <p className="text-sm font-semibold uppercase tracking-wider" style={{ color: 'var(--brand)' }}>
            What we believe
          </p>
          <h2 className="mt-3 text-3xl sm:text-4xl font-bold text-slate-900">Our core values</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {values.map((v, i) => {
            const Icon = (v.icon && VALUE_ICON[v.icon]) || Heart;
            return (
              <Card key={i} className="border-slate-200 text-center hover:shadow-md transition-shadow">
                <CardContent className="p-8">
                  <div
                    className="h-14 w-14 rounded-2xl mx-auto flex items-center justify-center mb-5 overflow-hidden"
                    style={
                      v.image
                        ? undefined
                        : { background: 'var(--brand-soft)', color: 'var(--brand)' }
                    }
                  >
                    {v.image ? (
                      <img src={v.image} alt={v.title} className="w-full h-full object-cover" />
                    ) : (
                      <Icon className="h-7 w-7" />
                    )}
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-2">{v.title}</h3>
                  {v.description && (
                    <p className="text-slate-600 leading-relaxed">{v.description}</p>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>

      {/* ── Highlights gallery ── */}
      <HighlightsGallery highlights={highlights} />

      {/* ── CTA ── */}
      <section className="relative overflow-hidden">
        <div
          className="absolute inset-0"
          style={{
            background: 'linear-gradient(135deg, var(--brand) 0%, color-mix(in srgb, var(--brand) 70%, black) 100%)',
          }}
        />
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center text-white">
          <h2 className="text-3xl sm:text-4xl font-bold">Ready to be part of the family?</h2>
          <p className="mt-4 text-lg text-white/90 max-w-2xl mx-auto">
            Create your free account and stay connected with everything happening at {churchName}.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Button asChild size="lg" variant="secondary" className="bg-white hover:bg-white/90" style={{ color: 'var(--brand)' }}>
              <Link to="/register">Join us <ArrowRight className="h-4 w-4 ml-1" /></Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="border-white/40 bg-white/10 text-white hover:bg-white/20 hover:text-white">
              <Link to="/login">I already have an account</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <BrandedFooter
        churchName={churchName}
        address={branding?.address ?? null}
        email={branding?.contact_email ?? null}
        phone={branding?.contact_phone ?? null}
        social={social}
      />
    </div>
  );
};

export default CustomDomainAbout;
