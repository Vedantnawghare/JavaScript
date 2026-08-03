function calculateGrade() {

    let name = document.getElementById("name").value;
    let prn = document.getElementById("prn").value;
    let studentClass = document.getElementById("class").value;
    let section = document.getElementById("section").value;
    let dob = document.getElementById("dob").value;

    let m1 = Number(document.getElementById("m1").value);
    let dbms = Number(document.getElementById("dbms").value);
    let js = Number(document.getElementById("js").value);
    let toc = Number(document.getElementById("toc").value);
    let python = Number(document.getElementById("python").value);

    if(name=="" || prn=="" || studentClass=="" || section=="" || dob==""){
        document.getElementById("result").innerHTML="Please fill all student details.";
        return;
    }

    let total = m1 + dbms + js + toc + python;
    let percentage = total / 5;

    let grade;

    if(percentage > 90)
        grade = "A+";
    else if(percentage >= 81)
        grade = "A";
    else if(percentage >= 66)
        grade = "B";
    else if(percentage >= 50)
        grade = "C";
    else
        grade = "Fail";

    document.getElementById("result").innerHTML =
    "<h3>Student Report Card</h3>" +
    "<b>Name:</b> " + name + "<br>" +
    "<b>PRN:</b> " + prn + "<br>" +
    "<b>Class:</b> " + studentClass + "<br>" +
    "<b>Section:</b> " + section + "<br>" +
    "<b>Date of Birth:</b> " + dob + "<br><br>" +
    "<b>Total Marks:</b> " + total + " / 500<br>" +
    "<b>Percentage:</b> " + percentage.toFixed(2) + "%<br>" +
    "<b>Overall Grade:</b> " + grade;
}