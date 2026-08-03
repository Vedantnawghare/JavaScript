function reverseString(str) {
    return str.split("").reverse().join("");
}

function message() {
    var msg = "Palindrome Checker";

    function display() {
        return msg;
    }

    return display;
}

function checkPalindrome() {
    try {
        var word = document.getElementById("word").value.trim();

        if (word === "") {
            throw "Please enter a word.";
        }

        if (!/^[A-Za-z]+$/.test(word)) {
            throw "Only alphabets are allowed.";
        }

        if (word.length < 3) {
            throw "Please enter at least 3 characters.";
        }

        if (word.length > 20) {
            throw "Maximum 20 characters are allowed.";
        }

        let input = word.toLowerCase();
        var reverse = reverseString(input);

        document.write("<h2>" + message()() + "</h2>");

        if (input === reverse) {
            document.write("<b>Word :</b> " + word + "<br><br>");
            document.write("<b>Result :</b> Palindrome");
        } else {
            document.write("<b>Word :</b> " + word + "<br><br>");
            document.write("<b>Result :</b> Not a Palindrome");
        }

    } catch (error) {
        alert(error);
    }
}