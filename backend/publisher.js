const mqtt = require('mqtt');

const client = mqtt.connect("mqtt://localhost:1883");

let cycleCount = 0;
let isRunning = true

client.on("connect", () => {
    console.log("Publisher connected to broker");

    setInterval(() => {
        if (Math.random() < 0.1) {
            isRunning = !isRunning;
        }
        if (isRunning) {
            cycleCount++;
        }

        const payload = {
            status: isRunning ? "running" : "down",
            cycle_count: cycleCount,
            timestamp: new Date().toISOString(),
        };

        client.publish("factory/machine1/status", JSON.stringify(payload));
        console.log("published", payload);
    }, 2000)
})

