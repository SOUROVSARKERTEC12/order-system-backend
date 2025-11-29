// // src/routes/admin.routes.ts (Create a new file for admin routes or add to an existing one)
// // This adds two endpoints: /start-socket and /stop-socket for controlling the SocketService

// import express from 'express';
// import { SocketService } from '../socket/socket.service';

// const router = express.Router();

// // Assuming you have access to the main HTTP server; if not, pass it via a global or dependency injection.
// // For simplicity, we'll assume the HTTP server is exported or accessible. If closed, you may need to restart the entire server.

// // GET /admin/start-socket - Starts or initializes the Socket.IO server if not running
// router.get('/start-socket', (req, res) => {
//   try {
//     const socketService = SocketService.getInstance();
    
//     if (!socketService.getIo()) {
//       socketService.init(httpServer);
//       res.status(200).json({ message: 'Socket.IO server started' });
//     } else {
//       res.status(200).json({ message: 'Socket.IO server already running' });
//     }
//   } catch (error) {
//     res.status(500).json({ message: 'Error starting Socket.IO server', error });
//   }
// });

// // GET /admin/stop-socket - Stops the Socket.IO server (closes it, stops accepting new connections)
// router.get('/stop-socket', (req, res) => {
//   try {
//     const socketService = SocketService.getInstance();
//     const io = socketService.getIo();

//     if (io) {
//       io.close(() => {
//         // Set io to null after close to allow re-init
//         (socketService as any).io = null; // Private property; consider adding a public stop method in SocketService
//         res.status(200).json({ message: 'Socket.IO server stopped' });
//       });
//     } else {
//       res.status(200).json({ message: 'Socket.IO server not running' });
//     }
//   } catch (error) {
//     res.status(500).json({ message: 'Error stopping Socket.IO server', error });
//   }
// });

// export default router;