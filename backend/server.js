const express = require('express');
const http = require('http');
const { Server } = require("socket.io");
const client = require('./config/mqtt')

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: "http://localhost:5173"
    }
})


client.on("connect", () => {
    console.log("MQTT Conneted");
    client.subscribe("factory/+/status");
})

client.on("message", (topic, message) => {
    const data = JSON.parse(message.toString());

    console.log(data);

    io.emit("machine-status", data)
})

server.listen(3000, () => {
    console.log("Server running");
})