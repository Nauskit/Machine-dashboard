const client = require('./config/mqtt');
const { findAllActiveMachines } = require('./models/machine.model')
const { readMachineStatus } = require('./services/modbus.service')


const publisher = () => {
    setInterval(async () => {
        try {
            const machines = await findAllActiveMachines();

            for (const machine of machines) {
                try {
                    const data = await readMachineStatus(machine);
                    client.publish(
                        machine.topic,
                        JSON.stringify(data)
                    );
                    console.log(`Publisher ${machine.machine_id}`);

                } catch (err) {
                    console.error(machine.machine_id, err);
                };
            }
        } catch (err) {
            console.error("Load machine error: ", err.message);
        }
    }, 2000)


}


publisher();