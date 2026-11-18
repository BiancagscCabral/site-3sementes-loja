"use client";

import Image from "next/image";
import { useActionState, useEffect, useRef, useState, useTransition } from "react";
import {
  excluirFotoDoProduto,
  subirFotoDoProduto,
} from "@/app/admin/produtos/acoes";

type Foto = {
  id: string;
  url: string;
  altText: string | null;
  optionName: string | null;
  veioDoPainel: boolean;
};

export default function FotosDoProduto({
  slug,
  opcoes,
  rotuloDaOpcao,
  fotos,
}: {
  slug: string;
  opcoes: string[];
  rotuloDaOpcao: string;
  fotos: Foto[];
}) {
  const formulario = useRef<HTMLFormElement>(null);
  const [resultado, enviar, enviando] = useActionState(
    subirFotoDoProduto,
    null,
  );

  // Depois que a foto sobe, limpa o campo para a próxima. É só mexer no DOM
  // do formulário, nada de estado.
  useEffect(() => {
    if (resultado?.ok) formulario.current?.reset();
  }, [resultado]);

  return (
    <>
      <form
        ref={formulario}
        action={enviar}
        className="mt-6 rounded-xl border border-border bg-surface p-4"
      >
        <input type="hidden" name="slug" value={slug} />

        <label className="block text-[13px] font-medium" htmlFor="foto">
          Adicionar uma foto
        </label>
        <p className="mt-1 text-[12px] text-muted">
          JPG, PNG, WebP ou AVIF, até 10 MB. No celular dá para tirar na hora.
        </p>

        <input
          id="foto"
          name="foto"
          type="file"
          accept="image/jpeg,image/png,image/webp,image/avif"
          required
          className="mt-3 block w-full cursor-pointer text-[13px] file:mr-3 file:cursor-pointer file:rounded-lg file:border file:border-border file:bg-muted-bg file:px-3 file:py-2 file:text-[13px] file:font-medium file:text-foreground hover:file:border-foreground"
        />

        {opcoes.length > 0 && (
          <div className="mt-4">
            <label className="block text-[13px] font-medium" htmlFor="opcao">
              {rotuloDaOpcao} desta foto
            </label>
            <p className="mt-1 text-[12px] text-muted">
              Deixe em branco para a foto aparecer sempre, sem depender da
              escolha da cliente.
            </p>
            <select
              id="opcao"
              name="opcao"
              defaultValue=""
              className="mt-2 h-10 w-full cursor-pointer rounded-lg border border-border bg-surface px-3 text-[13px] outline-none transition-colors hover:border-foreground focus-visible:border-accent"
            >
              <option value="">Nenhuma, foto geral</option>
              {opcoes.map((opcao) => (
                <option key={opcao} value={opcao}>
                  {opcao}
                </option>
              ))}
            </select>
          </div>
        )}

        <div className="mt-4 flex flex-wrap items-center gap-3">
          <button
            type="submit"
            disabled={enviando}
            className="cursor-pointer rounded-lg bg-accent px-4 py-2 text-[13px] font-semibold text-background transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {enviando ? "Enviando..." : "Enviar foto"}
          </button>

          {resultado?.ok === false && (
            <span className="text-[13px] text-danger">{resultado.erro}</span>
          )}
          {resultado?.ok === true && (
            <span className="text-[13px] text-muted">Foto enviada.</span>
          )}
        </div>
      </form>

      {fotos.length === 0 ? (
        <p className="mt-8 text-[13px] text-muted">
          Este produto ainda não tem foto nenhuma. Na loja ele aparece só com a
          marca d&apos;água.
        </p>
      ) : (
        <ul className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3">
          {fotos.map((foto) => (
            <CartaoDaFoto key={foto.id} foto={foto} />
          ))}
        </ul>
      )}
    </>
  );
}

function CartaoDaFoto({ foto }: { foto: Foto }) {
  const [confirmando, setConfirmando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [apagando, iniciar] = useTransition();

  const apagar = () => {
    setErro(null);
    iniciar(async () => {
      const r = await excluirFotoDoProduto(foto.id);
      if (!r.ok) {
        setErro(r.erro);
        setConfirmando(false);
      }
    });
  };

  return (
    <li className="overflow-hidden rounded-xl border border-border bg-surface">
      <span className="relative block aspect-square bg-muted-bg">
        <Image
          src={foto.url}
          alt={foto.altText ?? ""}
          fill
          sizes="(min-width: 640px) 30vw, 45vw"
          className="object-cover"
        />
      </span>

      <div className="px-3 py-2.5">
        <p className="text-[12px] text-muted">
          {foto.optionName ?? "Foto geral"}
        </p>

        {erro && <p className="mt-1 text-[12px] text-danger">{erro}</p>}

        {confirmando ? (
          <div className="mt-2 flex items-center gap-3">
            <button
              type="button"
              onClick={apagar}
              disabled={apagando}
              className="cursor-pointer text-[12px] font-medium text-danger underline underline-offset-4 disabled:opacity-60"
            >
              {apagando ? "Apagando..." : "Confirmar"}
            </button>
            <button
              type="button"
              onClick={() => setConfirmando(false)}
              className="cursor-pointer text-[12px] text-muted underline underline-offset-4"
            >
              Cancelar
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setConfirmando(true)}
            className="mt-2 cursor-pointer text-[12px] text-muted underline underline-offset-4 transition-colors hover:text-danger"
          >
            Excluir
          </button>
        )}

        {!foto.veioDoPainel && (
          <p className="mt-2 text-[11px] leading-snug text-muted">
            Veio da pasta do projeto: o <code>npm run fotos</code> recria esta.
          </p>
        )}
      </div>
    </li>
  );
}
