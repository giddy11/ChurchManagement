import React from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Calendar,
  Church,
  Clock,
  Mail,
  MapPin,
  Phone,
  Users,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useDomain } from '@/components/domain/DomainProvider';
import BrandedFooter from '@/components/domain/BrandedFooter';
import type { LandingServiceTime } from '@/lib/api';

const DEFAULT_SERVICES: LandingServiceTime[] = [
  { label: 'Sunday Worship', day: 'Sundays', time: '9:00 AM' },
  { label: 'Sunday Second Service', day: 'Sundays', time: '11:00 AM' },
  { label: 'Midweek Bible Study', day: 'Wednesdays', time: '6:30 PM' },
  { label: 'Friday Prayer', day: 'Fridays', time: '7:00 PM' },
];

/* ─── page ────────────────────────────────────────────────────────────── */

const CustomDomainServices: React.FC = () => {
  const { branding } = useDomain();

  const accent = branding?.primary_color || '#4F46E5';
  const churchName = branding?.church_name || branding?.display_name || 'Our Church';
  const cfg = branding?.landing_config ?? null;
  const services: LandingServiceTime[] =
    cfg?.service_times && cfg.service_times.length > 0
      ? cfg.service_times
      : DEFAULT_SERVICES;
  const social = cfg?.social ?? null;

  const themeStyle: React.CSSProperties = {
    ['--brand' as any]: accent,
    ['--brand-soft' as any]: `${accent}15`,
  };

  return (
    <div style={themeStyle} className="min-h-screen bg-white text-slate-900 antialiased">
      {/* ── Header ── */}
      <header className="sticky top-0 z-30 bg-white/85 backdrop-blur border-b border-slate-200/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3 min-w-0">
            {branding?.logo_url ? (
              <img src={branding.logo_url} alt={churchName} className="h-9 w-9 rounded-lg object-cover" />
            ) : (
              <div className="h-9 w-9 rounded-lg flex items-center justify-center text-white" style={{ background: 'var(--brand)' }}>
                <Church className="h-5 w-5" />
              </div>
            )}
            <span className="font-semibold text-slate-900 truncate">{churchName}</span>
          </Link>
          <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-slate-600">
            <Link to="/" className="hover:text-slate-900 transition-colors">Home</Link>
            <Link to="/about" className="hover:text-slate-900 transition-colors">About</Link>
            <Link to="/services" className="font-semibold transition-colors" style={{ color: 'var(--brand)' }}>Services</Link>
          </nav>
          <div className="flex items-center gap-2">
            <Button asChild variant="ghost" size="sm"><Link to="/login">Sign in</Link></Button>
            <Button asChild size="sm" style={{ background: 'var(--brand)' }} className="text-white hover:opacity-90">
              <Link to="/register">Get started</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* ── Hero banner ── */}
      <section
        className="relative py-20 sm:py-24"
        style={{ background: 'linear-gradient(135deg, var(--brand-soft) 0%, white 60%)' }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-sm font-semibold uppercase tracking-wider" style={{ color: 'var(--brand)' }}>
            Service times
          </p>
          <h1 className="mt-3 text-4xl sm:text-5xl font-bold text-slate-900 leading-tight">
            When we gather
          </h1>
          <p className="mt-4 text-lg text-slate-600 max-w-2xl">
            Come as you are. There is a seat saved for you at every service.
          </p>
        </div>
      </section>

      {/* ── Services grid ── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {services.map((s, i) => (
            <Card key={i} className="border-slate-200 hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div
                  className="h-12 w-12 rounded-xl flex items-center justify-center mb-4"
                  style={{ background: 'var(--brand-soft)', color: 'var(--brand)' }}
                >
                  <Calendar className="h-6 w-6" />
                </div>
                <h2 className="text-lg font-semibold text-slate-900">{s.label}</h2>
                <div className="mt-3 space-y-1.5 text-sm text-slate-600">
                  {s.day && (
                    <p className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 flex-shrink-0" style={{ color: 'var(--brand)' }} />
                      {s.day}
                    </p>
                  )}
                  {s.time && (
                    <p className="flex items-center gap-2">
                      <Clock className="h-4 w-4 flex-shrink-0" style={{ color: 'var(--brand)' }} />
                      {s.time}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* ── What to expect ── */}
      <section
        className="py-14 sm:py-18 border-y border-slate-200"
        style={{ background: 'var(--brand-soft)' }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <p className="text-sm font-semibold uppercase tracking-wider" style={{ color: 'var(--brand)' }}>
              First time?
            </p>
            <h2 className="mt-3 text-3xl font-bold text-slate-900">What to expect</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {[
              {
                icon: Users,
                title: 'Warm welcome',
                body: 'Our welcome team is here to help you find your feet. Everyone is family from the moment you walk in.',
              },
              {
                icon: Church,
                title: 'Authentic worship',
                body: 'Expect contemporary, spirit-filled worship led by our passionate music team.',
              },
              {
                icon: Calendar,
                title: 'Practical message',
                body: 'Bible-based teaching you can apply to your everyday life — clear, relevant and encouraging.',
              },
            ].map(({ icon: Icon, title, body }) => (
              <div key={title} className="bg-white rounded-xl border border-slate-200 p-6">
                <div
                  className="h-10 w-10 rounded-lg flex items-center justify-center mb-4"
                  style={{ color: 'var(--brand)' }}
                >
                  <Icon className="h-6 w-6" />
                </div>
                <h3 className="font-semibold text-slate-900 mb-1">{title}</h3>
                <p className="text-sm text-slate-600 leading-relaxed">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Location ── */}
      {(branding?.address || branding?.contact_phone || branding?.contact_email) && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wider mb-3" style={{ color: 'var(--brand)' }}>
                Find us
              </p>
              <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-6">Getting here</h2>
              <ul className="space-y-4 text-sm">
                {branding?.address && (
                  <li className="flex items-start gap-3">
                    <MapPin className="h-5 w-5 mt-0.5 flex-shrink-0" style={{ color: 'var(--brand)' }} />
                    <span className="text-slate-700">{branding.address}</span>
                  </li>
                )}
                {branding?.contact_phone && (
                  <li className="flex items-start gap-3">
                    <Phone className="h-5 w-5 mt-0.5 flex-shrink-0" style={{ color: 'var(--brand)' }} />
                    <a href={`tel:${branding.contact_phone}`} className="text-slate-700 hover:underline">
                      {branding.contact_phone}
                    </a>
                  </li>
                )}
                {branding?.contact_email && (
                  <li className="flex items-start gap-3">
                    <Mail className="h-5 w-5 mt-0.5 flex-shrink-0" style={{ color: 'var(--brand)' }} />
                    <a href={`mailto:${branding.contact_email}`} className="text-slate-700 hover:underline">
                      {branding.contact_email}
                    </a>
                  </li>
                )}
              </ul>
            </div>

            {branding?.pastor_name && (
              <Card className="border-slate-200">
                <CardContent className="p-6">
                  <div
                    className="h-14 w-14 rounded-full flex items-center justify-center text-white mb-4"
                    style={{ background: 'var(--brand)' }}
                  >
                    <Users className="h-7 w-7" />
                  </div>
                  <p className="text-xs uppercase tracking-wider text-slate-500 mb-1">Led by</p>
                  <p className="text-xl font-semibold text-slate-900">{branding.pastor_name}</p>
                  <p className="text-sm text-slate-600 mt-1">Senior Pastor, {churchName}</p>
                  <p className="text-sm text-slate-600 mt-3 leading-relaxed">
                    We look forward to meeting you in person. Come experience life at {churchName}.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </section>
      )}

      {/* ── CTA ── */}
      <section className="relative overflow-hidden">
        <div
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(135deg, var(--brand) 0%, color-mix(in srgb, var(--brand) 70%, black) 100%)',
          }}
        />
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center text-white">
          <h2 className="text-3xl sm:text-4xl font-bold">Plan your first visit</h2>
          <p className="mt-4 text-lg text-white/90 max-w-xl mx-auto">
            Sign up and let us know you're coming so we can give you the best welcome.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Button asChild size="lg" variant="secondary" className="bg-white hover:bg-white/90" style={{ color: 'var(--brand)' }}>
              <Link to="/register">Create account <ArrowRight className="h-4 w-4 ml-1" /></Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="border-white/40 bg-white/10 text-white hover:bg-white/20 hover:text-white">
              <Link to="/login">Sign in</Link>
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

export default CustomDomainServices;
