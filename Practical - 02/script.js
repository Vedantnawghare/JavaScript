var cart = [];

document.getElementById("orderNo").innerHTML =
    "QC" + Math.floor(Math.random() * 90000 + 10000);

document.getElementById("orderDate").innerHTML =
    new Date().toLocaleString();

function addItem() {

    let name = document.getElementById("itemName").value.trim();
    let price = Number(document.getElementById("itemPrice").value);
    let qty = Number(document.getElementById("itemQty").value);

    if (name === "" || price <= 0 || qty <= 0) {
        alert("Please fill item name, price and quantity correctly");
        return;
    }

    cart.push({
        name: name,
        price: price,
        qty: qty,
        amount: price * qty
    });

    renderCart();

    document.getElementById("itemName").value = "";
    document.getElementById("itemPrice").value = "";
    document.getElementById("itemQty").value = "1";
}

function toggleUpiOptions() {

    let selectedRadio = document.querySelector('input[name="payModeRadio"]:checked');
    let mode = selectedRadio ? selectedRadio.value : "Cash on Delivery";
    let box = document.getElementById("upiBox");

    if (mode === "UPI") {
        box.style.display = "block";
    } else {
        box.style.display = "none";
    }
}

function toggleUpiId() {

    let app = document.getElementById("upiApp").value;
    let idField = document.getElementById("upiId");

    if (app === "other") {
        idField.style.display = "block";
    } else {
        idField.style.display = "none";
    }
}

function renderCart() {

    let html = "";

    cart.forEach(function (item, i) {
        html += "<tr>" +
            "<td>" + item.name + "</td>" +
            "<td>Rs. " + item.price + "</td>" +
            "<td>" + item.qty + "</td>" +
            "<td>Rs. " + item.amount.toFixed(2) + "</td>" +
            "<td><button class='delBtn' onclick='removeItem(" + i + ")'>Remove</button></td>" +
            "</tr>";
    });

    document.getElementById("cartBody").innerHTML = html;

    calculate();
}

function removeItem(i) {
    cart.splice(i, 1);
    renderCart();
}

function calculate() {

    let cartValue = 0;
    cart.forEach(function (item) {
        cartValue += item.amount;
    });

    let delivery = 0;
    if (cartValue > 0 && cartValue < 500) {
        delivery = 150;
    }

    let tax = cartValue * 0.18;

    let membership = document.getElementById("membership").value;
    let memberDisc = 0;

    if (membership === "prime") {
        memberDisc = cartValue * 0.10;
        delivery = delivery*0.10;
    } else if (membership === "prime_plus") {
        memberDisc = cartValue * 0.25;
        delivery = 0;
    }

    let promo = document.getElementById("promo").value.trim().toUpperCase();
    let promoDisc = 0;

    if (promo === "SAVE50" && cartValue >= 300) {
        promoDisc = 50;
    } else if (promo === "SAVE100" && cartValue >= 500) {
        promoDisc = 100;
    } else if (promo === "FLAT100" && cartValue >= 1000) {
        promoDisc = 100;
    } else if (promo === "WELCOME10") {
        promoDisc = cartValue * 0.10;
    }
    else if (promo === "NEW26") {
        promoDisc = cartValue * 0.20;
    }

    let finalAmt = cartValue + delivery + tax - memberDisc - promoDisc;

    if (finalAmt < 0) finalAmt = 0;

    document.getElementById("totalItems").innerHTML = cart.length;
    document.getElementById("cartValue").innerHTML = cartValue.toFixed(2);
    document.getElementById("deliveryCharge").innerHTML = delivery.toFixed(2);
    document.getElementById("taxAmt").innerHTML = tax.toFixed(2);
    document.getElementById("memberDisc").innerHTML = memberDisc.toFixed(2);
    document.getElementById("promoDisc").innerHTML = promoDisc.toFixed(2);
    document.getElementById("finalAmt").innerHTML = finalAmt.toFixed(2);

    let note = document.getElementById("freeDelNote");
    if (cartValue > 0 && cartValue < 500 && membership !== "prime_plus") {
        note.innerHTML = "Add items worth Rs. " + (500 - cartValue).toFixed(2) + " more for free delivery";
    } else {
        note.innerHTML = "";
    }
}

function makeReceipt() {

    let name = document.getElementById("custName").value.trim();
    let phone = document.getElementById("custPhone").value.trim();
    let address = document.getElementById("custAddress").value.trim();

    if (name === "") {
        alert("Please enter customer name");
        return;
    }

    if (phone.length !== 10) {
        alert("Please enter a valid 10 digit phone number");
        return;
    }

    if (address === "") {
        alert("Please enter delivery address");
        return;
    }

    if (cart.length === 0) {
        alert("Cart is empty, add some items first");
        return;
    }

    let selectedRadio = document.querySelector('input[name="payModeRadio"]:checked');
    let payMode = selectedRadio ? selectedRadio.value : "Cash on Delivery";
    let payDetail = payMode;

    if (payMode === "UPI") {
        let upiApp = document.getElementById("upiApp").value;
        if (upiApp === "other") {
            payDetail = "UPI - " + (document.getElementById("upiId").value.trim() || "not provided");
        } else {
            payDetail = "UPI - " + upiApp;
        }
    }

    let rows = "";
    cart.forEach(function (item) {
        rows += "<tr>" +
            "<td>" + item.name + "</td>" +
            "<td>Rs. " + item.price + "</td>" +
            "<td>" + item.qty + "</td>" +
            "<td>Rs. " + item.amount.toFixed(2) + "</td>" +
            "</tr>";
    });

    let box = document.getElementById("receiptBox");
    box.style.display = "block";
    let placeholder = document.getElementById("receiptPlaceholder");
    if (placeholder) placeholder.style.display = "none";

    box.innerHTML =
        "<h2>Order Receipt</h2>" +
        "<p><b>Customer:</b> " + name + "</p>" +
        "<p><b>Phone:</b> " + phone + "</p>" +
        "<p><b>Address:</b> " + address + "</p>" +
        "<p><b>Order No:</b> " + document.getElementById("orderNo").innerHTML + "</p>" +
        "<p><b>Payment Mode:</b> " + payDetail + "</p>" +
        "<p><b>Delivery Pincode:</b> " + (document.getElementById("pincode").value || "-") + "</p>" +
        "<table border='1' width='100%' style='margin-top:10px;border-collapse:collapse;'>" +
        "<tr><th>Item</th><th>Price</th><th>Qty</th><th>Amount</th></tr>" +
        rows +
        "</table>" +
        "<p style='margin-top:10px;'>Cart Value: Rs. " + document.getElementById("cartValue").innerHTML + "</p>" +
        "<p>Delivery: Rs. " + document.getElementById("deliveryCharge").innerHTML + "</p>" +
        "<p>GST: Rs. " + document.getElementById("taxAmt").innerHTML + "</p>" +
        "<p>Discounts: Rs. " + (Number(document.getElementById("memberDisc").innerHTML) + Number(document.getElementById("promoDisc").innerHTML)).toFixed(2) + "</p>" +
        "<h3 style='margin-top:10px;'>Total Payable: Rs. " + document.getElementById("finalAmt").innerHTML + "</h3>" +
        "<p style='text-align:center;margin-top:12px;'>Thanks for shopping with us!</p>";

    alert("Bill generated successfully!");
}

function printReceipt() {

    let box = document.getElementById("receiptBox");

    if (box.innerHTML.trim() === "") {
        alert("Generate the bill first before printing");
        return;
    }

    window.print();
}

function resetAll() {

    if (!confirm("Clear the whole cart and bill?")) return;

    cart = [];

    document.getElementById("custName").value = "";
    document.getElementById("custPhone").value = "";
    document.getElementById("custAddress").value = "";
    document.getElementById("membership").selectedIndex = 0;
    let firstRadio = document.querySelector('input[name="payModeRadio"][value="Cash on Delivery"]');
    if (firstRadio) firstRadio.checked = true;
    document.getElementById("promo").value = "";
    document.getElementById("pincode").value = "";
    document.getElementById("itemName").value = "";
    document.getElementById("itemPrice").value = "";
    document.getElementById("itemQty").value = "1";

    document.getElementById("upiBox").style.display = "none";
    document.getElementById("upiApp").selectedIndex = 0;
    document.getElementById("upiId").value = "";
    document.getElementById("upiId").style.display = "none";

    document.getElementById("cartBody").innerHTML = "";

    let receipt = document.getElementById("receiptBox");
    receipt.style.display = "none";
    receipt.innerHTML = "";
    let placeholder = document.getElementById("receiptPlaceholder");
    if (placeholder) placeholder.style.display = "flex";

    calculate();
}

document.getElementById("membership").addEventListener("change", calculate);
document.getElementById("promo").addEventListener("input", calculate);

function toggleTheme() {
    let currentTheme = document.documentElement.getAttribute("data-theme");
    let newTheme = currentTheme === "dark" ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", newTheme);
    localStorage.setItem("theme", newTheme);
    updateThemeButton(newTheme);
}

function updateThemeButton(theme) {
    let btn = document.getElementById("themeToggleBtn");
    if (btn) {
        btn.innerHTML = theme === "dark" ? "☀️ Light Mode" : "🌙 Dark Mode";
    }
}

document.addEventListener("DOMContentLoaded", function() {
    let savedTheme = localStorage.getItem("theme") || "dark";
    updateThemeButton(savedTheme);
});