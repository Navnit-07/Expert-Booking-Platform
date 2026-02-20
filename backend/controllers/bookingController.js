const Booking = require("../models/Booking");
const Expert = require("../models/Expert");
const { getIO } = require("../sockets");
const { emitSlotBooked } = require("../sockets/bookingHandler");

const createBooking = async (req, res, next) => {
    try {
        const { expert: expertId, name, email, phone, date, timeSlot, notes } = req.body;

        if (!expertId || !name || !email || !phone || !date || !timeSlot) {
            res.status(400);
            throw new Error("All required fields must be provided: expert, name, email, phone, date, timeSlot");
        }

        const bookingDate = new Date(date);

        const updatedExpert = await Expert.findOneAndUpdate(
            {
                _id: expertId,
                "availableSlots.date": bookingDate,
                "availableSlots.slots": timeSlot,
            },
            {
                $pull: {
                    "availableSlots.$.slots": timeSlot,
                },
            },
            { new: true }
        );

        if (!updatedExpert) {
            res.status(409);
            throw new Error("Slot is not available — it may have already been booked or does not exist");
        }

        const booking = await Booking.create({
            expert: expertId,
            name,
            email,
            phone,
            date: bookingDate,
            timeSlot,
            notes,
        });

        emitSlotBooked(getIO(), { expertId, date: bookingDate, timeSlot });

        res.status(201).json({
            success: true,
            data: booking,
        });
    } catch (error) {
        if (error.name === "ValidationError") {
            res.status(400);
            error.message = Object.values(error.errors)
                .map((e) => e.message)
                .join(", ");
        }
        next(error);
    }
};

const getBookings = async (req, res, next) => {
    try {
        const { email } = req.query;

        if (!email) {
            res.status(400);
            throw new Error("Email query parameter is required");
        }

        const bookings = await Booking.find({ email: email.toLowerCase() })
            .populate("expert", "name category")
            .select("-__v")
            .sort({ createdAt: -1 })
            .lean();

        res.status(200).json({
            success: true,
            count: bookings.length,
            data: bookings,
        });
    } catch (error) {
        next(error);
    }
};

const updateBookingStatus = async (req, res, next) => {
    try {
        const { status } = req.body;
        const validStatuses = ["Pending", "Confirmed", "Completed"];

        if (!status || !validStatuses.includes(status)) {
            res.status(400);
            throw new Error(`Status must be one of: ${validStatuses.join(", ")}`);
        }

        const booking = await Booking.findByIdAndUpdate(
            req.params.id,
            { status },
            { new: true, runValidators: true }
        )
            .populate("expert", "name category")
            .select("-__v");

        if (!booking) {
            res.status(404);
            throw new Error("Booking not found");
        }

        res.status(200).json({
            success: true,
            data: booking,
        });
    } catch (error) {
        if (error.name === "CastError" && error.kind === "ObjectId") {
            res.status(400);
            error.message = "Invalid booking ID format";
        }
        next(error);
    }
};

module.exports = { createBooking, getBookings, updateBookingStatus };
