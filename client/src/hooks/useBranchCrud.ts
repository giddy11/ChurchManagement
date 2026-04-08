import { useState, useCallback } from 'react';
import type { BranchDTO } from '@/lib/api';
import {
  fetchBranches,
  createBranchApi,
  updateBranchApi,
  deleteBranchApi,
} from '@/lib/api';
import { toast } from 'sonner';

export function useBranchCrud(denominationId: string | null) {
  const [branches, setBranches] = useState<BranchDTO[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    if (!denominationId) { setBranches([]); return; }
    setLoading(true);
    try {
      const res = await fetchBranches(denominationId);
      setBranches(res.data ?? []);
    } catch (err: any) {
      toast.error(err.message || 'Failed to load branches');
    } finally {
      setLoading(false);
    }
  }, [denominationId]);

  const create = async (data: Omit<Parameters<typeof createBranchApi>[1], never>) => {
    if (!denominationId) return false;
    setSaving(true);
    try {
      await createBranchApi(denominationId, data);
      toast.success('Branch created successfully');
      await load();
      return true;
    } catch (err: any) {
      toast.error(err.message || 'Failed to create branch');
      return false;
    } finally {
      setSaving(false);
    }
  };

  const update = async (branchId: string, data: Parameters<typeof updateBranchApi>[2]) => {
    if (!denominationId) return false;
    setSaving(true);
    try {
      await updateBranchApi(denominationId, branchId, data);
      toast.success('Branch updated successfully');
      await load();
      return true;
    } catch (err: any) {
      toast.error(err.message || 'Failed to update branch');
      return false;
    } finally {
      setSaving(false);
    }
  };

  const remove = async (branchId: string) => {
    if (!denominationId) return false;
    setSaving(true);
    try {
      await deleteBranchApi(denominationId, branchId);
      toast.success('Branch deleted successfully');
      await load();
      return true;
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete branch');
      return false;
    } finally {
      setSaving(false);
    }
  };

  return { branches, loading, saving, load, create, update, remove };
}
