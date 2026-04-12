import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import type { ChurchDTO } from '@/lib/api';
import {
  fetchChurches,
  createChurchApi,
  updateChurchApi,
  deleteChurchApi,
} from '@/lib/api';
import { toast } from 'sonner';
import { queryKeys } from '@/lib/queryKeys';

export function useChurchCrud() {
  const queryClient = useQueryClient();
  const [saving, setSaving] = useState(false);

  const { data: churches = [], isLoading: loading } = useQuery({
    queryKey: queryKeys.churches(),
    queryFn: async () => {
      const res = await fetchChurches();
      return res.data ?? [];
    },
    staleTime: 5 * 60 * 1000,
  });

  const invalidate = () => queryClient.invalidateQueries({ queryKey: queryKeys.churches() });

  const load = invalidate;

  const create = async (data: Parameters<typeof createChurchApi>[0]) => {
    setSaving(true);
    try {
      await createChurchApi(data);
      toast.success('Church created successfully');
      invalidate();
      return true;
    } catch (err: any) {
      toast.error(err.message || 'Failed to create church');
      return false;
    } finally {
      setSaving(false);
    }
  };

  const update = async (id: string, data: Parameters<typeof updateChurchApi>[1]) => {
    setSaving(true);
    try {
      await updateChurchApi(id, data);
      toast.success('Church updated successfully');
      invalidate();
      return true;
    } catch (err: any) {
      toast.error(err.message || 'Failed to update church');
      return false;
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: string) => {
    setSaving(true);
    try {
      await deleteChurchApi(id);
      toast.success('Church deleted successfully');
      invalidate();
      return true;
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete church');
      return false;
    } finally {
      setSaving(false);
    }
  };

  return { churches, loading, saving, load, create, update, remove };
}
