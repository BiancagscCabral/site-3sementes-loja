// Card que vira ao passar o mouse. No celular, onde não existe hover, ele vira
// ao ser tocado (o toque dá foco no card).
export default function FlipCard({
  icon,
  title,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flip-card h-[250px]" tabIndex={0}>
      <div className="flip-card-inner">
        <div className="flip-card-face flip-card-front">
          <span className="flex h-[70px] w-[70px] items-center justify-center rounded-full border-2 border-accent text-accent">
            {icon}
          </span>
          <h3 className="font-display mt-5 text-[22px] font-bold text-primary-foreground">
            {title}
          </h3>
        </div>
        <div className="flip-card-face flip-card-back">
          <p className="text-[15px] leading-7 text-primary-foreground">
            {children}
          </p>
        </div>
      </div>
    </div>
  );
}
