let genderChart;
let conditionsChart;
let areaChart;
let lifestyleChart;
let healthcareChart;
let nfhsChart;


// ==========================================
// LOAD DASHBOARD DATA
// ==========================================

async function loadDashboard() {

    const tableMessage = document.getElementById("tableMessage");
    const nfhsMessage = document.getElementById("nfhsMessage");

    try {

        tableMessage.textContent = "Loading survey data...";
        nfhsMessage.textContent = "Loading NFHS historical data...";


        // ------------------------------------------
        // LOAD HEALTHPULSE SURVEY DATA
        // ------------------------------------------

        const surveyResponse = await fetch("/api/surveys");

        if (!surveyResponse.ok) {
            throw new Error("Failed to fetch survey data");
        }

        const surveyResult = await surveyResponse.json();

        const surveys = surveyResult.data || [];

        updateStatistics(surveys);
        updateCharts(surveys);
        updateTable(surveys);


        // ------------------------------------------
        // LOAD NFHS 2019-21 DATA
        // ------------------------------------------

        const nfhsResponse = await fetch("/api/nfhs/summary");

        if (!nfhsResponse.ok) {
            throw new Error("Failed to fetch NFHS data");
        }

        const nfhsResult = await nfhsResponse.json();

        if (!nfhsResult.success) {
            throw new Error("NFHS API returned an error");
        }

        updateNFHS(nfhsResult.data);

    } catch (error) {

        console.error("Dashboard error:", error);

        tableMessage.textContent =
            "Unable to load survey data. Please make sure the server is running.";

        nfhsMessage.textContent =
            "Unable to load NFHS historical data.";

    }
}


// ==========================================
// HEALTHPULSE STATISTICS
// ==========================================

function updateStatistics(surveys) {

    const total = surveys.length;

    document.getElementById("totalRespondents").textContent = total;


    // Average age

    const ages = surveys
        .map(item => Number(item.age))
        .filter(value => !isNaN(value));

    const averageAge =
        ages.length > 0
            ? ages.reduce((sum, value) => sum + value, 0) / ages.length
            : 0;

    document.getElementById("averageAge").textContent =
        averageAge.toFixed(1);


    // Average BMI

    const bmiValues = surveys
        .map(item => Number(item.bmi))
        .filter(value => !isNaN(value) && value > 0);

    const averageBMI =
        bmiValues.length > 0
            ? bmiValues.reduce((sum, value) => sum + value, 0) /
              bmiValues.length
            : 0;

    document.getElementById("averageBMI").textContent =
        averageBMI.toFixed(1);


    // Diabetes

    const diabetesCount = surveys.filter(item =>
        String(item.diabetes).toLowerCase() === "yes"
    ).length;

    document.getElementById("diabetesCount").textContent =
        diabetesCount;


    // Hypertension

    const hypertensionCount = surveys.filter(item =>
        String(item.hypertension).toLowerCase() === "yes"
    ).length;

    document.getElementById("hypertensionCount").textContent =
        hypertensionCount;
}


// ==========================================
// GENERIC COUNT FUNCTION
// ==========================================

function countValues(data, property) {

    const counts = {};

    data.forEach(item => {

        let value = item[property];

        if (!value) {
            value = "Not specified";
        }

        value = String(value);

        counts[value] = (counts[value] || 0) + 1;

    });

    return counts;
}


// ==========================================
// CREATE / UPDATE SURVEY CHARTS
// ==========================================

function updateCharts(surveys) {

    createGenderChart(surveys);

    createConditionsChart(surveys);

    createAreaChart(surveys);

    createLifestyleChart(surveys);

    createHealthcareChart(surveys);
}


// ==========================================
// GENDER CHART
// ==========================================

function createGenderChart(surveys) {

    const counts = countValues(surveys, "gender");

    const labels = Object.keys(counts);

    const values = Object.values(counts);


    if (genderChart) {
        genderChart.destroy();
    }


    genderChart = new Chart(
        document.getElementById("genderChart"),
        {
            type: "doughnut",

            data: {

                labels: labels,

                datasets: [
                    {
                        data: values
                    }
                ]

            },

            options: {

                responsive: true,

                maintainAspectRatio: false,

                plugins: {

                    legend: {
                        position: "bottom"
                    }

                }

            }

        }
    );
}


// ==========================================
// CONDITIONS CHART
// ==========================================

function createConditionsChart(surveys) {

    const diabetes = surveys.filter(item =>
        String(item.diabetes).toLowerCase() === "yes"
    ).length;


    const hypertension = surveys.filter(item =>
        String(item.hypertension).toLowerCase() === "yes"
    ).length;


    if (conditionsChart) {
        conditionsChart.destroy();
    }


    conditionsChart = new Chart(
        document.getElementById("conditionsChart"),
        {
            type: "bar",

            data: {

                labels: [
                    "Diabetes",
                    "Hypertension"
                ],

                datasets: [
                    {
                        label: "Reported Cases",

                        data: [
                            diabetes,
                            hypertension
                        ]
                    }
                ]

            },

            options: {

                responsive: true,

                maintainAspectRatio: false,

                scales: {

                    y: {
                        beginAtZero: true,

                        ticks: {
                            precision: 0
                        }
                    }

                },

                plugins: {

                    legend: {
                        display: false
                    }

                }

            }

        }
    );
}


// ==========================================
// AREA CHART
// ==========================================

function createAreaChart(surveys) {

    const counts = countValues(surveys, "area");

    const labels = Object.keys(counts);

    const values = Object.values(counts);


    if (areaChart) {
        areaChart.destroy();
    }


    areaChart = new Chart(
        document.getElementById("areaChart"),
        {
            type: "bar",

            data: {

                labels: labels,

                datasets: [
                    {
                        label: "Respondents",

                        data: values
                    }
                ]

            },

            options: {

                responsive: true,

                maintainAspectRatio: false,

                scales: {

                    y: {

                        beginAtZero: true,

                        ticks: {
                            precision: 0
                        }

                    }

                },

                plugins: {

                    legend: {
                        display: false
                    }

                }

            }

        }
    );
}


// ==========================================
// LIFESTYLE CHART
// ==========================================

function createLifestyleChart(surveys) {

    const exercise = surveys
        .map(item => Number(item.exercise_hours))
        .filter(value => !isNaN(value));


    const sleep = surveys
        .map(item => Number(item.sleep_hours))
        .filter(value => !isNaN(value));


    const averageExercise =
        exercise.length > 0
            ? exercise.reduce((sum, value) => sum + value, 0) /
              exercise.length
            : 0;


    const averageSleep =
        sleep.length > 0
            ? sleep.reduce((sum, value) => sum + value, 0) /
              sleep.length
            : 0;


    if (lifestyleChart) {
        lifestyleChart.destroy();
    }


    lifestyleChart = new Chart(
        document.getElementById("lifestyleChart"),
        {
            type: "bar",

            data: {

                labels: [
                    "Exercise (hrs/week)",
                    "Sleep (hrs/day)"
                ],

                datasets: [
                    {
                        label: "Average",

                        data: [
                            averageExercise.toFixed(1),
                            averageSleep.toFixed(1)
                        ]
                    }
                ]

            },

            options: {

                responsive: true,

                maintainAspectRatio: false,

                scales: {

                    y: {
                        beginAtZero: true
                    }

                },

                plugins: {

                    legend: {
                        display: false
                    }

                }

            }

        }
    );
}


// ==========================================
// HEALTHCARE ACCESS CHART
// ==========================================

function createHealthcareChart(surveys) {

    const counts =
        countValues(surveys, "healthcare_access");


    const labels = Object.keys(counts);

    const values = Object.values(counts);


    if (healthcareChart) {
        healthcareChart.destroy();
    }


    healthcareChart = new Chart(
        document.getElementById("healthcareChart"),
        {
            type: "doughnut",

            data: {

                labels: labels,

                datasets: [
                    {
                        data: values
                    }
                ]

            },

            options: {

                responsive: true,

                maintainAspectRatio: false,

                plugins: {

                    legend: {
                        position: "bottom"
                    }

                }

            }

        }
    );
}


// ==========================================
// NFHS 2019-21
// ==========================================

function updateNFHS(data) {

    const districts = Number(data.total_districts) || 0;

    const electricity = Number(data.avg_electricity) || 0;

    const water = Number(data.avg_water) || 0;

    const sanitation = Number(data.avg_sanitation) || 0;

    const stunting = Number(data.avg_stunting) || 0;

    const anaemia = Number(data.avg_women_anaemia) || 0;


    // NFHS statistic cards

    document.getElementById("nfhsDistricts").textContent =
        districts;

    document.getElementById("nfhsElectricity").textContent =
        `${electricity.toFixed(2)}%`;

    document.getElementById("nfhsWater").textContent =
        `${water.toFixed(2)}%`;

    document.getElementById("nfhsSanitation").textContent =
        `${sanitation.toFixed(2)}%`;

    document.getElementById("nfhsStunting").textContent =
        `${stunting.toFixed(2)}%`;

    document.getElementById("nfhsAnaemia").textContent =
        `${anaemia.toFixed(2)}%`;


    // Create NFHS chart

    createNFHSChart(
        electricity,
        water,
        sanitation,
        stunting,
        anaemia
    );


    document.getElementById("nfhsMessage").textContent =
        `NFHS 2019–21 historical dataset • ${districts} districts represented`;
}


// ==========================================
// NFHS CHART
// ==========================================

function createNFHSChart(
    electricity,
    water,
    sanitation,
    stunting,
    anaemia
) {

    if (nfhsChart) {
        nfhsChart.destroy();
    }


    nfhsChart = new Chart(
        document.getElementById("nfhsChart"),
        {
            type: "bar",

            data: {

                labels: [
                    "Electricity",
                    "Improved Water",
                    "Improved Sanitation",
                    "Child Stunting",
                    "Women Anaemia"
                ],

                datasets: [
                    {
                        label: "NFHS 2019–21 District Average (%)",

                        data: [
                            electricity,
                            water,
                            sanitation,
                            stunting,
                            anaemia
                        ]
                    }
                ]

            },

            options: {

                responsive: true,

                maintainAspectRatio: false,

                scales: {

                    y: {

                        beginAtZero: true,

                        max: 100,

                        ticks: {
                            callback: function(value) {
                                return value + "%";
                            }
                        }

                    }

                },

                plugins: {

                    legend: {
                        display: true,
                        position: "bottom"
                    }

                }

            }

        }
    );
}


// ==========================================
// SURVEY TABLE
// ==========================================

function updateTable(surveys) {

    const tableBody =
        document.getElementById("surveyTableBody");

    const tableMessage =
        document.getElementById("tableMessage");


    tableBody.innerHTML = "";


    if (surveys.length === 0) {

        tableMessage.textContent =
            "No survey responses available yet.";

        return;
    }


    tableMessage.textContent =
        `${surveys.length} survey response(s) found.`;


    const latestSurveys = [...surveys]
        .sort(
            (a, b) =>
                new Date(b.created_at) -
                new Date(a.created_at)
        )
        .slice(0, 10);


    latestSurveys.forEach(survey => {

        const row =
            document.createElement("tr");


        const date =
            survey.created_at
                ? new Date(
                    survey.created_at
                ).toLocaleDateString("en-IN")
                : "-";


        row.innerHTML = `

            <td>${survey.id}</td>

            <td>${survey.age ?? "-"}</td>

            <td>${survey.gender ?? "-"}</td>

            <td>${survey.area ?? "-"}</td>

            <td>${survey.bmi ?? "-"}</td>

            <td>
                <span class="status-badge">
                    ${survey.diabetes ?? "-"}
                </span>
            </td>

            <td>
                <span class="status-badge">
                    ${survey.hypertension ?? "-"}
                </span>
            </td>

            <td>${date}</td>

        `;


        tableBody.appendChild(row);

    });

}


// ==========================================
// REFRESH BUTTON
// ==========================================

document
    .getElementById("refreshBtn")
    .addEventListener(
        "click",
        loadDashboard
    );


// ==========================================
// INITIAL LOAD
// ==========================================

loadDashboard();