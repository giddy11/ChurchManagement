import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronUp, Plus, Trash2 } from 'lucide-react';
import type {
  LandingConfig,
  LandingCoreValue,
  LandingHighlight,
  LandingMinistry,
  LandingServiceTime,
  LandingSocialLinks,
} from '@/lib/api';
import HighlightsEditor from './landing-editor/HighlightsEditor';
import CoreValuesEditor from './landing-editor/CoreValuesEditor';
import ImageUploadButton from './landing-editor/ImageUploadButton';

interface Props {
  value: LandingConfig | null;
  onChange: (next: LandingConfig | null) => void;
}

/**
 * Compact editor for the public landing page configuration. Renders inside the
 * Custom Domain settings dialog. Designed to be all-optional — every field
 * has a sensible fallback at render time on the public landing page.
 */
const LandingPageEditor: React.FC<Props> = ({ value, onChange }) => {
  const [open, setOpen] = useState(false);

  const cfg: LandingConfig = value ?? {};
  const setField = <K extends keyof LandingConfig>(k: K, v: LandingConfig[K]) => {
    onChange({ ...cfg, [k]: v });
  };

  const services = cfg.service_times ?? [];
  const ministries = cfg.ministries ?? [];
  const highlights = cfg.highlights ?? [];
  const coreValues = cfg.core_values ?? [];
  const social: LandingSocialLinks = cfg.social ?? {};

  /* ─── Service times ────────────────────────────────────────────────── */
  const updateService = (i: number, patch: Partial<LandingServiceTime>) => {
    const next = services.map((s, idx) => (idx === i ? { ...s, ...patch } : s));
    setField('service_times', next);
  };
  const addService = () =>
    setField('service_times', [...services, { label: '', day: '', time: '' }]);
  const removeService = (i: number) =>
    setField('service_times', services.filter((_, idx) => idx !== i));

  /* ─── Ministries ───────────────────────────────────────────────────── */
  const updateMinistry = (i: number, patch: Partial<LandingMinistry>) => {
    const next = ministries.map((m, idx) => (idx === i ? { ...m, ...patch } : m));
    setField('ministries', next);
  };
  const addMinistry = () =>
    setField('ministries', [...ministries, { title: '', description: '', icon: '' }]);
  const removeMinistry = (i: number) =>
    setField('ministries', ministries.filter((_, idx) => idx !== i));

  const setSocial = (k: keyof LandingSocialLinks, v: string) =>
    setField('social', { ...social, [k]: v });

  return (
    <div className="rounded-md border bg-slate-50/50">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-4 py-3 text-left"
      >
        <div>
          <p className="text-sm font-medium text-slate-900">Public landing page</p>
          <p className="text-xs text-muted-foreground">
            Customise the page visitors see at the root of your custom domain.
          </p>
        </div>
        {open ? (
          <ChevronUp className="h-4 w-4 text-muted-foreground" />
        ) : (
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        )}
      </button>

      {open && (
        <div className="px-4 pb-4 space-y-5">
          {/* ─── Hero ─────────────────────────────────────────────── */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-xs">Hero headline</Label>
              <Input
                value={cfg.hero_headline ?? ''}
                onChange={(e) => setField('hero_headline', e.target.value)}
                placeholder="Welcome home"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs">Primary CTA label</Label>
              <Input
                value={cfg.cta_primary_label ?? ''}
                onChange={(e) => setField('cta_primary_label', e.target.value)}
                placeholder="Join Us"
              />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label className="text-xs">Hero subheading</Label>
              <Textarea
                rows={2}
                value={cfg.hero_subheadline ?? ''}
                onChange={(e) => setField('hero_subheadline', e.target.value)}
                placeholder="Discover faith, find community, and grow with us each week."
              />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label className="text-xs">Hero background image</Label>
              <ImageUploadButton
                value={cfg.hero_image_url}
                onChange={(url) => setField('hero_image_url', url)}
                errorMessage="Hero image upload failed"
              />
            </div>
          </div>

          {/* ─── About + mission + video ─────────────────────────── */}
          <div className="space-y-2">
            <Label className="text-xs">About us</Label>
            <Textarea
              rows={4}
              value={cfg.about ?? ''}
              onChange={(e) => setField('about', e.target.value)}
              placeholder="We are a vibrant community of believers… (supports line breaks)"
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-xs">Mission statement</Label>
              <Textarea
                rows={2}
                value={cfg.mission ?? ''}
                onChange={(e) => setField('mission', e.target.value)}
                placeholder="To know Christ and make Him known."
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs">Video URL (YouTube / Vimeo)</Label>
              <Input
                value={cfg.video_url ?? ''}
                onChange={(e) => setField('video_url', e.target.value)}
                placeholder="https://youtube.com/watch?v=…"
              />
            </div>
          </div>

          {/* ─── Service times ───────────────────────────────────── */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-xs">Service times</Label>
              <Button type="button" size="sm" variant="ghost" className="h-7" onClick={addService}>
                <Plus className="h-3.5 w-3.5 mr-1" /> Add service
              </Button>
            </div>
            {services.length === 0 && (
              <p className="text-xs text-muted-foreground italic">No services added yet.</p>
            )}
            <div className="space-y-3">
              {services.map((s, i) => (
                <div key={i} className="rounded-md border bg-white p-3 space-y-2">
                  <div className="grid grid-cols-12 gap-2">
                    <Input
                      className="col-span-4"
                      placeholder="Sunday Service"
                      value={s.label}
                      onChange={(e) => updateService(i, { label: e.target.value })}
                    />
                    <Input
                      className="col-span-3"
                      placeholder="Sundays"
                      value={s.day ?? ''}
                      onChange={(e) => updateService(i, { day: e.target.value })}
                    />
                    <Input
                      className="col-span-4"
                      placeholder="9:00 AM"
                      value={s.time ?? ''}
                      onChange={(e) => updateService(i, { time: e.target.value })}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="col-span-1 text-red-600 hover:bg-red-50"
                      onClick={() => removeService(i)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">
                      Background image (optional)
                    </Label>
                    <ImageUploadButton
                      value={s.background_image}
                      onChange={(url) => updateService(i, { background_image: url })}
                      folder="custom-domains/services"
                      thumbClassName="h-12 w-20"
                      errorMessage="Service image upload failed"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ─── Ministries ──────────────────────────────────────── */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-xs">Ministries</Label>
              <Button type="button" size="sm" variant="ghost" className="h-7" onClick={addMinistry}>
                <Plus className="h-3.5 w-3.5 mr-1" /> Add ministry
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Icons (optional): <code className="font-mono">Music2</code>,{' '}
              <code className="font-mono">Users</code>, <code className="font-mono">Heart</code>,{' '}
              <code className="font-mono">Sparkles</code>, <code className="font-mono">Church</code>,{' '}
              <code className="font-mono">Calendar</code>, <code className="font-mono">Globe</code>.
            </p>
            <div className="space-y-2">
              {ministries.map((m, i) => (
                <div key={i} className="rounded-md border bg-white p-3 space-y-2">
                  <div className="grid grid-cols-12 gap-2">
                    <Input
                      className="col-span-7"
                      placeholder="Ministry title"
                      value={m.title}
                      onChange={(e) => updateMinistry(i, { title: e.target.value })}
                    />
                    <Input
                      className="col-span-4"
                      placeholder="Icon (e.g. Music2)"
                      value={m.icon ?? ''}
                      onChange={(e) => updateMinistry(i, { icon: e.target.value })}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="col-span-1 text-red-600 hover:bg-red-50"
                      onClick={() => removeMinistry(i)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  <Textarea
                    rows={2}
                    placeholder="Short description"
                    value={m.description ?? ''}
                    onChange={(e) => updateMinistry(i, { description: e.target.value })}
                  />
                  <div className="flex flex-col gap-1">
                    <Label className="text-xs text-muted-foreground">
                      Background image (optional)
                    </Label>
                    <ImageUploadButton
                      value={m.background_image}
                      onChange={(url) => updateMinistry(i, { background_image: url })}
                      folder="custom-domains/ministries"
                      thumbClassName="h-12 w-20"
                      errorMessage="Ministry image upload failed"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ─── Core values ─────────────────────────────────────── */}
          <CoreValuesEditor
            value={coreValues}
            onChange={(next: LandingCoreValue[]) => setField('core_values', next)}
          />

          {/* ─── Highlights (replaces flat photo gallery) ────────── */}
          <HighlightsEditor
            value={highlights}
            onChange={(next: LandingHighlight[]) => setField('highlights', next)}
          />

          {/* ─── Social ──────────────────────────────────────────── */}
          <div className="space-y-2">
            <Label className="text-xs">Social links</Label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <Input
                placeholder="Facebook URL"
                value={social.facebook ?? ''}
                onChange={(e) => setSocial('facebook', e.target.value)}
              />
              <Input
                placeholder="Instagram URL"
                value={social.instagram ?? ''}
                onChange={(e) => setSocial('instagram', e.target.value)}
              />
              <Input
                placeholder="YouTube URL"
                value={social.youtube ?? ''}
                onChange={(e) => setSocial('youtube', e.target.value)}
              />
              <Input
                placeholder="X / Twitter URL"
                value={social.twitter ?? ''}
                onChange={(e) => setSocial('twitter', e.target.value)}
              />
              <Input
                placeholder="WhatsApp URL"
                value={social.whatsapp ?? ''}
                onChange={(e) => setSocial('whatsapp', e.target.value)}
              />
              <Input
                placeholder="Website URL"
                value={social.website ?? ''}
                onChange={(e) => setSocial('website', e.target.value)}
              />
            </div>
          </div>

          {/* ─── Toggle ──────────────────────────────────────────── */}
          <div className="flex items-center justify-between rounded-md border bg-white px-3 py-2">
            <div>
              <Label className="text-sm">Show "Join Us" call-to-action</Label>
              <p className="text-xs text-muted-foreground">
                Display the primary signup CTA on hero &amp; closing sections.
              </p>
            </div>
            <Switch
              checked={cfg.show_join_cta !== false}
              onCheckedChange={(v) => setField('show_join_cta', v)}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default LandingPageEditor;
