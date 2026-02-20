const mongoose = require("mongoose");

const availableSlotSchema = new mongoose.Schema(
    {
        date: {
            type: Date,
            required: [true, "Slot date is required"],
        },
        slots: {
            type: [String],
            default: [],
        },
    },
    { _id: false }
);

const expertSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, "Expert name is required"],
            trim: true,
            maxlength: [100, "Name cannot exceed 100 characters"],
        },
        category: {
            type: String,
            required: [true, "Category is required"],
            trim: true,
        },
        experience: {
            type: Number,
            required: [true, "Experience is required"],
            min: [0, "Experience cannot be negative"],
        },
        rating: {
            type: Number,
            default: 0,
            min: [0, "Rating cannot be less than 0"],
            max: [5, "Rating cannot exceed 5"],
        },
        bio: {
            type: String,
            trim: true,
            maxlength: [1000, "Bio cannot exceed 1000 characters"],
        },
        availableSlots: [availableSlotSchema],
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model("Expert", expertSchema);
