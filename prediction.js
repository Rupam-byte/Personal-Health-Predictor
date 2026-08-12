
document.addEventListener("DOMContentLoaded", () => {

    // ==========================================================
    // DOM ELEMENTS
    // ==========================================================

    const loadingState =
        document.getElementById("loadingState");

    const emptyState =
        document.getElementById("emptyState");

    const reportContent =
        document.getElementById("reportContent");

    const errorState =
        document.getElementById("errorState");

    const errorMessage =
        document.getElementById("errorMessage");


    // ==========================================================
    // API CONFIGURATION
    // ==========================================================

    const HISTORY_API =
        "http://127.0.0.1:5000/api/history";


    console.log(
        "[PREDICTION] History API:",
        HISTORY_API
    );


    // ==========================================================
    // START DIAGNOSIS BUTTONS
    // ==========================================================

    function goToDiagnosis() {

        window.location.href =
            "diagnosis.html";

    }


    [
        "topStartDiagnosisBtn",
        "startDiagnosisBtn",
        "newDiagnosisBtn"
    ].forEach(id => {

        const button =
            document.getElementById(id);

        if (button) {

            button.addEventListener(
                "click",
                goToDiagnosis
            );

        }

    });


    // ==========================================================
    // LOAD LATEST REPORT
    // ==========================================================

    async function loadReport() {

        hideAllStates();


        if (loadingState) {

            loadingState.classList.remove(
                "hidden"
            );

        }


        try {

            console.log(
                "[PREDICTION] Loading authenticated prediction history..."
            );


            /*
             * IMPORTANT
             *
             * Prediction history comes from Flask.
             *
             * Do NOT use localStorage for prediction data.
             *
             * Flask-Login identifies the current user
             * through the session cookie.
             */

            const response =
                await fetch(
                    HISTORY_API,
                    {
                        method: "GET",

                        credentials: "include",

                        headers: {
                            "Accept":
                                "application/json"
                        },

                        cache: "no-store"
                    }
                );


            console.log(
                "[PREDICTION] HTTP status:",
                response.status
            );


            let result = {};

            try {

                result =
                    await response.json();

            } catch (jsonError) {

                console.error(
                    "[PREDICTION] Invalid JSON response:",
                    jsonError
                );

                result = {};

            }


            console.log(
                "[PREDICTION] Backend response:",
                result
            );


            // ==================================================
            // AUTHENTICATION ERROR
            // ==================================================

            if (
                response.status === 401
            ) {

                showError(
                    "Your login session has expired. Please log in again."
                );

                return;

            }


            // ==================================================
            // BACKEND ERROR
            // ==================================================

            if (!response.ok) {

                throw new Error(
                    result.error ||
                    `Unable to load prediction history (${response.status}).`
                );

            }


            // ==================================================
            // RESPONSE VALIDATION
            // ==================================================

            if (
                !result ||
                result.success !== true
            ) {

                throw new Error(
                    result.error ||
                    "The prediction history could not be loaded."
                );

            }


            const history =
                Array.isArray(result.history)
                    ? result.history
                    : [];


            console.log(
                "[PREDICTION] User prediction count:",
                history.length
            );


            // ==================================================
            // EMPTY HISTORY
            // ==================================================

            if (!history.length) {

                showEmpty();

                return;

            }


            /*
             * Backend already returns:
             *
             * created_at DESC
             *
             * Therefore history[0] is the latest
             * prediction belonging to the current user.
             */

            const latestReport =
                history[0];


            if (!latestReport) {

                showEmpty();

                return;

            }


            console.log(
                "[PREDICTION] Latest prediction:",
                latestReport
            );


            renderReport(
                latestReport
            );


        } catch (error) {

            console.error(
                "[PREDICTION] Failed to load report:",
                error
            );


            showError(
                error.message ||
                "Unable to load your prediction report."
            );

        }

    }


    // ==========================================================
    // RENDER COMPLETE REPORT
    // ==========================================================

    function renderReport(report) {

        hideAllStates();


        if (!report) {

            showEmpty();

            return;

        }


        // ======================================================
        // DISEASE NAME
        // ======================================================

        const disease =
            report.predicted_disease ||
            report.disease ||
            report.prediction ||
            "Unknown Condition";


        setText(
            "diseaseName",
            disease
        );


        // ======================================================
        // CONFIDENCE
        // ======================================================

        const confidence =
            normalizeConfidence(
                report.confidence
            );


        setText(
            "confidenceValue",
            `${confidence}%`
        );


        setText(
            "ringConfidence",
            `${confidence}%`
        );


        const confidenceBar =
            document.getElementById(
                "confidenceBar"
            );


        if (confidenceBar) {

            confidenceBar.style.width =
                `${confidence}%`;

            confidenceBar.setAttribute(
                "aria-valuenow",
                String(confidence)
            );

        }


        // ======================================================
        // RISK
        // ======================================================

        const risk =
            normalizeRisk(
                report.risk_level ||
                report.risk ||
                "unknown"
            );


        setText(
            "riskBadge",
            `Risk ${capitalize(risk)}`
        );


        // ======================================================
        // DATE
        // ======================================================

        setText(
            "reportDate",
            formatDate(
                report.created_at ||
                report.date
            )
        );


        // ======================================================
        // DESCRIPTION
        // ======================================================

        setText(
            "description",
            report.description ||
            "No additional condition information was provided."
        );


        // ======================================================
        // SUMMARY
        // ======================================================

        const summary =
            report.summary ||
            `The current assessment identified ${disease} with a confidence of ${confidence}%.`;


        setText(
            "summaryText",
            summary
        );


        // ======================================================
        // SELECTED SYMPTOMS
        // ======================================================

        renderTags(
            "selectedSymptoms",
            report.symptoms_input ||
            report.selectedSymptoms ||
            report.selected_symptoms ||
            report.symptoms ||
            []
        );


        // ======================================================
        // RELATED / DISEASE SYMPTOMS
        // ======================================================

        renderTags(
            "relatedSymptoms",
            report.disease_symptoms ||
            report.relatedSymptoms ||
            report.related_symptoms ||
            []
        );


        // ======================================================
        // OTHER POSSIBLE CONDITIONS
        // ======================================================

        renderCandidates(
            "otherConditions",
            report.top_candidates ||
            report.otherConditions ||
            report.other_conditions ||
            []
        );


        // ======================================================
        // PRECAUTIONS / ADVICE
        // ======================================================

        renderList(
            "precautions",
            report.advice ||
            report.precautions ||
            []
        );


        // ======================================================
        // MEDICATIONS
        // ======================================================

        renderList(
            "medications",
            report.medicines ||
            report.medications ||
            report.medication ||
            []
        );


        // ======================================================
        // DIET
        // ======================================================

        renderList(
            "diet",
            report.diet ||
            []
        );


        // ======================================================
        // WORKOUT / LIFESTYLE
        // ======================================================

        renderList(
            "workout",
            report.workout ||
            report.lifestyle ||
            []
        );


        // ======================================================
        // OPTIONAL FULL DETAILS
        // ======================================================

        renderFullDetails(
            report
        );


        // ======================================================
        // OPTIONAL REPORT ID
        // ======================================================

        setTextIfExists(
            "predictionId",
            report.id
                ? `Report #${report.id}`
                : ""
        );


        // ======================================================
        // SHOW REPORT
        // ======================================================

        if (reportContent) {

            reportContent.classList.remove(
                "hidden"
            );

        }

    }


    // ==========================================================
    // FULL DETAILS VIEW
    // ==========================================================

    /*
     * This function supports optional detail elements.
     *
     * If your HTML contains these IDs they will automatically
     * be populated.
     *
     * If an ID does not exist, nothing happens.
     *
     * This means the JavaScript remains compatible with your
     * existing prediction page.
     */

    function renderFullDetails(report) {

        // ------------------------------------------------------
        // PREDICTION ID
        // ------------------------------------------------------

        setTextIfExists(
            "detailPredictionId",
            report.id
                ? String(report.id)
                : "—"
        );


        // ------------------------------------------------------
        // PREDICTED DISEASE
        // ------------------------------------------------------

        setTextIfExists(
            "detailDisease",
            report.predicted_disease ||
            report.disease ||
            "Unknown"
        );


        // ------------------------------------------------------
        // CONFIDENCE
        // ------------------------------------------------------

        setTextIfExists(
            "detailConfidence",
            `${normalizeConfidence(report.confidence)}%`
        );


        // ------------------------------------------------------
        // RISK
        // ------------------------------------------------------

        setTextIfExists(
            "detailRisk",
            capitalize(
                normalizeRisk(
                    report.risk_level ||
                    report.risk ||
                    "unknown"
                )
            )
        );


        // ------------------------------------------------------
        // DATE
        // ------------------------------------------------------

        setTextIfExists(
            "detailDate",
            formatDate(
                report.created_at ||
                report.date
            )
        );


        // ------------------------------------------------------
        // SYMPTOMS COUNT
        // ------------------------------------------------------

        const symptoms =
            normalizeArray(
                report.symptoms_input ||
                report.selectedSymptoms ||
                report.selected_symptoms ||
                report.symptoms ||
                []
            );


        setTextIfExists(
            "detailSymptomCount",
            String(symptoms.length)
        );


        // ------------------------------------------------------
        // TOP CANDIDATE COUNT
        // ------------------------------------------------------

        const candidates =
            normalizeArray(
                report.top_candidates ||
                report.otherConditions ||
                report.other_conditions ||
                []
            );


        setTextIfExists(
            "detailCandidateCount",
            String(candidates.length)
        );


        // ------------------------------------------------------
        // DESCRIPTION
        // ------------------------------------------------------

        setTextIfExists(
            "detailDescription",
            report.description ||
            "No description available."
        );


        // ------------------------------------------------------
        // RAW JSON DETAILS
        // ------------------------------------------------------

        /*
         * If the HTML contains:
         *
         * <pre id="rawPredictionDetails"></pre>
         *
         * the complete backend response is displayed there.
         *
         * This is useful while testing the ML integration.
         */

        const rawDetails =
            document.getElementById(
                "rawPredictionDetails"
            );


        if (rawDetails) {

            try {

                rawDetails.textContent =
                    JSON.stringify(
                        report,
                        null,
                        2
                    );

            } catch {

                rawDetails.textContent =
                    "Prediction details unavailable.";

            }

        }

    }


    // ==========================================================
    // TAG RENDERER
    // ==========================================================

    function renderTags(
        elementId,
        values
    ) {

        const element =
            document.getElementById(
                elementId
            );


        if (!element) return;


        const list =
            normalizeArray(
                values
            );


        if (!list.length) {

            element.innerHTML =
                `<span class="muted">None provided</span>`;

            return;

        }


        element.innerHTML = "";


        list.forEach(value => {

            const tag =
                document.createElement(
                    "span"
                );


            tag.className =
                "tag";


            tag.textContent =
                objectToDisplayText(
                    value
                );


            element.appendChild(
                tag
            );

        });

    }


    // ==========================================================
    // OTHER CONDITIONS
    // ==========================================================

    function renderCandidates(
        elementId,
        values
    ) {

        const element =
            document.getElementById(
                elementId
            );


        if (!element) return;


        const list =
            normalizeArray(
                values
            );


        if (!list.length) {

            element.innerHTML =
                `<span class="muted">No alternative conditions provided.</span>`;

            return;

        }


        element.innerHTML = "";


        list.forEach(value => {

            const item =
                document.createElement(
                    "div"
                );


            item.className =
                "candidate-item";


            if (
                typeof value === "object" &&
                value !== null
            ) {

                const name =
                    value.name ||
                    value.condition ||
                    value.disease ||
                    value.predicted_disease ||
                    "Possible condition";


                let confidence =
                    value.confidence;


                if (
                    confidence === undefined
                ) {

                    confidence =
                        value.probability;

                }


                const strong =
                    document.createElement(
                        "strong"
                    );


                strong.textContent =
                    name;


                item.appendChild(
                    strong
                );


                if (
                    confidence !== undefined &&
                    confidence !== null &&
                    confidence !== ""
                ) {

                    const percentage =
                        normalizeConfidence(
                            confidence
                        );


                    const confidenceText =
                        document.createElement(
                            "span"
                        );


                    confidenceText.textContent =
                        `${percentage}%`;


                    item.appendChild(
                        confidenceText
                    );

                }

            } else {

                item.textContent =
                    String(value);

            }


            element.appendChild(
                item
            );

        });

    }


    // ==========================================================
    // LIST RENDERER
    // ==========================================================

    function renderList(
        elementId,
        values
    ) {

        const element =
            document.getElementById(
                elementId
            );


        if (!element) return;


        const list =
            normalizeArray(
                values
            );


        if (!list.length) {

            element.innerHTML =
                "<li>No information provided.</li>";

            return;

        }


        element.innerHTML = "";


        list.forEach(value => {

            const li =
                document.createElement(
                    "li"
                );


            li.textContent =
                objectToDisplayText(
                    value
                );


            element.appendChild(
                li
            );

        });

    }


    // ==========================================================
    // OBJECT TO DISPLAY TEXT
    // ==========================================================

    function objectToDisplayText(
        value
    ) {

        if (
            value === null ||
            value === undefined
        ) {

            return "";

        }


        if (
            typeof value !== "object"
        ) {

            return String(value);

        }


        return (
            value.text ||
            value.name ||
            value.label ||
            value.symptom ||
            value.condition ||
            value.disease ||
            value.description ||
            safeJsonStringify(value)
        );

    }


    // ==========================================================
    // ARRAY NORMALIZATION
    // ==========================================================

    function normalizeArray(
        value
    ) {

        if (
            Array.isArray(value)
        ) {

            return value;

        }


        if (
            typeof value === "string" &&
            value.trim()
        ) {

            /*
             * First try JSON.
             *
             * This supports backend fields that may contain:
             *
             * '["headache", "fever"]'
             */

            try {

                const parsed =
                    JSON.parse(
                        value
                    );


                if (
                    Array.isArray(parsed)
                ) {

                    return parsed;

                }

            } catch {
                // Continue with comma-separated parsing.
            }


            return value
                .split(",")
                .map(
                    item =>
                        item.trim()
                )
                .filter(Boolean);

        }


        return [];

    }


    // ==========================================================
    // CONFIDENCE NORMALIZATION
    // ==========================================================

    function normalizeConfidence(
        value
    ) {

        let number =
            Number(value);


        if (
            !Number.isFinite(number)
        ) {

            return 0;

        }


        /*
         * Backend may return:
         *
         * 0.87
         *
         * or:
         *
         * 87
         *
         */

        if (
            number > 0 &&
            number <= 1
        ) {

            number *= 100;

        }


        return Math.round(
            Math.max(
                0,
                Math.min(
                    100,
                    number
                )
            )
        );

    }


    // ==========================================================
    // RISK NORMALIZATION
    // ==========================================================

    function normalizeRisk(
        value
    ) {

        if (
            value === null ||
            value === undefined
        ) {

            return "unknown";

        }


        const risk =
            String(value)
                .trim()
                .toLowerCase();


        if (
            risk === "high"
        ) {

            return "high";

        }


        if (
            risk === "medium"
        ) {

            return "medium";

        }


        if (
            risk === "low"
        ) {

            return "low";

        }


        return "unknown";

    }


    // ==========================================================
    // CAPITALIZE
    // ==========================================================

    function capitalize(
        value
    ) {

        const text =
            String(value || "");


        if (!text) {

            return "";

        }


        return (
            text.charAt(0).toUpperCase() +
            text.slice(1)
        );

    }


    // ==========================================================
    // DATE FORMAT
    // ==========================================================

    function formatDate(
        value
    ) {

        if (!value) {

            return new Date()
                .toLocaleDateString(
                    undefined,
                    {
                        day: "2-digit",
                        month: "short",
                        year: "numeric"
                    }
                );

        }


        const date =
            new Date(
                value
            );


        if (
            Number.isNaN(
                date.getTime()
            )
        ) {

            return String(value);

        }


        return date.toLocaleDateString(
            undefined,
            {
                day: "2-digit",
                month: "short",
                year: "numeric"
            }
        );

    }


    // ==========================================================
    // SET TEXT
    // ==========================================================

    function setText(
        id,
        value
    ) {

        const element =
            document.getElementById(
                id
            );


        if (element) {

            element.textContent =
                value ?? "—";

        }

    }


    // ==========================================================
    // OPTIONAL SET TEXT
    // ==========================================================

    function setTextIfExists(
        id,
        value
    ) {

        const element =
            document.getElementById(
                id
            );


        if (!element) return;


        element.textContent =
            value ?? "—";

    }


    // ==========================================================
    // SAFE JSON
    // ==========================================================

    function safeJsonStringify(
        value
    ) {

        try {

            return JSON.stringify(
                value
            );

        } catch {

            return String(value);

        }

    }


    // ==========================================================
    // STATES
    // ==========================================================

    function hideAllStates() {

        if (loadingState) {

            loadingState.classList.add(
                "hidden"
            );

        }


        if (emptyState) {

            emptyState.classList.add(
                "hidden"
            );

        }


        if (reportContent) {

            reportContent.classList.add(
                "hidden"
            );

        }


        if (errorState) {

            errorState.classList.add(
                "hidden"
            );

        }

    }


    // ==========================================================
    // EMPTY STATE
    // ==========================================================

    function showEmpty() {

        hideAllStates();


        if (emptyState) {

            emptyState.classList.remove(
                "hidden"
            );

        }

    }


    // ==========================================================
    // ERROR STATE
    // ==========================================================

    function showError(
        message
    ) {

        hideAllStates();


        if (errorMessage) {

            errorMessage.textContent =
                message;

        }


        if (errorState) {

            errorState.classList.remove(
                "hidden"
            );

        }

    }


    // ==========================================================
    // REFRESH BUTTON
    // ==========================================================

    const refreshBtn =
        document.getElementById(
            "refreshBtn"
        );


    if (refreshBtn) {

        refreshBtn.addEventListener(
            "click",
            loadReport
        );

    }


    // ==========================================================
    // RETRY BUTTON
    // ==========================================================

    const retryBtn =
        document.getElementById(
            "retryBtn"
        );


    if (retryBtn) {

        retryBtn.addEventListener(
            "click",
            loadReport
        );

    }


    // ==========================================================
    // ACCOUNT
    // ==========================================================

    const accountName =
        document.getElementById(
            "accountName"
        );


    try {

        const storedUser =
            localStorage.getItem(
                "currentUser"
            );


        if (!storedUser) {

            if (accountName) {

                accountName.textContent =
                    "HealthAI User";

            }

        } else {

            const currentUser =
                JSON.parse(
                    storedUser
                );


            if (
                currentUser &&
                accountName
            ) {

                accountName.textContent =
                    currentUser.name ||
                    currentUser.username ||
                    currentUser.email ||
                    "HealthAI User";

            }

        }

    } catch (error) {

        console.error(
            "[PREDICTION] Unable to read current user:",
            error
        );


        if (accountName) {

            accountName.textContent =
                "HealthAI User";

        }

    }


    // ==========================================================
    // LOGOUT
    // ==========================================================

    const logoutBtn =
        document.getElementById(
            "logoutBtn"
        );


    if (logoutBtn) {

        logoutBtn.addEventListener(
            "click",
            async () => {

                /*
                 * Prediction history belongs to the backend.
                 *
                 * Do not delete prediction history here.
                 */

                try {

                    /*
                     * Give Flask-Login a chance to clear
                     * the actual server session.
                     *
                     * This is intentionally best-effort.
                     */

                    await fetch(
                        "http://127.0.0.1:5000/api/logout",
                        {
                            method: "POST",

                            credentials: "include",

                            headers: {
                                "Accept":
                                    "application/json"
                            }
                        }
                    );

                } catch (error) {

                    console.warn(
                        "[PREDICTION] Logout API request failed:",
                        error
                    );

                }


                localStorage.removeItem(
                    "currentUser"
                );


                window.location.href =
                    "login.html";

            }
        );

    }


    // ==========================================================
    // MOBILE MENU
    // ==========================================================

    const mobileMenu =
        document.getElementById(
            "mobileMenu"
        );


    const mainNav =
        document.getElementById(
            "mainNav"
        );


    if (
        mobileMenu &&
        mainNav
    ) {

        mobileMenu.addEventListener(
            "click",
            () => {

                const open =
                    mainNav.classList.toggle(
                        "open"
                    );


                mobileMenu.setAttribute(
                    "aria-expanded",
                    open
                        ? "true"
                        : "false"
                );

            }
        );

    }


    // ==========================================================
    // INITIAL LOAD
    // ==========================================================

    loadReport();

});
