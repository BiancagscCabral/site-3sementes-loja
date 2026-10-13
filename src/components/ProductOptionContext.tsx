"use client";

import { createContext, useContext, useMemo, useState } from "react";

type ProductOption = {
  option: string | null;
  setOption: (option: string | null) => void;
};

const Context = createContext<ProductOption>({
  option: null,
  setOption: () => {},
});

// A opção escolhida (cor, tema) é usada em dois lugares da página do produto:
// nos botões e na galeria, que troca a foto junto. Por isso ela mora aqui.
export function ProductOptionProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [option, setOption] = useState<string | null>(null);
  const value = useMemo(() => ({ option, setOption }), [option]);

  return <Context.Provider value={value}>{children}</Context.Provider>;
}

export function useProductOption() {
  return useContext(Context);
}
