const ModbusRTU = require('modbus-serial');


const client = new ModbusRTU();

const connectAndPoll = async () => {
    try {
        await client.connectTCP("localhost", { port: 8502 });
        client.setID(1);
        console.log("Master connected to Modbus slave");

        setInterval(() => {
            try {
                const data = client.readHoldingRegisters(0, 3);
                const cycleCount = data.data[0];
                const temperature = data.data[1]
                const status = data.data[2] === 1 ? "running" : "down"

                console.log(`[Modbus] cycle = ${cycleCount} temp = ${temperature} status = ${status}`);
            } catch (err) {
                console.error("Read error:", err.message);
            }
        }, 2000)
    } catch (err) {
        console.error("Read error:", err.message);
    }
}