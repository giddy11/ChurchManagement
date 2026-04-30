import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Briefcase, Heart, Sparkles, Users, MapPin } from 'lucide-react';
import MarketingPageLayout from '@/components/landing/MarketingPageLayout';
import { Button } from '@/components/ui/button';

const perks = [
  {
    icon: Heart,
    title: 'Mission-driven work',
    body: 'Build software that helps real churches run real ministries — not yet another B2B SaaS dashboard.',
  },
  {
    icon: Sparkles,
    title: 'Modern stack',
    body: 'TypeScript end-to-end, React, Node.js, PostgreSQL, and a thoughtful approach to type safety and DX.',
  },
  {
    icon: Users,
    title: 'Small, senior team',
    body: 'No layers, no busywork. Your code ships in front of users in days, not quarters.',
  },
  {
    icon: MapPin,
    title: 'Remote-friendly',
    body: 'We work asynchronously and care about outcomes, not hours at a desk.',
  },
];

const Careers: React.FC = () => {
  const navigate = useNavigate();

  return (
    <MarketingPageLayout
      eyebrow="Careers"
      title="Help us build the platform churches deserve."
      subtitle="ChurchFlow is a small team building software at the intersection of ministry and modern engineering. We hire people who care deeply about both."
    >
      <h2>Why work with us</h2>
      <div className="not-prose grid grid-cols-1 sm:grid-cols-2 gap-5 mt-4">
        {perks.map((p) => (
          <div key={p.title} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-3 mb-2">
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                <p.icon className="h-4 w-4" />
              </span>
              <h3 className="m-0 text-base font-semibold text-slate-900">{p.title}</h3>
            </div>
            <p className="text-sm text-slate-600 leading-relaxed m-0">{p.body}</p>
          </div>
        ))}
      </div>

      <h2>Open positions</h2>
      <div className="not-prose rounded-xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center">
        <Briefcase className="h-6 w-6 text-slate-400 mx-auto mb-3" />
        <h3 className="text-base font-semibold text-slate-900 mb-2">
          No open roles right now
        </h3>
        <p className="text-sm text-slate-600 max-w-md mx-auto mb-5">
          We're not actively hiring at the moment, but we're always interested
          in connecting with thoughtful engineers, designers, and product
          people who care about the mission. If that sounds like you, send us
          a note.
        </p>
        <Button onClick={() => navigate('/contact')}>Introduce yourself</Button>
      </div>

      <h2>What we look for</h2>
      <p>
        We don't have a checklist of frameworks or years-of-experience numbers.
        Instead, we look for a few qualities that hold up across every role:
      </p>
      <ul>
        <li><strong>Care for the craft.</strong> Code that's clear, tested, and kind to the next person who reads it.</li>
        <li><strong>Care for the user.</strong> Understanding that the people on the other end of the screen are running a Sunday service tomorrow.</li>
        <li><strong>Bias toward action.</strong> Shipping small, useful improvements is more valuable than debating large ones.</li>
        <li><strong>Honest communication.</strong> We disagree, write things down, and move on without ego.</li>
      </ul>
    </MarketingPageLayout>
  );
};

export default Careers;
