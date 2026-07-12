const mqtt = require('mqtt');

const client = mqtt.connect("mqtt://localhost:1883");

const machines = [
    {
        id: 1,
        machineId: "machine1",
        cycleCount: 0,
        isRunning: true,
        temperature: 25,
    },
    {
        id: 2,
        machineId: "machine2",
        cycleCount: 0,
        isRunning: true,
        temperature: 25,
    },
    {
        id: 3,
        machineId: "machine3",
        cycleCount: 0,
        isRunning: true,
        temperature: 25,
    }
]
client.on("connect", () => {
    console.log("Publisher connected to broker");

    setInterval(() => {
        machines.forEach(machine => {
            if (Math.random() < 0.1) {
                machine.isRunning = !machine.isRunning
            }

            if (machine.isRunning) {
                machine.cycleCount++;
                machine.temperature += (Math.random() - 0.5) * 8;
                machine.temperature = Math.max(150, Math.min(220, machine.temperature))
            }

            const payload = ({
                id: machine.id,
                machineId: machine.machineId,
                status: machine.isRunning ? "running" : "down",
                cycle_count: machine.cycleCount,
                timestamp: new Date().toISOString(),
                temperature: Math.round(machine.temperature * 10) / 10
            })

            client.publish(
                `factory/${machine.machineId}/status`,
                JSON.stringify(payload)
            )
        })
    }, 2000)
})

