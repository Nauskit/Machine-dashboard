const { pool } = require('../config/db')


const findAllActiveMachines = async () => {
    const result = await pool.query(
        `SELECT * FROM machines WHERE enabled = true`
    );
    return result.rows;
}

const insertDataMachines = async () => {
    const result = await pool.query(

    )
}

module.exports = { findAllActiveMachines }
