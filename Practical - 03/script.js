function nextPage() {
    const fields = ["name", "prn", "class", "section", "dob", "password", "confirmPassword"];
    const values = {};
    for (let id of fields) {
        values[id] = document.getElementById(id).value.trim();
    }

    const message = document.getElementById("message");
    const pattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#!])[A-Za-z\d@$!%*?&#!]{8,}$/;

    if (Object.values(values).some(v => v === "")) {
        message.innerHTML = "<span>⚠️ Please fill in all required fields.</span>";
        return;
    }

    if (!pattern.test(values.password)) {
        message.innerHTML = "<span>⚠️ Password must contain at least 8 characters, one uppercase, one lowercase, one number, and one special character.</span>";
        return;
    }

    if (values.password !== values.confirmPassword) {
        message.innerHTML = "<span>⚠️ Passwords do not match.</span>";
        return;
    }

    message.innerHTML = "";
    document.getElementById("studentSection").style.display = "none";
    document.getElementById("marksSection").style.display = "block";

    document.getElementById("step1").classList.remove("active");
    document.getElementById("step1").classList.add("completed");
    document.getElementById("step2").classList.add("active");
}

function generateResult() {
    const subjects = [
        { id: "m1", name: "Mathematics-I" },
        { id: "dbms", name: "DBMS" },
        { id: "javascript", name: "JavaScript" },
        { id: "toc", name: "TOC" },
        { id: "python", name: "Python" }
    ];

    const markValues = [];
    for (let sub of subjects) {
        let val = Number(document.getElementById(sub.id).value);
        if (isNaN(val) || val < 0 || val > 100 || document.getElementById(sub.id).value === "") {
            alert("Marks should be between 0 and 100 for all subjects.");
            return;
        }
        markValues.push({ name: sub.name, mark: val });
    }

    const total = markValues.reduce((sum, s) => sum + s.mark, 0);
    const percentage = total / 5;

    let grade = percentage > 90 ? "A+" : percentage >= 81 ? "A" : percentage >= 66 ? "B" : percentage >= 50 ? "C" : "Fail";
    let result = percentage >= 50 ? "PASS" : "FAIL";
    let resultClass = result === "PASS" ? "pass-badge" : "fail-badge";

    document.getElementById("marksSection").style.display = "none";
    document.getElementById("reportSection").style.display = "block";

    document.getElementById("step2").classList.remove("active");
    document.getElementById("step2").classList.add("completed");
    document.getElementById("step3").classList.add("active");

    const name = document.getElementById("name").value;
    const prn = document.getElementById("prn").value;
    const studentYear = document.getElementById("class").value;
    const section = document.getElementById("section").value;
    const dob = document.getElementById("dob").value;

    let tableRows = markValues.map(s => {
        let barColor = s.mark >= 75 ? "#10b981" : s.mark >= 50 ? "#6366f1" : "#ef4444";
        return `<tr>
            <td>
                <div class="sub-name">
                    <span class="sub-dot" style="background:${barColor}"></span>
                    ${s.name}
                </div>
            </td>
            <td>
                <div class="score-cell">
                    <div class="progress-bar-bg">
                        <div class="progress-bar-fill" style="width: ${s.mark}%; background: ${barColor};"></div>
                    </div>
                    <span class="mark-val">${s.mark}</span> <span class="max-val">/ 100</span>
                </div>
            </td>
        </tr>`;
    }).join("");

    document.getElementById("report").innerHTML = `
        <div class="report-header-card">
            <div class="student-avatar">${name.charAt(0).toUpperCase()}</div>
            <div class="student-main-info">
                <h3>${name}</h3>
                <p>PRN: <strong>${prn}</strong></p>
            </div>
            <div class="result-status ${resultClass}">${result}</div>
        </div>

        <div class="info-grid">
            <div class="info-item">
                <span class="info-label">Academic Year</span>
                <span class="info-val">${studentYear}</span>
            </div>
            <div class="info-item">
                <span class="info-label">Section</span>
                <span class="info-val">${section}</span>
            </div>
            <div class="info-item">
                <span class="info-label">Date of Birth</span>
                <span class="info-val">${dob}</span>
            </div>
        </div>

        <div class="table-container">
            <table class="marks-table">
                <thead>
                    <tr><th>Subject</th><th>Marks & Performance</th></tr>
                </thead>
                <tbody>
                    ${tableRows}
                </tbody>
            </table>
        </div>

        <div class="stats-cards-grid">
            <div class="stat-card">
                <span class="stat-title">Total Score</span>
                <span class="stat-value">${total} <small>/ 500</small></span>
            </div>
            <div class="stat-card">
                <span class="stat-title">Percentage</span>
                <span class="stat-value">${percentage.toFixed(2)}%</span>
            </div>
            <div class="stat-card">
                <span class="stat-title">Overall Grade</span>
                <span class="stat-value grade-tag">${grade}</span>
            </div>
        </div>
    `;
}