CREATE TABLE IF NOT EXISTS health_surveys (
    id SERIAL PRIMARY KEY,

    age INTEGER NOT NULL,
    gender VARCHAR(20) NOT NULL,
    area VARCHAR(100) NOT NULL,

    occupation VARCHAR(100),
    water_quality VARCHAR(20),
    sanitation VARCHAR(20),

    exercise_hours DECIMAL(4,1),
    sleep_hours DECIMAL(4,1),

    diet_quality VARCHAR(20),

    smoking VARCHAR(20),
    alcohol_consumption VARCHAR(20),

    diabetes VARCHAR(10),
    hypertension VARCHAR(10),

    bmi DECIMAL(5,2),
    blood_pressure VARCHAR(30),

    healthcare_access VARCHAR(20),
    annual_checkup VARCHAR(20),

    health_issue TEXT,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);