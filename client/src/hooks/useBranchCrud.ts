import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import type { BranchDTO } from '@/lib/api';
import {
  fetchBranches,
  createBranchApi,
  updateBranchApi,
  deleteBranchApi,
} from '@/lib/api';
import { toast } from 'sonner';
import { queryKeys } from '@/lib/queryKeys';

export function useBranchCrud(denominationId: string | null) {
  const queryClient = useQueryClient();
  const [saving, setSaving] = useState(false);

  const { data: branches = [], isLoading: loading } = useQuery({
    queryKey: queryKeys.branches(denominationId ?? undefined),
    queryFn: async () => {
      if (!denominationId) return [];
      const res = await fetchBranches(denominationId);
      return res.data ?? [];
    },
    enabled: !!denominationId,
    staleTime: 2 * 60 * 1000,
  });

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: queryKeys.branches(denominationId ?? undefined) });

  const load = invalidate;

  const create = async (data: Omit<Parameters<typeof createBranchApi>[1], never>) => {
    if (!denominationId) return false;
    setSaving(true);
    try {
      await createBranchApi(denominationId, data);
      toast.success('Branch created successfully');
      invalidate();
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
      invalidate();
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
      invalidate();
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
