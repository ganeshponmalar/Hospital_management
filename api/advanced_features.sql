-- 2.1 Refined EMR (Split into Records and Prescriptions)
CREATE TABLE IF NOT EXISTS medical_records (
  id INT PRIMARY KEY AUTO_INCREMENT,
  patient_id INT,
  doctor_id INT,
  diagnosis TEXT,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE,
  FOREIGN KEY (doctor_id) REFERENCES doctors(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS prescriptions (
  id INT PRIMARY KEY AUTO_INCREMENT,
  record_id INT,
  medicine_name VARCHAR(100),
  dosage VARCHAR(50),
  duration VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (record_id) REFERENCES medical_records(id) ON DELETE CASCADE
);

-- 2.2 Doctor Schedule & Slot Logic
CREATE TABLE IF NOT EXISTS doctor_schedule (
  id INT PRIMARY KEY AUTO_INCREMENT,
  doctor_id INT,
  available_date DATE,
  start_time TIME,
  end_time TIME,
  status VARCHAR(20) DEFAULT 'available',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (doctor_id) REFERENCES doctors(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS doctor_slots (
  id INT PRIMARY KEY AUTO_INCREMENT,
  schedule_id INT,
  slot_time TIME,
  is_booked BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (schedule_id) REFERENCES doctor_schedule(id) ON DELETE CASCADE
);

-- 2.3 Refined Queue Management (Daily Tokens)
CREATE TABLE IF NOT EXISTS queue (
  id INT PRIMARY KEY AUTO_INCREMENT,
  patient_id INT,
  doctor_id INT,
  token_number INT,
  queue_date DATE,
  status VARCHAR(20) DEFAULT 'Waiting',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE,
  FOREIGN KEY (doctor_id) REFERENCES doctors(id) ON DELETE CASCADE,
  UNIQUE (doctor_id, queue_date, token_number)
);

-- PERFORMANCE INDEXES
CREATE INDEX idx_patient ON medical_records(patient_id);
CREATE INDEX idx_doctor_schedule ON doctor_schedule(doctor_id);
CREATE INDEX idx_queue ON queue(doctor_id, queue_date);
