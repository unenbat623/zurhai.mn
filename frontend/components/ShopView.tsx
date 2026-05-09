
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence, Reorder } from 'motion/react';
import { ShoppingBag, Plus, Sparkles, CreditCard, Loader2, GripVertical, Trash2 } from 'lucide-react';
import { ShopProduct } from '../types';
import AddProductModal from './AddProductModal';

interface Props {
  onPurchase: (product: ShopProduct) => void;
  isLoading: boolean;
}

const INITIAL_PRODUCTS: ShopProduct[] = [
  {
    id: 'p1',
    name: 'Сансрын Болор',
    description: 'Эерэг энергийг өөртөө татаж, сөрөг нөлөөллөөс хамгаалах цэвэр байгалийн болор.',
    price: 49,
    imageUrl: 'https://picsum.photos/seed/crystal/400/500'
  },
  {
    id: 'p2',
    name: 'Тэнгэрийн Хүрд',
    description: 'Ордуудын байршил болон гариг эрхсийн нөлөөг тайлбарласан тусгай зураглал.',
    price: 29,
    imageUrl: 'https://picsum.photos/seed/zodiac/400/500'
  }
];

export default function ShopView({ onPurchase, isLoading }: Props) {
  const [products, setProducts] = useState<ShopProduct[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  // Load from local storage on mount
  useEffect(() => {
    const saved = localStorage.getItem('astra_products');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setProducts(parsed);
        } else {
          setProducts(INITIAL_PRODUCTS);
        }
      } catch (e) {
        setProducts(INITIAL_PRODUCTS);
      }
    } else {
      setProducts(INITIAL_PRODUCTS);
    }
    setIsInitialized(true);
  }, []);

  // Persist to local storage whenever products list changes
  useEffect(() => {
    if (isInitialized) {
      localStorage.setItem('astra_products', JSON.stringify(products));
    }
  }, [products, isInitialized]);

  const handleReorder = (newOrder: ShopProduct[]) => {
    setProducts(newOrder);
  };

  const handleAddProduct = (name: string, description: string, image: string, price: number) => {
    const newProduct: ShopProduct = {
      id: `p-${Date.now()}`,
      name,
      description,
      imageUrl: image,
      price
    };
    setProducts(prev => [newProduct, ...prev]);
    setIsModalOpen(false);
  };

  const handleDeleteProduct = (id: string) => {
    setProducts(prev => prev.filter(p => p.id !== id));
  };

  return (
    <div className="max-w-6xl mx-auto py-12" role="region" aria-label="Бүтээгдэхүүний дэлгүүр">
      <div className="flex justify-between items-end mb-16">
        <div>
          <h2 className="text-4xl font-serif font-bold text-white mb-4">Astra Дэлгүүр</h2>
          <p className="text-slate-400 font-light max-w-lg tracking-wide uppercase text-[10px]">Таны сүнслэг аялалд зориулсан одод болон сансрын энерги шингэсэн бүтээгдэхүүнүүд.</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          aria-label="Шинэ бүтээгдэхүүн нэмэх"
          className="flex items-center gap-3 px-6 py-3 bg-indigo-600/10 hover:bg-indigo-600/20 text-indigo-400 rounded-xl border border-indigo-500/30 transition-all active:scale-95 text-[10px] uppercase font-bold tracking-widest focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
        >
          <Plus size={16} />
          Бараа нэмэх
        </button>
      </div>

      <Reorder.Group 
        axis="y" 
        values={products} 
        onReorder={handleReorder}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        role="list"
        aria-label="Бүтээгдэхүүний жагсаалт"
      >
        <AnimatePresence mode="popLayout">
          {products.map((product) => (
            <Reorder.Item
              key={product.id}
              value={product}
              role="listitem"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="glass-card group overflow-hidden bg-slate-900/40 border-white/5 active:cursor-grabbing cursor-grab focus-within:ring-2 focus-within:ring-indigo-500/50"
            >
              <div className="aspect-[4/5] overflow-hidden relative">
                <img 
                  src={product.imageUrl} 
                  alt={product.name}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover transition-all duration-1000 group-hover:scale-110 group-hover:brightness-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-60" />
                
                {/* Drag handle overlay */}
                <div className="absolute top-4 left-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="p-2 bg-black/40 backdrop-blur-md rounded-lg border border-white/10">
                    <GripVertical size={16} className="text-slate-400" />
                  </div>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteProduct(product.id);
                    }}
                    className="p-2 bg-rose-500/20 hover:bg-rose-500 backdrop-blur-md rounded-lg border border-rose-500/30 text-rose-400 hover:text-white transition-all pointer-events-auto"
                    title="Устгах"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>

                <div className="absolute top-4 right-4 bg-indigo-600 text-white px-4 py-2 rounded-full font-bold text-xs shadow-lg shadow-indigo-600/30">
                  ${product.price}
                </div>
              </div>
              
              <div className="p-8">
                <h3 className="text-xl font-serif text-white mb-4 group-hover:text-indigo-400 transition-colors uppercase tracking-wider">{product.name}</h3>
                <p className="text-sm text-slate-500 leading-relaxed mb-8 line-clamp-3 font-light italic">"{product.description}"</p>
                
                <button
                  onClick={() => onPurchase(product)}
                  disabled={isLoading}
                  className="w-full py-4 bg-white/5 hover:bg-white text-slate-400 hover:text-black rounded-xl border border-white/10 transition-all flex items-center justify-center gap-3 active:scale-95 group/btn overflow-hidden relative"
                >
                  <div className="absolute inset-0 bg-indigo-600 translate-y-full group-hover/btn:translate-y-0 transition-transform duration-500" />
                  <span className="relative z-10 flex items-center gap-3 text-[10px] uppercase font-bold tracking-widest">
                    {isLoading ? <Loader2 size={16} className="animate-spin" /> : <ShoppingBag size={16} />}
                    ХУДАЛДАН АВАХ
                  </span>
                </button>
              </div>
            </Reorder.Item>
          ))}
        </AnimatePresence>
      </Reorder.Group>

      <AddProductModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onAdd={handleAddProduct}
      />
    </div>
  );
}
