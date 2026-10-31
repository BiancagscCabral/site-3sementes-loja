"use client";

import { useState, useTransition } from "react";
import { excluirPedido, mudarStatusDoPedido } from "@/app/admin/acoes";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { podeExcluir, statusPermitidos } from "@/lib/pedidos";

const STATUS = [
  { valor: "AWAITING_CONTACT", nome: "Aguardando contato" },
  { valor: "AWAITING_PAYMENT", nome: "Aguardando pagamento" },
  { valor: "PAID", nome: "Pago" },
  { valor: "SHIPPED", nome: "Postado" },
  { valor: "DELIVERED", nome: "Finalizado" },
  { valor: "CANCELLED", nome: "Cancelado" },
];

export default function AcoesDoPedido({
  id,
  status,
  codigo,
  foiPago,
}: {
  id: string;
  status: string;
  codigo: string;
  foiPago: boolean;
}) {
  const permitidos = statusPermitidos({
    paymentStatus: foiPago ? "PAID" : "PENDING",
  });
  const opcoes = STATUS.filter((item) => permitidos.includes(item.valor));
  const excluivel = podeExcluir({ paymentStatus: foiPago ? "PAID" : "PENDING" });

  const [confirmando, setConfirmando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [salvando, iniciarSalvamento] = useTransition();

  const trocarStatus = (novo: string) => {
    setErro(null);
    iniciarSalvamento(async () => {
      try {
        await mudarStatusDoPedido(id, novo);
      } catch {
        setErro("Não deu para mudar o status.");
      }
    });
  };

  const apagar = () => {
    setErro(null);
    iniciarSalvamento(async () => {
      try {
        await excluirPedido(id);
      } catch {
        setErro("Não deu para excluir.");
        setConfirmando(false);
      }
    });
  };

  return (
    <div className="mt-4 flex flex-wrap items-center gap-3 border-t border-border pt-3">
      <div className="flex items-center gap-2 text-[13px] text-muted">
        <span id={`situacao-${id}`}>Situação</span>
        <Select value={status} onValueChange={trocarStatus} disabled={salvando}>
          <SelectTrigger
            aria-labelledby={`situacao-${id}`}
            className="w-[200px]"
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>Situação do pedido</SelectLabel>
              {opcoes.map((item) => (
                <SelectItem key={item.valor} value={item.valor}>
                  {item.nome}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>

      <div className="ml-auto flex items-center gap-3">
        {erro && <span className="text-[13px] text-danger">{erro}</span>}

        {!excluivel ? (
          <span className="text-[13px] text-muted">
            Pedido pago: não dá para excluir
          </span>
        ) : confirmando ? (
          <>
            <span className="text-[13px] text-danger">
              Apagar {codigo} de vez?
            </span>
            <button
              type="button"
              onClick={apagar}
              disabled={salvando}
              className="cursor-pointer border border-danger px-3 py-1.5 text-[13px] font-medium text-danger transition-colors hover:bg-danger hover:text-background disabled:opacity-60"
            >
              {salvando ? "Apagando..." : "Apagar"}
            </button>
            <button
              type="button"
              onClick={() => setConfirmando(false)}
              className="cursor-pointer text-[13px] text-muted underline underline-offset-4"
            >
              Cancelar
            </button>
          </>
        ) : (
          <button
            type="button"
            onClick={() => setConfirmando(true)}
            disabled={salvando}
            className="cursor-pointer text-[13px] text-muted underline underline-offset-4 transition-colors hover:text-danger disabled:opacity-60"
          >
            Excluir
          </button>
        )}
      </div>
    </div>
  );
}
