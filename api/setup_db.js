const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

async function setup() {
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
    });

    console.log('Connected to MySQL server...');

    try {
        // 1. Create Database
        await connection.query(`CREATE DATABASE IF NOT EXISTS ${process.env.DB_NAME};`);
        console.log(`Database "${process.env.DB_NAME}" created or already exists.`);

        // 2. Switch to Database
        await connection.query(`USE ${process.env.DB_NAME};`);

        // 3. Read and execute Schema.sql
        const schemaPath = path.join(__dirname, 'schema.sql');
        const schema = fs.readFileSync(schemaPath, 'utf8');

        // Split by semicolon and filter out empty strings
        const queries = schema.split(';').filter(q => q.trim().length > 0);

        for (let query of queries) {
            await connection.query(query);
        }

        console.log('All tables created successfully!');
    } catch (err) {
        console.error('Error during setup:', err.message);
        console.log('\nTIP: Make sure your DB_USER and DB_PASSWORD in the .env file are correct!');
    } finally {
        await connection.end();
        process.exit();
    }
}

setup();
