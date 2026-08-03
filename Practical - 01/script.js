function greet() {

    let name = document.getElementById("name").value;
    alert("Welcome to SIT Nagpur, " + name + "!!!");

    console.table([
        {
            Name: "Vedant Nawghare",
            Course: "JavaScript"
        }
    ]);

    console.time("Execution");
    console.timeEnd("Execution");

}