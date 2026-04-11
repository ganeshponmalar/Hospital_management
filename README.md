# Hospital Management System

A full-stack enterprise-grade Hospital Management System built with React, Node.js, and MySQL.

## Tech Stack
- **Frontend**: React (Vite), Vanilla CSS, Axios, Lucide React
- **Backend**: Node.js, Express, MySQL (Raw Queries), JWT, Bcrypt
- **Database**: MySQL

## Prerequisites
- Node.js (v16+)
- MySQL Server

## Getting Started

### 1. Database Setup
1. Open your MySQL client.
2. Run the SQL commands found in `api/schema.sql`.

### 2. Backend Setup
1. Navigate to the `api` folder.
2. Update `.env` with your database credentials.
3. Run `npm install`.
4. Run `node server.js` to start the backend.

### 3. Frontend Setup
1. Navigate to the `client` folder.
2. Run `npm install`.
3. Run `npm run dev` to start the frontend.

## Features
- **Authentication**: Role-based access (Admin, Doctor, Receptionist, Patient).
- **Patient Management**: Registration, History, Visits.
- **Doctor Management**: Profiles, Specialization, Availability.
- **Appointment System**: Booking and Scheduling.
- **Billing System**: Consultation Fees, Invoices.
- **Pharmacy**: Inventory and Stock tracking.
- **Lab Reports**: Test results and history.
- **Dashboard**: Analytics for various roles.
