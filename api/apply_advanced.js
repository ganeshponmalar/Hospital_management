const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

async function run() {
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME
    });

    console.log('Connected to MySQL server...');

    try {
        const sqlPath = path.join(__dirname, 'advanced_features.sql');
        const sql = fs.readFileSync(sqlPath, 'utf8');

        // Split by semicolon and filter out empty strings
        const queries = sql.split(';').filter(q => q.trim().length > 0);

        for (let query of queries) {
            console.log('Executing:', query.substring(0, 50) + '...');
            await connection.query(query);
        }

        console.log('Advanced features applied successfully!');
    } catch (err) {
        console.error('Error applying advanced features:', err.message);
    } finally {
        await connection.end();
        process.exit();
    }
}

run();
