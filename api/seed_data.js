const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
require('dotenv').config();

async function seed() {
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME
    });

    try {
        await connection.query('SET FOREIGN_KEY_CHECKS = 0');
        const hashedPassword = await bcrypt.hash('password123', 10);
        await connection.query('DELETE FROM users WHERE username = "admin"');
        await connection.query(
            'INSERT INTO users (username, password, role) VALUES (?, ?, ?)',
            ['admin', hashedPassword, 'admin']
        );
        console.log('✅ Admin user "admin" with password "password123" created.');

        // Seed some wards and beds
        await connection.query('DELETE FROM wards');
        const [ward] = await connection.query('INSERT INTO wards (ward_name, ward_type, capacity) VALUES ("General Ward A", "General", 20)');
        await connection.query('INSERT INTO beds (ward_id, bed_number, status) VALUES (?, "B-101", "available")', [ward.insertId]);
        await connection.query('INSERT INTO beds (ward_id, bed_number, status) VALUES (?, "B-102", "available")', [ward.insertId]);
        console.log('✅ Wards and beds seeded.');

        // Seed some doctors and patients
        await connection.query('DELETE FROM doctors');
        await connection.query('INSERT INTO doctors (name, specialization) VALUES ("Dr. Smith", "Cardiology")');

        await connection.query('DELETE FROM patients');
        await connection.query('INSERT INTO patients (name, age, gender) VALUES ("John Doe", 45, "Male")');
        console.log('✅ Doctors and patients seeded.');

        await connection.query('SET FOREIGN_KEY_CHECKS = 1');
    } catch (err) {
        console.error('Seed Error:', err.message);
    } finally {
        await connection.end();
    }
}

seed();
