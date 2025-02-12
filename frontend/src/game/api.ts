import { Data } from "../types";

export const handleServerEventsRequests = async ( data: Data) => {
  try {
    const response:any = await fetch("http://localhost:5050/game",{
      method:"POST",
      headers:{
        "Content-Type":"application/json",
      },
      body:JSON.stringify(data)
    })

    const dataa = await response.json()

    return dataa
  } catch (err: any) {
    throw err
  }
};
