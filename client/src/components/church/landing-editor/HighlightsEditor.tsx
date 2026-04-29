import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Camera, Loader2, Plus, Trash2 } from 'lucide-react';
import { uploadToCloudinary } from '@/lib/cloudinary';
import { toast } from 'sonner';
import type { LandingHighlight } from '@/lib/api';

interface Props {
  value: LandingHighlight[];
  onChange: (next: LandingHighlight[]) => void;
}

/** Quick id helper — only used for stable react keys. Not security-sensitive. */
const newId = () => `h_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;

/**
 * Editor for the "Highlights" gallery — each highlight is a titled, dated
 * collection of photos (e.g. "Easter Sunday Service — 2026-04-05").
 */
const HighlightsEditor: React.FC<Props> = ({ value, onChange }) => {
  const [uploadingFor, setUploadingFor] = useState<string | null>(null);

  const update = (i: number, patch: Partial<LandingHighlight>) => {
    onChange(value.map((h, idx) => (idx === i ? { ...h, ...patch } : h)));
  };

  const add = () =>
    onChange([
      ...value,
      { id: newId(), title: '', date: '', description: '', images: [] },
    ]);

  const remove = (i: number) =>
    onChange(value.filter((_, idx) => idx !== i));

  const removeImage = (i: number, imageIdx: number) => {
    const next = [...value];
    next[i] = {
      ...next[i],
      images: next[i].images.filter((_, idx) => idx !== imageIdx),
    };
    onChange(next);
  };

  const uploadImages = async (i: number, files: FileList) => {
    if (!files.length) return;
    const id = value[i].id ?? `idx-${i}`;
    try {
      setUploadingFor(id);
      const uploads = await Promise.all(
        Array.from(files).map((f) => uploadToCloudinary(f, 'custom-domains/highlights')),
      );
      const next = [...value];
      next[i] = { ...next[i], images: [...next[i].images, ...uploads] };
      onChange(next);
    } catch {
      toast.error('Failed to upload some images');
    } finally {
      setUploadingFor(null);
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div>
          <Label className="text-xs">Highlights</Label>
          <p className="text-xs text-muted-foreground">
            Group photos by event &amp; date — visitors can filter on the public page.
          </p>
        </div>
        <Button type="button" size="sm" variant="ghost" className="h-7" onClick={add}>
          <Plus className="h-3.5 w-3.5 mr-1" /> Add highlight
        </Button>
      </div>

      {value.length === 0 && (
        <p className="text-xs text-muted-foreground italic">No highlights added yet.</p>
      )}

      <div className="space-y-3">
        {value.map((h, i) => {
          const id = h.id ?? `idx-${i}`;
          const busy = uploadingFor === id;
          return (
            <div key={id} className="rounded-md border bg-white p-3 space-y-3">
              <div className="grid grid-cols-12 gap-2">
                <Input
                  className="col-span-7"
                  placeholder="e.g. Easter Sunday Service"
                  value={h.title}
                  onChange={(e) => update(i, { title: e.target.value })}
                />
                <Input
                  className="col-span-4"
                  type="date"
                  value={h.date ?? ''}
                  onChange={(e) => update(i, { date: e.target.value })}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="col-span-1 text-red-600 hover:bg-red-50"
                  onClick={() => remove(i)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>

              <Textarea
                rows={2}
                placeholder="Short description (optional)"
                value={h.description ?? ''}
                onChange={(e) => update(i, { description: e.target.value })}
              />

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-xs text-muted-foreground">
                    Photos ({h.images.length})
                  </Label>
                  <label className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md border bg-white text-xs cursor-pointer hover:bg-slate-50">
                    {busy ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Camera className="h-3.5 w-3.5" />
                    )}
                    Add photos
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      className="hidden"
                      onChange={(e) => {
                        if (e.target.files) uploadImages(i, e.target.files);
                        e.target.value = '';
                      }}
                    />
                  </label>
                </div>
                {h.images.length === 0 ? (
                  <p className="text-xs text-muted-foreground italic">No photos yet.</p>
                ) : (
                  <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                    {h.images.map((url, imageIdx) => (
                      <div
                        key={imageIdx}
                        className="relative group aspect-square rounded-md overflow-hidden bg-slate-200"
                      >
                        <img src={url} alt="" className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => removeImage(i, imageIdx)}
                          className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity text-white"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default HighlightsEditor;
