export interface Person {
  id: number;
  firstName: string;
  lastName: string;
  name: string;
  middleName?: string;
  nickname?: string;
  birthdate?: string;
  gender?: 'male' | 'female';
  addressLine?: string;
  state?: string;
  city?: string;
  postalCode?: string;
  envelopeNumber?: string;
  email: string;
  mobile: string;
  homePhone?: string;
}
