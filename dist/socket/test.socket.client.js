"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const socket_io_client_1 = require("socket.io-client");
const socket = (0, socket_io_client_1.io)("http://localhost:8000", {
    auth: {
        token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI0YjUxYjYyMi02YjljLTRjODktOGQ5Zi1hN2Y1NDBlYmExNmEiLCJyb2xlIjoidXNlciIsImlhdCI6MTc2NDM3MDM2MiwiZXhwIjoxNzY0NDU2NzYyfQ.CCCR69TE9YOvdIokh86WS2YF8RfofwNvsNLCTjhny14", // replace with a real JWT containing userId
    },
    transports: ["websocket"],
});
socket.on("connect", () => console.log("✅ Connected!"));
socket.on("connect_error", (err) => console.error("❌ Connection error:", err.message));
socket.on("orderUpdate", (data) => console.log("📦 Order update:", data));
socket.on("disconnect", () => console.log("❌ Disconnected"));
process.stdin.resume();
