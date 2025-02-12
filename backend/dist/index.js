"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.broadcast = exports.ttl = void 0;
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const uuid_1 = require("uuid");
const redis_1 = require("./lib/redis");
const service = __importStar(require("./service"));
const app = (0, express_1.default)();
const PORT = 5050;
let serverClients = [];
const server = app.listen(PORT, () => {
    console.log("Server is Listening on " + PORT);
});
let client;
app.use(express_1.default.json());
app.use((0, cors_1.default)());
exports.ttl = 2 * 60 * 60; // 2 hours in secs
function eventsHandler(request, response, next) {
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
    newClient.response.write(`data:${JSON.stringify({ message: "Connection Established" })}\n\n`);
    response.on('close', () => {
        console.log(`${clientId} Connection closed`);
        serverClients = serverClients.filter(serverClient => serverClient.id !== clientId);
    });
}
function sendData(serverClient, payload) {
    const data = `data: ${JSON.stringify(payload)}\n\n`;
    console.log(data);
    serverClient.response.write(data);
}
app.post("/create", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const client = yield (0, redis_1.redisClient)(); // initializig a redis client connection 
        const { gameId, user } = req.body;
        if (!user) {
            throw new Error("There must be user object with name");
        }
        if (!user.id) {
            user.id = (0, uuid_1.v4)();
        }
        let payload = {
            players: [],
            gameId: gameId,
            reveal: false
        };
        if (!gameId) {
            payload.gameId = (0, uuid_1.v4)();
            payload.organizer = user;
        }
        else {
            payload = yield (client === null || client === void 0 ? void 0 : client.get(`gameId:${payload.gameId}`));
            payload = JSON.parse(payload);
        }
        payload.players.push({ playerId: user.id, name: user.name, number: 0, voted: false });
        const response = yield (client === null || client === void 0 ? void 0 : client.set(`gameId:${payload.gameId}`, JSON.stringify(payload), { EX: exports.ttl }));
        res.json({ user, gameId: payload.gameId });
    }
    catch (err) {
        res.json({ error: { message: err.message } });
    }
}));
app.get("/events", eventsHandler);
app.post("/game", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        client = yield (0, redis_1.redisClient)();
        const { message, type } = req.body;
        switch (type) {
            case "join": {
                console.log("Join Request Came");
                yield service.joinGame({ message, res, client });
                break;
            }
            case "voted": {
                yield service.voted({ message, res, client });
                break;
            }
            case "reveal": {
                yield service.reveal({ message, res, client });
                break;
            }
            case "reset": {
                yield service.reset({ message, res, client });
                break;
            }
        }
        res.json({ success: true });
    }
    catch (err) {
        res.json({ error: { message: err.message } });
    }
}));
const broadcast = (data) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        for (const serverClient of serverClients) {
            sendData(serverClient, data);
        }
    }
    catch (err) {
        console.log(err.message);
    }
});
exports.broadcast = broadcast;
