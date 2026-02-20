const registerBookingHandlers = (io, socket) => {
    socket.on("joinExpertRoom", (expertId) => {
        socket.join(`expert:${expertId}`);
        console.log(`Socket ${socket.id} joined room expert:${expertId}`);
    });

    socket.on("leaveExpertRoom", (expertId) => {
        socket.leave(`expert:${expertId}`);
        console.log(`Socket ${socket.id} left room expert:${expertId}`);
    });
};

const emitSlotBooked = (io, { expertId, date, timeSlot }) => {
    const payload = { expertId, date, timeSlot };

    io.emit("slotBooked", payload);

    io.to(`expert:${expertId}`).emit("expertSlotUpdate", payload);
};

module.exports = { registerBookingHandlers, emitSlotBooked };
