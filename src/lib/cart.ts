"use client";

import { useSyncExternalStore } from "react";

export type CartItem = {
  slug: string;
  name: string;
  priceCents: number;
  quantity: number;
  categorySlug: string;
  image?: string;
  variantName?: string;
};

type Snapshot = { items: CartItem[]; ready: boolean };

const STORAGE_KEY = "3sementes:carrinho";

// O carrinho vive fora do React (localStorage), então é lido com
// useSyncExternalStore: o servidor renderiza vazio e o navegador hidrata depois,
// sem diferença entre os dois.
const SERVER_SNAPSHOT: Snapshot = { items: [], ready: false };

let snapshot: Snapshot = SERVER_SNAPSHOT;
let hydrated = false;
const listeners = new Set<() => void>();

function emit() {
  for (const listener of listeners) listener();
}

function write(items: CartItem[]) {
  snapshot = { items, ready: true };
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch {
    // sem espaço ou storage bloqueado: o carrinho vale só para esta sessão
  }
  emit();
}

function hydrate() {
  if (hydrated) return;
  hydrated = true;
  let items: CartItem[] = [];
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) items = JSON.parse(stored);
  } catch {
    // carrinho corrompido ou storage bloqueado: começa vazio
  }
  snapshot = { items, ready: true };
  emit();
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  hydrate();
  return () => {
    listeners.delete(listener);
  };
}

export function itemKey(item: Pick<CartItem, "slug" | "variantName">) {
  return item.variantName ? `${item.slug}__${item.variantName}` : item.slug;
}

export function addItem(item: CartItem) {
  const key = itemKey(item);
  const existing = snapshot.items.find((i) => itemKey(i) === key);
  write(
    existing
      ? snapshot.items.map((i) =>
          itemKey(i) === key ? { ...i, quantity: i.quantity + item.quantity } : i,
        )
      : [...snapshot.items, item],
  );
}

export function setQuantity(key: string, quantity: number) {
  write(
    snapshot.items.map((item) =>
      itemKey(item) === key
        ? { ...item, quantity: Math.max(1, quantity) }
        : item,
    ),
  );
}

export function removeItem(key: string) {
  write(snapshot.items.filter((item) => itemKey(item) !== key));
}

export function clearCart() {
  write([]);
}

export function useCart() {
  const { items, ready } = useSyncExternalStore(
    subscribe,
    () => snapshot,
    () => SERVER_SNAPSHOT,
  );

  return {
    items,
    ready,
    itemCount: items.reduce((total, item) => total + item.quantity, 0),
    totalCents: items.reduce(
      (total, item) => total + item.priceCents * item.quantity,
      0,
    ),
    addItem,
    setQuantity,
    removeItem,
    clear: clearCart,
  };
}
