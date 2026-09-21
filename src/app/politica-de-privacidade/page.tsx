import type { Metadata } from "next";
import { WHATSAPP_URL } from "@/lib/catalog";

export const metadata: Metadata = {
  title: "Política de privacidade | 3sementes",
  description:
    "Quais dados a 3sementes coleta, para que usa, com quem compartilha e como exercer seus direitos.",
};

const UPDATED_AT = "20 de setembro de 2026";

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

export default function PoliticaDePrivacidadePage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <h1 className="font-display text-4xl font-medium leading-tight text-foreground">
        Política de privacidade
      </h1>
      <p className="mt-4 text-[15px] leading-7 text-muted">
        Esta página explica quais informações suas a 3sementes coleta, para que
        elas são usadas e quais são os seus direitos, conforme a Lei Geral de
        Proteção de Dados (Lei 13.709/2018). Última atualização: {UPDATED_AT}.
      </p>

      <Section title="Quem é responsável pelos seus dados">
        <p>
          [RAZÃO SOCIAL], CNPJ [PREENCHER], sediada em Igarassu (PE), é quem
          trata os dados coletados neste site. Para falar sobre privacidade,
          use o{" "}
          <a
            href={WHATSAPP_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="text-accent underline underline-offset-4"
          >
            WhatsApp (81) 92005-1830
          </a>
          .
        </p>
      </Section>

      <Section title="Que dados coletamos">
        <p>
          <strong>Quando você fala com a gente:</strong> os dados que você mesma
          envia na conversa do WhatsApp ou do Instagram, como nome, telefone e o
          conteúdo das mensagens.
        </p>
        <p>
          <strong>Quando você faz um pedido:</strong> nome, telefone, e-mail,
          endereço de entrega, itens comprados e valor. Esses dados são
          necessários para produzir, cobrar e entregar a encomenda.
        </p>
        <p>
          <strong>Dados de pagamento:</strong> os dados do cartão ou do Pix são
          informados direto na plataforma de pagamento e processados por ela.
          Nós não temos acesso ao número do seu cartão.
        </p>
        <p>
          Hoje o site não tem cadastro de usuário, não usa cookies de
          publicidade e não faz rastreamento para anúncios.
        </p>
      </Section>

      <Section title="Para que usamos">
        <p>
          Para atender você, produzir e enviar o pedido, combinar o frete,
          resolver trocas e devoluções, e cumprir obrigações legais e fiscais.
          Não vendemos seus dados e não enviamos mensagens de propaganda sem
          que você peça.
        </p>
      </Section>

      <Section title="Com quem compartilhamos">
        <p>
          Compartilhamos apenas o necessário para o pedido chegar até você: os
          dados de entrega com os Correios ou a transportadora escolhida, e os
          dados da cobrança com a plataforma de pagamento. As informações da
          loja ficam guardadas em serviço de hospedagem de banco de dados
          contratado para este site.
        </p>
      </Section>

      <Section title="Por quanto tempo guardamos">
        <p>
          Mantemos os dados do pedido enquanto durar o atendimento e pelos
          prazos exigidos por lei — por exemplo, os prazos fiscais e o prazo de
          garantia do produto. Depois disso, eles são apagados ou anonimizados.
        </p>
      </Section>

      <Section title="Seus direitos">
        <p>
          Você pode pedir, a qualquer momento: confirmação de que tratamos seus
          dados, acesso a eles, correção de informações erradas, exclusão,
          portabilidade, e informação sobre com quem foram compartilhados. Basta
          pedir pelo WhatsApp, que respondemos no menor prazo possível.
        </p>
      </Section>

      <Section title="Segurança e mudanças nesta política">
        <p>
          Adotamos medidas razoáveis para proteger suas informações contra
          acesso não autorizado. Se esta política mudar, a data de atualização
          no topo da página muda junto.
        </p>
      </Section>
    </div>
  );
}
