/**
 * ==============================================================================
 * PRACTICAL 10.2 - ONLINE MUSIC CONCERT EVENT REGISTRATION SYSTEM
 * ==============================================================================
 * 
 * Curriculum Concepts Integrated:
 * - Practical 1: alert(), console.table(), console.time(), console.timeEnd()
 * - Practical 2: Dynamic billing calculation, pass IDs, promo discounts, 18% GST, 
 *                conditional UPI payment toggle, printable VIP pass (window.print())
 * - Practical 5: Arrays of objects, push(), forEach(), map(), filter(), reduce(), splice()
 * - Practical 6: String methods (split, match, replace, indexOf, trim, toUpperCase) & RegEx
 * - Practical 7: Form events (focus, blur, input, change, mouseover, mouseout, submit, reset),
 *                Live event console feed, DOM node creation & traversal (parentElement, children)
 * - Practical 8: Live search & category filtering, dynamic counter badge, empty state
 * - Practical 9: Web Storage API: localStorage (persistent) vs sessionStorage (temporary seat lock)
 * ==============================================================================
 */

// ==============================================================================
// 1. STORAGE KEYS & GLOBAL VARIABLES
// ==============================================================================
const STORAGE_KEY_CONCERT_REG = "live_concert_registrations_v1";
const STORAGE_KEY_CONCERT_DRAFT = "live_concert_draft_v1";
const STORAGE_KEY_CONCERT_THEME = "live_concert_theme_v1";
const SESSION_KEY_SEAT_TOKEN = "live_concert_seat_token";
const SESSION_KEY_SEAT_TIME = "live_concert_seat_remaining";

// Array of registered concert passes (Practical 5)
let concertAttendees = [];

// Session Storage 15-minute Seat Lock Timer
let seatLockRemaining = 900; // 15 minutes (900 seconds)
let seatLockInterval = null;

// Promo coupon state
let activeConcertPromo = "";
let concertPromoDiscount = 0;

// ==============================================================================
// 2. DOM ELEMENT REFERENCES
// ==============================================================================
const concertRegForm = document.getElementById("concertRegForm");
const attendeeNameInput = document.getElementById("attendeeName");
const attendeeDobInput = document.getElementById("attendeeDob");
const calculatedAgeSpan = document.getElementById("calculatedAge");
const attendeeEmailInput = document.getElementById("attendeeEmail");
const attendeePhoneInput = document.getElementById("attendeePhone");
const attendeeCityInput = document.getElementById("attendeeCity");
const emergencyContactInput = document.getElementById("emergencyContact");

const concertTourSelect = document.getElementById("concertTour");
const venueCitySelect = document.getElementById("venueCity");
const seatingZoneSelect = document.getElementById("seatingZone");
const passQuantityInput = document.getElementById("passQuantity");

// Addon Checkboxes
const addonCheckboxes = document.querySelectorAll(".addon-checkbox");

const promoInput = document.getElementById("promoInput");
const promoHint = document.getElementById("promoHint");
const concertUpiBox = document.getElementById("concertUpiBox");
const upiProviderSelect = document.getElementById("upiProvider");
const customVpaContainer = document.getElementById("customVpaContainer");
const customVpaInput = document.getElementById("customVpa");

const ageConsentCheckbox = document.getElementById("ageConsent");
const termsConsentCheckbox = document.getElementById("termsConsent");
const bookPassBtn = document.getElementById("bookPassBtn");
const eventFeed = document.getElementById("eventFeed");

// Badges & Tables
const totalPassesBadge = document.getElementById("totalPassesBadge");
const totalSalesBadge = document.getElementById("totalSalesBadge");
const localDisplay = document.getElementById("localDisplay");
const sessionDisplay = document.getElementById("sessionDisplay");
const seatLockTimerDisplay = document.getElementById("seatLockTimer");
const concertTableBody = document.getElementById("concertTableBody");
const emptyConcertRow = document.getElementById("emptyConcertRow");

// Billing Summary Display
const summaryTour = document.getElementById("summaryTour");
const summaryZone = document.getElementById("summaryZone");
const summaryBasePrice = document.getElementById("summaryBasePrice");
const summaryAddons = document.getElementById("summaryAddons");
const summaryPromo = document.getElementById("summaryPromo");
const summaryGst = document.getElementById("summaryGst");
const summaryGrandTotal = document.getElementById("summaryGrandTotal");

// ==============================================================================
// 3. INITIALIZATION & STORAGE (Practical 9)
// ==============================================================================
document.addEventListener("DOMContentLoaded", function () {
    console.time("ConcertAppInit");
    logConcertEvent("SYSTEM", "Concert Registration Application initialized.");

    // 1. Theme initialization from localStorage
    initTheme();

    // 2. 15-minute Seat Lock in sessionStorage
    initSeatLockSession();

    // 3. Load registrations from localStorage
    loadConcertRegistrations();

    // 4. Restore draft if present
    restoreConcertDraft();

    // 5. Attach Event Listeners
    attachConcertListeners();

    // 6. Calculate initial billing
    calculateConcertBilling();

    // 7. Update storage monitors
    updateStoragePreviews();

    console.timeEnd("ConcertAppInit");
});

// ==============================================================================
// 4. EVENT FEED STREAM (Practical 7)
// ==============================================================================
function logConcertEvent(type, message) {
    const timestamp = new Date().toLocaleTimeString();
    const entry = document.createElement("div");
    entry.className = "feed-entry";

    let extraClass = "";
    if (type === "REGISTER_SUCCESS") extraClass = "ok-log";
    else if (type === "ERROR" || type === "VALIDATION_FAIL") extraClass = "fail-log";
    else if (type === "SYSTEM" || type === "STORAGE") extraClass = "sys-log";

    if (extraClass) entry.classList.add(extraClass);

    entry.innerHTML = `<span class="time">[${timestamp}]</span> <strong>${type}:</strong> ${escapeHtml(message)}`;
    eventFeed.insertBefore(entry, eventFeed.firstChild);

    if (eventFeed.children.length > 40) {
        eventFeed.removeChild(eventFeed.lastChild);
    }
}

function clearEventLogs() {
    eventFeed.innerHTML = `<div class="feed-entry sys-log">[System] Event feed cleared.</div>`;
}

// ==============================================================================
// 5. REGEX & FORM VALIDATIONS (Practicals 6 & 7)
// ==============================================================================
function setFieldErr(el, errId, msg) {
    const span = document.getElementById(errId);
    if (span) span.textContent = msg;
    el.classList.add("invalid");
    el.classList.remove("valid");
}

function setFieldOk(el, errId) {
    const span = document.getElementById(errId);
    if (span) span.textContent = "";
    el.classList.remove("invalid");
    el.classList.add("valid");
}

// Attendee Name: Alphabetic letters and spaces only (Regex Practical 6)
function validateName() {
    const val = attendeeNameInput.value.trim();
    const nameRegex = /^[A-Za-z\s]{3,35}$/;

    if (val === "") {
        setFieldErr(attendeeNameInput, "nameError", "Attendee full name is required.");
        return false;
    } else if (!nameRegex.test(val)) {
        setFieldErr(attendeeNameInput, "nameError", "Only alphabetic letters & spaces allowed (3-35 chars).");
        return false;
    }
    setFieldOk(attendeeNameInput, "nameError");
    return true;
}

// Date of Birth: Must be 18+ for concert entry (Practical 7 age calculation)
function validateDob() {
    const val = attendeeDobInput.value;
    if (val === "") {
        setFieldErr(attendeeDobInput, "dobError", "Date of Birth is required.");
        calculatedAgeSpan.textContent = "";
        return false;
    }

    const birthDate = new Date(val);
    const today = new Date();

    if (birthDate > today) {
        setFieldErr(attendeeDobInput, "dobError", "Date of birth cannot be in the future.");
        calculatedAgeSpan.textContent = "";
        return false;
    }

    // Dynamic Age Calculation
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        age--;
    }

    if (age < 18) {
        setFieldErr(attendeeDobInput, "dobError", `Age is ${age}. Strictly 18+ required for concert arena entry.`);
        calculatedAgeSpan.textContent = `(Age: ${age} - Underage Entry Prohibited)`;
        calculatedAgeSpan.style.color = "var(--danger)";
        return false;
    }

    setFieldOk(attendeeDobInput, "dobError");
    calculatedAgeSpan.textContent = `Verified Age: ${age} years old (Eligible for Arena Entry)`;
    calculatedAgeSpan.style.color = "var(--secondary)";
    return true;
}

// Email Regex (Practical 6)
function validateEmail() {
    const val = attendeeEmailInput.value.trim();
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

    if (val === "") {
        setFieldErr(attendeeEmailInput, "emailError", "Email address is required for e-ticket delivery.");
        return false;
    } else if (!emailRegex.test(val)) {
        setFieldErr(attendeeEmailInput, "emailError", "Enter a valid email address (e.g. user@domain.com).");
        return false;
    }
    setFieldOk(attendeeEmailInput, "emailError");
    return true;
}

// Phone Number Regex: Indian 10-digit mobile
function validatePhone() {
    const val = attendeePhoneInput.value.trim();
    const phoneRegex = /^[6-9]\d{9}$/;

    if (val === "") {
        setFieldErr(attendeePhoneInput, "phoneError", "Mobile number is required for SMS ticket passes.");
        return false;
    } else if (!phoneRegex.test(val)) {
        setFieldErr(attendeePhoneInput, "phoneError", "Enter valid 10-digit mobile number starting with 6-9.");
        return false;
    }
    setFieldOk(attendeePhoneInput, "phoneError");
    return true;
}

// City / State
function validateCity() {
    const val = attendeeCityInput.value.trim();
    if (val.length < 2) {
        setFieldErr(attendeeCityInput, "cityError", "Please enter your city/state.");
        return false;
    }
    setFieldOk(attendeeCityInput, "cityError");
    return true;
}

// Emergency Contact
function validateEmergency() {
    const val = emergencyContactInput.value.trim();
    if (val.length < 5) {
        setFieldErr(emergencyContactInput, "emergencyError", "Emergency contact name & phone required.");
        return false;
    }
    setFieldOk(emergencyContactInput, "emergencyError");
    return true;
}

// Concert Event
function validateConcert() {
    if (concertTourSelect.value === "") {
        setFieldErr(concertTourSelect, "concertError", "Please select a concert tour event.");
        return false;
    }
    setFieldOk(concertTourSelect, "concertError");
    return true;
}

// Venue City
function validateVenue() {
    if (venueCitySelect.value === "") {
        setFieldErr(venueCitySelect, "venueError", "Please choose a venue arena / stadium.");
        return false;
    }
    setFieldOk(venueCitySelect, "venueError");
    return true;
}

// Seating Zone
function validateZone() {
    if (seatingZoneSelect.value === "") {
        setFieldErr(seatingZoneSelect, "zoneError", "Please choose a seating zone.");
        return false;
    }
    setFieldOk(seatingZoneSelect, "zoneError");
    return true;
}

// Pass Quantity
function validateQuantity() {
    const val = Number(passQuantityInput.value);
    if (isNaN(val) || val < 1 || val > 6) {
        setFieldErr(passQuantityInput, "qtyError", "Quantity must be between 1 and 6 passes.");
        return false;
    }
    setFieldOk(passQuantityInput, "qtyError");
    return true;
}

// Custom UPI validation
function validateCustomVpa() {
    const selectedPayRadio = document.querySelector('input[name="concertPayMode"]:checked');
    if (selectedPayRadio && selectedPayRadio.value === "UPI" && upiProviderSelect.value === "other") {
        const val = customVpaInput.value.trim();
        const vpaRegex = /^[\w.-]+@[\w.-]+$/;
        if (val === "" || !vpaRegex.test(val)) {
            setFieldErr(customVpaInput, "vpaError", "Please enter a valid UPI VPA handle (e.g. name@bank).");
            return false;
        }
        setFieldOk(customVpaInput, "vpaError");
    }
    return true;
}

// Age & Terms Checkboxes
function validateConsents() {
    let valid = true;
    const ageErr = document.getElementById("ageConsentError");
    const termsErr = document.getElementById("termsConsentError");

    if (!ageConsentCheckbox.checked) {
        ageErr.textContent = "You must confirm you are at least 18 years of age.";
        valid = false;
    } else {
        ageErr.textContent = "";
    }

    if (!termsConsentCheckbox.checked) {
        termsErr.textContent = "You must agree to the Concert Arena Entry Regulations.";
        valid = false;
    } else {
        termsErr.textContent = "";
    }

    return valid;
}

// Full Form Verification
function validateAllConcertFields() {
    const c1 = validateName();
    const c2 = validateDob();
    const c3 = validateEmail();
    const c4 = validatePhone();
    const c5 = validateCity();
    const c6 = validateEmergency();
    const c7 = validateConcert();
    const c8 = validateVenue();
    const c9 = validateZone();
    const c10 = validateQuantity();
    const c11 = validateCustomVpa();
    const c12 = validateConsents();

    return c1 && c2 && c3 && c4 && c5 && c6 && c7 && c8 && c9 && c10 && c11 && c12;
}

// ==============================================================================
// 6. EVENT LISTENERS (Practical 7)
// ==============================================================================
function attachConcertListeners() {
    // FOCUS & BLUR Events
    const fieldsToTrack = [
        { el: attendeeNameInput, label: "Attendee Name", fn: validateName },
        { el: attendeeEmailInput, label: "Email Address", fn: validateEmail },
        { el: attendeePhoneInput, label: "Mobile Phone", fn: validatePhone },
        { el: attendeeCityInput, label: "City", fn: validateCity },
        { el: emergencyContactInput, label: "Emergency Contact", fn: validateEmergency },
        { el: customVpaInput, label: "Custom UPI VPA", fn: validateCustomVpa }
    ];

    fieldsToTrack.forEach(item => {
        if (!item.el) return;
        item.el.addEventListener("focus", () => {
            logConcertEvent("FOCUS", `User focused on field '${item.label}'`);
        });
        item.el.addEventListener("blur", () => {
            logConcertEvent("BLUR", `User blurred field '${item.label}'`);
            item.fn();
        });
    });

    // CHANGE Events
    attendeeDobInput.addEventListener("change", () => {
        logConcertEvent("CHANGE", `Date of birth chosen: ${attendeeDobInput.value}`);
        validateDob();
    });

    concertTourSelect.addEventListener("change", () => {
        logConcertEvent("CHANGE", `Concert tour selected: ${concertTourSelect.value}`);
        validateConcert();
        calculateConcertBilling();
    });

    venueCitySelect.addEventListener("change", () => {
        logConcertEvent("CHANGE", `Venue selected: ${venueCitySelect.value}`);
        validateVenue();
    });

    seatingZoneSelect.addEventListener("change", () => {
        logConcertEvent("CHANGE", `Zone chosen: ${seatingZoneSelect.value}`);
        validateZone();
        calculateConcertBilling();
    });

    passQuantityInput.addEventListener("input", () => {
        logConcertEvent("INPUT", `Quantity adjusted to: ${passQuantityInput.value}`);
        validateQuantity();
        calculateConcertBilling();
    });

    // Addon Checkbox change events
    addonCheckboxes.forEach(cb => {
        cb.addEventListener("change", () => {
            logConcertEvent("CHANGE", `VIP Add-on toggled: ${cb.id} (${cb.checked ? "Checked" : "Unchecked"})`);
            calculateConcertBilling();
        });
    });

    ageConsentCheckbox.addEventListener("change", validateConsents);
    termsConsentCheckbox.addEventListener("change", validateConsents);

    // MOUSEOVER & MOUSEOUT Events
    bookPassBtn.addEventListener("mouseover", () => {
        logConcertEvent("MOUSEOVER", "Hovering on 'Confirm & Register Concert Pass' button");
    });
    bookPassBtn.addEventListener("mouseout", () => {
        logConcertEvent("MOUSEOUT", "Left registration submit button");
    });

    // RESET Event
    concertRegForm.addEventListener("reset", () => {
        logConcertEvent("RESET", "Concert registration form reset.");
        setTimeout(() => {
            concertRegForm.querySelectorAll("input, select").forEach(el => {
                el.classList.remove("valid", "invalid");
            });
            concertRegForm.querySelectorAll(".err").forEach(el => el.textContent = "");
            calculatedAgeSpan.textContent = "";
            activeConcertPromo = "";
            concertPromoDiscount = 0;
            promoHint.textContent = "Codes: ROCKON (₹200 off), LIVE2026 (15% off), VIP500 (₹500 off on ₹3500+)";
            toggleConcertPayment();
            calculateConcertBilling();
        }, 10);
    });

    // SUBMIT Event
    concertRegForm.addEventListener("submit", handleConcertSubmit);
}

// ==============================================================================
// 7. BILLING CALCULATIONS & PROMO CODES (Practicals 2 & 5)
// ==============================================================================
function calculateConcertBilling() {
    const selectedTourOption = concertTourSelect.options[concertTourSelect.selectedIndex];
    const baseTourPrice = selectedTourOption && selectedTourOption.value !== ""
        ? Number(selectedTourOption.dataset.price)
        : 0;

    const tourName = selectedTourOption && selectedTourOption.value !== ""
        ? selectedTourOption.value
        : "None selected";

    const selectedZoneOption = seatingZoneSelect.options[seatingZoneSelect.selectedIndex];
    const zoneMultiplier = selectedZoneOption ? Number(selectedZoneOption.dataset.multiplier) : 1;
    const zoneName = selectedZoneOption ? selectedZoneOption.value : "General Standing";

    const qty = Math.max(1, Number(passQuantityInput.value) || 1);

    // Passes Subtotal
    const passesCost = (baseTourPrice * zoneMultiplier) * qty;

    // Addons Cost calculation (Practical 5 array iteration)
    let addonsTotal = 0;
    addonCheckboxes.forEach(cb => {
        if (cb.checked) {
            addonsTotal += Number(cb.dataset.fee);
        }
    });

    const subtotal = passesCost + addonsTotal;

    // Promo Code Discounts
    let promoDisc = 0;
    if (activeConcertPromo === "ROCKON") {
        promoDisc = 200;
    } else if (activeConcertPromo === "LIVE2026") {
        promoDisc = subtotal * 0.15; // 15% discount
    } else if (activeConcertPromo === "VIP500" && subtotal >= 3500) {
        promoDisc = 500;
    }

    // 18% GST and Entertainment Tax (Practical 2)
    const taxable = Math.max(0, subtotal - promoDisc);
    const gstAmt = taxable > 0 ? taxable * 0.18 : 0;
    const finalAmount = taxable + gstAmt;

    // Update Billing UI Card
    summaryTour.textContent = tourName;
    summaryZone.textContent = `${zoneName} (${zoneMultiplier}x)`;
    summaryBasePrice.textContent = `₹${passesCost.toFixed(2)} (₹${baseTourPrice} × ${zoneMultiplier}x × ${qty})`;
    summaryAddons.textContent = `+ ₹${addonsTotal.toFixed(2)}`;
    summaryPromo.textContent = `- ₹${promoDisc.toFixed(2)}`;
    summaryGst.textContent = `₹${gstAmt.toFixed(2)}`;
    summaryGrandTotal.textContent = `₹${finalAmount.toFixed(2)}`;

    // VIP Perk Highlight
    const perkBox = document.getElementById("vipPerkBox");
    if (qty >= 3) {
        perkBox.innerHTML = `🌟 <strong>Arena Group VIP Perk:</strong> Booking of ${qty} passes qualifies for Backstage Soundcheck Access & LED Wristbands!`;
        perkBox.style.color = "var(--primary)";
    } else {
        perkBox.innerHTML = `⚡ Tip: Book 3 or more passes to receive complimentary Concert Wristbands & Glow Sticks!`;
        perkBox.style.color = "var(--secondary)";
    }

    return {
        baseTourPrice,
        zoneMultiplier,
        qty,
        passesCost,
        addonsTotal,
        promoDisc,
        gstAmt,
        finalAmount
    };
}

// Promo Code validation & string handling (Practical 6)
function applyPromo() {
    const code = promoInput.value.trim().toUpperCase();
    if (code === "") {
        alert("Please enter a promo code first.");
        return;
    }

    if (code === "ROCKON" || code === "LIVE2026" || code === "VIP500") {
        activeConcertPromo = code;
        promoHint.innerHTML = `✅ Promo <strong>${code}</strong> activated successfully!`;
        promoHint.style.color = "var(--accent)";
        logConcertEvent("PROMO_APPLIED", `Promo code activated: ${code}`);
        calculateConcertBilling();
    } else {
        activeConcertPromo = "";
        promoHint.innerHTML = `❌ Invalid code '${escapeHtml(code)}'. Use ROCKON, LIVE2026, or VIP500.`;
        promoHint.style.color = "var(--danger)";
        calculateConcertBilling();
    }
}

// Payment method conditional fields (Practical 2)
function toggleConcertPayment() {
    const selectedPayRadio = document.querySelector('input[name="concertPayMode"]:checked');
    const mode = selectedPayRadio ? selectedPayRadio.value : "UPI";

    if (mode === "UPI") {
        concertUpiBox.style.display = "block";
    } else {
        concertUpiBox.style.display = "none";
    }
}

function toggleCustomUpiField() {
    if (upiProviderSelect.value === "other") {
        customVpaContainer.style.display = "block";
    } else {
        customVpaContainer.style.display = "none";
    }
}

// ==============================================================================
// 8. REGISTRATION SUBMISSION & VIP PASS CREATION (Practicals 1, 2, 5, 7)
// ==============================================================================
function handleConcertSubmit(e) {
    e.preventDefault();
    console.time("ConcertRegistrationTime");
    logConcertEvent("SUBMIT", "Concert registration submit triggered.");

    const isValid = validateAllConcertFields();
    if (!isValid) {
        logConcertEvent("VALIDATION_FAIL", "Registration validation failed. Please check highlighted errors.");
        alert("⚠️ Please correct the errors in the form before completing concert registration.");
        console.timeEnd("ConcertRegistrationTime");
        return;
    }

    // Dynamic Pass ID (Practical 2)
    const passId = "CONCERT-PASS-" + Math.floor(100000 + Math.random() * 900000);
    const passTimestamp = new Date().toLocaleString();

    // Billing figures
    const bill = calculateConcertBilling();

    // Collect Addons
    const selectedAddons = [];
    if (document.getElementById("addonTshirt").checked) selectedAddons.push("Tour T-Shirt");
    if (document.getElementById("addonParking").checked) selectedAddons.push("VIP Parking");
    if (document.getElementById("addonFood").checked) selectedAddons.push("F&B Pass");
    if (document.getElementById("addonAfterparty").checked) selectedAddons.push("After-Party");

    const addonsText = selectedAddons.length > 0 ? selectedAddons.join(", ") : "None";

    // Payment String
    const payMode = document.querySelector('input[name="concertPayMode"]:checked').value;
    let payDetail = payMode;
    if (payMode === "UPI") {
        if (upiProviderSelect.value === "other") {
            payDetail = `UPI (${customVpaInput.value.trim()})`;
        } else {
            payDetail = `UPI (${upiProviderSelect.value})`;
        }
    }

    // New Concert Registration Object (Practical 5)
    const newRegistration = {
        passId: passId,
        attendeeName: attendeeNameInput.value.trim(),
        dob: attendeeDobInput.value,
        email: attendeeEmailInput.value.trim(),
        phone: attendeePhoneInput.value.trim(),
        city: attendeeCityInput.value.trim(),
        emergency: emergencyContactInput.value.trim(),
        concertTour: concertTourSelect.value,
        venue: venueCitySelect.value,
        seatingZone: seatingZoneSelect.value,
        quantity: bill.qty,
        addons: addonsText,
        paymentMode: payDetail,
        totalPaid: bill.finalAmount.toFixed(2),
        registrationDate: passTimestamp
    };

    // Array push (Practical 5)
    concertAttendees.push(newRegistration);

    // Save to localStorage (Practical 9)
    saveConcertRegistrations();

    // Practical 1: alert() greeting
    alert(
        `🎸 CONCERT PASS REGISTERED!\n\n` +
        `• Pass ID: ${passId}\n` +
        `• Attendee: ${newRegistration.attendeeName}\n` +
        `• Concert: ${newRegistration.concertTour}\n` +
        `• Venue: ${newRegistration.venue}\n` +
        `• Seating: ${newRegistration.seatingZone} (Qty: ${newRegistration.quantity})\n` +
        `• Total Paid: ₹${newRegistration.totalPaid}\n\n` +
        `Your official VIP concert entry badge is ready for viewing and printing below.`
    );

    // Practical 1: console.table & console.timeEnd
    console.log("Live Concert Attendees Roster:");
    console.table(concertAttendees);
    console.timeEnd("ConcertRegistrationTime");

    logConcertEvent("REGISTER_SUCCESS", `Pass ${passId} generated for ${newRegistration.attendeeName}. Total ₹${newRegistration.totalPaid}`);

    // Re-render Table
    renderConcertTable(concertAttendees);

    // Open Printable VIP Pass Modal
    openConcertModal(newRegistration);

    // Clear Draft from localStorage
    localStorage.removeItem(STORAGE_KEY_CONCERT_DRAFT);

    // Reset Form
    concertRegForm.reset();
}

// ==============================================================================
// 9. DYNAMIC DOM TABLE & RECORD ACTIONS (Practicals 2, 5, 7, 8)
// ==============================================================================
function renderConcertTable(dataList) {
    concertTableBody.innerHTML = "";

    if (dataList.length === 0) {
        concertTableBody.appendChild(emptyConcertRow);
        totalPassesBadge.textContent = "Total Passes: 0";
        totalSalesBadge.textContent = "Total Sales: ₹0";
        return;
    }

    // Array forEach (Practical 5)
    dataList.forEach(reg => {
        // Dynamic DOM Creation (Practical 7)
        const tr = document.createElement("tr");
        tr.dataset.id = reg.passId;

        tr.innerHTML = `
            <td>
                <span class="badge badge-neon">${escapeHtml(reg.passId)}</span><br>
                <small style="color:var(--text-muted);">${escapeHtml(reg.registrationDate)}</small>
            </td>
            <td>
                <strong>${escapeHtml(reg.attendeeName)}</strong><br>
                <small>${escapeHtml(reg.email)}</small><br>
                <small style="color:var(--text-muted);">${escapeHtml(reg.phone)} (${escapeHtml(reg.city)})</small>
            </td>
            <td>
                <strong>${escapeHtml(reg.concertTour)}</strong><br>
                <small style="color:var(--secondary);">${escapeHtml(reg.venue)}</small>
            </td>
            <td>
                <span class="badge badge-accent">${escapeHtml(reg.seatingZone)}</span>
            </td>
            <td>
                <small>${escapeHtml(reg.addons)}</small>
            </td>
            <td>
                <strong>${reg.quantity}</strong>
            </td>
            <td>
                <strong style="color:var(--primary);">₹${reg.totalPaid}</strong><br>
                <small style="font-size:10px;">${escapeHtml(reg.paymentMode)}</small>
            </td>
            <td>
                <div class="table-btns">
                    <button class="btn btn-outline btn-xs pass-btn" title="View & Print VIP Pass">🎟️ Pass</button>
                    <button class="btn btn-secondary btn-xs edit-btn" title="Edit Attendee Details">✏️ Edit</button>
                    <button class="btn btn-danger btn-xs delete-btn" title="Refund / Delete Pass">🗑️</button>
                </div>
            </td>
        `;

        // DOM Traversal & Event Binding (Practical 7)
        const passBtn = tr.querySelector(".pass-btn");
        const editBtn = tr.querySelector(".edit-btn");
        const deleteBtn = tr.querySelector(".delete-btn");

        // Pass View Action
        passBtn.addEventListener("click", () => {
            logConcertEvent("CLICK", `Viewing pass modal for ${reg.passId}`);
            openConcertModal(reg);
        });

        // Edit Action via DOM Traversal
        editBtn.addEventListener("click", () => {
            logConcertEvent("CLICK", `Editing pass ${reg.passId}`);
            const newName = prompt("Edit Attendee Full Name:", reg.attendeeName);
            const newEmail = prompt("Edit Attendee Email:", reg.email);

            if (newName && newName.trim() !== "") reg.attendeeName = newName.trim();
            if (newEmail && newEmail.trim() !== "") reg.email = newEmail.trim();

            saveConcertRegistrations();
            renderConcertTable(concertAttendees);
            logConcertEvent("DOM_EDIT", `Pass ${reg.passId} updated via DOM traversal.`);
        });

        // Delete / Refund Action (Practical 5 Array splice & Practical 7 node remove)
        deleteBtn.addEventListener("click", () => {
            if (confirm(`Cancel and refund pass ${reg.passId} for ${reg.attendeeName}?`)) {
                // DOM node remove
                tr.remove();

                // Array splice
                const idx = concertAttendees.findIndex(a => a.passId === reg.passId);
                if (idx !== -1) {
                    concertAttendees.splice(idx, 1);
                }

                saveConcertRegistrations();
                updateConcertMetrics();
                logConcertEvent("DOM_DELETE", `Pass ${reg.passId} refunded and removed.`);

                if (concertAttendees.length === 0) {
                    concertTableBody.appendChild(emptyConcertRow);
                }
            }
        });

        concertTableBody.appendChild(tr);
    });

    updateConcertMetrics();
}

// Array reduce metrics (Practical 5)
function updateConcertMetrics() {
    const totalSales = concertAttendees.reduce((sum, item) => sum + Number(item.totalPaid), 0);
    const totalPasses = concertAttendees.reduce((sum, item) => sum + Number(item.quantity), 0);

    totalPassesBadge.textContent = `Total Passes: ${totalPasses} (${concertAttendees.length} Orders)`;
    totalSalesBadge.textContent = `Total Sales: ₹${totalSales.toFixed(2)}`;

    updateStoragePreviews();
}

// ==============================================================================
// 10. SEARCH & FILTERING (Practical 8.2)
// ==============================================================================
function filterConcertTable() {
    const query = document.getElementById("concertSearch").value.trim().toLowerCase();
    const tourFilter = document.getElementById("filterTour").value;
    const zoneFilter = document.getElementById("filterZone").value;

    // Array filter (Practical 5 & Practical 8.2)
    const results = concertAttendees.filter(item => {
        const matchesQuery = query === "" ||
            item.attendeeName.toLowerCase().includes(query) ||
            item.passId.toLowerCase().includes(query) ||
            item.email.toLowerCase().includes(query) ||
            item.city.toLowerCase().includes(query);

        const matchesTour = tourFilter === "all" || item.concertTour === tourFilter;
        const matchesZone = zoneFilter === "all" || item.seatingZone === zoneFilter;

        return matchesQuery && matchesTour && matchesZone;
    });

    logConcertEvent("FILTER", `Filter executed: ${results.length} results found`);
    renderConcertTable(results);
}

function resetConcertFilters() {
    document.getElementById("concertSearch").value = "";
    document.getElementById("filterTour").value = "all";
    document.getElementById("filterZone").value = "all";
    renderConcertTable(concertAttendees);
}

// Array map analytics exported to console (Practical 1 & 5)
function exportConcertConsole() {
    console.time("ConcertReport");
    console.log("================= ARENA CONCERT ATTENDEE ANALYTICS =================");

    // Array map
    const roster = concertAttendees.map(item => ({
        PassID: item.passId,
        Attendee: item.attendeeName,
        Tour: item.concertTour,
        Zone: item.seatingZone,
        Passes: item.quantity,
        Paid: "₹" + item.totalPaid
    }));

    console.table(roster);
    console.timeEnd("ConcertReport");
    alert("📊 Concert Analytics exported to Console! Press F12 to inspect.");
}

// ==============================================================================
// 11. PRINTABLE VIP CONCERT PASS (Practical 2)
// ==============================================================================
function openConcertModal(reg) {
    const printableConcertTicket = document.getElementById("printableConcertTicket");
    printableConcertTicket.innerHTML = `
        <div class="vip-pass">
            <div class="vip-pass-head">
                <div>
                    <span class="badge badge-neon">ARENA VIP ACCESS</span>
                    <div class="vip-title">${escapeHtml(reg.concertTour)}</div>
                </div>
                <div class="vip-id">
                    Pass Ref: <strong>${escapeHtml(reg.passId)}</strong>
                </div>
            </div>

            <div class="vip-body">
                <div class="vip-cell">
                    <span>Attendee Name</span>
                    <strong>${escapeHtml(reg.attendeeName)}</strong>
                </div>
                <div class="vip-cell">
                    <span>Arena Stadium / City</span>
                    <strong>${escapeHtml(reg.venue)}</strong>
                </div>
                <div class="vip-cell">
                    <span>Seating Zone & Tier</span>
                    <strong>${escapeHtml(reg.seatingZone)}</strong>
                </div>
                <div class="vip-cell">
                    <span>Pass Quantity</span>
                    <strong>${reg.quantity} Pass(es)</strong>
                </div>
                <div class="vip-cell">
                    <span>Selected Add-ons</span>
                    <strong>${escapeHtml(reg.addons)}</strong>
                </div>
                <div class="vip-cell">
                    <span>Payment Mode</span>
                    <strong>${escapeHtml(reg.paymentMode)}</strong>
                </div>
                <div class="vip-cell">
                    <span>Amount Paid</span>
                    <strong>₹${reg.totalPaid}</strong>
                </div>
                <div class="vip-cell">
                    <span>Date of Registration</span>
                    <strong>${escapeHtml(reg.registrationDate)}</strong>
                </div>
            </div>

            <div class="vip-barcode">
                ||| ||||| || |||||| | |||||||| || |||| | ||
            </div>
        </div>
    `;

    document.getElementById("concertPassModal").style.display = "flex";
}

function closeConcertModal() {
    document.getElementById("concertPassModal").style.display = "none";
}

function printConcertTicket() {
    logConcertEvent("PRINT", "window.print() invoked for VIP concert pass.");
    window.print();
}

// ==============================================================================
// 12. WEB STORAGE MANAGER: localStorage vs sessionStorage (Practical 9)
// ==============================================================================
function saveConcertRegistrations() {
    localStorage.setItem(STORAGE_KEY_CONCERT_REG, JSON.stringify(concertAttendees));
    updateStoragePreviews();
}

function loadConcertRegistrations() {
    const saved = localStorage.getItem(STORAGE_KEY_CONCERT_REG);
    if (saved) {
        try {
            concertAttendees = JSON.parse(saved);
        } catch (e) {
            concertAttendees = [];
        }
    } else {
        // Seed default initial registration for instant showcase
        concertAttendees = [
            {
                passId: "CONCERT-PASS-718294",
                attendeeName: "Vedant Nawghare",
                dob: "2004-08-15",
                email: "vedant@livearena.com",
                phone: "9876543210",
                city: "Nagpur, Maharashtra",
                emergency: "Parent (9123456780)",
                concertTour: "Coldplay - Music of the Spheres Tour",
                venue: "Mumbai (DY Patil Sports Stadium)",
                seatingZone: "Platinum VIP Lounge",
                quantity: 2,
                addons: "Tour T-Shirt, VIP Parking",
                paymentMode: "UPI (Google Pay)",
                totalPaid: "22170.82",
                registrationDate: new Date().toLocaleString()
            }
        ];
        saveConcertRegistrations();
    }
    renderConcertTable(concertAttendees);
}

function clearConcertStorage() {
    if (confirm("Clear all concert registrations from localStorage?")) {
        localStorage.removeItem(STORAGE_KEY_CONCERT_REG);
        concertAttendees = [];
        renderConcertTable(concertAttendees);
        logConcertEvent("STORAGE", "Cleared localStorage concert registrations.");
        alert("🗑️ LocalStorage concert registrations cleared!");
    }
}

// Save form draft to localStorage
function saveConcertDraft() {
    const draft = {
        name: attendeeNameInput.value,
        dob: attendeeDobInput.value,
        email: attendeeEmailInput.value,
        phone: attendeePhoneInput.value,
        city: attendeeCityInput.value,
        emergency: emergencyContactInput.value,
        tour: concertTourSelect.value,
        venue: venueCitySelect.value,
        zone: seatingZoneSelect.value,
        savedAt: new Date().toLocaleTimeString()
    };

    localStorage.setItem(STORAGE_KEY_CONCERT_DRAFT, JSON.stringify(draft));
    logConcertEvent("STORAGE", "Concert draft saved into localStorage.");
    updateStoragePreviews();
    alert(`💾 Draft successfully saved to Local Storage at ${draft.savedAt}!\n(Your form details will remain even after page refresh)`);
}

function restoreConcertDraft() {
    const raw = localStorage.getItem(STORAGE_KEY_CONCERT_DRAFT);
    if (raw) {
        try {
            const draft = JSON.parse(raw);
            if (attendeeNameInput.value === "" && draft.name) attendeeNameInput.value = draft.name;
            if (attendeeDobInput.value === "" && draft.dob) {
                attendeeDobInput.value = draft.dob;
                validateDob();
            }
            if (attendeeEmailInput.value === "" && draft.email) attendeeEmailInput.value = draft.email;
            if (attendeePhoneInput.value === "" && draft.phone) attendeePhoneInput.value = draft.phone;
            if (attendeeCityInput.value === "" && draft.city) attendeeCityInput.value = draft.city;
            if (emergencyContactInput.value === "" && draft.emergency) emergencyContactInput.value = draft.emergency;
            if (draft.tour) concertTourSelect.value = draft.tour;
            if (draft.venue) venueCitySelect.value = draft.venue;
            if (draft.zone) seatingZoneSelect.value = draft.zone;
            logConcertEvent("STORAGE", "Restored existing concert draft from localStorage.");
        } catch (e) {
            console.error("Concert draft failed to restore", e);
        }
    }
}

// SessionStorage 15-minute Seat Lock (Practical 9)
function initSeatLockSession() {
    let token = sessionStorage.getItem(SESSION_KEY_SEAT_TOKEN);
    if (!token) {
        token = "ARENA-LOCK-" + Math.random().toString(36).substring(2, 10).toUpperCase();
        sessionStorage.setItem(SESSION_KEY_SEAT_TOKEN, token);
    }

    let savedTime = sessionStorage.getItem(SESSION_KEY_SEAT_TIME);
    seatLockRemaining = savedTime ? parseInt(savedTime, 10) : 900;

    startSeatLockCountdown();
}

function startSeatLockCountdown() {
    if (seatLockInterval) clearInterval(seatLockInterval);

    seatLockInterval = setInterval(() => {
        seatLockRemaining--;
        sessionStorage.setItem(SESSION_KEY_SEAT_TIME, seatLockRemaining);

        const mins = Math.floor(seatLockRemaining / 60);
        const secs = seatLockRemaining % 60;
        seatLockTimerDisplay.textContent = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;

        if (seatLockRemaining <= 0) {
            clearInterval(seatLockInterval);
            alert("⏱️ 15-Minute Seat Lock Expired! Your reserved concert seats have been released back to the arena.");
            resetSeatLockTimer();
        }
    }, 1000);
}

function resetSeatLockTimer() {
    seatLockRemaining = 900;
    sessionStorage.setItem(SESSION_KEY_SEAT_TIME, "900");
    startSeatLockCountdown();
    logConcertEvent("STORAGE", "Seat Lock countdown reset to 15:00.");
}

// Dual Storage Previews (Practical 9.2)
function updateStoragePreviews() {
    const rawLocal = localStorage.getItem(STORAGE_KEY_CONCERT_REG);
    if (rawLocal) {
        localDisplay.textContent = `Key: ${STORAGE_KEY_CONCERT_REG}\nSize: ${rawLocal.length} bytes\nData:\n${rawLocal.substring(0, 120)}...`;
    } else {
        localDisplay.innerHTML = `<span class="dim-text">(localStorage is empty)</span>`;
    }

    const token = sessionStorage.getItem(SESSION_KEY_SEAT_TOKEN);
    const time = sessionStorage.getItem(SESSION_KEY_SEAT_TIME);
    if (token) {
        sessionDisplay.textContent = `Seat Lock Token: ${token}\nTime Left: ${time}s\nStatus: Reserved (Temporary)`;
    } else {
        sessionDisplay.innerHTML = `<span class="dim-text">(sessionStorage is empty)</span>`;
    }
}

// Theme Preference Toggle (Practical 9.1)
function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute("data-theme") || "dark";
    const newTheme = currentTheme === "dark" ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", newTheme);
    localStorage.setItem(STORAGE_KEY_CONCERT_THEME, newTheme);
    updateThemeButton(newTheme);
    logConcertEvent("THEME", `Switched theme to ${newTheme} mode.`);
}

function updateThemeButton(theme) {
    const btn = document.getElementById("themeBtn");
    if (btn) {
        btn.innerHTML = theme === "dark" ? "☀️ Festival Light" : "🌙 Neon Arena";
    }
}

function initTheme() {
    const saved = localStorage.getItem(STORAGE_KEY_CONCERT_THEME) || "dark";
    document.documentElement.setAttribute("data-theme", saved);
    updateThemeButton(saved);
}

// Safe HTML Escaping
function escapeHtml(str) {
    if (!str) return "";
    return String(str)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}
