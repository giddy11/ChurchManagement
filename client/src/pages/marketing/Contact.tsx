import React, { useState } from 'react';
import { Mail, MapPin, Phone, Send, Loader2, CheckCircle2 } from 'lucide-react';
import MarketingPageLayout from '@/components/landing/MarketingPageLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

const SUPPORT_EMAIL = 'theunitedchurchflow@gmail.com';
const SUPPORT_PHONE = '+234 703-11700-92';
const SUPPORT_LOCATION = 'Rivers, Nigeria';

const Contact: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !message.trim()) {
      toast.error('Please fill in your name, email, and message.');
      return;
    }
    setSubmitting(true);
    // Compose a mailto link as the immediate fallback so visitors get a
    // working contact path even before a backend endpoint is wired up.
    const body = encodeURIComponent(
      `From: ${name} <${email}>\n\n${message}\n\n— Sent from churchflow.app/contact`,
    );
    const subj = encodeURIComponent(subject || 'ChurchFlow enquiry');
    window.location.href = `mailto:${SUPPORT_EMAIL}?subject=${subj}&body=${body}`;
    // Show a success state without blocking — the mail client will open.
    setTimeout(() => {
      setSubmitting(false);
      setSubmitted(true);
    }, 600);
  };

  return (
    <MarketingPageLayout
      eyebrow="Contact"
      title="We'd love to hear from you."
      subtitle="Whether you have a question about features, pricing, partnerships, or you just want to say hello — drop us a line and we'll get back to you."
    >
      <div className="not-prose grid grid-cols-1 lg:grid-cols-3 gap-8 mt-2">
        {/* Contact details */}
        <aside className="space-y-5 lg:col-span-1">
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-3 mb-1">
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                <Mail className="h-4 w-4" />
              </span>
              <h3 className="text-base font-semibold text-slate-900 m-0">Email</h3>
            </div>
            <a
              href={`mailto:${SUPPORT_EMAIL}`}
              className="text-sm text-blue-600 hover:text-blue-700 break-all"
            >
              {SUPPORT_EMAIL}
            </a>
            <p className="text-xs text-slate-500 mt-2 m-0">
              We aim to reply within one business day.
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-3 mb-1">
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                <Phone className="h-4 w-4" />
              </span>
              <h3 className="text-base font-semibold text-slate-900 m-0">Phone &amp; WhatsApp</h3>
            </div>
            <a href={`tel:${SUPPORT_PHONE.replace(/\s|\+/g, '')}`} className="text-sm text-blue-600 hover:text-blue-700">
              {SUPPORT_PHONE}
            </a>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-3 mb-1">
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                <MapPin className="h-4 w-4" />
              </span>
              <h3 className="text-base font-semibold text-slate-900 m-0">Location</h3>
            </div>
            <p className="text-sm text-slate-600 m-0">{SUPPORT_LOCATION}</p>
          </div>
        </aside>

        {/* Form */}
        <div className="lg:col-span-2">
          {submitted ? (
            <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-8 text-center">
              <CheckCircle2 className="h-8 w-8 text-emerald-600 mx-auto mb-3" />
              <h3 className="text-lg font-semibold text-slate-900 mb-2">
                Your email client should be open
              </h3>
              <p className="text-sm text-slate-600 max-w-md mx-auto">
                We've prefilled a message for you to send to{' '}
                <strong>{SUPPORT_EMAIL}</strong>. If nothing happened, just
                email us directly — we'll be glad to hear from you.
              </p>
            </div>
          ) : (
            <form
              onSubmit={onSubmit}
              className="rounded-xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm space-y-5"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Your name</Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Jane Doe"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email address</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="jane@yourchurch.org"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="subject">Subject</Label>
                <Input
                  id="subject"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="How can we help?"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="message">Message</Label>
                <Textarea
                  id="message"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={6}
                  placeholder="Tell us about your church and what you're looking to solve…"
                  required
                />
              </div>

              <div className="flex items-center justify-between gap-4 pt-2">
                <p className="text-xs text-slate-500">
                  By submitting, you agree to our{' '}
                  <a href="/privacy" className="text-blue-600 hover:text-blue-700">
                    privacy policy
                  </a>
                  .
                </p>
                <Button type="submit" disabled={submitting} className="gap-2">
                  {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                  Send message
                </Button>
              </div>
            </form>
          )}
        </div>
      </div>
    </MarketingPageLayout>
  );
};

export default Contact;
