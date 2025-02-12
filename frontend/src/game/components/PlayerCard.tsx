interface props {
  player: {
    playerId: string;
    name: string;
    number: string;
    voted: boolean;
  };
  revealed: boolean;
}

export const PlayerCard = ({ player, revealed }: props) => {
  return (
    <div className="flex flex-col items-center space-y-2">
      <div
        className={`
      w-24 h-32 rounded-lg shadow-md flex items-center justify-center
      ${player.voted ? "bg-blue-50" : "bg-gray-50"}
      ${revealed ? "transform rotate-0" : "transform rotate-180"}
      transition-all duration-500
    `}
      >
        {revealed && player.number && player.number !== "0" ? <span className="text-2xl font-bold">{player.number}</span> : <div className="w-16 h-24 bg-blue-100 rounded"></div>}
      </div>
      <div className="flex items-center space-x-2">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
        </svg>

        <span className="text-sm font-medium">{player.name}</span>
      </div>
      {player.voted && !revealed && <span className="text-xs text-green-600">Voted</span>}
    </div>
  );
};
