let students = [
    { name: "Ved", marks: 85 },
    { name: "Rahul", marks: 72 },
    { name: "Priya", marks: 91 },
    { name: "Aman", marks: 64 }
];

function displayStudents() {
    let list = document.getElementById("studentList");
    list.innerHTML = "";

    students.forEach(function(student, index) {
        list.innerHTML += `
            <div class="student">
                <span class="student-name">${index + 1}. ${student.name}</span>
                <span class="student-marks">${student.marks} Marks</span>
            </div>
        `;
    });

    updateResults();
}

function addStudent() {
    let name = document.getElementById("studentName").value.trim();
    let marks = Number(document.getElementById("studentMarks").value);

    if (name === "" || document.getElementById("studentMarks").value === "") {
        showMessage("Please enter student name and marks.");
        return;
    }

    if (marks < 0 || marks > 100) {
        showMessage("Marks must be between 0 and 100.");
        return;
    }

    students.push({
        name: name,
        marks: marks
    });

    document.getElementById("studentName").value = "";
    document.getElementById("studentMarks").value = "";

    showMessage("Student added.");
    displayStudents();
}

function popStudent() {
    if (students.length === 0) {
        showMessage("No students available.");
        return;
    }

    let student = students.pop();
    showMessage(student.name + " removed.");
    displayStudents();
}

function shiftStudent() {
    if (students.length === 0) {
        showMessage("No students available.");
        return;
    }

    let student = students.shift();
    showMessage(student.name + " removed.");
    displayStudents();
}

function unshiftStudent() {
    students.unshift({
        name: "New Student",
        marks: 50
    });

    showMessage("New student added.");
    displayStudents();
}

function spliceStudent() {
    if (students.length === 0) {
        showMessage("No students available.");
        return;
    }

    let index = Math.floor(students.length / 2);
    let student = students.splice(index, 1);

    showMessage(student[0].name + " removed.");
    displayStudents();
}

function sliceStudents() {
    if (students.length === 0) {
        showMessage("No students available.");
        return;
    }

    let result = students.slice(0, 2);
    let text = "Slice: ";

    for (let i = 0; i < result.length; i++) {
        text += result[i].name + " (" + result[i].marks + ")";

        if (i < result.length - 1) {
            text += ", ";
        }
    }

    showMessage(text);
}

function useMap() {
    let marks = students.map(function(student) {
        return student.marks;
    });

    document.getElementById("mapResult").textContent =
        marks.length ? marks.join(", ") : "No students available.";
}

function useFilter() {
    let passed = students.filter(function(student) {
        return student.marks >= 50;
    });

    let result = "";

    passed.forEach(function(student, index) {
        result += student.name + " (" + student.marks + ")";

        if (index < passed.length - 1) {
            result += ", ";
        }
    });

    document.getElementById("filterResult").textContent =
        result || "No students scored 50 or above.";
}

function useForEach() {
    let result = "";

    students.forEach(function(student, index) {
        result += (index + 1) + ". " + student.name + " - " + student.marks;

        if (index < students.length - 1) {
            result += " | ";
        }
    });

    document.getElementById("forEachResult").textContent =
        result || "No students available.";
}

function updateResults() {
    if (students.length === 0) {
        document.getElementById("maximumMarks").textContent = "-";
        document.getElementById("minimumMarks").textContent = "-";
        document.getElementById("mapResult").textContent = "No students available.";
        document.getElementById("filterResult").textContent = "No students available.";
        document.getElementById("forEachResult").textContent = "No students available.";
        return;
    }

    let marks = students.map(function(student) {
        return student.marks;
    });

    let max = Math.max(...marks);
    let min = Math.min(...marks);

    let maxStudent;
    let minStudent;

    for (let i = 0; i < students.length; i++) {
        if (students[i].marks === max) {
            maxStudent = students[i];
        }

        if (students[i].marks === min) {
            minStudent = students[i];
        }
    }

    document.getElementById("maximumMarks").textContent =
        maxStudent.name + " - " + maxStudent.marks;

    document.getElementById("minimumMarks").textContent =
        minStudent.name + " - " + minStudent.marks;

    useMap();
    useFilter();
    useForEach();
}

function showMessage(message) {
    document.getElementById("operationMessage").textContent = message;
}

displayStudents();