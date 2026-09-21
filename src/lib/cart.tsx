"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

export type CartItem = {
  slug: string;
  name: string;
  priceCents: number;
  quantity: number;
  categorySlug: string;
  variantName?: string;
};

type CartContextValue = {
  items: CartItem[];
  itemCount: number;
  totalCents: number;
  ready: boolean;
  addItem: (item: CartItem) => void;
  setQuantity: (key: string, quantity: number) => void;
  removeItem: (key: string) => void;
  clear: () => void;
};

const STORAGE_KEY = "3sementes:carrinho";

const CartContext = createContext<CartContextValue | null>(null);

export function itemKey(item: Pick<CartItem, "slug" | "variantName">) {
  return item.variantName ? `${item.slug}__${item.variantName}` : item.slug;
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  // `ready` evita mostrar o carrinho salvo antes da hidratação, o que causaria
  // diferença entre o HTML do servidor e o do navegador.
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) setItems(JSON.parse(stored));
    } catch {
      // carrinho corrompido ou storage bloqueado: começa vazio
    }
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      // sem espaço ou storage bloqueado: o carrinho vale só para esta sessão
    }
  }, [items, ready]);

  const value = useMemo<CartContextValue>(() => {
    return {
      items,
      ready,
      itemCount: items.reduce((total, item) => total + item.quantity, 0),
      totalCents: items.reduce(
        (total, item) => total + item.priceCents * item.quantity,
        0,
      ),
      addItem: (item) =>
        setItems((current) => {
          const key = itemKey(item);
          const existing = current.find((i) => itemKey(i) === key);
          if (!existing) return [...current, item];
          return current.map((i) =>
            itemKey(i) === key
              ? { ...i, quantity: i.quantity + item.quantity }
              : i,
          );
        }),
      setQuantity: (key, quantity) =>
        setItems((current) =>
          current.map((item) =>
            itemKey(item) === key
              ? { ...item, quantity: Math.max(1, quantity) }
              : item,
          ),
        ),
      removeItem: (key) =>
        setItems((current) => current.filter((item) => itemKey(item) !== key)),
      clear: () => setItems([]),
    };
  }, [items, ready]);

  return <CartContext value={value}>{children}</CartContext>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart precisa estar dentro do CartProvider");
  return context;
}
