import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronUp, Plus, Trash2 } from 'lucide-react';
import ImageUploadButton from './ImageUploadButton';
import type { LandingCoreValue } from '@/lib/api';

interface Props {
  value: LandingCoreValue[];
  onChange: (next: LandingCoreValue[]) => void;
}

/** Editor for the church's core values shown on the About page. */
const CoreValuesEditor: React.FC<Props> = ({ value, onChange }) => {
  const [expandedIdx, setExpandedIdx] = useState<number | null>(null);

  const update = (i: number, patch: Partial<LandingCoreValue>) =>
    onChange(value.map((c, idx) => (idx === i ? { ...c, ...patch } : c)));

  const add = () => {
    onChange([...value, { title: '', description: '', icon: '', image: '' }]);
    setExpandedIdx(value.length);
  };

  const remove = (i: number) => {
    onChange(value.filter((_, idx) => idx !== i));
    if (expandedIdx === i) setExpandedIdx(null);
    else if (expandedIdx !== null && expandedIdx > i) setExpandedIdx(expandedIdx - 1);
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div>
          <Label className="text-xs">Core values</Label>
          <p className="text-xs text-muted-foreground">
            Shown on the public About page. An image (if uploaded) is preferred over the icon.
          </p>
        </div>
        <Button type="button" size="sm" variant="ghost" className="h-7" onClick={add}>
          <Plus className="h-3.5 w-3.5 mr-1" /> Add value
        </Button>
      </div>

      {value.length === 0 && (
        <p className="text-xs text-muted-foreground italic">
          No core values added — defaults will be shown.
        </p>
      )}

      <div className="space-y-1.5">
        {value.map((c, i) => {
          const open = expandedIdx === i;
          return (
            <div key={i} className="rounded-md border bg-card overflow-hidden">
              {/* Collapsed header */}
              <div className="flex items-center gap-2 px-3 py-2">
                <button
                  type="button"
                  className="flex-1 flex items-center gap-2 text-left min-w-0"
                  onClick={() => setExpandedIdx(open ? null : i)}
                >
                  {open ? (
                    <ChevronUp className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                  ) : (
                    <ChevronDown className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                  )}
                  <span className="text-xs font-medium truncate text-foreground">
                    {c.title || <span className="text-muted-foreground italic">Untitled value</span>}
                  </span>
                  {c.icon && (
                    <span className="text-xs text-muted-foreground shrink-0 font-mono">{c.icon}</span>
                  )}
                </button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0 text-red-500 hover:bg-red-50 shrink-0"
                  onClick={() => remove(i)}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>

              {/* Expanded form */}
              {open && (
                <div className="border-t px-3 pb-3 pt-2 space-y-2">
                  <div className="grid grid-cols-12 gap-2">
                    <Input
                      className="col-span-7 h-8 text-xs"
                      placeholder="Value title (e.g. Love)"
                      value={c.title}
                      onChange={(e) => update(i, { title: e.target.value })}
                    />
                    <Input
                      className="col-span-5 h-8 text-xs"
                      placeholder="Icon (e.g. Heart)"
                      value={c.icon ?? ''}
                      onChange={(e) => update(i, { icon: e.target.value })}
                    />
                  </div>
                  <Textarea
                    rows={2}
                    placeholder="Short description"
                    value={c.description ?? ''}
                    className="text-xs"
                    onChange={(e) => update(i, { description: e.target.value })}
                  />
                  <div className="flex flex-col gap-1">
                    <Label className="text-xs text-muted-foreground">Image (optional)</Label>
                    <ImageUploadButton
                      value={c.image || undefined}
                      onChange={(url) => update(i, { image: url ?? '' })}
                      folder="custom-domains/core-values"
                      thumbClassName="h-12 w-12"
                    />
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CoreValuesEditor;
