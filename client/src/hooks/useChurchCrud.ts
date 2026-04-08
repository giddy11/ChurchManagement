import { useState, useCallback } from 'react';
import type { ChurchDTO } from '@/lib/api';
import {
  fetchChurches,
  createChurchApi,
  updateChurchApi,
  deleteChurchApi,
} from '@/lib/api';
import { toast } from 'sonner';

export function useChurchCrud() {
  const [churches, setChurches] = useState<ChurchDTO[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetchChurches();
      setChurches(res.data ?? []);
    } catch (err: any) {
      toast.error(err.message || 'Failed to load churches');
    } finally {
      setLoading(false);
    }
  }, []);

  const create = async (data: Parameters<typeof createChurchApi>[0]) => {
    setSaving(true);
    try {
      await createChurchApi(data);
      toast.success('Church created successfully');
      await load();
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
      await load();
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
      await load();
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
