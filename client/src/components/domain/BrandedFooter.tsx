/**
 * BrandedFooter — shared footer used on every custom-domain public page.
 *
 * Columns:
 *   1. Church name + address + social icons
 *   2. Contact details (phone, email)
 *   3. Quick links (all real router links — no hash anchors that only work
 *      on the home page)
 */
import React from 'react';
import { Link } from 'react-router-dom';
import {
  Facebook,
  Globe,
  Instagram,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
  Twitter,
  Youtube,
} from 'lucide-react';
import type { LandingSocialLinks } from '@/lib/api';

const externalize = (url?: string): string => {
  if (!url) return '#';
  return /^https?:\/\//i.test(url) ? url : `https://${url}`;
};

interface Props {
  churchName: string;
  address: string | null;
  email: string | null;
  phone: string | null;
  social: LandingSocialLinks | null;
}

const BrandedFooter: React.FC<Props> = ({ churchName, address, email, phone, social }) => (
  <footer id="contact" className="bg-slate-950 text-slate-300">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 grid grid-cols-1 md:grid-cols-3 gap-10">

      {/* ── Column 1: branding + social ── */}
      <div>
        <p className="text-white font-semibold text-lg">{churchName}</p>
        {address && (
          <p className="mt-3 text-sm text-slate-400 flex items-start gap-2">
            <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0" />{address}
          </p>
        )}
        <p className="mt-4 text-sm text-slate-400 leading-relaxed">
          Powered by Church Flow — modern tools for the church community.
        </p>
        {social && (
          <div className="mt-5 flex gap-3">
            {social.facebook && (
              <a aria-label="Facebook" href={externalize(social.facebook)} target="_blank" rel="noreferrer" className="hover:text-white transition-colors">
                <Facebook className="h-5 w-5" />
              </a>
            )}
            {social.instagram && (
              <a aria-label="Instagram" href={externalize(social.instagram)} target="_blank" rel="noreferrer" className="hover:text-white transition-colors">
                <Instagram className="h-5 w-5" />
              </a>
            )}
            {social.youtube && (
              <a aria-label="YouTube" href={externalize(social.youtube)} target="_blank" rel="noreferrer" className="hover:text-white transition-colors">
                <Youtube className="h-5 w-5" />
              </a>
            )}
            {social.twitter && (
              <a aria-label="Twitter / X" href={externalize(social.twitter)} target="_blank" rel="noreferrer" className="hover:text-white transition-colors">
                <Twitter className="h-5 w-5" />
              </a>
            )}
            {social.whatsapp && (
              <a aria-label="WhatsApp" href={externalize(social.whatsapp)} target="_blank" rel="noreferrer" className="hover:text-white transition-colors">
                <MessageCircle className="h-5 w-5" />
              </a>
            )}
            {social.website && (
              <a aria-label="Website" href={externalize(social.website)} target="_blank" rel="noreferrer" className="hover:text-white transition-colors">
                <Globe className="h-5 w-5" />
              </a>
            )}
          </div>
        )}
      </div>

      {/* ── Column 2: contact details ── */}
      <div>
        <p className="text-sm font-semibold uppercase tracking-wider text-slate-500">Contact</p>
        <ul className="mt-4 space-y-3 text-sm">
          {address && (
            <li className="flex items-start gap-3">
              <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0" />
              {address}
            </li>
          )}
          {phone && (
            <li className="flex items-start gap-3">
              <Phone className="h-4 w-4 mt-0.5 flex-shrink-0" />
              <a href={`tel:${phone}`} className="hover:text-white">{phone}</a>
            </li>
          )}
          {email && (
            <li className="flex items-start gap-3">
              <Mail className="h-4 w-4 mt-0.5 flex-shrink-0" />
              <a href={`mailto:${email}`} className="hover:text-white">{email}</a>
            </li>
          )}
        </ul>
      </div>

      {/* ── Column 3: quick links (all real routes, no hash anchors) ── */}
      <div>
        <p className="text-sm font-semibold uppercase tracking-wider text-slate-500">Quick links</p>
        <ul className="mt-4 space-y-3 text-sm">
          <li><Link to="/" className="hover:text-white">Home</Link></li>
          <li><Link to="/about" className="hover:text-white">About us</Link></li>
          <li><Link to="/services#services" className="hover:text-white">Service times</Link></li>
          <li><Link to="/login" className="hover:text-white">Member sign in</Link></li>
          <li><Link to="/register" className="hover:text-white">Create account</Link></li>
        </ul>
      </div>

    </div>

    {/* ── Bottom bar ── */}
    <div className="border-t border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-2">
        <p>&copy; {new Date().getFullYear()} {churchName}. All rights reserved.</p>
        <p>
          Powered by{' '}
          <Link to="/" className="hover:text-white">
            Church Flow
          </Link>
        </p>
      </div>
    </div>
  </footer>
);

export default BrandedFooter;
