type GameTitleProps = {
  title: string;
};

export function GameTitle({ title }: GameTitleProps) {
  return <h1 className="text-2xl font-bold text-blue-600">{title}</h1>;
}