import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Plus, Trash2 } from 'lucide-react';
import ImageUploadButton from './ImageUploadButton';
import type { LandingCoreValue } from '@/lib/api';

interface Props {
  value: LandingCoreValue[];
  onChange: (next: LandingCoreValue[]) => void;
}

/** Editor for the church's core values shown on the About page. */
const CoreValuesEditor: React.FC<Props> = ({ value, onChange }) => {
  const update = (i: number, patch: Partial<LandingCoreValue>) =>
    onChange(value.map((c, idx) => (idx === i ? { ...c, ...patch } : c)));

  const add = () =>
    onChange([...value, { title: '', description: '', icon: '', image: '' }]);

  const remove = (i: number) =>
    onChange(value.filter((_, idx) => idx !== i));

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

      <div className="space-y-2">
        {value.map((c, i) => (
          <div key={i} className="rounded-md border bg-white p-3 space-y-2">
            <div className="grid grid-cols-12 gap-2">
              <Input
                className="col-span-7"
                placeholder="Value title (e.g. Love)"
                value={c.title}
                onChange={(e) => update(i, { title: e.target.value })}
              />
              <Input
                className="col-span-4"
                placeholder="Icon (e.g. Heart)"
                value={c.icon ?? ''}
                onChange={(e) => update(i, { icon: e.target.value })}
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
              placeholder="Short description"
              value={c.description ?? ''}
              onChange={(e) => update(i, { description: e.target.value })}
            />
            <div className="pt-1">
              <Label className="text-xs">Image (optional)</Label>
              <ImageUploadButton
                value={c.image || undefined}
                onChange={(url) => update(i, { image: url ?? '' })}
                folder="custom-domains/core-values"
                thumbClassName="h-12 w-12"
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CoreValuesEditor;
