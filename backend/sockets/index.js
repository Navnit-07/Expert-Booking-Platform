const { Server } = require("socket.io");
const { registerBookingHandlers } = require("./bookingHandler");

let io;
let connectedClients = 0;

const initSocket = (httpServer) => {
    io = new Server(httpServer, {
        cors: {
            origin: "*",
            methods: ["GET", "POST"],
        },
        pingTimeout: 60000,
        pingInterval: 25000,
    });

    io.on("connection", (socket) => {
        connectedClients++;
        console.log(`Socket connected: ${socket.id} | Total clients: ${connectedClients}`);

        registerBookingHandlers(io, socket);

        socket.on("error", (err) => {
            console.error(`Socket error [${socket.id}]:`, err.message);
        });

        socket.on("disconnect", (reason) => {
            connectedClients--;
            console.log(`🔌 Socket disconnected: ${socket.id} | Reason: ${reason} | Remaining: ${connectedClients}`);
        });
    });

    console.log("Socket.io initialised");
    return io;
};

const getIO = () => {
    if (!io) {
        throw new Error("Socket.io has not been initialised. Call initSocket() first.");
    }
    return io;
};

const getConnectedClients = () => connectedClients;

module.exports = { initSocket, getIO, getConnectedClients };
