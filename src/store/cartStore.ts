import { create } from 'zustand';

interface CartStore {
  itemCount: number;
  setItemCount: (count: number) => void;
  updateCartItemCount: () => Promise<void>;
}

export const useCartStore = create<CartStore>((set) => ({
  itemCount: 0,
  setItemCount: (count) => set({ itemCount: count }),
  updateCartItemCount: async () => {
    try {
      const response = await fetch('/api/store/cart');
      const data = await response.json();
      
      if (response.ok && data.items) {
        // Sepetteki toplam ürün sayısını hesapla
        const totalItems = data.items.reduce((total: number, item: any) => {
          return total + item.quantity;
        }, 0);
        
        set({ itemCount: totalItems });
      }
    } catch (error) {
      console.error('Sepet bilgisi güncellenemedi:', error);
    }
  },
})); 