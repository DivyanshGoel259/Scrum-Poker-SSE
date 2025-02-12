import { RedisClientType } from "redis";
import { broadcast, ttl } from ".";
import { Response } from "express";

interface Args {
    message:any
    res:Response,
    client:RedisClientType|undefined
}

export const joinGame = async ({message,res,client}:Args)=>{

    try {
        const gameId = message.gameId;
        const gameString = await client?.get(`gameId:${gameId}`);
        const game = gameString?JSON.parse(gameString):null
        broadcast({
            type:"game",
            message:game
        })
    } catch (err:any){
        console.log(err.message)
        res.json({ error: { message: err.message } })
    }

}

export const voted = async ({message,res,client}:Args)=>{

    try {

        const gameId = message.gameId
        const gameString = await client?.get(`gameId:${gameId}`)
        const userId = message.userId
        const game = gameString?JSON.parse(gameString):null
        if(!game){
            throw new Error("Provide Valid GameID")
        }
        const playerIdIndex = game.players.findIndex((player:any)=>{
            return player.playerId === userId
        })  

        if(playerIdIndex==-1){
            throw new Error("No user with This id Exists")
        }

        game.players[playerIdIndex].voted = true
        game.players[playerIdIndex].number = message.number
        await client?.set(`gameId:${gameId}`,JSON.stringify(game),{EX:ttl})

        broadcast ({
            type:"game",
            message:game
        })
    } catch (err:any){
        res.json({ error: { message: err.message } })
    }

}

export const reveal = async ({message,res,client}:Args)=>{

    try {
        const gameId = message.gameId
        const gameString = await client?.get(`gameId:${gameId}`);
        const game = gameString?JSON.parse(gameString):null
        if(!game){
            throw new Error("No Game Exists with this gameId")
        }
        game.reveal = true;
        broadcast({
            type:"game",
            message:game
        })
    } catch (err:any){
        res.json({ error: { message: err.message } })
    }

}

export const reset = async ({message,res,client}:Args)=>{

    try {

        const gameId = message.gameId 
        const gameString = await client?.get(`gameId:${gameId}`)
        const game = gameString?JSON.parse(gameString):null
        if(!game){
            throw new Error("Provide Valid Game ID")
        }

        game.reveal = false
        game.players.forEach((player:any) => {
            player.number = 0;
            player.voted = false
        });

        await client?.set(`gameId:${gameId}`,JSON.stringify(game),{EX:ttl})

        broadcast({
            type:"game",
            message:game,
            action:"reset"
        })

    } catch (err:any){
        res.json({ error: { message: err.message } });
    }

}