const express = require("express");
const router = express.Router();

/**
 * @route   GET /api/health
 * @desc    Health-check endpoint
 * @access  Public
 */
router.get("/health", (_req, res) => {
    res.status(200).json({
        success: true,
        message: "API is running",
    });
});

// Mount feature routes below as the application grows
// Example: router.use("/users", require("./userRoutes"));

module.exports = router;
