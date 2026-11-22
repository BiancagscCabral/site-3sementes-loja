// Grafismos de apoio da identidade Groovy: flor, estrela, manchas orgânicas e a
// forma de flor dos atalhos. Todos usam currentColor (a cor vem da classe de
// texto) e são decorativos: ficam escondidos de leitores de tela.

type Props = { className?: string };

// Flor de cinco pétalas, com miolo na cor `miolo`.
export function Flor({
  className,
  miolo = "var(--primary)",
}: Props & { miolo?: string }) {
  return (
    <svg viewBox="0 0 100 100" aria-hidden className={className}>
      <g fill="currentColor">
        {[0, 72, 144, 216, 288].map((giro) => (
          <ellipse
            key={giro}
            cx="50"
            cy="24"
            rx="15"
            ry="23"
            transform={`rotate(${giro} 50 50)`}
          />
        ))}
      </g>
      <circle cx="50" cy="50" r="9" fill={miolo} />
    </svg>
  );
}

// Estrela de quatro pontas (brilho).
export function Estrela({ className }: Props) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden className={className}>
      <path
        fill="currentColor"
        d="M12 0c.9 6.2 5.8 11.1 12 12-6.2.9-11.1 5.8-12 12-.9-6.2-5.8-11.1-12-12C6.2 11.1 11.1 6.2 12 0Z"
      />
    </svg>
  );
}

// Mancha orgânica (três formatos), para fundos e cantos.
const MANCHAS = [
  "M44.7,-58.4C57.6,-48.9,67.5,-34.4,71.6,-18.3C75.7,-2.2,73.9,15.5,65.6,29.6C57.3,43.7,42.4,54.2,26.3,61.6C10.2,69,-7.2,73.3,-22.6,68.6C-38,63.9,-51.4,50.2,-60.1,34.6C-68.8,19,-72.8,1.5,-69.1,-13.9C-65.4,-29.3,-54,-42.4,-40.7,-51.7C-27.4,-61,-12.2,-66.5,2.3,-69.3C16.8,-72.1,31.8,-67.9,44.7,-58.4Z",
  "M38.9,-49.4C50.4,-40.2,59.7,-28.3,64.2,-14.1C68.7,0.1,68.4,16.5,61.3,29.2C54.2,41.9,40.3,50.9,25.7,57.3C11.1,63.7,-4.2,67.5,-19.1,64.2C-34,60.9,-48.5,50.5,-56.8,36.7C-65.1,22.9,-67.2,5.7,-62.9,-9.1C-58.6,-23.9,-47.9,-36.3,-35.6,-45.3C-23.3,-54.3,-11.7,-59.9,1.2,-61.4C14,-62.8,27.5,-58.6,38.9,-49.4Z",
  "M47.3,-61.9C59.9,-52.2,67.6,-36.2,70.6,-19.6C73.6,-3,71.9,14.2,64.2,28.3C56.5,42.4,42.8,53.4,27.7,59.6C12.6,65.8,-3.9,67.2,-19.5,63C-35.1,58.8,-49.8,49,-58.6,35.3C-67.4,21.6,-70.3,4,-66.8,-11.5C-63.3,-27,-53.4,-40.4,-41,-50.1C-28.6,-59.8,-14.3,-65.8,1.9,-68.2C18.1,-70.6,34.7,-71.6,47.3,-61.9Z",
];

export function Mancha({
  className,
  forma = 0,
}: Props & { forma?: 0 | 1 | 2 }) {
  return (
    <svg viewBox="0 0 200 200" aria-hidden className={className}>
      <path
        fill="currentColor"
        transform="translate(100 100)"
        d={MANCHAS[forma]}
      />
    </svg>
  );
}

// Forma de flor (nuvem de oito gomos) usada atrás dos atalhos de categoria.
function caminhoDeFlor(gomos: number) {
  const centro = 50;
  const raio = 35;
  const arco = 17;
  const ponto = (i: number) => {
    const angulo = (i / gomos) * Math.PI * 2 - Math.PI / 2;
    return [centro + raio * Math.cos(angulo), centro + raio * Math.sin(angulo)];
  };
  const [x0, y0] = ponto(0);
  let d = `M${x0.toFixed(2)} ${y0.toFixed(2)}`;
  for (let i = 1; i <= gomos; i++) {
    const [x, y] = ponto(i % gomos);
    d += `A${arco} ${arco} 0 0 1 ${x.toFixed(2)} ${y.toFixed(2)}`;
  }
  return `${d}Z`;
}

const FLOR_DE_OITO = caminhoDeFlor(8);

export function FormaDeFlor({ className }: Props) {
  return (
    <svg viewBox="0 0 100 100" aria-hidden className={className}>
      <path fill="currentColor" d={FLOR_DE_OITO} />
    </svg>
  );
}
