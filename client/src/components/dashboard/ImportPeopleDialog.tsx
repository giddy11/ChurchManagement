import React, { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Download, Upload, FileSpreadsheet, Loader2 } from 'lucide-react';
import { PERSON_IMPORT_COLUMNS } from '@/types/person';
import type { PersonCreateDTO } from '@/types/person';

interface ImportPeopleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onImport: (rows: Partial<PersonCreateDTO>[]) => Promise<boolean>;
  saving?: boolean;
}

function downloadTemplate() {
  const header = PERSON_IMPORT_COLUMNS.join(',');
  const sample = 'John,Doe,Michael,Johnny,1990-01-15,male,123 Main St,Lagos,Ikeja,john@email.com,08012345678';
  const csv = `${header}\n${sample}`;
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'people_import_template.csv';
  a.click();
  URL.revokeObjectURL(url);
}

function parseCSV(text: string): Partial<PersonCreateDTO>[] {
  const lines = text.trim().split('\n');
  if (lines.length < 2) return [];
  const headers = lines[0].split(',').map((h) => h.trim());
  return lines.slice(1).map((line) => {
    const values = line.split(',').map((v) => v.trim());
    const row: any = {};
    headers.forEach((h, i) => { if (values[i]) row[h] = values[i]; });
    return row;
  });
}

const ImportPeopleDialog: React.FC<ImportPeopleDialogProps> = ({ open, onOpenChange, onImport, saving }) => {
  const fileRef = useRef<HTMLInputElement>(null);
  const [rows, setRows] = useState<Partial<PersonCreateDTO>[]>([]);
  const [fileName, setFileName] = useState('');

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (ev) => {
      const parsed = parseCSV(ev.target?.result as string);
      setRows(parsed);
    };
    reader.readAsText(file);
  };

  const handleImport = async () => {
    const ok = await onImport(rows);
    if (ok) { setRows([]); setFileName(''); onOpenChange(false); }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg bg-white">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Import People</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" onClick={downloadTemplate}>
              <Download className="mr-2 h-4 w-4" /> Download Template
            </Button>
            <span className="text-xs text-gray-500">CSV format with required columns</span>
          </div>

          <div
            className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-teal-500 transition-colors"
            onClick={() => fileRef.current?.click()}
          >
            <input ref={fileRef} type="file" accept=".csv" className="hidden" onChange={handleFile} />
            <FileSpreadsheet className="mx-auto h-10 w-10 text-gray-400 mb-3" />
            {fileName ? (
              <p className="text-sm font-medium text-teal-700">{fileName} — {rows.length} row(s)</p>
            ) : (
              <p className="text-sm text-gray-500">Click to select a CSV file</p>
            )}
          </div>

          {rows.length > 0 && (
            <div className="max-h-40 overflow-auto border rounded text-xs">
              <table className="w-full">
                <thead><tr className="bg-gray-50">{Object.keys(rows[0]).map((k) => <th key={k} className="px-2 py-1 text-left font-medium">{k}</th>)}</tr></thead>
                <tbody>{rows.slice(0, 5).map((r, i) => <tr key={i} className="border-t">{Object.values(r).map((v, j) => <td key={j} className="px-2 py-1">{String(v)}</td>)}</tr>)}</tbody>
              </table>
              {rows.length > 5 && <p className="text-center py-1 text-gray-400">+{rows.length - 5} more rows</p>}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleImport} disabled={saving || rows.length === 0} className="bg-teal-600 hover:bg-teal-700 text-white">
            {saving ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Importing…</> : <><Upload className="h-4 w-4 mr-2" /> Import {rows.length} People</>}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ImportPeopleDialog;
