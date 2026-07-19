const ModbusRTU = require('modbus-serial')


const vector = {
    getHoldingRegister: function (addr, unitId, callback) {
        callback(null, holdingRegisters[addr] || 0)
    },
    setRegister: function (addr, value, unitId, callback) {
        holdingRegisters[addr] = value;
        callback(null)
    }
}


let holdingRegisters = {
    0: 0,  //cycle_count
    1: 25,  //temperature
    2: 1,  //status 1 = running
}

const server = new ModbusRTU.ServerTCP(vector, {
    host: "0.0.0.0",
    port: 8502,
    unitID: 1
})

server.on("socketError", (err) => {
    console.error("Server socket error:", err);
})

console.log("Modbus Slave simulator running on port 8502");

setInterval(() => {
    if (Math.random() < 0.1) {
        holdingRegisters[2] = holdingRegisters[2] === 1 ? 0 : 1
        console.log(`Status changed to: ${holdingRegisters[2] === 1 ? "running" : "down"}`);
    }
    if (holdingRegisters[2] === 1) {
        holdingRegisters[0]++;
    }


    holdingRegisters[1]
}, 2000)