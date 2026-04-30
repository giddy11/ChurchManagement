import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Calendar } from 'lucide-react';
import MarketingPageLayout from '@/components/landing/MarketingPageLayout';
import { Button } from '@/components/ui/button';

interface Post {
  title: string;
  excerpt: string;
  date: string;
  category: string;
  readTime: string;
}

const posts: Post[] = [
  {
    title: 'Launching custom domains: your church, your home on the web',
    excerpt:
      'How any branch on ChurchFlow can now register a custom hostname, configure full branding, and publish a beautiful public landing page — without touching a line of code.',
    date: 'May 2026',
    category: 'Product Update',
    readTime: '4 min read',
  },
  {
    title: 'Designing event management for the way churches actually run events',
    excerpt:
      'Recurring services, QR-code check-ins, location-verified attendance, guest forms, and scheduled publishing — what we learned building event management with real church teams.',
    date: 'April 2026',
    category: 'Product Update',
    readTime: '6 min read',
  },
  {
    title: 'From visitor to member: closing the follow-up gap',
    excerpt:
      'Most churches lose visitors not because they aren\'t welcomed, but because there is no system to follow up. Here\'s how we\'re thinking about that workflow.',
    date: 'March 2026',
    category: 'Ministry',
    readTime: '5 min read',
  },
  {
    title: 'Branch hierarchies, denominations, and why structure matters',
    excerpt:
      'A look at how ChurchFlow models multi-branch churches and denominations — and why the data model is the most important thing we ship.',
    date: 'February 2026',
    category: 'Engineering',
    readTime: '7 min read',
  },
];

const Blog: React.FC = () => {
  const navigate = useNavigate();

  return (
    <MarketingPageLayout
      eyebrow="Blog"
      title="Notes from the team building ChurchFlow."
      subtitle="Product updates, ministry-focused thinking, and behind-the-scenes engineering posts. We publish whenever we have something genuinely useful to share."
    >
      <div className="not-prose grid grid-cols-1 gap-6 mt-2">
        {posts.map((post) => (
          <article
            key={post.title}
            className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex items-center gap-3 text-xs text-slate-500 mb-3">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 text-blue-700 px-2.5 py-1 font-medium">
                {post.category}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5" /> {post.date}
              </span>
              <span>·</span>
              <span>{post.readTime}</span>
            </div>
            <h3 className="text-lg sm:text-xl font-semibold text-slate-900 mb-2 leading-snug">
              {post.title}
            </h3>
            <p className="text-sm text-slate-600 leading-relaxed mb-4">{post.excerpt}</p>
            <span className="inline-flex items-center gap-1.5 text-sm font-medium text-blue-600">
              Coming soon <ArrowRight className="h-4 w-4" />
            </span>
          </article>
        ))}
      </div>

      <div className="not-prose mt-12 rounded-xl border border-slate-200 bg-slate-50 p-6 text-center">
        <h3 className="text-base font-semibold text-slate-900 mb-2">
          Want to be notified when new posts go live?
        </h3>
        <p className="text-sm text-slate-600 mb-4">
          We're working on an email digest. In the meantime, reach out and we'll
          keep you in the loop.
        </p>
        <Button onClick={() => navigate('/contact')}>Get in touch</Button>
      </div>
    </MarketingPageLayout>
  );
};

export default Blog;
