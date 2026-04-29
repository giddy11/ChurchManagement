import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import {
  fetchPublicCustomDomainBranding,
  type PublicCustomDomainBrandingDTO,
} from '@/lib/api';

/**
 * Hostnames that should never be treated as a custom domain — even if a
 * branding row exists in the database. Useful for local development.
 */
const SYSTEM_HOSTS = new Set([
  'localhost',
  '127.0.0.1',
  '0.0.0.0',
]);

interface DomainContextValue {
  /** True when the current hostname maps to an active custom domain. */
  isCustomDomain: boolean;
  /** Active branding (logo, church name, etc.) or null if not on a custom domain. */
  branding: PublicCustomDomainBrandingDTO | null;
  /** True while the initial branding lookup is in flight. */
  isResolving: boolean;
  /** The hostname we tested against (lower-cased). */
  hostname: string;
}

const DomainContext = createContext<DomainContextValue | undefined>(undefined);

export const useDomain = (): DomainContextValue => {
  const ctx = useContext(DomainContext);
  if (!ctx) throw new Error('useDomain must be used within a DomainProvider');
  return ctx;
};

interface DomainProviderProps {
  children: ReactNode;
}

export const DomainProvider: React.FC<DomainProviderProps> = ({ children }) => {
  const hostname = useMemo(() => {
    if (typeof window === 'undefined') return '';
    return window.location.hostname.toLowerCase();
  }, []);

  const [branding, setBranding] = useState<PublicCustomDomainBrandingDTO | null>(null);
  const [isResolving, setIsResolving] = useState<boolean>(true);

  useEffect(() => {
    if (!hostname || SYSTEM_HOSTS.has(hostname)) {
      setIsResolving(false);
      return;
    }
    let cancelled = false;
    fetchPublicCustomDomainBranding(hostname)
      .then((res) => {
        if (cancelled) return;
        setBranding(res?.data ?? null);
      })
      .catch(() => {
        if (cancelled) return;
        setBranding(null);
      })
      .finally(() => {
        if (!cancelled) setIsResolving(false);
      });
    return () => { cancelled = true; };
  }, [hostname]);

  const value: DomainContextValue = useMemo(
    () => ({
      isCustomDomain: !!branding,
      branding,
      isResolving,
      hostname,
    }),
    [branding, isResolving, hostname],
  );

  // Side-effect: apply the brand accent colour as a CSS variable so
  // shadcn primary buttons pick it up automatically.
  useEffect(() => {
    if (typeof document === 'undefined') return;
    const root = document.documentElement;
    if (branding?.primary_color) {
      root.style.setProperty('--brand-primary', branding.primary_color);
    } else {
      root.style.removeProperty('--brand-primary');
    }
  }, [branding?.primary_color]);

  // Side-effect: update <title> and favicon to match the custom-domain branding.
  useEffect(() => {
    if (typeof document === 'undefined' || !branding) return;

    // Title
    const siteName = branding.display_name || branding.church_name;
    if (siteName) {
      document.title = siteName;
      // Also update og:title if present
      const ogTitle = document.querySelector<HTMLMetaElement>('meta[property="og:title"]');
      if (ogTitle) ogTitle.content = siteName;
    }

    // Favicon — replace/create a <link rel="icon"> pointing to the logo
    if (branding.logo_url) {
      const setFav = (rel: string, type: string, href: string) => {
        let el = document.querySelector<HTMLLinkElement>(`link[rel="${rel}"]`);
        if (!el) {
          el = document.createElement('link');
          el.rel = rel;
          document.head.appendChild(el);
        }
        el.type = type;
        el.href = href;
      };
      setFav('icon', 'image/png', branding.logo_url);
      setFav('apple-touch-icon', 'image/png', branding.logo_url);
      // Remove the SVG fallback so browsers don't prefer it over the logo
      document
        .querySelectorAll<HTMLLinkElement>('link[rel="icon"][type="image/svg+xml"]')
        .forEach((el) => el.remove());
    }
  }, [branding]);

  return <DomainContext.Provider value={value}>{children}</DomainContext.Provider>;
};

export default DomainProvider;
