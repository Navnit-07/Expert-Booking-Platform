const Expert = require("../models/Expert");

const getExperts = async (req, res, next) => {
    try {
        const {
            page = 1,
            limit = 5,
            search = "",
            category = "",
        } = req.query;

        const pageNum = Math.max(1, parseInt(page, 10) || 1);
        const limitNum = Math.max(1, Math.min(50, parseInt(limit, 10) || 5));
        const skip = (pageNum - 1) * limitNum;

        const filter = {};

        if (search) {
            filter.name = { $regex: search, $options: "i" };
        }

        if (category) {
            filter.category = { $regex: `^${category}$`, $options: "i" };
        }

        const [experts, total] = await Promise.all([
            Expert.find(filter)
                .select("-__v")
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limitNum)
                .lean(),
            Expert.countDocuments(filter),
        ]);

        res.status(200).json({
            success: true,
            count: experts.length,
            total,
            page: pageNum,
            totalPages: Math.ceil(total / limitNum),
            data: experts,
        });
    } catch (error) {
        next(error);
    }
};

const getExpertById = async (req, res, next) => {
    try {
        const expert = await Expert.findById(req.params.id)
            .select("-__v")
            .lean();

        if (!expert) {
            res.status(404);
            throw new Error("Expert not found");
        }

        res.status(200).json({
            success: true,
            data: expert,
        });
    } catch (error) {
        if (error.name === "CastError" && error.kind === "ObjectId") {
            res.status(400);
            error.message = "Invalid expert ID format";
        }
        next(error);
    }
};

module.exports = { getExperts, getExpertById };
