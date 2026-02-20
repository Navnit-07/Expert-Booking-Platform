const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema(
    {
        expert: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Expert",
            required: [true, "Expert reference is required"],
        },
        name: {
            type: String,
            required: [true, "Client name is required"],
            trim: true,
            maxlength: [100, "Name cannot exceed 100 characters"],
        },
        email: {
            type: String,
            required: [true, "Email is required"],
            trim: true,
            lowercase: true,
            match: [
                /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
                "Please provide a valid email address",
            ],
        },
        phone: {
            type: String,
            required: [true, "Phone number is required"],
            trim: true,
        },
        date: {
            type: Date,
            required: [true, "Booking date is required"],
        },
        timeSlot: {
            type: String,
            required: [true, "Time slot is required"],
            trim: true,
        },
        notes: {
            type: String,
            trim: true,
            maxlength: [500, "Notes cannot exceed 500 characters"],
        },
        status: {
            type: String,
            enum: {
                values: ["Pending", "Confirmed", "Completed"],
                message: "{VALUE} is not a valid status",
            },
            default: "Pending",
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model("Booking", bookingSchema);
