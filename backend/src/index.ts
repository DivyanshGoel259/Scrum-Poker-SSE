import express, { NextFunction, Request, Response } from 'express'
import cors from 'cors'
import { v4 as uuid } from "uuid"
import { redisClient } from "./lib/redis";
import * as service from "./service"
import { RedisClientType } from "redis";

const app = express()
const PORT = 5050


let serverClients:any[] = []

const server = app.listen(PORT, () => {
    console.log("Server is Listening on " + PORT);
})


let client: RedisClientType | undefined;

app.use(express.json())
app.use(cors())

export const ttl = 2 * 60 * 60 // 2 hours in secs

function eventsHandler(request:Request, response:Response, next:NextFunction) {
    const headers = {
      'Content-Type': 'text/event-stream',
      'Connection': 'keep-alive',
      'Cache-Control': 'no-cache'
    };
    response.writeHead(200, headers);
  
    const clientId = Date.now();
  
    const newClient = {
      id: clientId,
      response
    };
  
    serverClients.push(newClient);

    newClient.response.write(`data:${JSON.stringify({message:"Connection Established"})}\n\n`);
  
    response.on('close', () => {
      console.log(`${clientId} Connection closed`);
      serverClients = serverClients.filter(serverClient => serverClient.id !== clientId);
    });
  }

function sendData(serverClient:any, payload:any) {
    const data = `data: ${JSON.stringify(payload)}\n\n`;
    console.log(data);
    serverClient.response.write(data);

    
  }




app.post("/create", async (req: Request, res: Response) => {
    try {
        const client = await redisClient();  // initializig a redis client connection 
        const { gameId, user } = req.body;
        if (!user) {
            throw new Error("There must be user object with name")
        }
        if (!user.id) {
            user.id = uuid()
        }
        let payload: any = {
            players: [],
            gameId: gameId,
            reveal: false
        }

        if (!gameId) {
            payload.gameId = uuid()
            payload.organizer = user;
        } else {
            payload = await client?.get(`gameId:${payload.gameId}`);
            payload = JSON.parse(payload);
        }
        payload.players.push({ playerId: user.id, name: user.name, number: 0, voted: false })
        const response = await client?.set(`gameId:${payload.gameId}`, JSON.stringify(payload), { EX: ttl })
        res.json({ user, gameId: payload.gameId })
    } catch (err: any) {
        res.json({ error: { message: err.message } })
    }
})


app.get("/events",eventsHandler)

app.post("/game",async (req:Request,res:Response)=> {
            try {
                client = await redisClient()
                const {message,type} = req.body
                switch(type) {
                    case "join": {
                        console.log("Join Request Came");
                        await service.joinGame({ message,res, client })
                        break;
                    }
                    case "voted": {
                        await service.voted({ message,res, client })
                        break;
                    }
                    case "reveal": {
                        await service.reveal({ message,res, client })
                        break;
                    }
                    case "reset": {
                        await service.reset({ message,res, client })
                        break;
                    }
                }
                res.json({success:true})
            } catch (err: any) {
                res.json({ error: { message: err.message } })
            }
        })

export const broadcast = async (data: any) => {
    try {
        for (const serverClient of serverClients) {
            sendData(serverClient,data)
        }
    } catch (err: any) {
        console.log(err.message)
    }
}