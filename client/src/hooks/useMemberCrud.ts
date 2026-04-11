import { useState, useCallback } from 'react';
import type { MemberDTO } from '@/lib/api';
import {
  fetchMembersApi,
  createMemberApi,
  updateMemberApi,
  updateMemberBranchRoleApi,
  updateMemberBranchStatusApi,
  deleteMembersApi,
  importMembersApi,
} from '@/lib/api';
import { toast } from 'sonner';
import { useChurch } from '@/components/church/ChurchProvider';

export type { MemberDTO };

export interface ImportMembersResult {
  created: MemberDTO[];
  duplicates: { email: string; reason: string }[];
  uniqueCount: number;
  duplicateCount: number;
}

export function useMemberCrud() {
  const { currentChurch, currentBranch } = useChurch();
  const [members, setMembers] = useState<MemberDTO[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetchMembersApi();
      setMembers(res.data ?? []);
    } catch (err: any) {
      toast.error(err.message || 'Failed to load members');
    } finally {
      setLoading(false);
    }
  }, []);

  const create = async (data: Parameters<typeof createMemberApi>[0]) => {
    setSaving(true);
    try {
      await createMemberApi(data);
      toast.success('Member added successfully. A welcome email with their password has been sent.');
      await load();
      return true;
    } catch (err: any) {
      toast.error(err.message || 'Failed to add member');
      return false;
    } finally {
      setSaving(false);
    }
  };

  const update = async (id: string, data: Partial<{ full_name: string; role: string }>) => {
    setSaving(true);
    try {
      const { role, ...userFields } = data;
      const tasks: Promise<any>[] = [];
      if (Object.keys(userFields).length > 0) tasks.push(updateMemberApi(id, userFields));
      if (role && currentChurch && currentBranch) {
        tasks.push(updateMemberBranchRoleApi(currentChurch.id, currentBranch.id, id, role));
      }
      await Promise.all(tasks);
      toast.success('Member updated successfully');
      await load();
      return true;
    } catch (err: any) {
      toast.error(err.message || 'Failed to update member');
      return false;
    } finally {
      setSaving(false);
    }
  };

  const setBranchStatus = async (id: string, is_active: boolean) => {
    setSaving(true);
    try {
      if (!currentChurch || !currentBranch) throw new Error('No branch selected');
      await updateMemberBranchStatusApi(currentChurch.id, currentBranch.id, id, is_active);
      toast.success(is_active ? 'Member activated in this branch' : 'Member deactivated in this branch');
      await load();
      return true;
    } catch (err: any) {
      toast.error(err.message || 'Failed to update member status');
      return false;
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: string) => {
    setSaving(true);
    try {
      await deleteMembersApi([id]);
      toast.success('Member removed');
      await load();
      return true;
    } catch (err: any) {
      toast.error(err.message || 'Failed to remove member');
      return false;
    } finally {
      setSaving(false);
    }
  };

  const removeMany = async (ids: string[]) => {
    setSaving(true);
    try {
      await deleteMembersApi(ids);
      toast.success(`${ids.length} member(s) removed`);
      await load();
      return true;
    } catch (err: any) {
      toast.error(err.message || 'Failed to remove members');
      return false;
    } finally {
      setSaving(false);
    }
  };

  const importMembers = async (
    rows: Parameters<typeof importMembersApi>[0]
  ): Promise<ImportMembersResult | false> => {
    setSaving(true);
    try {
      const res = await importMembersApi(rows);
      await load();
      const uniqueCount = res.uniqueCount ?? 0;
      const duplicateCount = res.duplicateCount ?? 0;
      if (uniqueCount > 0) {
        toast.success(`${uniqueCount} member(s) imported. Welcome emails sent.`);
      }
      return {
        created: res.data ?? [],
        duplicates: (res.duplicateData ?? []).map((d: any) => ({
          email: d.email,
          reason: 'Duplicate email',
        })),
        uniqueCount,
        duplicateCount,
      };
    } catch (err: any) {
      toast.error(err.message || 'Import failed');
      return false;
    } finally {
      setSaving(false);
    }
  };

  return { members, loading, saving, load, create, update, setBranchStatus, remove, removeMany, importMembers };
}
