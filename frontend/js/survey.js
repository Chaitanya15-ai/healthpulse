const form = document.getElementById("healthSurveyForm");
const message = document.getElementById("formMessage");

form.addEventListener("submit", async function (event) {

    event.preventDefault();

    message.className = "form-message";
    message.textContent = "Submitting your survey...";

    const formData = new FormData(form);

    const data = {

        age: Number(formData.get("age")),

        gender: formData.get("gender"),

        area: formData.get("area"),

        occupation: formData.get("occupation"),

        water_quality: formData.get("water_quality"),

        sanitation: formData.get("sanitation"),

        exercise_hours:
            formData.get("exercise_hours")
                ? Number(formData.get("exercise_hours"))
                : null,

        sleep_hours:
            formData.get("sleep_hours")
                ? Number(formData.get("sleep_hours"))
                : null,

        diet_quality: formData.get("diet_quality"),

        smoking: formData.get("smoking"),

        alcohol_consumption:
            formData.get("alcohol_consumption"),

        diabetes: formData.get("diabetes"),

        hypertension:
            formData.get("hypertension"),

        bmi:
            formData.get("bmi")
                ? Number(formData.get("bmi"))
                : null,

        blood_pressure:
            formData.get("blood_pressure"),

        healthcare_access:
            formData.get("healthcare_access"),

        annual_checkup:
            formData.get("annual_checkup"),

        health_issue:
            formData.get("health_issue")
    };


    try {

        const response = await fetch("/api/surveys", {

            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify(data)

        });


        const result = await response.json();


        if (!response.ok) {

            throw new Error(
                result.message || "Submission failed"
            );

        }


        message.className = "form-message success";

        message.textContent =
            "✓ Survey submitted successfully! Thank you for contributing to community health.";


        form.reset();


        window.scrollTo({
            top: document.body.scrollHeight,
            behavior: "smooth"
        });


    } catch (error) {

        console.error(error);

        message.className = "form-message error";

        message.textContent =
            "Something went wrong. Please try again.";

    }

});