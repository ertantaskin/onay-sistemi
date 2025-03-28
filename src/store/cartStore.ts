import { create } from 'zustand';

interface CartStore {
  itemCount: number;
  setItemCount: (count: number) => void;
  updateCartItemCount: (count?: number) => Promise<void>;
}

export const useCartStore = create<CartStore>((set) => ({
  itemCount: 0,
  setItemCount: (count) => set({ itemCount: count }),
  updateCartItemCount: async (count?: number) => {
    try {
      // Eğer count parametresi verilmişse, direkt olarak o değeri kullan
      if (count !== undefined) {
        set({ itemCount: count });
        return;
      }
      
      // Değilse API'den sepet bilgisini al
      const response = await fetch('/api/store/cart');
      
      if (!response.ok) {
        throw new Error("Sepet yüklenirken bir hata oluştu");
      }
      
      const data = await response.json();
      
      if (data && data.items) {
        // Sepetteki toplam ürün sayısını hesapla
        const totalItems = data.items.reduce((total: number, item: any) => {
          return total + item.quantity;
        }, 0);
        
        set({ itemCount: totalItems });
      } else {
        set({ itemCount: 0 });
      }
    } catch (error) {
      console.error('Sepet bilgisi güncellenemedi:', error);
      set({ itemCount: 0 });
    }
  },
})); 