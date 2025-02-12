interface Data {
  user: {
    name: string;
    id: string;
  };
  gameId: string;
}

export const createGame = async (payload: any) => {
  try {
    const response = await fetch("http://localhost:5050/create", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });
    const data = await response.json();

    return [data, null] as [Data, null];
  } catch (err: any) {
    return [null, err] as [null, Error];
  }
};
