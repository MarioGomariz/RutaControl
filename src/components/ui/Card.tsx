interface CardProps {
  title: string;
  description?: string;
  link: string;
  nuevo?: boolean;
  icon?: React.ReactNode;
}

export default function Card({ card }: { card: CardProps }) {

  if (card.nuevo) {
    return (
      <button
        className="flex flex-col items-center justify-center cursor-pointer text-white p-8 h-40 text-center rounded-lg shadow-md transition ease-in-out hover:scale-110  hover:bg-primary hover:text-background-0 border-dashed border-2 border-gray-500"
        onClick={() => (window.location.href = card.link)}
      >
        <h1 className="text-2xl font-bold mb-4 ">{card.title}</h1>
      </button>
    );
  }


  return (
    <button
      className="flex flex-col items-center justify-center cursor-pointer bg-background-2 text-white p-8 h-40 rounded-lg shadow-md transition ease-in-out hover:scale-110 hover:bg-primary hover:text-background-0 relative"
      onClick={() => (window.location.href = card.link)}
    >
      {card.icon}
      <h1 className="text-2xl font-bold mb-4 ">{card.title}</h1>
      <p className="">{card.description}</p>
    </button>
  );
}
