export const queryKeys = {
  people: (branchId?: string) => ['people', branchId ?? 'all'] as const,
  members: (branchId?: string) => ['members', branchId ?? 'all'] as const,
  churches: () => ['churches'] as const,
  directory: (branchId?: string) => ['directory', branchId ?? 'all'] as const,
} as const;
