import { create } from 'zustand';

interface CreditStore {
  credits: number;
  setCredits: (credits: number) => void;
  updateCredits: () => Promise<void>;
}

export const useCreditStore = create<CreditStore>((set) => ({
  credits: 0,
  setCredits: (credits) => set({ credits }),
  updateCredits: async () => {
    try {
      const response = await fetch('/api/users/me');
      const data = await response.json();
      
      if (response.ok && data.user) {
        set({ credits: data.user.credits });
      }
    } catch (error) {
      console.error('Kredi bilgisi güncellenemedi:', error);
    }
  },
})); 