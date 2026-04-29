import React, { useState } from 'react';
import { Camera, Loader2, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { uploadToCloudinary } from '@/lib/cloudinary';
import { toast } from 'sonner';

interface Props {
  /** Currently uploaded image URL (if any). */
  value?: string;
  /** Called with the new URL after a successful upload, or `undefined` when cleared. */
  onChange: (next: string | undefined) => void;
  /** Cloudinary folder for the upload. */
  folder?: string;
  /** Compact label shown on the trigger when no image is set. */
  label?: string;
  /** Pixel size of the thumbnail. */
  thumbClassName?: string;
  /** Surfaced when an upload fails. */
  errorMessage?: string;
}

/**
 * Reusable single-image uploader used by the Landing-page editor.  Keeps the
 * upload UI consistent across hero / service / core-value images.
 */
const ImageUploadButton: React.FC<Props> = ({
  value,
  onChange,
  folder = 'custom-domains',
  label = 'Upload',
  thumbClassName = 'h-16 w-28',
  errorMessage = 'Image upload failed',
}) => {
  const [busy, setBusy] = useState(false);

  const handleFile = async (file: File) => {
    try {
      setBusy(true);
      const url = await uploadToCloudinary(file, folder);
      onChange(url);
    } catch {
      toast.error(errorMessage);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex items-center gap-3">
      {value ? (
        <div className={`${thumbClassName} rounded-md overflow-hidden bg-slate-200 flex-shrink-0`}>
          <img src={value} alt="" className="h-full w-full object-cover" />
        </div>
      ) : (
        <div
          className={`${thumbClassName} rounded-md bg-slate-200 flex items-center justify-center text-xs text-slate-500 flex-shrink-0`}
        >
          No image
        </div>
      )}
      <label className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md border bg-white text-sm cursor-pointer hover:bg-slate-50">
        {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Camera className="h-4 w-4" />}
        {label}
        <input
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) handleFile(f);
            e.target.value = '';
          }}
        />
      </label>
      {value && (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="text-red-600 hover:bg-red-50"
          onClick={() => onChange(undefined)}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
};

export default ImageUploadButton;
