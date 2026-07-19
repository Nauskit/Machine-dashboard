const modbusRTU = require('modbus-serial');




const connectModbus = async (machine) => {
    try {
        const client = new modbusRTU();
        await client.connectTCP(machine.host, {
            port: machine.port,
        })
        client.setID(machine.slaveId);
        console.log(`Connected ${machine.id}`);

        return client
    } catch (err) {
        throw (err)
    }

}

module.exports = { connectModbus };
