export interface Player {
  playerId: string;
  number: string;
  name: string;
  voted: boolean;
}

export interface Data {
  type: string;
  message: Partial<Message>;
}

export interface Message {
  players: Array<Player>;
  reveal: boolean;
  gameId: string;
  userId: string;
  name: string;
  number: string;
  // organizer: {
  //   name: string;
  //   id: string;
  // }
}
