import React, { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Download, Upload, FileSpreadsheet, Loader2, CheckCircle2, AlertTriangle, Copy, UserCheck } from 'lucide-react';
import type { ImportMembersResult } from '@/hooks/useMemberCrud';
import { normalizePhone } from '@/lib/utils';

const MEMBER_IMPORT_COLUMNS = ['first_name', 'last_name', 'email', 'phone_number'] as const;
type MemberImportCol = typeof MEMBER_IMPORT_COLUMNS[number];

// ── Cell-level format validators ───────────────────────────────────────────────
const CELL_VALIDATORS: Partial<Record<MemberImportCol, (v: string) => boolean>> = {
  email:        (v) => v.includes('@'),
  phone_number: (v) => /^[\+\d\s\(\)\-\.]{6,}$/.test(v),
};

function isCellSuspect(col: MemberImportCol, value: string): boolean {
  const validate = CELL_VALIDATORS[col];
  return !!validate && !!value && !validate(value);
}

function rowHasColumnMismatch(row: Record<string, string>): boolean {
  return MEMBER_IMPORT_COLUMNS.some((col) => isCellSuspect(col, row[col] ?? ''));
}

interface ImportMembersDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onImport: (rows: { first_name: string; last_name: string; email: string; role?: string; phone_number?: string }[]) => Promise<ImportMembersResult | false>;
  saving?: boolean;
  /** Emails of existing Person records — used to highlight rows that will be auto-converted */
  existingPersonEmails?: string[];
}

function downloadTemplate() {
  const header = MEMBER_IMPORT_COLUMNS.join(',');
  // const instructions = '# INSTRUCTIONS: One member per row. Required: first_name, last_name, email. phone_number is optional — leave it blank but keep the comma.';
  const sample1 = 'John,Doe,john@example.com,+234 700 000 0000';
  // Example with optional phone_number empty (comma preserved)
  const sample2 = 'Jane,Smith,jane@example.com,';
  const csv = [header, /*instructions,*/ sample1, sample2].join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'members_import_template.csv';
  a.click();
  URL.revokeObjectURL(url);
}

function parseCSV(text: string): Record<string, string>[] {
  const rows: string[][] = [];
  let inQuotes = false;
  const cells: string[] = [''];
  let cellIdx = 0;

  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    const next = text[i + 1];
    if (inQuotes) {
      if (ch === '"' && next === '"') { cells[cellIdx] += '"'; i++; }
      else if (ch === '"') { inQuotes = false; }
      else { cells[cellIdx] += ch; }
    } else {
      if (ch === '"') { inQuotes = true; }
      else if (ch === ',') { cells.push(''); cellIdx++; }
      else if (ch === '\n' || (ch === '\r' && next === '\n')) {
        if (ch === '\r') i++;
        rows.push([...cells]);
        cells.length = 0; cells.push(''); cellIdx = 0;
      } else { cells[cellIdx] += ch; }
    }
  }
  if (cells.some((c) => c !== '')) rows.push([...cells]);
  if (rows.length < 2) return [];

  const headers = rows[0].map((h) => h.trim());
  // Skip comment/instruction rows (lines starting with #)
  const dataRows = rows.slice(1).filter((r) => !r[0]?.trimStart().startsWith('#'));
  return dataRows.map((values) => {
    const row: Record<string, string> = {};
    headers.forEach((h, i) => {
      let v = (values[i] ?? '').trim();
      if (!v) return;
      if (h === 'phone_number') v = normalizePhone(v);
      row[h] = v;
    });
    return row;
  });
}

const RowTable: React.FC<{ rows: Record<string, any>[]; reasonKey?: string }> = ({ rows, reasonKey }) => {
  if (rows.length === 0) return <p className="text-sm text-gray-400 py-4 text-center">None</p>;
  const dataRows = reasonKey ? rows.map((r) => r.row ?? r) : rows;
  const reasons: string[] = reasonKey ? rows.map((r) => r.reason ?? r[reasonKey] ?? '') : [];
  const cols = Array.from(new Set(dataRows.flatMap(Object.keys))).slice(0, 5);

  return (
    <div className="overflow-auto rounded border text-xs max-h-52">
      <table className="w-full">
        <thead>
          <tr className="bg-gray-50 border-b">
            {reasonKey && <th className="px-2 py-1.5 text-left font-medium text-gray-600 whitespace-nowrap">Reason</th>}
            {cols.map((c) => <th key={c} className="px-2 py-1.5 text-left font-medium text-gray-600 whitespace-nowrap">{c}</th>)}
          </tr>
        </thead>
        <tbody>
          {dataRows.map((r, i) => (
            <tr key={i} className="border-b last:border-0 hover:bg-gray-50">
              {reasonKey && <td className="px-2 py-1.5 text-red-600 max-w-[200px]">{reasons[i]}</td>}
              {cols.map((c) => <td key={c} className="px-2 py-1.5 text-gray-700 whitespace-nowrap max-w-[120px] truncate">{String(r[c] ?? '')}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

const ImportMembersDialog: React.FC<ImportMembersDialogProps> = ({ open, onOpenChange, onImport, saving, existingPersonEmails }) => {
  const fileRef = useRef<HTMLInputElement>(null);
  const [rows, setRows] = useState<Record<string, string>[]>([]);
  const [fileName, setFileName] = useState('');
  const [result, setResult] = useState<ImportMembersResult | null>(null);

  const reset = () => { setRows([]); setFileName(''); setResult(null); };
  const handleClose = () => { reset(); onOpenChange(false); };

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
    setResult(null);
    const reader = new FileReader();
    reader.onload = (ev) => setRows(parseCSV(ev.target?.result as string));
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleImport = async () => {
    const validRows = rows
      .filter((r) => r.first_name && r.last_name && r.email)
      .map((r) => ({ first_name: r.first_name, last_name: r.last_name, email: r.email, phone_number: r.phone_number, role: 'member' }));
    const res = await onImport(validRows);
    if (res !== false) {
      setResult(res);
      setRows([]);
      setFileName('');
    }
  };

  const createdCount = result?.uniqueCount ?? 0;
  const dupCount = result?.duplicateCount ?? 0;
  const convertedCount = result?.convertedCount ?? 0;

  // Pre-import: which preview rows match existing Person records
  const personEmailSet = new Set((existingPersonEmails ?? []).map((e) => e.trim().toLowerCase()));
  const willConvertRows = rows.filter((r) => r.email && personEmailSet.has(r.email.trim().toLowerCase()));

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-[90vw] sm:max-w-3xl bg-white">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Import Members</DialogTitle>
        </DialogHeader>

        {result ? (
          <div className="space-y-4 py-2">
            <div className="flex flex-wrap gap-3">
              <div className="flex items-center gap-2 rounded-md border border-green-200 bg-green-50 px-3 py-2">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <span className="text-sm font-medium text-green-700">{createdCount} imported</span>
              </div>
              {convertedCount > 0 && (
                <div className="flex items-center gap-2 rounded-md border border-blue-200 bg-blue-50 px-3 py-2">
                  <UserCheck className="h-4 w-4 text-blue-600" />
                  <span className="text-sm font-medium text-blue-700">{convertedCount} converted from People</span>
                </div>
              )}
              <div className="flex items-center gap-2 rounded-md border border-yellow-200 bg-yellow-50 px-3 py-2">
                <Copy className="h-4 w-4 text-yellow-600" />
                <span className="text-sm font-medium text-yellow-700">{dupCount} duplicate{dupCount !== 1 ? 's' : ''}</span>
              </div>
            </div>

            <Tabs defaultValue={convertedCount > 0 ? 'converted' : dupCount > 0 ? 'duplicates' : 'created'}>
              <TabsList className="w-full">
                <TabsTrigger value="created" className="flex-1 gap-2">
                  Imported <Badge variant="secondary">{createdCount}</Badge>
                </TabsTrigger>
                {convertedCount > 0 && (
                  <TabsTrigger value="converted" className="flex-1 gap-2">
                    Converted <Badge variant="secondary">{convertedCount}</Badge>
                  </TabsTrigger>
                )}
                <TabsTrigger value="duplicates" className="flex-1 gap-2">
                  Duplicates <Badge variant="secondary">{dupCount}</Badge>
                </TabsTrigger>
              </TabsList>
              <TabsContent value="created" className="mt-3">
                <RowTable rows={result.created as any} />
              </TabsContent>
              {convertedCount > 0 && (
                <TabsContent value="converted" className="mt-3">
                  <p className="text-xs text-gray-500 mb-2">These people existed in your People list and have been converted to member accounts.</p>
                  <RowTable rows={result.convertedPersons as any} />
                </TabsContent>
              )}
              <TabsContent value="duplicates" className="mt-3">
                <RowTable rows={result.duplicates.map((d) => ({ ...d, row: { email: d.email } }))} reasonKey="reason" />
              </TabsContent>
            </Tabs>
          </div>
        ) : (
          <div className="space-y-5 py-2">
            <div className="flex items-center gap-3">
              <Button variant="outline" size="sm" onClick={downloadTemplate}>
                <Download className="mr-2 h-4 w-4" /> Download Template
              </Button>
              <span className="text-xs text-gray-500">CSV · required: first_name, last_name, email</span>
            </div>

            <div
              className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-teal-500 transition-colors"
              onClick={() => fileRef.current?.click()}
            >
              <input ref={fileRef} type="file" accept=".csv" className="hidden" onChange={handleFile} />
              <FileSpreadsheet className="mx-auto h-10 w-10 text-gray-400 mb-3" />
              {fileName ? (
                <p className="text-sm font-medium text-teal-700">{fileName} — {rows.length} row(s) parsed</p>
              ) : (
                <>
                  <p className="text-sm font-medium text-gray-700">Click to select a CSV file</p>
                  <p className="text-xs text-gray-400 mt-1">or drag and drop</p>
                </>
              )}
            </div>

            {rows.length > 0 && (
              <div className="space-y-1.5">
                <p className="text-xs font-medium text-gray-500">Preview (first 5 rows)</p>
                {willConvertRows.length > 0 && (
                  <div className="flex items-start gap-2 rounded-md border border-blue-200 bg-blue-50 px-3 py-2 text-xs text-blue-800">
                    <UserCheck className="h-3.5 w-3.5 mt-0.5 shrink-0" />
                    <span>
                      <span className="font-medium">{willConvertRows.length} row{willConvertRows.length !== 1 ? 's' : ''}</span>
                      {' '}match{willConvertRows.length === 1 ? 'es' : ''} existing People records
                      ({willConvertRows.map((r) => r.email).join(', ')}) — {willConvertRows.length === 1 ? 'this person' : 'these people'} will be converted to member accounts on import.
                    </span>
                  </div>
                )}
                {rows.slice(0, 5).some(rowHasColumnMismatch) && (
                  <div className="flex items-start gap-2 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
                    <AlertTriangle className="h-3.5 w-3.5 mt-0.5 shrink-0" />
                    <span>One or more rows have values in the wrong column — likely caused by skipping optional fields without keeping the commas. Cells highlighted in amber are suspected mismatches. Fix your CSV and re-upload, or <button className="underline font-medium" onClick={downloadTemplate}>download the template</button> again.</span>
                  </div>
                )}
                <div className="overflow-auto rounded border text-xs max-h-44">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-gray-50 border-b">
                        {MEMBER_IMPORT_COLUMNS.map((col) => (
                          <th key={col} className="px-2 py-1.5 text-left font-medium text-gray-600 whitespace-nowrap">{col}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {rows.slice(0, 5).map((r, i) => (
                        <tr key={i} className="border-b last:border-0">
                          {MEMBER_IMPORT_COLUMNS.map((col) => {
                            const val = r[col] ?? '';
                            const suspect = isCellSuspect(col, val);
                            return (
                              <td
                                key={col}
                                title={suspect ? `"${val}" doesn't look like a valid ${col}` : undefined}
                                className={`px-2 py-1.5 whitespace-nowrap max-w-[120px] truncate ${
                                  suspect ? 'bg-amber-50 text-amber-700 font-medium' : 'text-gray-700'
                                }`}
                              >
                                {val}
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {rows.length > 5 && <p className="text-center py-1 text-gray-400">+{rows.length - 5} more rows</p>}
                </div>
              </div>
            )}
          </div>
        )}

        <DialogFooter className="gap-2">
          {result ? (
            <>
              <Button variant="outline" onClick={reset}>Import Another File</Button>
              <Button onClick={handleClose} className="bg-teal-600 hover:bg-teal-700 text-white">Done</Button>
            </>
          ) : (
            <>
              <Button variant="outline" onClick={handleClose}>Cancel</Button>
              <Button
                onClick={handleImport}
                disabled={saving || rows.length === 0}
                className="bg-app-primary hover:bg-app-primary-hover text-app-primary-foreground"
              >
                {saving
                  ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Importing…</>
                  : <><Upload className="h-4 w-4 mr-2" /> Import {rows.length > 0 ? `${rows.length} ` : ''}Members</>}
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ImportMembersDialog;
