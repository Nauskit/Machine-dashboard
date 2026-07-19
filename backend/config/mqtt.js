const mqtt = require('mqtt');

const client = mqtt.connect('mqtt://localhost:1883');


client.on('connect', () => {
    console.log("MQTT Connected!");
})

client.on("error", (err) => {
    console.error("MQTT Error: ", err.message);
})

module.exports = client