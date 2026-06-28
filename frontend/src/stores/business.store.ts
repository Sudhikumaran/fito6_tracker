import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { api } from '@/lib/api';

export interface Business {
  id: string;
  name: string;
}

interface BusinessState {
  businesses: Business[];
  activeBusinessId: string | null;
  isLoading: boolean;
  setActiveBusiness: (id: string) => void;
  fetchBusinesses: () => Promise<Business[]>;
  createBusiness: (name: string) => Promise<Business>;
  reset: () => void;
}

export const useBusinessStore = create<BusinessState>()(
  persist(
    (set, get) => ({
      businesses: [],
      activeBusinessId: null,
      isLoading: false,

      setActiveBusiness: (id) => set({ activeBusinessId: id }),

      fetchBusinesses: async () => {
        set({ isLoading: true });
        try {
          const businesses = await api.get<Business[]>('/businesses');
          const current = get().activeBusinessId;
          const activeStillValid = businesses.some((b) => b.id === current);
          set({
            businesses,
            activeBusinessId: activeStillValid ? current : businesses[0]?.id ?? null,
            isLoading: false,
          });
          return businesses;
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      createBusiness: async (name) => {
        const business = await api.post<Business>('/businesses', { name });
        const businesses = [...get().businesses, business];
        set({ businesses, activeBusinessId: business.id });
        return business;
      },

      reset: () => set({ businesses: [], activeBusinessId: null }),
    }),
    {
      name: 'fito6-business',
      partialize: (state) => ({
        activeBusinessId: state.activeBusinessId,
      }),
    }
  )
);

export function getActiveBusinessId(): string | null {
  return useBusinessStore.getState().activeBusinessId;
}
