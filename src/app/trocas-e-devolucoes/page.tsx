import type { Metadata } from "next";
import { WHATSAPP_URL } from "@/lib/catalog";

export const metadata: Metadata = {
  title: "Entrega, trocas e devoluções | 3sementes",
  description:
    "Prazos de produção e envio, direito de arrependimento, trocas por defeito e como solicitar.",
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

export default function TrocasEDevolucoesPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <h1 className="font-display text-4xl font-medium leading-tight text-foreground">
        Entrega, trocas e devoluções
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
          ajustes combinados antes da produção — nesse caso, o prazo começa a
          contar depois que os detalhes estiverem definidos com você.
        </p>
        <p>
          O prazo de entrega depende da transportadora e do CEP de destino, e é
          informado no momento da compra. Assim que a peça for postada, enviamos
          o código de rastreio.
        </p>
      </Section>

      <Section title="Direito de arrependimento (7 dias)">
        <p>
          Como a compra é feita pela internet, você pode desistir dela em até{" "}
          <strong>7 dias corridos</strong> contados a partir do recebimento,
          sem precisar justificar o motivo. Isso vale para qualquer peça,
          inclusive as feitas sob medida, conforme o artigo 49 do Código de
          Defesa do Consumidor.
        </p>
        <p>
          A peça precisa voltar sem sinais de uso e, de preferência, na
          embalagem original. Depois que recebermos e conferirmos, devolvemos o
          valor pago, incluindo o frete, pelo mesmo meio de pagamento usado na
          compra.
        </p>
      </Section>

      <Section title="Peça com defeito ou danificada no transporte">
        <p>
          Confira a encomenda assim que receber. Se a peça chegar danificada, ou
          apresentar algum defeito de fabricação, fale com a gente e resolvemos:
          dependendo do caso, consertamos a peça, enviamos outra igual ou
          devolvemos o valor pago. O frete da devolução nesse caso é por nossa
          conta.
        </p>
        <p>
          Guarde as fotos da embalagem e da peça como chegaram — elas ajudam a
          resolver mais rápido, principalmente quando o dano aconteceu no
          caminho.
        </p>
      </Section>

      <Section title="Peças sob medida">
        <p>
          Peças sob medida são feitas exclusivamente para você, no tamanho e nas
          cores combinados. Por isso, passado o prazo de 7 dias de
          arrependimento, elas não são trocadas por mudança de ideia, tamanho ou
          cor — apenas em caso de defeito ou dano no transporte.
        </p>
        <p>
          Antes de fechar o pedido, tire todas as dúvidas com a gente pelo
          WhatsApp: ajudamos você a tirar a medida certa e a escolher as cores.
        </p>
      </Section>

      <Section title="Como solicitar">
        <p>
          Fale com a gente pelo{" "}
          <a
            href={WHATSAPP_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="text-accent underline underline-offset-4"
          >
            WhatsApp (81) 92005-1830
          </a>{" "}
          informando o pedido, o motivo e, se for o caso, fotos da peça. A
          gente responde com o endereço de devolução e as orientações de envio.
        </p>
        <p>
          O reembolso, quando houver, é feito pelo mesmo meio de pagamento da
          compra. O prazo para o valor aparecer na sua conta ou fatura depende
          do banco ou da operadora do cartão.
        </p>
      </Section>
    </div>
  );
}
