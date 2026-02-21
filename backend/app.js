const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const path = require("path");
const { notFound, errorHandler } = require("./middlewares/errorHandler");
const apiRoutes = require("./routes");

const app = express();

// --------------- Global Middleware ---------------

// Enable CORS for all origins (tighten in production)
app.use(cors());

// HTTP request logger — use "combined" format in production for richer logs
app.use(morgan(process.env.NODE_ENV === "production" ? "combined" : "dev"));

// Parse incoming JSON & URL-encoded payloads
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// --------------- API Routes ---------------

app.use("/api", apiRoutes);

// --------------- Production Build ---------------

if (process.env.NODE_ENV === "production") {
    const frontendPath = path.join(__dirname, "../frontend/dist");
    app.use(express.static(frontendPath));

    app.get("*", (req, res) => {
        res.sendFile(path.resolve(frontendPath, "index.html"));
    });
}

// --------------- Error Handling ---------------

app.use(notFound);
app.use(errorHandler);

module.exports = app;

