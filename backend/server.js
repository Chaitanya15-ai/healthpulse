const express = require("express");
const cors = require("cors");
const path = require("path");
require("dotenv").config();

const pool = require("./db");

const app = express();
const PORT = process.env.PORT || 5000;

// ==========================================
// MIDDLEWARE
// ==========================================

app.use(cors());
app.use(express.json());

// ==========================================
// SERVE FRONTEND
// ==========================================

app.use(express.static(path.join(__dirname, "..", "frontend")));

// ==========================================
// HOME
// ==========================================

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "..", "frontend", "index.html"));
});

// ==========================================
// API TEST
// ==========================================

app.get("/api/health", (req, res) => {
    res.json({
        success: true,
        message: "Local Health Survey API is running 🚀"
    });
});

// ==========================================
// DATABASE TEST
// ==========================================

app.get("/api/db-test", async (req, res) => {
    try {
        const result = await pool.query("SELECT NOW()");

        res.json({
            success: true,
            message: "PostgreSQL connected successfully",
            time: result.rows[0].now
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            message: "Database connection failed",
            error: error.message
        });
    }
});

// ==========================================
// GET USER SURVEYS
// ==========================================

app.get("/api/surveys", async (req, res) => {
    try {
        const result = await pool.query(
            "SELECT * FROM health_surveys ORDER BY id DESC"
        );

        res.json({
            success: true,
            count: result.rows.length,
            data: result.rows
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            message: "Failed to fetch surveys",
            error: error.message
        });
    }
});

// ==========================================
// SUBMIT USER SURVEY
// ==========================================

app.post("/api/surveys", async (req, res) => {

    const {
        age,
        gender,
        area,
        occupation,
        water_quality,
        sanitation,
        exercise_hours,
        sleep_hours,
        diet_quality,
        smoking,
        alcohol_consumption,
        diabetes,
        hypertension,
        bmi,
        blood_pressure,
        healthcare_access,
        annual_checkup,
        health_issue
    } = req.body;

    try {

        const query = `
            INSERT INTO health_surveys (
                age,
                gender,
                area,
                occupation,
                water_quality,
                sanitation,
                exercise_hours,
                sleep_hours,
                diet_quality,
                smoking,
                alcohol_consumption,
                diabetes,
                hypertension,
                bmi,
                blood_pressure,
                healthcare_access,
                annual_checkup,
                health_issue
            )
            VALUES (
                $1, $2, $3, $4, $5, $6, $7, $8, $9,
                $10, $11, $12, $13, $14, $15, $16, $17, $18
            )
            RETURNING *;
        `;

        const values = [
            age,
            gender,
            area,
            occupation,
            water_quality,
            sanitation,
            exercise_hours,
            sleep_hours,
            diet_quality,
            smoking,
            alcohol_consumption,
            diabetes,
            hypertension,
            bmi,
            blood_pressure,
            healthcare_access,
            annual_checkup,
            health_issue
        ];

        const result = await pool.query(query, values);

        res.status(201).json({
            success: true,
            message: "Survey submitted successfully",
            data: result.rows[0]
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            success: false,
            message: "Failed to submit survey",
            error: error.message
        });
    }
});

// ==========================================
// NFHS 2019-21 HISTORICAL DATA
// ==========================================

// ------------------------------------------
// NFHS SUMMARY
// ------------------------------------------

app.get("/api/nfhs/summary", async (req, res) => {

    try {

        const query = `
            SELECT
                COUNT(*) AS total_districts,

                ROUND(
                    AVG(electricity_pct)
                    FILTER (
                        WHERE electricity_pct BETWEEN 0 AND 100
                    ),
                    2
                ) AS avg_electricity,

                ROUND(
                    AVG(improved_water_pct)
                    FILTER (
                        WHERE improved_water_pct BETWEEN 0 AND 100
                    ),
                    2
                ) AS avg_water,

                ROUND(
                    AVG(improved_sanitation_pct)
                    FILTER (
                        WHERE improved_sanitation_pct BETWEEN 0 AND 100
                    ),
                    2
                ) AS avg_sanitation,

                ROUND(
                    AVG(stunting_pct)
                    FILTER (
                        WHERE stunting_pct BETWEEN 0 AND 100
                    ),
                    2
                ) AS avg_stunting,

                ROUND(
                    AVG(women_anaemia_pct)
                    FILTER (
                        WHERE women_anaemia_pct BETWEEN 0 AND 100
                    ),
                    2
                ) AS avg_women_anaemia

            FROM nfhs_analysis;
        `;

        const result = await pool.query(query);

        res.json({
            success: true,
            source: "NFHS 2019-21",
            data: result.rows[0]
        });

    } catch (error) {

        console.error("NFHS summary error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to fetch NFHS summary",
            error: error.message
        });
    }
});

// ------------------------------------------
// NFHS STATE-WISE DATA
// ------------------------------------------

app.get("/api/nfhs/states", async (req, res) => {

    try {

        const query = `
            SELECT
                state_ut,
                COUNT(*) AS districts,

                ROUND(
                    AVG(electricity_pct)
                    FILTER (
                        WHERE electricity_pct BETWEEN 0 AND 100
                    ),
                    2
                ) AS electricity,

                ROUND(
                    AVG(improved_water_pct)
                    FILTER (
                        WHERE improved_water_pct BETWEEN 0 AND 100
                    ),
                    2
                ) AS water,

                ROUND(
                    AVG(improved_sanitation_pct)
                    FILTER (
                        WHERE improved_sanitation_pct BETWEEN 0 AND 100
                    ),
                    2
                ) AS sanitation,

                ROUND(
                    AVG(stunting_pct)
                    FILTER (
                        WHERE stunting_pct BETWEEN 0 AND 100
                    ),
                    2
                ) AS stunting,

                ROUND(
                    AVG(women_anaemia_pct)
                    FILTER (
                        WHERE women_anaemia_pct BETWEEN 0 AND 100
                    ),
                    2
                ) AS women_anaemia

            FROM nfhs_analysis

            WHERE state_ut IS NOT NULL

            GROUP BY state_ut

            ORDER BY state_ut;
        `;

        const result = await pool.query(query);

        res.json({
            success: true,
            source: "NFHS 2019-21",
            count: result.rows.length,
            data: result.rows
        });

    } catch (error) {

        console.error("NFHS states error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to fetch NFHS state data",
            error: error.message
        });
    }
});

// ------------------------------------------
// NFHS DISTRICT-WISE DATA
// ------------------------------------------

app.get("/api/nfhs/districts", async (req, res) => {

    try {

        const query = `
            SELECT
                district_name,
                state_ut,
                electricity_pct,
                improved_water_pct,
                improved_sanitation_pct,
                stunting_pct,
                women_anaemia_pct

            FROM nfhs_analysis

            ORDER BY state_ut, district_name;
        `;

        const result = await pool.query(query);

        res.json({
            success: true,
            source: "NFHS 2019-21",
            count: result.rows.length,
            data: result.rows
        });

    } catch (error) {

        console.error("NFHS districts error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to fetch NFHS district data",
            error: error.message
        });
    }
});

// ==========================================
// START SERVER
// ==========================================

app.listen(PORT, () => {

    console.log("");

    console.log("======================================");
    console.log("     LOCAL HEALTH SURVEY 🚑");
    console.log("======================================");

    console.log(`Server running at http://localhost:${PORT}`);

    console.log("======================================");

    console.log("");
});