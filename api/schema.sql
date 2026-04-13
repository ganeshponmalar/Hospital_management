-- Hospital Management System Database Schema (SIMPLIFIED)

CREATE DATABASE IF NOT EXISTS hospital_db;
USE hospital_db;

-- Drop existing tables to apply new schema
DROP TABLE IF EXISTS discharge_summary;
DROP TABLE IF EXISTS admissions;
DROP TABLE IF EXISTS beds;
DROP TABLE IF EXISTS wards;
DROP TABLE IF EXISTS lab_results;
DROP TABLE IF EXISTS lab_order_items;
DROP TABLE IF EXISTS lab_orders;
DROP TABLE IF EXISTS lab_tests;
DROP TABLE IF EXISTS lab_reports;
DROP TABLE IF EXISTS stock_history;
DROP TABLE IF EXISTS sale_items;
DROP TABLE IF EXISTS sales;
DROP TABLE IF EXISTS purchase_items;
DROP TABLE IF EXISTS purchases;
DROP TABLE IF EXISTS medicine_batches;
DROP TABLE IF EXISTS billing;
DROP TABLE IF EXISTS appointments;
DROP TABLE IF EXISTS medicines;
DROP TABLE IF EXISTS suppliers;
DROP TABLE IF EXISTS patients;
DROP TABLE IF EXISTS doctors;
DROP TABLE IF EXISTS staff;
DROP TABLE IF EXISTS users;

-- Users Table (Still used for Auth)
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    email VARCHAR(100),
    role ENUM('admin', 'doctor', 'receptionist', 'patient', 'nurse') NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Patients Table (SIMPLIFIED ✅)
CREATE TABLE IF NOT EXISTS patients (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  age INT,
  gender VARCHAR(10),
  date_of_birth DATE,
  phone VARCHAR(20),
  email VARCHAR(100),
  address TEXT,
  blood_group VARCHAR(10),
  allergies TEXT,
  medical_history TEXT,
  emergency_contact_name VARCHAR(100),
  emergency_contact_phone VARCHAR(20),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Doctors Table (SIMPLIFIED ✅)
CREATE TABLE IF NOT EXISTS doctors (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    specialization VARCHAR(100) NOT NULL,
    qualification VARCHAR(100),
    experience INT,
    phone VARCHAR(20),
    email VARCHAR(100),
    consultation_fee DECIMAL(10, 2),
    available_days VARCHAR(50),
    available_time VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Appointments Table (SIMPLIFIED ✅)
CREATE TABLE IF NOT EXISTS appointments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    patient_id INT NOT NULL,
    doctor_id INT NOT NULL,
    appointment_date DATETIME NOT NULL,
    status ENUM('Pending', 'Confirmed', 'Cancelled', 'Completed') DEFAULT 'Pending',
    reason TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE,
    FOREIGN KEY (doctor_id) REFERENCES doctors(id) ON DELETE CASCADE
);

-- Billing Table
CREATE TABLE IF NOT EXISTS billing (
    id INT AUTO_INCREMENT PRIMARY KEY,
    patient_id INT NOT NULL,
    total_amount DECIMAL(10, 2) NOT NULL,
    status ENUM('Unpaid', 'Paid') DEFAULT 'Unpaid',
    billing_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    description TEXT,
    FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE
);

-- Pharmacy Module Tables

CREATE TABLE IF NOT EXISTS medicines (
    id INT AUTO_INCREMENT PRIMARY KEY,
    medicine_name VARCHAR(100) NOT NULL,
    category VARCHAR(50),
    reorder_level INT DEFAULT 10,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS suppliers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    supplier_name VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    email VARCHAR(100),
    address TEXT
);

CREATE TABLE IF NOT EXISTS medicine_batches (
    id INT AUTO_INCREMENT PRIMARY KEY,
    medicine_id INT NOT NULL,
    batch_no VARCHAR(50) NOT NULL,
    supplier_id INT,
    expiry_date DATE NOT NULL,
    manufacture_date DATE,
    quantity INT NOT NULL DEFAULT 0,
    purchase_price DECIMAL(10, 2),
    selling_price DECIMAL(10, 2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (medicine_id) REFERENCES medicines(id) ON DELETE CASCADE,
    FOREIGN KEY (supplier_id) REFERENCES suppliers(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS purchases (
    id INT AUTO_INCREMENT PRIMARY KEY,
    supplier_id INT NOT NULL,
    purchase_date DATE NOT NULL,
    total_amount DECIMAL(10, 2) DEFAULT 0.00,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (supplier_id) REFERENCES suppliers(id) ON DELETE RESTRICT
);

CREATE TABLE IF NOT EXISTS purchase_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    purchase_id INT NOT NULL,
    medicine_id INT NOT NULL,
    batch_no VARCHAR(50) NOT NULL,
    quantity INT NOT NULL,
    price_per_unit DECIMAL(10, 2) NOT NULL,
    FOREIGN KEY (purchase_id) REFERENCES purchases(id) ON DELETE CASCADE,
    FOREIGN KEY (medicine_id) REFERENCES medicines(id) ON DELETE RESTRICT
);

CREATE TABLE IF NOT EXISTS sales (
    id INT AUTO_INCREMENT PRIMARY KEY,
    patient_id INT NOT NULL,
    sale_date DATE NOT NULL,
    total_amount DECIMAL(10, 2) NOT NULL,
    discount DECIMAL(10, 2) DEFAULT 0.00,
    tax DECIMAL(10, 2) DEFAULT 0.00,
    payment_method VARCHAR(50),
    payment_status ENUM('Unpaid', 'Paid', 'Partial') DEFAULT 'Paid',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE RESTRICT
);

CREATE TABLE IF NOT EXISTS sale_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    sale_id INT NOT NULL,
    medicine_id INT NOT NULL,
    batch_id INT NOT NULL,
    quantity INT NOT NULL,
    unit_price DECIMAL(10, 2) NOT NULL,
    total_price DECIMAL(10, 2) NOT NULL,
    FOREIGN KEY (sale_id) REFERENCES sales(id) ON DELETE CASCADE,
    FOREIGN KEY (medicine_id) REFERENCES medicines(id) ON DELETE RESTRICT,
    FOREIGN KEY (batch_id) REFERENCES medicine_batches(id) ON DELETE RESTRICT
);

CREATE TABLE IF NOT EXISTS stock_history (
    id INT AUTO_INCREMENT PRIMARY KEY,
    medicine_id INT NOT NULL,
    batch_id INT,
    action ENUM('Purchase', 'Sale', 'Adjustment') NOT NULL,
    quantity_change INT NOT NULL,
    reason TEXT,
    user_id INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (medicine_id) REFERENCES medicines(id) ON DELETE CASCADE,
    FOREIGN KEY (batch_id) REFERENCES medicine_batches(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

-- Lab Reports (Outdated structure removed)

-- New Enterprise Lab Report Module Tables
CREATE TABLE IF NOT EXISTS lab_tests (
    id INT AUTO_INCREMENT PRIMARY KEY,
    test_name VARCHAR(150) NOT NULL,
    category VARCHAR(100),
    reference_range VARCHAR(100),
    unit VARCHAR(50),
    price DECIMAL(10,2) DEFAULT 0.00,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS lab_orders (
    id INT AUTO_INCREMENT PRIMARY KEY,
    patient_id INT NOT NULL,
    doctor_id INT,
    order_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    status ENUM('Pending','In Progress','Completed','Approved') DEFAULT 'Pending',
    technician_id INT,
    verified_by INT,
    total_amount DECIMAL(10,2) DEFAULT 0.00,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE RESTRICT,
    FOREIGN KEY (doctor_id) REFERENCES doctors(id) ON DELETE SET NULL,
    FOREIGN KEY (technician_id) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (verified_by) REFERENCES users(id) ON DELETE SET NULL
);
CREATE INDEX idx_patient ON lab_orders(patient_id);

CREATE TABLE IF NOT EXISTS lab_order_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    order_id INT NOT NULL,
    test_id INT NOT NULL,
    price DECIMAL(10,2) DEFAULT 0.00,
    FOREIGN KEY (order_id) REFERENCES lab_orders(id) ON DELETE CASCADE,
    FOREIGN KEY (test_id) REFERENCES lab_tests(id) ON DELETE RESTRICT
);
CREATE INDEX idx_order ON lab_order_items(order_id);

CREATE TABLE IF NOT EXISTS lab_results (
    id INT AUTO_INCREMENT PRIMARY KEY,
    order_item_id INT NOT NULL,
    result_value VARCHAR(100),
    reference_range VARCHAR(100),
    unit VARCHAR(50),
    flag ENUM('Normal','High','Low'),
    remarks TEXT,
    report_file VARCHAR(255),
    FOREIGN KEY (order_item_id) REFERENCES lab_order_items(id) ON DELETE CASCADE
);

-- Wards Table
CREATE TABLE IF NOT EXISTS wards (
  id INT AUTO_INCREMENT PRIMARY KEY,
  ward_name VARCHAR(100) NOT NULL,
  ward_type VARCHAR(50), -- General, ICU, Semi-Private, Private
  capacity INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Beds Table
CREATE TABLE IF NOT EXISTS beds (
  id INT AUTO_INCREMENT PRIMARY KEY,
  ward_id INT,
  bed_number VARCHAR(20) NOT NULL,
  status ENUM('available', 'occupied', 'maintenance') DEFAULT 'available',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (ward_id) REFERENCES wards(id) ON DELETE CASCADE
);
CREATE INDEX idx_ward ON beds(ward_id);
CREATE INDEX idx_bed_status ON beds(status);

-- Admissions Table
CREATE TABLE IF NOT EXISTS admissions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  patient_id INT,
  doctor_id INT,
  bed_id INT,

  admission_date DATETIME DEFAULT CURRENT_TIMESTAMP,
  reason TEXT,
  admission_type VARCHAR(50), -- Emergency / Planned

  status ENUM('admitted','discharged') DEFAULT 'admitted',

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (patient_id) REFERENCES patients(id),
  FOREIGN KEY (doctor_id) REFERENCES doctors(id),
  FOREIGN KEY (bed_id) REFERENCES beds(id)
);
CREATE INDEX idx_admission_patient ON admissions(patient_id);
CREATE INDEX idx_admission_doctor ON admissions(doctor_id);
CREATE INDEX idx_admission_bed ON admissions(bed_id);

-- Discharge Summary Table
CREATE TABLE IF NOT EXISTS discharge_summary (
  id INT AUTO_INCREMENT PRIMARY KEY,
  admission_id INT,

  discharge_date DATETIME,
  final_diagnosis TEXT,
  treatment_given TEXT,
  medications TEXT,
  doctor_notes TEXT,

  follow_up_date DATE,

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (admission_id) REFERENCES admissions(id)
);
CREATE INDEX idx_discharge_admission ON discharge_summary(admission_id);
