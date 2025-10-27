type GameTitleProps = {
  title: string;
  subtitle?: string;
  className?: string;
};

export function GameTitle({ title, subtitle, className = "" }: GameTitleProps) {
  return (
    <div className={`text-center ${className}`}>
      <h1 className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary mb-2">
        {title}
      </h1>
      {subtitle && (
        <p className="text-lg text-text/70 font-medium">{subtitle}</p>
      )}
    </div>
  );
}