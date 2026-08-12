document.addEventListener("DOMContentLoaded", () => {
    console.log("Diagnosis JS started");

    // ============================================================
    // DOM ELEMENTS
    // ============================================================

    const searchInput =
        document.getElementById("symptomSearch");

    const searchResults =
        document.getElementById("searchResults");

    const selectedSymptomsBox =
        document.getElementById("selectedSymptoms");

    const selectedCount =
        document.getElementById("selectedCount");

    const analyzeBtn =
        document.getElementById("analyzeBtn");

    const clearSearch =
        document.getElementById("clearSearch");

    const clearSymptoms =
        document.getElementById("clearSymptoms");

    const datasetStatusText =
        document.getElementById("datasetStatusText");

    const loadingBox =
        document.getElementById("analysisLoading");

    const errorBox =
        document.getElementById("errorBox");

    const errorMessage =
        document.getElementById("errorMessage");

    const retryBtn =
        document.getElementById("retryBtn");

    const toast =
        document.getElementById("toast");

    const accountName =
        document.getElementById("accountName");

    const logoutBtn =
        document.getElementById("logoutBtn");


    // ============================================================
    // API CONFIGURATION
    // ============================================================

    const SYMPTOMS_API =
        "http://127.0.0.1:5000/api/symptoms";

    const PREDICTION_API =
        "http://127.0.0.1:5000/api/predict";

    console.log(
        "Symptoms API:",
        SYMPTOMS_API
    );

    console.log(
        "Prediction API:",
        PREDICTION_API
    );


    // ============================================================
    // STATE
    // ============================================================

    let symptoms = [];

    let selectedSymptoms = [];


    // ============================================================
    // REQUIRED ELEMENT CHECKS
    // ============================================================

    if (!searchInput) {
        console.error(
            "Missing #symptomSearch"
        );
        return;
    }

    if (!searchResults) {
        console.error(
            "Missing #searchResults"
        );
        return;
    }


    // ============================================================
    // DYNAMIC STYLES
    // ============================================================

    const diagnosisDynamicStyle =
        document.createElement("style");

    diagnosisDynamicStyle.textContent = `
        #allSymptomsBox {
            width: 100%;
            max-height: 180px;
            overflow-y: auto;
            overflow-x: hidden;
            margin-top: 12px;
            padding: 8px;
            box-sizing: border-box;
            border: 1px solid rgba(70, 200, 235, 0.25);
            border-radius: 12px;
            background: linear-gradient(
                145deg,
                rgba(8, 27, 42, 0.96),
                rgba(5, 20, 34, 0.96)
            );
            box-shadow:
                inset 0 0 20px rgba(40, 190, 230, 0.04),
                0 8px 25px rgba(0, 0, 0, 0.20);
            scrollbar-width: thin;
            scrollbar-color:
                rgba(65, 190, 225, 0.45)
                transparent;
        }

        #allSymptomsBox::-webkit-scrollbar {
            width: 6px;
        }

        #allSymptomsBox::-webkit-scrollbar-track {
            background: transparent;
        }

        #allSymptomsBox::-webkit-scrollbar-thumb {
            background:
                rgba(65, 190, 225, 0.40);
            border-radius: 10px;
        }

        #allSymptomsBox::-webkit-scrollbar-thumb:hover {
            background:
                rgba(65, 210, 240, 0.60);
        }

        #allSymptomsBox .all-symptoms-header {
            position: sticky;
            top: 0;
            z-index: 2;
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 10px;
            padding: 5px 6px 8px;
            margin-bottom: 3px;
            background:
                rgba(7, 24, 38, 0.96);
            color: #bdeefa;
            font-size: 12px;
            font-weight: 600;
            border-bottom:
                1px solid rgba(70, 200, 235, 0.12);
        }

        #allSymptomsBox .all-symptoms-count {
            color:
                rgba(185, 230, 242, 0.55);
            font-size: 11px;
            font-weight: 400;
        }

        #allSymptomsBox .all-symptom-item {
            display: flex;
            align-items: center;
            width: 100%;
            min-height: 34px;
            padding: 7px 10px;
            margin: 2px 0;
            box-sizing: border-box;
            border: 1px solid transparent;
            border-radius: 7px;
            background: transparent;
            color: #d9f7ff;
            font-family: inherit;
            font-size: 13px;
            font-weight: 500;
            line-height: 1.3;
            text-align: left;
            cursor: pointer;
            appearance: none;
            -webkit-appearance: none;
            transition:
                background 0.15s ease,
                border-color 0.15s ease,
                color 0.15s ease;
        }

        #allSymptomsBox .all-symptom-item:hover {
            background: linear-gradient(
                90deg,
                rgba(35, 190, 230, 0.16),
                rgba(35, 120, 190, 0.08)
            );
            border-color:
                rgba(60, 205, 240, 0.25);
            color: #ffffff;
        }

        #allSymptomsBox .all-symptom-item.selected {
            opacity: 0.42;
            cursor: default;
        }

        #allSymptomsBox
        .all-symptom-item.selected:hover {
            background: transparent;
            border-color: transparent;
            color: #d9f7ff;
        }

        #allSymptomsBox .all-symptom-item::before {
            content: "+";
            display: inline-flex;
            align-items: center;
            justify-content: center;
            width: 18px;
            height: 18px;
            margin-right: 8px;
            flex-shrink: 0;
            border-radius: 50%;
            background:
                rgba(50, 190, 225, 0.12);
            color: #8fdced;
            font-size: 13px;
            line-height: 1;
        }

        #allSymptomsBox
        .all-symptom-item.selected::before {
            content: "✓";
            background:
                rgba(55, 210, 160, 0.12);
            color: #79dfbc;
        }

        #allSymptomsBox .all-symptoms-empty {
            padding: 14px;
            text-align: center;
            color:
                rgba(210, 235, 245, 0.60);
            font-size: 13px;
        }

        #searchResults {
            position: fixed !important;
            z-index: 2147483647 !important;
            display: none !important;
            visibility: hidden !important;
            opacity: 0;
            width: 0;
            max-width: 100vw;
            max-height: 260px;
            overflow-x: hidden;
            overflow-y: auto;
            padding: 6px;
            margin: 0;
            box-sizing: border-box;
            background: linear-gradient(
                145deg,
                rgba(8, 27, 42, 0.99),
                rgba(5, 20, 34, 0.99)
            ) !important;
            border:
                1px solid rgba(70, 200, 235, 0.35) !important;
            border-radius: 12px !important;
            box-shadow:
                0 18px 45px rgba(0, 0, 0, 0.55),
                0 0 25px rgba(40, 190, 230, 0.12);
            backdrop-filter: blur(18px);
            -webkit-backdrop-filter: blur(18px);
            scrollbar-width: thin;
            scrollbar-color:
                rgba(65, 190, 225, 0.45)
                transparent;
        }

        #searchResults:not(.hidden) {
            display: block !important;
            visibility: visible !important;
            opacity: 1 !important;
        }

        #searchResults.hidden {
            display: none !important;
            visibility: hidden !important;
            opacity: 0 !important;
            pointer-events: none !important;
        }

        #searchResults .search-result-item {
            display: flex !important;
            width: 100% !important;
            min-width: 0;
            min-height: 42px;
            align-items: center;
            padding: 10px 13px;
            margin: 2px 0;
            box-sizing: border-box;
            border: 1px solid transparent;
            border-radius: 8px;
            background: transparent !important;
            color: #d9f7ff !important;
            font-family: inherit;
            font-size: 14px;
            font-weight: 500;
            line-height: 1.35;
            text-align: left;
            cursor: pointer;
            appearance: none;
            -webkit-appearance: none;
            outline: none;
            transition:
                background 0.15s ease,
                border-color 0.15s ease,
                color 0.15s ease,
                transform 0.15s ease;
        }

        #searchResults .search-result-item:hover {
            background: linear-gradient(
                90deg,
                rgba(35, 190, 230, 0.18),
                rgba(35, 120, 190, 0.10)
            ) !important;
            border-color:
                rgba(60, 205, 240, 0.30);
            color: #ffffff !important;
            transform: translateX(2px);
        }

        #searchResults .search-result-item:focus {
            background:
                rgba(35, 190, 230, 0.16) !important;
            border-color:
                rgba(60, 205, 240, 0.35);
            color: #ffffff !important;
            outline: none;
        }

        #searchResults .search-result-item:active {
            transform:
                translateX(1px) scale(0.99);
        }

        #searchResults .search-result-empty {
            display: block !important;
            width: 100%;
            padding: 15px 12px;
            box-sizing: border-box;
            color:
                rgba(210, 235, 245, 0.65) !important;
            font-size: 13px;
            font-weight: 400;
            line-height: 1.4;
            text-align: center;
        }

        #searchResults::-webkit-scrollbar {
            width: 6px;
        }

        #searchResults::-webkit-scrollbar-track {
            background: transparent;
        }

        #searchResults::-webkit-scrollbar-thumb {
            background:
                rgba(65, 190, 225, 0.40);
            border-radius: 10px;
        }

        #searchResults::-webkit-scrollbar-thumb:hover {
            background:
                rgba(65, 210, 240, 0.60);
        }

        .symptom-tag {
            display: inline-flex;
            align-items: center;
            gap: 8px;
            padding: 8px 11px;
            margin: 4px;
            box-sizing: border-box;
            border:
                1px solid rgba(55, 205, 240, 0.25);
            border-radius: 999px;
            background:
                rgba(20, 110, 145, 0.20);
            color: #d9f8ff;
            font-size: 13px;
            line-height: 1;
        }

        .symptom-tag button {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            flex-shrink: 0;
            width: 20px;
            height: 20px;
            padding: 0;
            border: none;
            border-radius: 50%;
            background:
                rgba(255, 255, 255, 0.08);
            color: #9ed9e8;
            cursor: pointer;
            font-size: 15px;
            line-height: 1;
            transition:
                background 0.15s ease,
                color 0.15s ease;
        }

        .symptom-tag button:hover {
            background:
                rgba(255, 80, 90, 0.25);
            color: #ffffff;
        }

        .symptom-tag button:focus {
            outline: none;
            background:
                rgba(255, 80, 90, 0.25);
            color: #ffffff;
        }
    `;

    document.head.appendChild(
        diagnosisDynamicStyle
    );


    // ============================================================
    // ALL SYMPTOMS BOX
    // ============================================================

    function createAllSymptomsBox() {
        if (!selectedSymptomsBox) {
            return null;
        }

        let box =
            document.getElementById(
                "allSymptomsBox"
            );

        if (box) {
            return box;
        }

        box = document.createElement("div");

        box.id = "allSymptomsBox";

        selectedSymptomsBox.insertAdjacentElement(
            "afterend",
            box
        );

        return box;
    }


    function renderAllSymptoms() {
        const box =
            createAllSymptomsBox();

        if (!box) {
            return;
        }

        box.innerHTML = "";


        const header =
            document.createElement("div");

        header.className =
            "all-symptoms-header";


        const title =
            document.createElement("span");

        title.textContent =
            "All Symptoms";


        const count =
            document.createElement("span");

        count.className =
            "all-symptoms-count";

        count.textContent =
            `${symptoms.length} available`;


        header.appendChild(title);
        header.appendChild(count);

        box.appendChild(header);


        if (!symptoms.length) {
            const empty =
                document.createElement("div");

            empty.className =
                "all-symptoms-empty";

            empty.textContent =
                "Loading symptoms...";

            box.appendChild(empty);

            return;
        }


        symptoms.forEach(symptom => {
            const button =
                document.createElement("button");

            button.type = "button";

            button.className =
                "all-symptom-item";

            button.textContent =
                symptom;


            if (
                selectedSymptoms.includes(
                    symptom
                )
            ) {
                button.classList.add(
                    "selected"
                );

                button.setAttribute(
                    "aria-disabled",
                    "true"
                );
            }


            button.addEventListener(
                "click",
                event => {
                    event.preventDefault();
                    event.stopPropagation();

                    if (
                        selectedSymptoms.includes(
                            symptom
                        )
                    ) {
                        return;
                    }

                    addSymptom(symptom);

                    searchInput.value = "";

                    searchResults.innerHTML =
                        "";

                    hideSearchResults();
                }
            );


            box.appendChild(button);
        });
    }


    // ============================================================
    // SYMPTOM NORMALIZATION
    // ============================================================

    function normalizeSymptom(item) {
        if (typeof item === "string") {
            return item.trim();
        }

        if (
            item &&
            typeof item === "object"
        ) {
            return String(
                item.name ??
                item.symptom ??
                item.label ??
                item.value ??
                item.Symptom ??
                item.SYMPTOM ??
                ""
            ).trim();
        }

        return "";
    }


    function extractSymptoms(data) {
        console.log(
            "Raw /api/symptoms response:",
            data
        );


        if (Array.isArray(data)) {
            return data
                .map(normalizeSymptom)
                .filter(Boolean);
        }


        if (
            data &&
            Array.isArray(
                data.symptoms
            )
        ) {
            return data.symptoms
                .map(normalizeSymptom)
                .filter(Boolean);
        }


        if (
            data &&
            Array.isArray(data.data)
        ) {
            return data.data
                .map(normalizeSymptom)
                .filter(Boolean);
        }


        if (
            data &&
            Array.isArray(data.results)
        ) {
            return data.results
                .map(normalizeSymptom)
                .filter(Boolean);
        }


        if (
            data &&
            data.symptoms &&
            typeof data.symptoms === "object"
        ) {
            return Object.values(
                data.symptoms
            )
                .map(normalizeSymptom)
                .filter(Boolean);
        }


        if (
            data &&
            Array.isArray(data.items)
        ) {
            return data.items
                .map(normalizeSymptom)
                .filter(Boolean);
        }


        return [];
    }


    // ============================================================
    // SEARCH RESULT POSITIONING
    // ============================================================

    function positionSearchResults() {
        if (
            searchResults.classList.contains(
                "hidden"
            ) ||
            !searchInput.value.trim()
        ) {
            return;
        }


        const rect =
            searchInput.getBoundingClientRect();


        const gap = 6;
        const padding = 10;


        const spaceBelow =
            window.innerHeight -
            rect.bottom -
            gap -
            padding;


        const spaceAbove =
            rect.top -
            gap -
            padding;


        let top =
            rect.bottom + gap;


        let maxHeight =
            Math.min(
                260,
                Math.max(
                    120,
                    spaceBelow
                )
            );


        if (
            spaceBelow < 140 &&
            spaceAbove > spaceBelow
        ) {
            maxHeight =
                Math.min(
                    260,
                    Math.max(
                        120,
                        spaceAbove
                    )
                );


            top =
                rect.top -
                gap -
                maxHeight;
        }


        searchResults.style.left =
            `${rect.left}px`;

        searchResults.style.top =
            `${top}px`;

        searchResults.style.width =
            `${rect.width}px`;

        searchResults.style.maxHeight =
            `${maxHeight}px`;
    }


    // ============================================================
    // SHOW / HIDE SEARCH RESULTS
    // ============================================================

    function showSearchResults() {
        searchResults.classList.remove(
            "hidden"
        );

        searchResults.style.display =
            "block";

        searchResults.style.visibility =
            "visible";

        searchResults.style.opacity =
            "1";

        searchResults.style.pointerEvents =
            "auto";

        positionSearchResults();
    }


    function hideSearchResults() {
        searchResults.classList.add(
            "hidden"
        );

        searchResults.style.display =
            "none";

        searchResults.style.visibility =
            "hidden";

        searchResults.style.opacity =
            "0";

        searchResults.style.pointerEvents =
            "none";
    }


    // ============================================================
    // LOAD SYMPTOMS FROM BACKEND
    // ============================================================

    async function loadSymptoms() {
        console.log(
            "Loading symptoms from:",
            SYMPTOMS_API
        );


        if (datasetStatusText) {
            datasetStatusText.textContent =
                "Loading symptoms...";
        }


        renderAllSymptoms();


        try {
            const response =
                await fetch(
                    SYMPTOMS_API,
                    {
                        method: "GET",

                        headers: {
                            Accept:
                                "application/json"
                        },

                        cache: "no-store"
                    }
                );


            console.log(
                "Symptoms API status:",
                response.status
            );


            if (!response.ok) {
                throw new Error(
                    `Symptoms API returned ${response.status}`
                );
            }


            const data =
                await response.json();


            symptoms =
                extractSymptoms(data);


            symptoms = [
                ...new Set(
                    symptoms
                        .map(s =>
                            String(s).trim()
                        )
                        .filter(Boolean)
                )
            ];


            console.log(
                "Normalized symptoms:",
                symptoms
            );


            console.log(
                "Total symptoms:",
                symptoms.length
            );


            if (!symptoms.length) {
                throw new Error(
                    "API returned no usable symptoms."
                );
            }


            if (datasetStatusText) {
                datasetStatusText.textContent =
                    `${symptoms.length} symptoms available`;
            }


            hideSearchResults();

            renderAllSymptoms();

            updateAnalyzeButton();

        } catch (error) {
            console.error(
                "Failed to load symptoms:",
                error
            );


            symptoms = [];


            if (datasetStatusText) {
                datasetStatusText.textContent =
                    "Unable to load symptoms from backend";
            }


            hideSearchResults();

            renderAllSymptoms();

            updateAnalyzeButton();
        }
    }


    // ============================================================
    // CREATE SEARCH RESULT BUTTON
    // ============================================================

    function createSymptomButton(symptom) {
        const button =
            document.createElement("button");


        button.type = "button";

        button.className =
            "search-result-item";

        button.textContent =
            symptom;


        button.setAttribute(
            "data-symptom",
            symptom
        );


        button.addEventListener(
            "click",
            event => {
                event.preventDefault();
                event.stopPropagation();


                if (
                    !selectedSymptoms.includes(
                        symptom
                    )
                ) {
                    addSymptom(symptom);
                }


                searchInput.value = "";

                searchResults.innerHTML =
                    "";

                hideSearchResults();

                searchInput.focus();
            }
        );


        searchResults.appendChild(
            button
        );
    }


    // ============================================================
    // SEARCH SYMPTOMS
    // ============================================================

    function searchSymptoms() {
        const query =
            searchInput.value
                .trim()
                .toLowerCase();


        searchResults.innerHTML =
            "";


        if (!query) {
            hideSearchResults();
            return;
        }


        console.log(
            "Searching symptoms:",
            query
        );


        const matches =
            symptoms
                .filter(Boolean)
                .filter(symptom =>
                    symptom
                        .toLowerCase()
                        .includes(query)
                )
                .filter(symptom =>
                    !selectedSymptoms.includes(
                        symptom
                    )
                )
                .slice(0, 10);


        console.log(
            "Search matches:",
            matches
        );


        if (!matches.length) {
            const empty =
                document.createElement(
                    "div"
                );


            empty.className =
                "search-result-empty";


            empty.textContent =
                "No matching symptoms found.";


            searchResults.appendChild(
                empty
            );


            showSearchResults();

            return;
        }


        matches.forEach(
            symptom => {
                createSymptomButton(
                    symptom
                );
            }
        );


        showSearchResults();
    }


    // ============================================================
    // ADD SYMPTOM
    // ============================================================

    function addSymptom(symptom) {
        if (!symptom) {
            return;
        }


        if (
            selectedSymptoms.includes(
                symptom
            )
        ) {
            return;
        }


        selectedSymptoms.push(
            symptom
        );


        console.log(
            "Selected symptoms:",
            selectedSymptoms
        );


        renderSelectedSymptoms();

        renderAllSymptoms();

        updateAnalyzeButton();
    }


    // ============================================================
    // REMOVE SYMPTOM
    // ============================================================

    function removeSymptom(symptom) {
        selectedSymptoms =
            selectedSymptoms.filter(
                item =>
                    item !== symptom
            );


        renderSelectedSymptoms();

        renderAllSymptoms();

        updateAnalyzeButton();
    }


    // ============================================================
    // RENDER SELECTED SYMPTOMS
    // ============================================================

    function renderSelectedSymptoms() {
        if (selectedCount) {
            selectedCount.textContent =
                selectedSymptoms.length;
        }


        if (!selectedSymptomsBox) {
            return;
        }


        if (!selectedSymptoms.length) {
            selectedSymptomsBox.innerHTML = `
                <div class="empty-selection">
                    <span class="empty-symbol">+</span>
                    <p>No symptoms selected yet.</p>
                    <small>
                        Use the search box above to find symptoms.
                    </small>
                </div>
            `;

            return;
        }


        selectedSymptomsBox.innerHTML =
            "";


        selectedSymptoms.forEach(
            symptom => {
                const tag =
                    document.createElement(
                        "div"
                    );


                tag.className =
                    "symptom-tag";


                const text =
                    document.createElement(
                        "span"
                    );


                text.textContent =
                    symptom;


                const removeButton =
                    document.createElement(
                        "button"
                    );


                removeButton.type =
                    "button";


                removeButton.textContent =
                    "×";


                removeButton.setAttribute(
                    "aria-label",
                    `Remove ${symptom}`
                );


                removeButton.addEventListener(
                    "click",
                    () => {
                        removeSymptom(
                            symptom
                        );
                    }
                );


                tag.appendChild(text);

                tag.appendChild(
                    removeButton
                );


                selectedSymptomsBox.appendChild(
                    tag
                );
            }
        );
    }


    // ============================================================
    // UPDATE ANALYZE BUTTON
    // ============================================================

    function updateAnalyzeButton() {
        if (!analyzeBtn) {
            return;
        }


        analyzeBtn.disabled =
            selectedSymptoms.length === 0;
    }


    // ============================================================
    // ANALYZE SYMPTOMS
    // ============================================================

    async function analyzeSymptoms() {
        if (!selectedSymptoms.length) {
            showToast(
                "Please select at least one symptom."
            );

            return;
        }


        hideError();

        hideSearchResults();


        if (loadingBox) {
            loadingBox.classList.remove(
                "hidden"
            );
        }


        if (analyzeBtn) {
            analyzeBtn.disabled = true;

            analyzeBtn.classList.add(
                "loading"
            );
        }


        try {
            console.log(
                "Sending symptoms:",
                selectedSymptoms
            );


            const response =
                await fetch(
                    PREDICTION_API,
                    {
                        method: "POST",

                        /*
                         * IMPORTANT:
                         * Flask-Login uses a session cookie.
                         * The frontend runs on port 8000 and
                         * Flask runs on port 5000.
                         */
                        credentials: "include",

                        headers: {
                            "Content-Type":
                                "application/json",

                            Accept:
                                "application/json"
                        },

                        body: JSON.stringify({
                            symptoms:
                                selectedSymptoms
                        })
                    }
                );


            console.log(
                "Prediction API status:",
                response.status
            );


            let result = {};

            try {
                result =
                    await response.json();
            } catch {
                result = {};
            }


            console.log(
                "Prediction result:",
                result
            );


            if (!response.ok) {
                if (
                    response.status === 401
                ) {
                    throw new Error(
                        "Authentication required. Please log in again."
                    );
                }


                throw new Error(
                    result.error ||
                    `Prediction server returned ${response.status}`
                );
            }


            const report =
                normalizePrediction(
                    result
                );


            console.log(
                "Normalized prediction report:",
                report
            );


            // ----------------------------------------------------
            // SAVE LATEST PREDICTION
            // ----------------------------------------------------

            localStorage.setItem(
                "latestPrediction",
                JSON.stringify(report)
            );


            // ----------------------------------------------------
            // SAVE LOCAL PREDICTION HISTORY
            // ----------------------------------------------------

            let history = [];


            try {
                history =
                    JSON.parse(
                        localStorage.getItem(
                            "predictionHistory"
                        )
                    ) || [];


                if (
                    !Array.isArray(history)
                ) {
                    history = [];
                }

            } catch {
                history = [];
            }


            history.unshift(report);


            history =
                history.slice(0, 20);


            localStorage.setItem(
                "predictionHistory",
                JSON.stringify(history)
            );


            // ----------------------------------------------------
            // GO TO PREDICTION PAGE
            // ----------------------------------------------------

            window.location.href =
                "prediction.html?new=1";

        } catch (error) {
            console.error(
                "Diagnosis error:",
                error
            );


            showError(
                error.message ||
                "Unable to connect to the prediction system. Please make sure your backend server is running."
            );

        } finally {
            if (loadingBox) {
                loadingBox.classList.add(
                    "hidden"
                );
            }


            if (analyzeBtn) {
                analyzeBtn.disabled =
                    selectedSymptoms.length === 0;

                analyzeBtn.classList.remove(
                    "loading"
                );
            }
        }
    }


    // ============================================================
    // NORMALIZE BACKEND PREDICTION
    // ============================================================

    function normalizePrediction(data) {
        /*
         * Backend currently returns confidence as a number.
         *
         * Support both:
         *   0.85  -> 85%
         *   85    -> 85%
         */

        const rawConfidence =
            Number(
                data.confidence ??
                data.confidence_score ??
                data.probability ??
                data.accuracy ??
                0
            );


        const confidence =
            rawConfidence > 0 &&
            rawConfidence <= 1
                ? rawConfidence * 100
                : rawConfidence;


        return {
            disease:
                data.predicted_disease ??
                data.disease ??
                data.prediction ??
                data.predictedDisease ??
                data.condition ??
                data.diagnosis ??
                "Unknown Condition",


            confidence:
                Math.max(
                    0,
                    Math.min(
                        100,
                        confidence
                    )
                ),


            risk:
                data.risk_level ??
                data.risk ??
                "Assessment",


            description:
                data.description ??
                data.about ??
                data.message ??
                "The AI system generated this assessment from the selected symptoms.",


            selectedSymptoms:
                data.symptoms_input ??
                data.selectedSymptoms ??
                data.selected_symptoms ??
                data.symptoms ??
                [...selectedSymptoms],


            relatedSymptoms:
                data.disease_symptoms ??
                data.relatedSymptoms ??
                data.related_symptoms ??
                [],


            otherConditions:
                data.top_candidates ??
                data.otherConditions ??
                data.other_conditions ??
                data.possible_conditions ??
                [],


            precautions:
                data.advice ??
                data.precautions ??
                [],


            medications:
                data.medicines ??
                data.medications ??
                data.medication ??
                [],


            diet:
                data.diet ??
                [],


            workout:
                data.workout ??
                data.lifestyle ??
                [],


            summary:
                data.summary ??
                `The prediction system identified ${
                    data.predicted_disease ??
                    data.disease ??
                    "a possible condition"
                } based on the selected symptoms.`,


            date:
                new Date().toISOString()
        };
    }


    // ============================================================
    // CLEAR SEARCH
    // ============================================================

    if (clearSearch) {
        clearSearch.addEventListener(
            "click",
            () => {
                searchInput.value = "";

                searchResults.innerHTML =
                    "";

                hideSearchResults();

                searchInput.focus();
            }
        );
    }


    // ============================================================
    // CLEAR SELECTED SYMPTOMS
    // ============================================================

    if (clearSymptoms) {
        clearSymptoms.addEventListener(
            "click",
            () => {
                selectedSymptoms = [];


                renderSelectedSymptoms();

                renderAllSymptoms();

                updateAnalyzeButton();


                searchResults.innerHTML =
                    "";


                if (
                    searchInput.value.trim()
                ) {
                    searchSymptoms();
                }
            }
        );
    }


    // ============================================================
    // SEARCH INPUT
    // ============================================================

    searchInput.addEventListener(
        "input",
        searchSymptoms
    );


    searchInput.addEventListener(
        "focus",
        () => {
            if (
                searchInput.value.trim()
            ) {
                searchSymptoms();
            } else {
                hideSearchResults();
            }
        }
    );


    searchInput.addEventListener(
        "keydown",
        event => {
            if (
                event.key === "Escape"
            ) {
                hideSearchResults();
            }
        }
    );


    // ============================================================
    // KEEP SEARCH DROPDOWN POSITIONED
    // ============================================================

    window.addEventListener(
        "scroll",
        () => {
            if (
                !searchResults.classList.contains(
                    "hidden"
                )
            ) {
                positionSearchResults();
            }
        },
        true
    );


    window.addEventListener(
        "resize",
        () => {
            if (
                !searchResults.classList.contains(
                    "hidden"
                )
            ) {
                positionSearchResults();
            }
        }
    );


    // ============================================================
    // ANALYZE BUTTON
    // ============================================================

    if (analyzeBtn) {
        analyzeBtn.addEventListener(
            "click",
            analyzeSymptoms
        );
    }


    // ============================================================
    // RETRY BUTTON
    // ============================================================

    if (retryBtn) {
        retryBtn.addEventListener(
            "click",
            analyzeSymptoms
        );
    }


    // ============================================================
    // CLOSE SEARCH WHEN CLICKING OUTSIDE
    // ============================================================

    document.addEventListener(
        "click",
        event => {
            const clickedSearch =
                searchInput.contains(
                    event.target
                );


            const clickedResults =
                searchResults.contains(
                    event.target
                );


            const clickedClear =
                clearSearch &&
                clearSearch.contains(
                    event.target
                );


            if (
                !clickedSearch &&
                !clickedResults &&
                !clickedClear
            ) {
                hideSearchResults();
            }
        }
    );


    // ============================================================
    // ERROR DISPLAY
    // ============================================================

    function showError(message) {
        if (!errorBox) {
            return;
        }


        if (errorMessage) {
            errorMessage.textContent =
                message;
        }


        errorBox.classList.remove(
            "hidden"
        );
    }


    function hideError() {
        if (!errorBox) {
            return;
        }


        errorBox.classList.add(
            "hidden"
        );
    }


    // ============================================================
    // TOAST
    // ============================================================

    function showToast(message) {
        if (!toast) {
            return;
        }


        toast.textContent =
            message;


        toast.classList.add(
            "show"
        );


        setTimeout(
            () => {
                toast.classList.remove(
                    "show"
                );
            },
            3000
        );
    }


    // ============================================================
    // LOGOUT
    // ============================================================

    if (logoutBtn) {
        logoutBtn.addEventListener(
            "click",
            () => {
                localStorage.removeItem(
                    "currentUser"
                );

                /*
                 * Do not manually pretend that the Flask
                 * session has been logged out.
                 *
                 * The actual backend logout route handles
                 * the Flask-Login session.
                 */
                window.location.href =
                    "login.html";
            }
        );
    }


    // ============================================================
    // DISPLAY CURRENT USER
    // ============================================================

    try {
        const currentUser =
            JSON.parse(
                localStorage.getItem(
                    "currentUser"
                )
            );


        if (
            currentUser &&
            accountName
        ) {
            accountName.textContent =
                currentUser.name ||
                currentUser.username ||
                "HealthAI User";
        }

    } catch (error) {
        console.warn(
            "Could not read currentUser:",
            error
        );


        if (accountName) {
            accountName.textContent =
                "HealthAI User";
        }
    }


    // ============================================================
    // INITIAL UI
    // ============================================================

    createAllSymptomsBox();

    renderSelectedSymptoms();

    renderAllSymptoms();

    updateAnalyzeButton();

    hideSearchResults();

    loadSymptoms();
});