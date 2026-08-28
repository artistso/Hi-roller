import cors from 'cors';
import express from 'express';
import { createServer } from 'node:http';
import { Server } from '@colyseus/core';
import { WebSocketTransport } from '@colyseus/ws-transport';
import { HighRollerRoom } from './rooms/HighRollerRoom';

const port = Number.parseInt(process.env.PORT || '2567', 10);
const app = express();
app.disable('x-powered-by');
app.use(cors({ origin: process.env.CLIENT_ORIGIN?.split(',') || true }));
app.get('/health', (_request, response) => {
  response.json({ ok: true, service: 'hi-roller-server' });
});

const httpServer = createServer(app);
const gameServer = new Server({
  transport: new WebSocketTransport({ server: httpServer }),
});

gameServer.define('highroller_room', HighRollerRoom);
httpServer.listen(port, '0.0.0.0', () => {
  console.log(`Hi Roller server listening on :${port}`);
});
