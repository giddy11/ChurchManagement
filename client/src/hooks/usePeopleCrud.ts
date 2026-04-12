import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { Person, PersonCreateDTO, PersonUpdateDTO, ImportPeopleResult } from '@/types/person';
import {
  fetchPeople,
  createPersonApi,
  updatePersonApi,
  deletePersonApi,
  importPeopleApi,
  convertPersonApi,
} from '@/lib/api';
import { toast } from 'sonner';
import { useChurch } from '@/components/church/ChurchProvider';
import { queryKeys } from '@/lib/queryKeys';

export function usePeopleCrud() {
  const { currentBranch } = useChurch();
  const queryClient = useQueryClient();
  const [saving, setSaving] = useState(false);

  const branchId = currentBranch?.id;
  const { data: people = [], isLoading: loading } = useQuery({
    queryKey: queryKeys.people(branchId),
    queryFn: async () => {
      const res = await fetchPeople();
      return res.data ?? [];
    },
    staleTime: 5 * 60 * 1000,
  });

  const invalidate = () => queryClient.invalidateQueries({ queryKey: queryKeys.people(branchId) });

  // Keep load() for backward compatibility with components calling it directly
  const load = invalidate;

  const create = async (data: PersonCreateDTO) => {
    setSaving(true);
    try {
      await createPersonApi(data);
      toast.success('Person added successfully');
      await invalidate();
      return true;
    } catch (err: any) {
      toast.error(err.message || 'Failed to add person');
      return false;
    } finally {
      setSaving(false);
    }
  };

  const update = async (id: string, data: PersonUpdateDTO) => {
    setSaving(true);
    try {
      await updatePersonApi(id, data);
      toast.success('Person updated successfully');
      await invalidate();
      return true;
    } catch (err: any) {
      toast.error(err.message || 'Failed to update person');
      return false;
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: string) => {
    setSaving(true);
    try {
      await deletePersonApi([id]);
      toast.success('Person deleted successfully');
      await invalidate();
      return true;
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete person');
      return false;
    } finally {
      setSaving(false);
    }
  };

  const importPeople = async (rows: Partial<PersonCreateDTO>[]): Promise<ImportPeopleResult | false> => {
    setSaving(true);
    try {
      const res = await importPeopleApi(rows);
      await invalidate();
      const { valid, duplicates, invalid } = res.data;
      if (valid.length > 0) {
        toast.success(`${valid.length} ${valid.length === 1 ? 'person' : 'people'} imported successfully`);
      } else if (duplicates.length === 0 && invalid.length === 0) {
        toast.success('Import successful');
      }
      return res.data;
    } catch (err: any) {
      toast.error(err.message || 'Import failed');
      return false;
    } finally {
      setSaving(false);
    }
  };

  const convert = async (id: string) => {
    setSaving(true);
    try {
      const res = await convertPersonApi(id);
      toast.success(res.message || 'Person converted to member');
      await invalidate();
      return true;
    } catch (err: any) {
      toast.error(err.message || 'Conversion failed');
      return false;
    } finally {
      setSaving(false);
    }
  };

  const removeMany = async (ids: string[]) => {
    setSaving(true);
    try {
      const res = await deletePersonApi(ids);
      toast.success(res.message || `${ids.length} people deleted`);
      await invalidate();
      return true;
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete people');
      return false;
    } finally {
      setSaving(false);
    }
  };

  return { people, loading, saving, load, create, update, remove, removeMany, importPeople, convert };
}
