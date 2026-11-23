import { redirect } from "next/navigation";
import { ehAdmin, usuarioAtual } from "@/lib/supabase/servidor";
import { INSTAGRAM_LINKS, WHATSAPP_URL } from "@/lib/catalog";
import CabecalhoDoPainel from "@/components/admin/CabecalhoDoPainel";
import EmBreve from "@/components/admin/EmBreve";
import Sair from "@/components/Sair";
import { IconeSair } from "@/components/Icones";

export const dynamic = "force-dynamic";

function Bloco({
  titulo,
  children,
}: {
  titulo: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-border bg-surface p-5 sm:p-6">
      <h2 className="font-display text-[21px] font-semibold text-primary">
        {titulo}
      </h2>
      <div className="mt-3 text-[14px] leading-7 text-foreground">
        {children}
      </div>
    </section>
  );
}

function Linha({
  rotulo,
  children,
}: {
  rotulo: string;
  children: React.ReactNode;
}) {
  return (
    <p className="flex flex-wrap gap-x-2">
      <span className="text-muted">{rotulo}:</span>
      <span className="font-medium">{children}</span>
    </p>
  );
}

// Resumo de como a loja está configurada. Por enquanto só leitura: os valores
// vêm do código e das variáveis de ambiente, e editar daqui fica para depois.
export default async function ConfiguracoesDoAdmin() {
  const usuario = await usuarioAtual();
  if (!usuario) redirect("/admin/entrar");
  if (!ehAdmin(usuario.email)) redirect("/admin");

  const emailAtivo = Boolean(process.env.RESEND_API_KEY);

  return (
    <div className="px-5 py-8 sm:px-8 sm:py-10">
      <CabecalhoDoPainel
        titulo="Configurações"
        subtitulo="Como a sua loja está configurada hoje."
      >
        <EmBreve className="!px-4 !py-1.5 !text-[12px]" />
      </CabecalhoDoPainel>

      <div className="mt-7 grid gap-4 lg:grid-cols-2">
        <Bloco titulo="Sua conta">
          <Linha rotulo="Entrou como">{usuario.email}</Linha>
          <div className="mt-3">
            <Sair
              className="inline-flex h-10 cursor-pointer items-center gap-2 rounded-full border border-border px-5 text-[14px] font-semibold text-foreground transition-colors hover:bg-muted-bg"
              icone={<IconeSair className="h-[18px] w-[18px]" />}
            />
          </div>
        </Bloco>

        <Bloco titulo="Contato da loja">
          <Linha rotulo="WhatsApp">
            <a
              href={WHATSAPP_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="underline underline-offset-4 hover:text-primary"
            >
              (81) 92005-1830
            </a>
          </Linha>
          {INSTAGRAM_LINKS.map((link) => (
            <Linha key={link.href} rotulo="Instagram">
              <a
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className="underline underline-offset-4 hover:text-primary"
              >
                {link.label}
              </a>
            </Linha>
          ))}
        </Bloco>

        <Bloco titulo="Pagamento">
          <Linha rotulo="Recebimento">InfinitePay</Linha>
          <Linha rotulo="Formas">Pix e cartão de crédito</Linha>
        </Bloco>

        <Bloco titulo="Entrega">
          <Linha rotulo="Correios">
            Mini Envios, PAC e SEDEX, com frete calculado
          </Linha>
          <Linha rotulo="Uber Flash">valor combinado pelo WhatsApp</Linha>
        </Bloco>

        <Bloco titulo="E-mail de pedido">
          <Linha rotulo="Envio">
            {emailAtivo ? "ativo" : "desligado: falta a chave do Resend"}
          </Linha>
          <p className="text-[13px] text-muted">
            Sem a chave, o pedido é gravado normalmente e o e-mail só fica
            registrado no log.
          </p>
        </Bloco>
      </div>
    </div>
  );
}
