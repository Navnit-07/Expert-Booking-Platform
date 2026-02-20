require("dotenv").config();

const http = require("http");
const app = require("./app");
const connectDB = require("./config/db");
const { initSocket } = require("./sockets");

const PORT = process.env.PORT || 5000;

// ---------- Bootstrap ----------

(async () => {
    // 1. Connect to MongoDB
    await connectDB();

    // 2. Create HTTP server from the Express app
    const server = http.createServer(app);

    // 3. Initialise Socket.io
    initSocket(server);

    // 4. Start listening
    server.listen(PORT, () => {
        console.log(
            `🚀 Server running in ${process.env.NODE_ENV || "development"} mode on port ${PORT}`
        );
    });
})();

// ---------- Process-level safety nets ----------

process.on("unhandledRejection", (reason) => {
    console.error("Unhandled Rejection:", reason);
    // In production you may want to gracefully shut down here
});

process.on("uncaughtException", (error) => {
    console.error("Uncaught Exception:", error);
    process.exit(1);
});
