const regNumberInput = document.getElementById("regNumber");
const validateBtn = document.getElementById("validateBtn");
const result = document.getElementById("result");
// Live validation while typing mtlb ek ek krke check hoga
regNumberInput.addEventListener("input", function () {
    // Sare upper case hoge idhr
    regNumberInput.value = regNumberInput.value
        .toUpperCase()
        .replace(/[^A-Z0-9]/g, "");
    updateChecklist();
});

validateBtn.addEventListener("click", validateRegistration);

function setRule(ruleId, status) {
    const rule = document.getElementById(ruleId);
    const icon = rule.querySelector(".icon");
    rule.classList.remove("valid", "invalid", "pending");
    if (status === "valid") {
        rule.classList.add("valid");
        icon.innerHTML = "✔";
    }
    else if (status === "invalid") {
        rule.classList.add("invalid");
        icon.innerHTML = "✖";
    }
    else {
        rule.classList.add("pending");
        icon.innerHTML = "⬜";
    }}

function updateChecklist() {
    const value = regNumberInput.value;
    // Rule 1 - Not Empty
    if (value.length > 0) {
        setRule("rule1", "valid");
    }
    else {
        setRule("rule1", "invalid");
    }
    // Rule 2 - Length
    if (value.length === 0) {
        setRule("rule2", "pending");
    }
    else if (value.length === 10) {
        setRule("rule2", "valid");
    }
    else {
        setRule("rule2", "invalid");
    }
    // Rule 3 - State Code
    if (value.length < 2) {
        setRule("rule3", "pending");
    }
    else if (/^[A-Z]{2}$/.test(value.substring(0, 2))) {
        setRule("rule3", "valid");
    }
    else {
        setRule("rule3", "invalid");
    }
    // Rule 4 - District Code
    if (value.length < 4) {
        setRule("rule4", "pending");
    }
    else if (/^\d{2}$/.test(value.substring(2, 4))) {
        setRule("rule4", "valid");
    }
    else {
        setRule("rule4", "invalid");
    }
    // Rule 5 - Series
    if (value.length < 6) {
        setRule("rule5", "pending");
    }
    else if (/^[A-Z]{2}$/.test(value.substring(4, 6))) {
        setRule("rule5", "valid");
    }
    else {
        setRule("rule5", "invalid");
    }
    // Rule 6 - Vehicle Number
    if (value.length < 10) {
        setRule("rule6", "pending");
    }
    else if (/^\d{4}$/.test(value.substring(6, 10))) {
        setRule("rule6", "valid");
    }
    else {
        setRule("rule6", "invalid");
    }}

function validateRegistration() {
    try {
        const regNumber = regNumberInput.value;
        checkRegistration(regNumber);
        result.classList.remove("error");
        result.classList.add("success");
        result.innerHTML = "✅ Vehicle Registration Number is VALID";
    }
    catch (error) {
        result.classList.remove("success");
        result.classList.add("error");
        result.innerHTML = "❌ " + error.message;
    }
}

function checkRegistration(regNumber) {
    // Rule 1
    if (regNumber === "") {
        throw new Error("Registration number should not be empty.");
    }
    // Rule 2
    if (regNumber.length !== 10) {
        throw new Error("Registration number must contain exactly 10 characters.");
    }
    // Rule 3
    if (!/^[A-Z]{2}$/.test(regNumber.substring(0, 2))) {
        throw new Error("First two characters must be uppercase alphabets (State Code).");
    }
    // Rule 4
    if (!/^\d{2}$/.test(regNumber.substring(2, 4))) {
        throw new Error("Third and fourth characters must be digits (District Code).");
    }
    // Rule 5
    if (!/^[A-Z]{2}$/.test(regNumber.substring(4, 6))) {
        throw new Error("Fifth and sixth characters must be uppercase alphabets (Series).");
    }
    // Rule 6
    if (!/^\d{4}$/.test(regNumber.substring(6, 10))) {
        throw new Error("Last four characters must be digits (Vehicle Number).");
    }
    return true;
}