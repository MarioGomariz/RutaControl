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
        className="flex flex-col items-center justify-center cursor-pointer text-black p-4 sm:p-6 md:p-8 h-40 sm:h-48 md:h-56 w-full max-w-xs text-center rounded-lg shadow-md transition ease-in-out hover:scale-105 hover:bg-primary hover:text-background-0 border-dashed border-2 border-gray-500"
        onClick={() => (window.location.href = card.link)}
      >
        <h1 className="text-xl sm:text-2xl font-bold mb-2 sm:mb-4">{card.title}</h1>
      </button>
    );
  }


  return (
    <button
      className="flex flex-col items-center justify-center cursor-pointer bg-white text-black p-4 sm:p-6 md:p-8 h-40 sm:h-48 md:h-56 w-full max-w-xs rounded-lg shadow-md transition ease-in-out hover:scale-105 hover:text-background-0 relative"
      onClick={() => (window.location.href = card.link)}
    >
      <div className="mb-2 sm:mb-3">{card.icon}</div>
      <h1 className="text-lg sm:text-xl md:text-2xl font-bold mb-1 sm:mb-2">{card.title}</h1>
      <p className="text-sm sm:text-base text-center">{card.description}</p>
    </button>
  );
}
