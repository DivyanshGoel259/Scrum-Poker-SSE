import { useEffect, useState } from "react";
import { handleServerEventsRequests } from "./api";
import { Message } from "../types";
import { PlayerCard } from "./components/PlayerCard";
import { Button } from "../components/ui/button";
import { globalState } from "../globalState";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

const Cards = ["1", "2", "3", "5", "8"];

export const Game = () => {
  const [serverEvents, setServerEvents] = useState<EventSource | null>(null);
  const { gameId, user, organizer } = globalState();
  const [message, setMessage] = useState<Partial<Message>>({});
  const [selected, setSelected] = useState("");
  const navigate = useNavigate();

  const handleSelect = async (card: string) => {
    try {
      setSelected(card);
      const data = {
        type: "voted",
        message: {
          number: card,
          gameId: gameId,
          userId: user?.id,
        },
      };
      const response = await handleServerEventsRequests(data);
    } catch (err: any) {
      console.log(err.message);
    }
  };

  const handleReveal = async () => {
    try {
      if (!organizer) {
        return;
      }
      const data = {
        type: "reveal",
        message: {
          userId: user?.id,
          gameId: gameId,
        },
      };
      const response = await handleServerEventsRequests(data);
    } catch (err: any) {
      console.log(err.message);
    }
  };

  const handleReset = async () => {
    try {
      if (!organizer) {
        return;
      }
      const data = {
        type: "reset",
        message: {
          gameId: gameId,
        },
      };
      const response = await handleServerEventsRequests(data);
      // setSelected("")
    } catch (err: any) {
      console.log(err.message);
    }
  };

  const handleJoinGame = async () => {
    try {
      console.log("Join Called");
      const response = await handleServerEventsRequests({
        type: "join",
        message: {
          userId: user?.id,
          gameId: gameId,
          name: user?.name,
        },
      });
    } catch (err: any) {
      console.log(err.message);
    }
  };

  useEffect(() => {
    try {
      if (!user) {
        navigate("/")
        return;
      }

      const eventSource = new EventSource(`http://localhost:5050/events?userId=${user?.id}`);

      eventSource.onopen = () => {
        console.log("connection Established");
        setServerEvents(eventSource)

        handleJoinGame();
      };

      eventSource.onerror = (err: any) => {
        console.log("ws err", err);
      };

      eventSource.onmessage = (event) => {
        // console.log("ws onmessage", event);
        const data = JSON.parse(event.data);

        if (data.type === "game") {
          setMessage(data.message);
        }

        if(data.action == "reset") {
          setSelected("")
        }
      };
    } catch (err: any) {
      console.log(err.message);
    }

    return () => {
      serverEvents?.close();
    };
  }, []);

  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-200">
      <div className="w-full max-w-4xl p-6 relative">
        {organizer && 
        <div className="absolute top-3 right-3 bg-blue-500 text-white m-6 px-2 py-1 rounded-md cursor-pointer" onClick={handleReset}>reset</div>}
        <div className="fixed top-10 right-10">
          <button className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-full shadow-lg" onClick={
            () => {
              navigator.clipboard.writeText(`${window.location.host}/?gameId=${gameId}`)
              toast.success("copied invite link")
            }
          }>copy invite link</button>
        </div>
        <div className="bg-white rounded-xl shadow-lg p-8">
          <div className="text-center mb-8">
            <div className="font-semibold text-4xl">Ticket Sizing</div>
            <div className="mt-3 text-gray-600">Vote your estimates</div>
          </div>

          <div className="grid grid-cols-3 gap-4 justify-center mb-8">
            {message.players?.map((player) => (
              <div key={player.playerId} className="col-span-1">
                <PlayerCard player={player} revealed={message.reveal || false} />
              </div>
            ))}
          </div>

          {organizer && (
            <div className="flex justify-center mb-8">
              <Button onClick={handleReveal} disabled={message.reveal}>
                {message.reveal ? "Revealed" : "Reveal"}
              </Button>
            </div>
          )}

          <div className="flex justify-center gap-3">
            {Cards.map((card) => (
              <div
                key={card}
                onClick={() => handleSelect(card)}
                disabled={selected != ""}
                className={`
                  ${selected === card ? "bg-blue-500 text-white" : "hover:bg-blue-500 hover:text-white"}
                  cursor-pointer 
                  border 
                  border-gray-300 
                  font-bold 
                  py-7 
                  px-4 
                  rounded-[5px]
                  flex 
                  flex-col 
                  justify-center
                `}
              >
                {card}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
