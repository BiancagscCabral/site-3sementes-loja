import type { Metadata } from "next";
import { WHATSAPP_URL } from "@/lib/catalog";

export const metadata: Metadata = {
  title: "Prazo e Entregas | 3sementes",
  description:
    "Prazo de produção e envio, peças sob medida e personalizadas e como falar com a loja.",
};

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mt-10">
      <h2 className="font-display text-xl font-medium text-foreground">
        {title}
      </h2>
      <div className="mt-3 flex flex-col gap-3 text-[15px] leading-7 text-muted">
        {children}
      </div>
    </section>
  );
}

export default function PrazoEEntregasPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <h1 className="font-display text-4xl font-medium leading-tight text-foreground">
        Prazo e Entregas
      </h1>
      <p className="mt-4 text-[15px] leading-7 text-muted">
        Todas as nossas peças são feitas à mão, uma a uma. Por isso pequenas
        diferenças de cor, tamanho e acabamento entre uma peça e outra são
        características do trabalho artesanal, e não defeitos.
      </p>

      <Section title="Prazo de produção e envio">
        <p>
          Cada peça é produzida e postada em até <strong>5 dias úteis</strong>{" "}
          após a confirmação do pagamento. Peças sob medida podem exigir alguns
          ajustes combinados antes da produção. Nesse caso, o prazo começa a
          contar depois que os detalhes estiverem definidos com você.
        </p>
        <p>
          O prazo de entrega depende da transportadora e do CEP de destino, e é
          informado no momento da compra. Assim que a peça for postada, enviamos
          o código de rastreio.
        </p>
      </Section>

      <Section title="Sob medida e personalizados">
        <p>
          Peças sob medida são feitas exclusivamente para você, no tamanho e nas
          cores combinados. Dá para escolher as cores, ajustar o tamanho e, nos
          buquês, acrescentar um card polaroid com foto ou um cartão presente
          escrito à mão tudo combinado com a gente antes da produção.
        </p>
        <p>
          Antes de fechar o pedido, tire todas as dúvidas no WhatsApp: ajudamos
          você a tirar a medida certa e a escolher as cores.
        </p>
      </Section>

      <Section title="Dúvidas">
        <p>
          Qualquer dúvida sobre prazo, entrega ou sobre um pedido já feito, fale
          com a gente pelo{" "}
          <a
            href={WHATSAPP_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="text-accent underline underline-offset-4"
          >
            WhatsApp (81) 92005-1830
          </a>
          . Respondemos de segunda a sábado.
        </p>
      </Section>
    </div>
  );
}
