import { Server } from 'colyseus';
import { WebSocketTransport } from '@colyseus/ws-transport';
import { HighRollerRoom } from './HighRollerRoom';

const port = Number(process.env.PORT || 2567);
const host = process.env.HOST || '0.0.0.0';

const gameServer: Server = new Server({
  transport: new WebSocketTransport(),
});

// Room id exposed to clients: highroller_room
gameServer.define('highroller_room', HighRollerRoom);

gameServer.onShutdown(() => {
  console.log('[high-roller] server shutting down');
});

gameServer.listen(port, host).then(() => {
  console.log(`[high-roller] Colyseus listening on ws://${host}:${port}`);
}).catch((error) => {
  console.error('[high-roller] failed to start', error);
  process.exit(1);
});
