interface CardProps {
  title: string;
  description: string;
  link: string;
}

export default function Card({ title, description, link }: CardProps) {
  return (
    <button
      className="flex flex-col items-center justify-center cursor-pointer bg-background-2 text-white p-8 h-40 rounded-lg shadow-md transition ease-in-out hover:scale-110 hover:bg-primary hover:text-background-0 relative"
      onClick={() => (window.location.href = link)}
    >
      <h1 className="text-2xl font-bold mb-4 ">{title}</h1>
      <p className="">{description}</p>
    </button>
  );
}
