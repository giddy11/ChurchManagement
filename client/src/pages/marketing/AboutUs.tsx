import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, Users, Sparkles, Globe } from 'lucide-react';
import MarketingPageLayout from '@/components/landing/MarketingPageLayout';
import { Button } from '@/components/ui/button';

const values = [
  {
    icon: Heart,
    title: 'Built with the church in mind',
    body:
      'Every feature begins with a real conversation with a pastor, an admin, or a member — not a hypothetical use case. We design for the people who do the work on Sundays.',
  },
  {
    icon: Users,
    title: 'Community over complexity',
    body:
      'Software should make ministry easier, not harder. We resist feature bloat and obsess over the small details that save your team minutes every week.',
  },
  {
    icon: Sparkles,
    title: 'Modern, mobile-first, accessible',
    body:
      'Whether your team uses laptops, tablets, or only phones, ChurchFlow is built to feel native everywhere — and to work for users of every ability.',
  },
  {
    icon: Globe,
    title: 'For one church or a thousand branches',
    body:
      'From a single congregation to a multi-branch denomination, the platform scales with your structure — without forcing you to change how you operate.',
  },
];

const AboutUs: React.FC = () => {
  const navigate = useNavigate();

  return (
    <MarketingPageLayout
      eyebrow="Company"
      title="Our story, our mission, and the people behind ChurchFlow."
      subtitle="ChurchFlow exists to give churches the digital tools they deserve — modern, reliable, and rooted in a deep respect for ministry."
    >
      <h2>Why we built ChurchFlow</h2>
      <p>
        ChurchFlow began with a simple observation: church teams were juggling
        spreadsheets, group chats, paper attendance sheets, and disconnected
        apps to do work that mattered enormously. Visitor follow-up slipped
        through the cracks. Branch leaders couldn't see what was happening
        across the denomination. Members had no easy way to stay connected
        between services.
      </p>
      <p>
        We set out to build a single, thoughtful platform that brings
        congregations, branches, events, and members into one place — without
        the steep learning curve or enterprise price tag that usually comes
        with software at this scale.
      </p>

      <h2>What we believe</h2>
      <ul className="grid grid-cols-1 sm:grid-cols-2 gap-6 list-none pl-0">
        {values.map((v) => (
          <li key={v.title} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-3 mb-2">
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                <v.icon className="h-4 w-4" />
              </span>
              <h3 className="m-0 text-base font-semibold text-slate-900">{v.title}</h3>
            </div>
            <p className="text-sm text-slate-600 leading-relaxed m-0">{v.body}</p>
          </li>
        ))}
      </ul>

      <h2>Where we're headed</h2>
      <p>
        ChurchFlow is being actively developed in close partnership with the
        churches that use it. People &amp; branch management, full-featured
        event management, and branded custom domains are already in production.
        Contributions, accounting, follow-up automation, and a richer member
        portal are next on the roadmap.
      </p>
      <p>
        We're a small, focused team — and we'd love to hear from you. If
        ChurchFlow could solve a problem your church is wrestling with,{' '}
        <a href="/contact" onClick={(e) => { e.preventDefault(); navigate('/contact'); }}>
          tell us about it
        </a>
        .
      </p>

      <div className="not-prose mt-10 flex flex-wrap gap-3">
        <Button onClick={() => navigate('/denominations')}>Get started for free</Button>
        <Button variant="outline" onClick={() => navigate('/contact')}>
          Contact our team
        </Button>
      </div>
    </MarketingPageLayout>
  );
};

export default AboutUs;
