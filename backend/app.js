const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
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

// --------------- Error Handling ---------------

app.use(notFound);
app.use(errorHandler);

module.exports = app;
