const { connectModbus } = require('../config/modbus');

const readMachineStatus = async (machine) => {
    try {
        const client = await connectModbus(machine);
        const registers = await client.readHoldingRegisters(0, 3);

        return {
            cycleCount: registers.data[0],
            temperature: registers.data[1],
            status: registers.data[2] === 1 ? "running" : "down",
            timestamp: Date.now()
        }
    } finally {
        client?.close();
    }
}

module.exports = { readMachineStatus }