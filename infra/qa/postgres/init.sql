-- ===============================
-- VETRESERVE QA DATABASES
-- ===============================

SELECT 'Initializing QA databases';

-- Identity & Access
CREATE DATABASE identity_access_db;

-- Scheduling & Appointments
CREATE DATABASE scheduling_db;
CREATE DATABASE appointments_db;

-- Client & Pet Domain
CREATE DATABASE client_pet_db;

SELECT 'QA databases initialization finished';

