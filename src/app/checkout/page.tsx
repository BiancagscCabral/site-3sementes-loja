"use client";

import { useState } from "react";
import Link from "next/link";
import { useCart } from "@/lib/cart";
import { formatPriceCents } from "@/lib/format";
import { getWhatsAppUrl } from "@/lib/catalog";
import { aceitaUberFlash, UBER_FLASH } from "@/lib/entrega";

type Form = {
  nome: string;
  telefone: string;
  email: string;
  cep: string;
  rua: string;
  numero: string;
  complemento: string;
  bairro: string;
  cidade: string;
  estado: string;
};

const EMPTY: Form = {
  nome: "",
  telefone: "",
  email: "",
  cep: "",
  rua: "",
  numero: "",
  complemento: "",
  bairro: "",
  cidade: "",
  estado: "",
};

const REQUIRED: (keyof Form)[] = [
  "nome",
  "telefone",
  "cep",
  "rua",
  "numero",
  "bairro",
  "cidade",
  "estado",
];

type OpcaoFrete = {
  id: number;
  nome: string;
  empresa: string;
  precoCents: number;
  prazoDias: number;
};

function onlyDigits(value: string) {
  return value.replace(/\D/g, "");
}

function Field({
  label,
  name,
  value,
  onChange,
  error,
  className = "",
  ...rest
}: {
  label: string;
  name: keyof Form;
  value: string;
  onChange: (name: keyof Form, value: string) => void;
  error?: string;
  className?: string;
} & Omit<React.InputHTMLAttributes<HTMLInputElement>, "onChange" | "name">) {
  return (
    <label className={`flex flex-col gap-1.5 ${className}`}>
      <span className="text-[13px] font-medium text-foreground">{label}</span>
      <input
        {...rest}
        value={value}
        onChange={(event) => onChange(name, event.target.value)}
        className={`h-11 border bg-surface px-3.5 text-sm text-foreground outline-none transition-colors placeholder:text-muted focus:border-accent ${
          error ? "border-danger" : "border-border"
        }`}
      />
      {error && <span className="text-[12px] text-danger">{error}</span>}
    </label>
  );
}

export default function CheckoutPage() {
  const { items, totalCents, ready } = useCart();
  const [form, setForm] = useState<Form>(EMPTY);
  const [errors, setErrors] = useState<Partial<Record<keyof Form, string>>>({});
  const [cepStatus, setCepStatus] = useState<"idle" | "loading" | "notFound">(
    "idle",
  );
  const [opcoesFrete, setOpcoesFrete] = useState<OpcaoFrete[]>([]);
  const [freteStatus, setFreteStatus] = useState<
    "idle" | "calculando" | "indisponivel"
  >("idle");
  const [freteEscolhido, setFreteEscolhido] = useState<OpcaoFrete | null>(null);
  const [temUberFlash, setTemUberFlash] = useState(false);
  const [uberFlashEscolhido, setUberFlashEscolhido] = useState(false);
  const [enviando, setEnviando] = useState(false);

  const fretecents = uberFlashEscolhido ? 0 : (freteEscolhido?.precoCents ?? 0);
  const totalComFrete = totalCents + fretecents;

  // Busca as opções de entrega assim que o CEP fica completo.
  const calcularFrete = async (rawCep: string) => {
    const cep = onlyDigits(rawCep);
    if (cep.length !== 8 || items.length === 0) return;

    setFreteStatus("calculando");
    setOpcoesFrete([]);
    setFreteEscolhido(null);
    setUberFlashEscolhido(false);

    try {
      const resposta = await fetch("/api/frete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cep,
          itens: items.map((item) => ({
            slug: item.slug,
            quantidade: item.quantity,
          })),
        }),
      });
      const dados = await resposta.json();

      if (!resposta.ok || !dados.configurado || !dados.opcoes?.length) {
        setFreteStatus("indisponivel");
        return;
      }

      setOpcoesFrete(dados.opcoes);
      setFreteEscolhido(dados.opcoes[0]);
      setFreteStatus("idle");
    } catch {
      // sem internet ou SuperFrete fora do ar: o frete fica para o WhatsApp
      setFreteStatus("indisponivel");
    }
  };

  const update = (name: keyof Form, value: string) => {
    setForm((current) => ({ ...current, [name]: value }));
    setErrors((current) => ({ ...current, [name]: undefined }));
  };

  const lookupCep = async (rawCep: string) => {
    const cep = onlyDigits(rawCep);
    if (cep.length !== 8) return;
    setCepStatus("loading");
    try {
      const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
      const data = await response.json();
      if (data.erro) {
        setCepStatus("notFound");
        return;
      }
      setCepStatus("idle");
      setTemUberFlash(aceitaUberFlash(data.localidade ?? "", data.uf ?? ""));
      setForm((current) => ({
        ...current,
        rua: data.logradouro || current.rua,
        bairro: data.bairro || current.bairro,
        cidade: data.localidade || current.cidade,
        estado: data.uf || current.estado,
      }));
    } catch {
      // sem internet ou ViaCEP fora do ar: o cliente preenche na mão
      setCepStatus("idle");
    }
  };

  const validate = () => {
    const found: Partial<Record<keyof Form, string>> = {};
    for (const field of REQUIRED) {
      if (!form[field].trim()) found[field] = "Campo obrigatório";
    }
    if (form.telefone && onlyDigits(form.telefone).length < 10) {
      found.telefone = "Informe o DDD e o número";
    }
    if (form.cep && onlyDigits(form.cep).length !== 8) {
      found.cep = "CEP deve ter 8 números";
    }
    if (form.email && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(form.email)) {
      found.email = "E-mail inválido";
    }
    setErrors(found);
    return Object.keys(found).length === 0;
  };

  const finish = async () => {
    if (!validate()) return;
    setEnviando(true);

    // Grava o pedido antes de sair do site. Se der erro, o pedido ainda vai
    // para o WhatsApp: a venda não pode se perder por causa disso.
    let codigo: string | null = null;
    try {
      const resposta = await fetch("/api/pedidos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cliente: {
            nome: form.nome,
            telefone: form.telefone,
            email: form.email,
          },
          endereco: {
            cep: form.cep,
            rua: form.rua,
            numero: form.numero,
            complemento: form.complemento,
            bairro: form.bairro,
            cidade: form.cidade,
            estado: form.estado,
          },
          entrega: uberFlashEscolhido
            ? { metodo: "uber-flash", servico: UBER_FLASH.nome, precoCents: null }
            : freteEscolhido
              ? {
                  metodo: "correios",
                  servico: freteEscolhido.nome,
                  precoCents: freteEscolhido.precoCents,
                }
              : { metodo: null, servico: null, precoCents: null },
          itens: items.map((item) => ({
            slug: item.slug,
            quantidade: item.quantity,
            tamanho: item.size ?? null,
            variacao: item.variantName ?? null,
          })),
        }),
      });
      const dados = await resposta.json();
      if (resposta.ok && dados.codigo) codigo = dados.codigo;
    } catch {
      // sem internet ou banco fora do ar: segue para o WhatsApp mesmo assim
    }

    const entregaEscolhida = uberFlashEscolhido
      ? `Entrega: ${UBER_FLASH.nome} — valor a combinar`
      : freteEscolhido
        ? `Entrega: ${freteEscolhido.nome}, ${freteEscolhido.prazoDias} dia(s) úteis — ${formatPriceCents(freteEscolhido.precoCents)}`
        : null;

    const message = [
      codigo ? `Olá! Quero fechar o pedido ${codigo}:` : "Olá! Quero fechar este pedido:",
      "",
      ...items.map(
        (item) =>
          `• ${item.quantity}x ${item.name}${
            item.variantName ? ` (${item.variantName})` : ""
          } — ${formatPriceCents(item.priceCents * item.quantity)}`,
      ),
      "",
      `Total dos produtos: ${formatPriceCents(totalCents)}`,
      entregaEscolhida,
      freteEscolhido && !uberFlashEscolhido
        ? `Total com frete: ${formatPriceCents(totalComFrete)}`
        : null,
      "",
      `Nome: ${form.nome}`,
      `Telefone: ${form.telefone}`,
      form.email ? `E-mail: ${form.email}` : null,
      `Endereço: ${form.rua}, ${form.numero}${
        form.complemento ? ` - ${form.complemento}` : ""
      }`,
      `${form.bairro} - ${form.cidade}/${form.estado}`,
      `CEP: ${form.cep}`,
    ]
      .filter(Boolean)
      .join("\n");

    window.location.href = getWhatsAppUrl(message);
  };

  if (!ready) {
    return <div className="mx-auto max-w-5xl px-6 py-16" />;
  }

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-5xl px-6 py-16">
        <h1 className="font-display text-3xl font-medium text-foreground">
          Finalizar pedido
        </h1>
        <p className="mt-4 text-sm text-muted">
          Sua sacola está vazia. Escolha suas peças primeiro.
        </p>
        <Link
          href="/#catalogo"
          className="mt-6 inline-flex h-11 items-center bg-accent px-6 text-sm font-semibold text-accent-foreground transition-opacity hover:opacity-90"
        >
          Ver categorias
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-6 py-12 sm:py-16">
      <h1 className="font-display text-3xl font-medium text-foreground">
        Finalizar pedido
      </h1>

      <div className="mt-8 grid items-start gap-8 lg:grid-cols-[1fr_300px]">
        <div className="flex flex-col gap-8">
          <section>
            <h2 className="font-display text-lg font-medium text-foreground">
              Seus dados
            </h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <Field
                label="Nome completo"
                name="nome"
                value={form.nome}
                onChange={update}
                error={errors.nome}
                autoComplete="name"
                className="sm:col-span-2"
              />
              <Field
                label="WhatsApp"
                name="telefone"
                value={form.telefone}
                onChange={update}
                error={errors.telefone}
                inputMode="tel"
                placeholder="(81) 90000-0000"
                autoComplete="tel"
              />
              <Field
                label="E-mail (opcional)"
                name="email"
                value={form.email}
                onChange={update}
                error={errors.email}
                inputMode="email"
                autoComplete="email"
              />
            </div>
          </section>

          <section>
            <h2 className="font-display text-lg font-medium text-foreground">
              Endereço de entrega
            </h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-6">
              <div className="sm:col-span-2">
                <Field
                  label="CEP"
                  name="cep"
                  value={form.cep}
                  onChange={(name, value) => {
                    update(name, value);
                    setCepStatus("idle");
                    if (onlyDigits(value).length === 8) {
                      lookupCep(value);
                      calcularFrete(value);
                    }
                  }}
                  error={errors.cep}
                  inputMode="numeric"
                  placeholder="00000-000"
                  autoComplete="postal-code"
                />
                {cepStatus === "loading" && (
                  <span className="mt-1 block text-[12px] text-muted">
                    Buscando endereço...
                  </span>
                )}
                {cepStatus === "notFound" && (
                  <span className="mt-1 block text-[12px] text-muted">
                    CEP não encontrado. Preencha abaixo.
                  </span>
                )}
              </div>
              <Field
                label="Rua"
                name="rua"
                value={form.rua}
                onChange={update}
                error={errors.rua}
                autoComplete="address-line1"
                className="sm:col-span-4"
              />
              <Field
                label="Número"
                name="numero"
                value={form.numero}
                onChange={update}
                error={errors.numero}
                inputMode="numeric"
                className="sm:col-span-2"
              />
              <Field
                label="Complemento (opcional)"
                name="complemento"
                value={form.complemento}
                onChange={update}
                placeholder="Apto, bloco, referência"
                className="sm:col-span-4"
              />
              <Field
                label="Bairro"
                name="bairro"
                value={form.bairro}
                onChange={update}
                error={errors.bairro}
                className="sm:col-span-3"
              />
              <Field
                label="Cidade"
                name="cidade"
                value={form.cidade}
                onChange={update}
                error={errors.cidade}
                className="sm:col-span-2"
              />
              <Field
                label="UF"
                name="estado"
                value={form.estado}
                onChange={update}
                error={errors.estado}
                maxLength={2}
                className="sm:col-span-1"
              />
            </div>
          </section>

          {(freteStatus !== "idle" || opcoesFrete.length > 0 || temUberFlash) && (
            <section>
              <h2 className="font-display text-lg font-medium text-foreground">
                Entrega
              </h2>

              {freteStatus === "calculando" && (
                <p className="mt-3 text-sm text-muted">Calculando o frete...</p>
              )}

              {freteStatus === "indisponivel" && (
                <p className="mt-3 text-sm text-muted">
                  Não deu para calcular o frete agora. Pode seguir assim mesmo:
                  a gente combina o valor da entrega pelo WhatsApp.
                </p>
              )}

              {opcoesFrete.length > 0 && (
                <div className="mt-4 flex flex-col gap-2.5">
                  {opcoesFrete.map((opcao) => {
                    const escolhida = freteEscolhido?.id === opcao.id;
                    return (
                      <label
                        key={opcao.id}
                        className={`flex cursor-pointer items-center gap-3 border p-3.5 transition-colors ${
                          escolhida
                            ? "border-accent bg-muted-bg"
                            : "border-border bg-surface hover:border-foreground"
                        }`}
                      >
                        <input
                          type="radio"
                          name="frete"
                          checked={escolhida}
                          onChange={() => setFreteEscolhido(opcao)}
                          className="accent-accent"
                        />
                        <span className="flex-1">
                          <span className="block text-sm font-medium text-foreground">
                            {opcao.nome}
                          </span>
                          <span className="block text-[13px] text-muted">
                            {opcao.prazoDias > 0
                              ? `chega em até ${opcao.prazoDias} dia(s) úteis`
                              : "prazo informado na postagem"}
                          </span>
                        </span>
                        <span className="text-sm font-semibold text-foreground">
                          {formatPriceCents(opcao.precoCents)}
                        </span>
                      </label>
                    );
                  })}
                </div>
              )}

              {temUberFlash && (
                <label
                  className={`mt-2.5 flex cursor-pointer items-center gap-3 border p-3.5 transition-colors ${
                    uberFlashEscolhido
                      ? "border-accent bg-muted-bg"
                      : "border-border bg-surface hover:border-foreground"
                  }`}
                >
                  <input
                    type="radio"
                    name="frete"
                    checked={uberFlashEscolhido}
                    onChange={() => {
                      setUberFlashEscolhido(true);
                      setFreteEscolhido(null);
                    }}
                    className="accent-accent"
                  />
                  <span className="flex-1">
                    <span className="block text-sm font-medium text-foreground">
                      {UBER_FLASH.nome}
                    </span>
                    <span className="block text-[13px] text-muted">
                      {UBER_FLASH.descricao}
                    </span>
                  </span>
                  <span className="text-sm font-semibold text-foreground">
                    a combinar
                  </span>
                </label>
              )}
            </section>
          )}
        </div>

        <aside className="border border-border bg-surface p-5">
          <h2 className="font-display text-lg font-medium text-foreground">
            Seu pedido
          </h2>

          <ul className="mt-4 flex flex-col gap-2 text-[13px]">
            {items.map((item) => (
              <li
                key={`${item.slug}-${item.variantName ?? ""}`}
                className="flex gap-3"
              >
                <span className="flex-1 text-muted">
                  {item.quantity}x {item.name}
                </span>
                <span className="font-medium text-foreground">
                  {formatPriceCents(item.priceCents * item.quantity)}
                </span>
              </li>
            ))}
          </ul>

          <div className="mt-4 flex flex-col gap-2 border-t border-border pt-3">
            <div className="flex items-baseline justify-between text-[13px]">
              <span className="text-muted">Produtos</span>
              <span className="font-medium text-foreground">
                {formatPriceCents(totalCents)}
              </span>
            </div>
            <div className="flex items-baseline justify-between text-[13px]">
              <span className="text-muted">Frete</span>
              <span className="font-medium text-foreground">
                {freteEscolhido && !uberFlashEscolhido
                  ? formatPriceCents(freteEscolhido.precoCents)
                  : "a combinar"}
              </span>
            </div>
            <div className="mt-1 flex items-baseline justify-between border-t border-border pt-2.5">
              <span className="text-[13px] text-muted">Total</span>
              <span className="text-lg font-semibold text-foreground">
                {formatPriceCents(totalComFrete)}
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={finish}
            disabled={enviando}
            className="mt-5 flex h-11 w-full items-center justify-center bg-accent px-5 text-sm font-semibold text-accent-foreground transition-opacity hover:opacity-90 disabled:opacity-60"
          >
            {enviando ? "Enviando..." : "Enviar pedido"}
          </button>

          <p className="mt-3 text-[13px] leading-6 text-muted">
            {freteEscolhido
              ? "O pedido vai pro nosso WhatsApp com seus dados e a entrega escolhida. Lá a gente combina o pagamento."
              : "O pedido vai pro nosso WhatsApp com seus dados preenchidos. Lá a gente calcula o frete e combina o pagamento."}
          </p>

          <Link
            href="/carrinho"
            className="mt-3 block text-center text-[13px] text-muted transition-colors hover:text-foreground"
          >
            Voltar para a sacola
          </Link>
        </aside>
      </div>
    </div>
  );
}
