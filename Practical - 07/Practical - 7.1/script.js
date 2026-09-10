const form = document.getElementById("registrationForm");
const firstnameInput = document.getElementById("firstname");
const lastnameInput = document.getElementById("lastname");
const birthdayInput = document.getElementById("birthday");
const usernameInput = document.getElementById("username");
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const confirmPasswordInput = document.getElementById("confirmPassword");
const genderSelect = document.getElementById("gender");
const termsCheckbox = document.getElementById("terms");

const submitBtn = document.getElementById("submitBtn");
const resetBtn = document.getElementById("resetBtn");
const clearLogBtn = document.getElementById("clearLogBtn");

const usersTableBody = document.getElementById("usersTableBody");
const emptyRow = document.getElementById("emptyRow");
const recordCountBadge = document.getElementById("recordCount");
const eventLogConsole = document.getElementById("eventLogConsole");
const ageInfo = document.getElementById("ageInfo");

let userRecordIndex = 0;

/**
 * Log live event interactions to the UI Event Console
 * @param {string} eventType - Type of event (e.g. 'FOCUS', 'BLUR', 'SUBMIT')
 * @param {string} details - Explanation of the event target or action
 */
function logEvent(eventType, details) {
    const timestamp = new Date().toLocaleTimeString();
    const entry = document.createElement("p");
    entry.className = "log-entry";
    entry.innerHTML = `<span style="color:#a855f7;">[${timestamp}]</span> <strong>${eventType}:</strong> ${details}`;
    
   
    eventLogConsole.insertBefore(entry, eventLogConsole.firstChild);

    
    if (eventLogConsole.children.length > 30) {
        eventLogConsole.removeChild(eventLogConsole.lastChild);
    }
}

function showError(inputElement, errorElementId, message) {
    const errorSmall = document.getElementById(errorElementId);
    errorSmall.textContent = message;
    inputElement.classList.add("invalid");
    inputElement.classList.remove("valid");
}


function showSuccess(inputElement, errorElementId) {
    const errorSmall = document.getElementById(errorElementId);
    errorSmall.textContent = "";
    inputElement.classList.remove("invalid");
    inputElement.classList.add("valid");
}

function validateFirstname() {
    const value = firstnameInput.value.trim();
    const nameRegex = /^[A-Za-z\s]+$/;

    if (value === "") {
        showError(firstnameInput, "firstnameError", "First name is required.");
        return false;
    } else if (!nameRegex.test(value)) {
        showError(firstnameInput, "firstnameError", "First name can only contain letters.");
        return false;
    } else {
        showSuccess(firstnameInput, "firstnameError");
        return true;
    }
}

function validateLastname() {
    const value = lastnameInput.value.trim();
    const nameRegex = /^[A-Za-z\s]+$/;

    if (value === "") {
        showError(lastnameInput, "lastnameError", "Last name is required.");
        return false;
    } else if (!nameRegex.test(value)) {
        showError(lastnameInput, "lastnameError", "Last name can only contain letters.");
        return false;
    } else {
        showSuccess(lastnameInput, "lastnameError");
        return true;
    }
}

function validateBirthday() {
    const value = birthdayInput.value;
    if (value === "") {
        showError(birthdayInput, "birthdayError", "Birthday is required.");
        ageInfo.textContent = "";
        return false;
    }

    const birthDate = new Date(value);
    const today = new Date();
    
    if (birthDate > today) {
        showError(birthdayInput, "birthdayError", "Birthday cannot be in the future.");
        ageInfo.textContent = "";
        return false;
    }

    // Age Cal. Kreee
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        age--;
    }

    if (age < 13) {
        showError(birthdayInput, "birthdayError", "You must be at least 13 years old.");
        ageInfo.textContent = "";
        return false;
    }

    showSuccess(birthdayInput, "birthdayError");
    ageInfo.textContent = `Calculated Age: ${age} years old`;
    return true;
}

function validateUsername() {
    const value = usernameInput.value.trim();
    const usernameRegex = /^[a-zA-Z0-9_]{4,15}$/;

    if (value === "") {
        showError(usernameInput, "usernameError", "Username is required.");
        return false;
    } else if (value.length < 4) {
        showError(usernameInput, "usernameError", "Username must be at least 4 characters.");
        return false;
    } else if (!usernameRegex.test(value)) {
        showError(usernameInput, "usernameError", "Alphanumeric and underscores only.");
        return false;
    } else {
        showSuccess(usernameInput, "usernameError");
        return true;
    }
}

function validateEmail() {
    const value = emailInput.value.trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (value === "") {
        showError(emailInput, "emailError", "Email address is required.");
        return false;
    } else if (!emailRegex.test(value)) {
        showError(emailInput, "emailError", "Please enter a valid email address (e.g. user@domain.com).");
        return false;
    } else {
        showSuccess(emailInput, "emailError");
        return true;
    }
}

function validatePassword() {
    const value = passwordInput.value;

    if (value === "") {
        showError(passwordInput, "passwordError", "Password is required.");
        return false;
    } else if (value.length < 6) {
        showError(passwordInput, "passwordError", "Password must be at least 6 characters.");
        return false;
    } else {
        showSuccess(passwordInput, "passwordError");
        // Re-validate confirm password if it already has value
        if (confirmPasswordInput.value !== "") {
            validateConfirmPassword();
        }
        return true;
    }
}

function validateConfirmPassword() {
    const confirmVal = confirmPasswordInput.value;
    const passVal = passwordInput.value;

    if (confirmVal === "") {
        showError(confirmPasswordInput, "confirmPasswordError", "Please confirm your password.");
        return false;
    } else if (confirmVal !== passVal) {
        showError(confirmPasswordInput, "confirmPasswordError", "Passwords do not match.");
        return false;
    } else {
        showSuccess(confirmPasswordInput, "confirmPasswordError");
        return true;
    }
}

function validateGender() {
    const value = genderSelect.value;
    if (value === "") {
        showError(genderSelect, "genderError", "Please select your gender.");
        return false;
    } else {
        showSuccess(genderSelect, "genderError");
        return true;
    }
}

function validateTerms() {
    if (!termsCheckbox.checked) {
        document.getElementById("termsError").textContent = "You must agree to the Terms & Conditions.";
        return false;
    } else {
        document.getElementById("termsError").textContent = "";
        return true;
    }
}


const allInputs = [
    { element: firstnameInput, name: "First Name" },
    { element: lastnameInput, name: "Last Name" },
    { element: birthdayInput, name: "Birthday" },
    { element: usernameInput, name: "Username" },
    { element: emailInput, name: "Email" },
    { element: passwordInput, name: "Password" },
    { element: confirmPasswordInput, name: "Confirm Password" },
    { element: genderSelect, name: "Gender" }
];

allInputs.forEach(item => {
    item.element.addEventListener("focus", function () {
        logEvent("FOCUS", `User focused on field '${item.name}'`);
    });
});


firstnameInput.addEventListener("blur", function () {
    logEvent("BLUR", "First Name field lost focus");
    validateFirstname();
});

lastnameInput.addEventListener("blur", function () {
    logEvent("BLUR", "Last Name field lost focus");
    validateLastname();
});

usernameInput.addEventListener("blur", function () {
    logEvent("BLUR", "Username field lost focus");
    validateUsername();
});

emailInput.addEventListener("blur", function () {
    logEvent("BLUR", "Email field lost focus");
    validateEmail();
});

passwordInput.addEventListener("blur", function () {
    logEvent("BLUR", "Password field lost focus");
    validatePassword();
});

confirmPasswordInput.addEventListener("blur", function () {
    logEvent("BLUR", "Confirm Password field lost focus");
    validateConfirmPassword();
});


usernameInput.addEventListener("input", function () {
    logEvent("INPUT", `Username typing: length = ${usernameInput.value.length}`);
    if (usernameInput.value.length >= 4) {
        validateUsername();
    }
});

emailInput.addEventListener("input", function () {
    if (emailInput.classList.contains("invalid")) {
        validateEmail();
    }
});


birthdayInput.addEventListener("change", function () {
    logEvent("CHANGE", `Birthday date selected: ${birthdayInput.value}`);
    validateBirthday();
});

genderSelect.addEventListener("change", function () {
    logEvent("CHANGE", `Gender selected: ${genderSelect.value}`);
    validateGender();
});

termsCheckbox.addEventListener("change", function () {
    logEvent("CHANGE", `Terms Checkbox status: ${termsCheckbox.checked ? 'Checked' : 'Unchecked'}`);
    validateTerms();
});


submitBtn.addEventListener("mouseover", function () {
    logEvent("MOUSEOVER", "Hovering over 'Register User' submit button");
});

submitBtn.addEventListener("mouseout", function () {
    logEvent("MOUSEOUT", "Left 'Register User' submit button");
});


form.addEventListener("reset", function () {
    logEvent("RESET", "Form has been reset");

    
    const inputs = form.querySelectorAll("input, select");
    inputs.forEach(input => {
        input.classList.remove("valid", "invalid");
    });

    const errorMsgs = form.querySelectorAll(".error-msg");
    errorMsgs.forEach(msg => msg.textContent = "");
    ageInfo.textContent = "";
});

clearLogBtn.addEventListener("click", function () {
    eventLogConsole.innerHTML = '<p class="log-entry system-msg">[System] Console log cleared.</p>';
});


form.addEventListener("submit", function (e) {
    
    e.preventDefault();
    logEvent("SUBMIT", "Form submit event triggered");

    
    const isFirstnameValid = validateFirstname();
    const isLastnameValid = validateLastname();
    const isBirthdayValid = validateBirthday();
    const isUsernameValid = validateUsername();
    const isEmailValid = validateEmail();
    const isPasswordValid = validatePassword();
    const isConfirmPasswordValid = validateConfirmPassword();
    const isGenderValid = validateGender();
    const isTermsValid = validateTerms();

    const isFormValid = isFirstnameValid && isLastnameValid && isBirthdayValid &&
                        isUsernameValid && isEmailValid && isPasswordValid &&
                        isConfirmPasswordValid && isGenderValid && isTermsValid;

    if (!isFormValid) {
        logEvent("SUBMIT_FAILED", "Validation failed! Form submission halted.");
        alert("Please correct the errors in the form before submitting.");
        return;
    }

    
    userRecordIndex++;
    logEvent("SUBMIT_SUCCESS", `Adding user '${usernameInput.value}' to DOM table`);

    
    if (emptyRow && emptyRow.parentNode) {
        emptyRow.remove();
    }

    
    const tr = document.createElement("tr");
    tr.id = `user-row-${userRecordIndex}`;

    
    tr.innerHTML = `
        <td>${userRecordIndex}</td>
        <td><strong>${firstnameInput.value.trim()} ${lastnameInput.value.trim()}</strong></td>
        <td>@${usernameInput.value.trim()}</td>
        <td>${emailInput.value.trim()}</td>
        <td>${birthdayInput.value}</td>
        <td>${genderSelect.value}</td>
        <td>
            <button class="action-btn edit-btn">Edit</button>
            <button class="action-btn delete-btn">Delete</button>
        </td>
    `;

    
    const editBtn = tr.querySelector(".edit-btn");
    const deleteBtn = tr.querySelector(".delete-btn");


    
    
    editBtn.addEventListener("click", function () {
        logEvent("CLICK", `Edit triggered for row #${userRecordIndex}`);
        
       
        const row = editBtn.parentElement.parentElement; // <tr> element
        const nameCell = row.children[1];
        const emailCell = row.children[3];

        const currentName = nameCell.textContent;
        const currentEmail = emailCell.textContent;

        const newName = prompt("Edit Full Name:", currentName);
        const newEmail = prompt("Edit Email Address:", currentEmail);

        if (newName !== null && newName.trim() !== "") {
            nameCell.innerHTML = `<strong>${newName.trim()}</strong>`;
        }
        if (newEmail !== null && newEmail.trim() !== "") {
            emailCell.textContent = newEmail.trim();
        }
        logEvent("DOM_EDIT", `Row #${userRecordIndex} updated via DOM traversal`);
    });

    
    deleteBtn.addEventListener("click", function () {
        logEvent("CLICK", `Delete clicked for row #${userRecordIndex}`);
        
        
        const row = deleteBtn.parentElement.parentElement;
        row.remove();
        
        updateRecordCount();
        logEvent("DOM_DELETE", "User record removed from table");

        
        if (usersTableBody.children.length === 0) {
            usersTableBody.appendChild(emptyRow);
        }
    });

    
    usersTableBody.appendChild(tr);

    updateRecordCount();

    
    alert(`Success! User '${firstnameInput.value} ${lastnameInput.value}' has been successfully registered.`);
    form.reset();
});


function updateRecordCount() {
    const rows = usersTableBody.querySelectorAll("tr");
    let count = 0;
    
   
    rows.forEach(r => {
        if (r.id !== "emptyRow") count++;
    });

    recordCountBadge.textContent = `Total Records: ${count}`;
}
