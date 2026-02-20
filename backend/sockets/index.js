const { Server } = require("socket.io");

let io;

/**
 * Initialise Socket.io on the given HTTP server.
 * @param {import("http").Server} httpServer
 * @returns {import("socket.io").Server}
 */
const initSocket = (httpServer) => {
    io = new Server(httpServer, {
        cors: {
            origin: "*", // tighten this in production
            methods: ["GET", "POST"],
        },
    });

    io.on("connection", (socket) => {
        console.log(`⚡ Socket connected: ${socket.id}`);

        socket.on("disconnect", (reason) => {
            console.log(`🔌 Socket disconnected: ${socket.id} — ${reason}`);
        });

        // Register additional event handlers here as needed
    });

    return io;
};

/**
 * Retrieve the current Socket.io instance.
 * Throws if called before initSocket().
 */
const getIO = () => {
    if (!io) {
        throw new Error("Socket.io has not been initialised. Call initSocket() first.");
    }
    return io;
};

module.exports = { initSocket, getIO };
