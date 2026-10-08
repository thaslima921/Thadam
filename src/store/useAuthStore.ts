import { create } from 'zustand';
import { DEMO_USERS } from '../config/constants';

export type UserRole = 'tourist' | 'partner' | 'admin';

interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  phone?: string;
  businessName?: string;
}

interface AuthStoreState {
  isAuthenticated: boolean;
  currentUser: UserProfile;
  role: UserRole;
  setRole: (role: UserRole) => void;
  login: (email: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthStoreState>((set) => ({
  isAuthenticated: true,
  currentUser: DEMO_USERS.tourist,
  role: 'tourist',

  setRole: (role: UserRole) => {
    const profile =
      role === 'partner'
        ? DEMO_USERS.partner
        : role === 'admin'
        ? DEMO_USERS.admin
        : DEMO_USERS.tourist;

    set({ role, currentUser: profile });
  },

  login: (email: string) => {
    let matchedRole: UserRole = 'tourist';
    if (email.includes('admin')) matchedRole = 'admin';
    else if (email.includes('artisan') || email.includes('partner')) matchedRole = 'partner';

    const profile =
      matchedRole === 'partner'
        ? DEMO_USERS.partner
        : matchedRole === 'admin'
        ? DEMO_USERS.admin
        : DEMO_USERS.tourist;

    set({ isAuthenticated: true, role: matchedRole, currentUser: profile });
  },

  logout: () => {
    set({ isAuthenticated: false });
  },
}));
