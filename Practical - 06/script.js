let login = document.getElementById("loginBox");
let signup = document.getElementById("signupBox");

let createBtn = document.getElementById("createAccount");
let backBtn = document.getElementById("backLogin");

createBtn.addEventListener("click", function () {
    login.style.display = "none";
    signup.style.display = "block";
    document.getElementById("bottomText").style.display = "none";
});

backBtn.addEventListener("click", function () {
    signup.style.display = "none";
    login.style.display = "block";
    document.getElementById("bottomText").style.display = "block";
});


let pass = document.getElementById("signupPassword");

pass.addEventListener("input", function () {

    let p = pass.value;

    let upper = /[A-Z]/.test(p);
    let lower = /[a-z]/.test(p);
    let number = /[0-9]/.test(p);
    let special = /[!@#$%^&*(),.?":{}|<>]/.test(p);
    let length = p.length >= 8;

    let capital = document.getElementById("capital");
    let small = document.getElementById("small");
    let digit = document.getElementById("digit");
    let specialText = document.getElementById("special");
    let lengthText = document.getElementById("length");

    capital.textContent = upper
        ? "✓ 1 uppercase letter"
        : "✗ 1 uppercase letter";

    small.textContent = lower
        ? "✓ 1 lowercase letter"
        : "✗ 1 lowercase letter";

    digit.textContent = number
        ? "✓ 1 digit"
        : "✗ 1 digit";

    specialText.textContent = special
        ? "✓ 1 special character"
        : "✗ 1 special character";

    lengthText.textContent = length
        ? "✓ Minimum 8 characters"
        : "✗ Minimum 8 characters";

    capital.style.color = upper ? "green" : "red";
    small.style.color = lower ? "green" : "red";
    digit.style.color = number ? "green" : "red";
    specialText.style.color = special ? "green" : "red";
    lengthText.style.color = length ? "green" : "red";
});


let contact = document.getElementById("signupContact");

contact.addEventListener("input", function () {

    let value = contact.value.trim();
    let contactError = document.getElementById("contactError");

    contactError.textContent = "";

    if (value == "") {
        return;
    }

    if (value.includes("@")) {

        if (!value.includes("@")) {
            contactError.textContent = "Email must contain @";
        }
        else if (!value.includes(".")) {
            contactError.textContent =
                "Email must contain a domain like .com or .in";
        }
        else if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(value)) {
            contactError.textContent =
                "Enter a valid email address";
        }
        else {
            contactError.textContent = "✓ Valid email address";
            contactError.style.color = "green";
        }

    } else {

        if (!/^[0-9]+$/.test(value)) {
            contactError.textContent =
                "Phone number should contain only digits";
        }
        else if (value.length != 10) {
            contactError.textContent =
                "Phone number must contain exactly 10 digits";
        }
        else if (!/^[6-9]/.test(value)) {
            contactError.textContent =
                "Phone number must start with 6, 7, 8 or 9";
        }
        else {
            contactError.textContent = "✓ Valid phone number";
            contactError.style.color = "green";
        }
    }
});


let signupForm = document.getElementById("signupForm");

signupForm.addEventListener("submit", function (e) {

    e.preventDefault();

    let fname = document.getElementById("firstName").value.trim();
    let lname = document.getElementById("lastName").value.trim();
    let dob = document.getElementById("dob").value;
    let contactValue = contact.value.trim();
    let password = document.getElementById("signupPassword").value;
    let confirm = document.getElementById("confirmPassword").value;

    let gender = document.querySelector(
        'input[name="gender"]:checked'
    );

    document.querySelectorAll(".error").forEach(function (x) {
        x.textContent = "";
        x.style.color = "red";
    });


    let nameCheck = /^[A-Za-z]+$/;

    if (fname == "") {
        document.getElementById("nameError").textContent =
            "Please enter your first name";
        return;
    }

    if (!nameCheck.test(fname)) {
        document.getElementById("nameError").textContent =
            "First name should contain only letters";
        return;
    }

    if (lname == "") {
        document.getElementById("nameError").textContent =
            "Please enter your last name";
        return;
    }

    if (!nameCheck.test(lname)) {
        document.getElementById("nameError").textContent =
            "Last name should contain only letters";
        return;
    }


    if (dob == "") {
        document.getElementById("dobError").textContent =
            "Please select your date of birth";
        return;
    }


    if (!gender) {
        document.getElementById("genderError").textContent =
            "Please select your gender";
        return;
    }


    if (contactValue == "") {
        document.getElementById("contactError").textContent =
            "Please enter your email or phone number";
        return;
    }


    let emailCheck =
        /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

    let phoneCheck = /^[6-9][0-9]{9}$/;


    if (contactValue.includes("@")) {

        if (!contactValue.includes("@")) {
            document.getElementById("contactError").textContent =
                "Email must contain @";
            return;
        }

        if (!contactValue.includes(".")) {
            document.getElementById("contactError").textContent =
                "Email must contain a domain like .com or .in";
            return;
        }

        if (!emailCheck.test(contactValue)) {
            document.getElementById("contactError").textContent =
                "Invalid email format";
            return;
        }

    } else {

        if (!/^[0-9]+$/.test(contactValue)) {
            document.getElementById("contactError").textContent =
                "Phone number should contain only digits";
            return;
        }

        if (contactValue.length != 10) {
            document.getElementById("contactError").textContent =
                "Phone number must contain exactly 10 digits";
            return;
        }

        if (!/^[6-9]/.test(contactValue)) {
            document.getElementById("contactError").textContent =
                "Phone number must start with 6, 7, 8 or 9";
            return;
        }

        if (!phoneCheck.test(contactValue)) {
            document.getElementById("contactError").textContent =
                "Invalid phone number";
            return;
        }
    }


    let upperCheck = /[A-Z]/.test(password);
    let lowerCheck = /[a-z]/.test(password);
    let numberCheck = /[0-9]/.test(password);
    let specialCheck =
        /[!@#$%^&*(),.?":{}|<>]/.test(password);
    let lengthCheck = password.length >= 8;


    if (!upperCheck) {
        document.getElementById("passwordError").textContent =
            "Password needs at least 1 uppercase letter";
        return;
    }

    if (!lowerCheck) {
        document.getElementById("passwordError").textContent =
            "Password needs at least 1 lowercase letter";
        return;
    }

    if (!numberCheck) {
        document.getElementById("passwordError").textContent =
            "Password needs at least 1 digit";
        return;
    }

    if (!specialCheck) {
        document.getElementById("passwordError").textContent =
            "Password needs at least 1 special character";
        return;
    }

    if (!lengthCheck) {
        document.getElementById("passwordError").textContent =
            "Password must contain at least 8 characters";
        return;
    }


    if (password != confirm) {
        document.getElementById("confirmError").textContent =
            "Confirm password does not match";
        return;
    }


    alert("Account created successfully!");

    console.log("First Name:", fname);
    console.log("Last Name:", lname);
    console.log("DOB:", dob);
    console.log("Gender:", gender.value);
    console.log("Contact:", contactValue);
});


let loginForm = document.getElementById("loginForm");

loginForm.addEventListener("submit", function (e) {

    e.preventDefault();

    let input =
        document.getElementById("loginInput").value.trim();

    let password =
        document.getElementById("loginPassword").value.trim();

    let error =
        document.getElementById("loginError");

    error.textContent = "";
    error.style.color = "red";


    if (input == "") {
        error.textContent =
            "Please enter your email or phone number";
        return;
    }


    if (password == "") {
        error.textContent =
            "Please enter your password";
        return;
    }


    let emailCheck =
        /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

    let phoneCheck = /^[6-9][0-9]{9}$/;


    if (input.includes("@")) {

        if (!input.includes("@")) {
            error.textContent =
                "Email must contain @";
            return;
        }

        if (!input.includes(".")) {
            error.textContent =
                "Email must contain a domain like .com or .in";
            return;
        }

        if (!emailCheck.test(input)) {
            error.textContent =
                "Invalid email format";
            return;
        }

    } else {

        if (!/^[0-9]+$/.test(input)) {
            error.textContent =
                "Phone number should contain only digits";
            return;
        }

        if (input.length != 10) {
            error.textContent =
                "Phone number must contain exactly 10 digits";
            return;
        }

        if (!/^[6-9]/.test(input)) {
            error.textContent =
                "Phone number must start with 6, 7, 8 or 9";
            return;
        }

        if (!phoneCheck.test(input)) {
            error.textContent =
                "Invalid phone number";
            return;
        }
    }


    alert("Login successful!");
});