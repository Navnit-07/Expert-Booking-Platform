import { io } from "socket.io-client";

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || "http://localhost:5000";

const socket = io(SOCKET_URL, {
    autoConnect: false,
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 2000,
});


export const connectSocket = () => {
    if (!socket.connected) {
        socket.connect();
    }
};

export const disconnectSocket = () => {
    if (socket.connected) {
        socket.disconnect();
    }
};

export const joinExpertRoom = (expertId) => {
    socket.emit("joinExpertRoom", expertId);
};

export const leaveExpertRoom = (expertId) => {
    socket.emit("leaveExpertRoom", expertId);
};

export default socket;
