/**
 * A Denomination is the top-level organisation (e.g. "Redeemed Christian Church of God").
 * It has many Branch locations.
 */
export interface Church {
  id: string;
  denomination_name: string;
  description?: string;
  location?: string;
  state?: string;
  country?: string;
  address?: string;
  admin_id: string;
  admin?: { id: string; email: string; full_name?: string };
  branches?: Branch[];
  created_at: string;
  updated_at: string;
}

/** A local church (physical location) belonging to a Denomination */
export interface Branch {
  id: string;
  name: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  pastor_name?: string;
  description?: string;
  is_headquarters: boolean;
  denomination_id: string;
  created_at: string;
  updated_at: string;
}

export interface ChurchMembership {
  churchId: string;
  branchId?: string;
  role: 'admin' | 'member';
}
