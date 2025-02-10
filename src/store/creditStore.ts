import { create } from 'zustand';

interface CreditStore {
  credit: number;
  setCredit: (credit: number) => void;
  updateCredit: () => Promise<void>;
}

export const useCreditStore = create<CreditStore>((set) => ({
  credit: 0,
  setCredit: (credit) => set({ credit }),
  updateCredit: async () => {
    try {
      const response = await fetch('/api/users/me');
      const data = await response.json();
      
      if (response.ok && data.user) {
        set({ credit: data.user.credit });
      }
    } catch (error) {
      console.error('Kredi bilgisi güncellenemedi:', error);
    }
  },
})); 