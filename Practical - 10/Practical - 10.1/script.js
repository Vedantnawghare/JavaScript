/**
 * ==============================================================================
 * PRACTICAL 10.1 - TECHNICAL WORKSHOP TICKET BOOKING SYSTEM
 * ==============================================================================
 * 
 * Curriculum Concepts Integrated:
 * - Practical 1: alert(), console.table(), console.time(), console.timeEnd()
 * - Practical 2: Billing calculations, dynamic order IDs, promo codes, 18% GST, 
 *                conditional UPI mode, printable receipt pass (window.print())
 * - Practical 5: Arrays of objects, push(), forEach(), map(), filter(), reduce(), splice()
 * - Practical 6: String methods (split, match, replace, indexOf, trim, toUpperCase) & RegEx
 * - Practical 7: Form events (focus, blur, input, change, mouseover, mouseout, submit, reset),
 *                Live event console stream, DOM node creation & traversal (parentElement, children)
 * - Practical 8: Live search & category filtering, dynamic record badge, empty state
 * - Practical 9: Web Storage API: localStorage (persistent) vs sessionStorage (temporary)
 * ==============================================================================
 */

// ==============================================================================
// 1. GLOBAL STATE & STORAGE KEYS
// ==============================================================================
const STORAGE_KEY_BOOKINGS = "sit_workshop_bookings_v1";
const STORAGE_KEY_DRAFT = "sit_workshop_draft_v1";
const STORAGE_KEY_THEME = "sit_workshop_theme_v1";
const SESSION_KEY_TOKEN = "sit_workshop_session_token";
const SESSION_KEY_TIME = "sit_workshop_session_remaining";

// Array of booking objects (Practical 2 & Practical 5)
let workshopBookings = [];

// Session Hold Countdown Timer (SessionStorage)
let sessionSecondsRemaining = 600; // 10 minutes
let sessionTimerInterval = null;

// Promo Code applied status
let activePromoDiscount = 0;
let appliedPromoCode = "";

// ==============================================================================
// 2. DOM ELEMENT REFERENCES
// ==============================================================================
const workshopForm = document.getElementById("workshopForm");
const firstnameInput = document.getElementById("firstname");
const lastnameInput = document.getElementById("lastname");
const studentPrnInput = document.getElementById("studentPrn");
const collegeNameInput = document.getElementById("collegeName");
const departmentSelect = document.getElementById("department");
const academicYearSelect = document.getElementById("academicYear");
const studentEmailInput = document.getElementById("studentEmail");
const studentPhoneInput = document.getElementById("studentPhone");

const workshopTrackSelect = document.getElementById("workshopTrack");
const passTierSelect = document.getElementById("passTier");
const batchTimeSelect = document.getElementById("batchTime");
const ticketQuantityInput = document.getElementById("ticketQuantity");
const membershipTypeSelect = document.getElementById("membershipType");
const bringLaptopCheckbox = document.getElementById("bringLaptop");
const termsAgreementCheckbox = document.getElementById("termsAgreement");

const promoCodeInput = document.getElementById("promoCode");
const upiBox = document.getElementById("upiBox");
const upiAppSelect = document.getElementById("upiApp");
const customUpiGroup = document.getElementById("customUpiGroup");
const customUpiIdInput = document.getElementById("customUpiId");

const submitBtn = document.getElementById("submitBtn");
const resetBtn = document.getElementById("resetBtn");
const eventStreamBox = document.getElementById("eventStreamBox");
const bookingsTableBody = document.getElementById("bookingsTableBody");
const emptyTableRow = document.getElementById("emptyTableRow");

// Badges & Displays
const totalRecordsBadge = document.getElementById("totalRecordsBadge");
const totalRevenueBadge = document.getElementById("totalRevenueBadge");
const localDataPreview = document.getElementById("localDataPreview");
const sessionDataPreview = document.getElementById("sessionDataPreview");
const sessionTimerDisplay = document.getElementById("sessionTimer");

// Billing Summary Elements
const billTrackName = document.getElementById("billTrackName");
const billBaseRate = document.getElementById("billBaseRate");
const billTier = document.getElementById("billTier");
const billMemberDiscount = document.getElementById("billMemberDiscount");
const billPromoDiscount = document.getElementById("billPromoDiscount");
const billGst = document.getElementById("billGst");
const billFinalAmount = document.getElementById("billFinalAmount");

// ==============================================================================
// 3. INITIALIZATION & STORAGE RESTORATION (Practical 9)
// ==============================================================================
document.addEventListener("DOMContentLoaded", function () {
    console.time("AppInitialization");
    logEvent("SYSTEM", "DOM fully loaded. Initializing Workshop Application...");

    // 1. Initialize Theme from localStorage
    initTheme();

    // 2. Initialize Session Storage Token & Timer (sessionStorage)
    initSessionStorage();

    // 3. Load Bookings from localStorage
    loadBookingsFromStorage();

    // 4. Check for auto-saved draft in localStorage
    restoreDraftIfAvailable();

    // 5. Attach Comprehensive Event Listeners (Practical 7)
    attachFormEventListeners();

    // 6. Run initial billing calculation
    calculateBilling();

    // 7. Update dual storage preview widgets
    updateStoragePreviews();

    console.timeEnd("AppInitialization");
});

// ==============================================================================
// 4. EVENT LOGGING STREAM (Practical 7)
// ==============================================================================
function logEvent(eventType, description) {
    const timestamp = new Date().toLocaleTimeString();
    const entry = document.createElement("div");
    entry.className = "console-entry";

    let colorClass = "";
    if (eventType === "SUBMIT_SUCCESS") colorClass = "success-msg";
    else if (eventType === "ERROR" || eventType === "VALIDATION_FAIL") colorClass = "error-msg-log";
    else if (eventType === "SYSTEM" || eventType === "STORAGE") colorClass = "system-msg";

    if (colorClass) entry.classList.add(colorClass);

    entry.innerHTML = `<span class="timestamp">[${timestamp}]</span> <strong>${eventType}:</strong> ${escapeHtml(description)}`;
    eventStreamBox.insertBefore(entry, eventStreamBox.firstChild);

    // Limit log memory to 40 items
    if (eventStreamBox.children.length > 40) {
        eventStreamBox.removeChild(eventStreamBox.lastChild);
    }
}

function clearEventConsole() {
    eventStreamBox.innerHTML = `<div class="console-entry system-msg">[System] Console logs cleared by user.</div>`;
}

// ==============================================================================
// 5. FORM VALIDATION LOGIC WITH REGULAR EXPRESSIONS (Practicals 6 & 7)
// ==============================================================================
function setError(element, errorId, message) {
    const errorSpan = document.getElementById(errorId);
    if (errorSpan) errorSpan.textContent = message;
    element.classList.add("invalid");
    element.classList.remove("valid");
}

function setSuccess(element, errorId) {
    const errorSpan = document.getElementById(errorId);
    if (errorSpan) errorSpan.textContent = "";
    element.classList.remove("invalid");
    element.classList.add("valid");
}

// First Name: Letters only (Regex Practical 6)
function validateFirstName() {
    const val = firstnameInput.value.trim();
    const nameRegex = /^[A-Za-z]{2,25}$/;

    if (val === "") {
        setError(firstnameInput, "firstnameError", "First name is required.");
        return false;
    } else if (!nameRegex.test(val)) {
        setError(firstnameInput, "firstnameError", "Letters only (2-25 characters).");
        return false;
    }
    setSuccess(firstnameInput, "firstnameError");
    return true;
}

// Last Name: Letters only
function validateLastName() {
    const val = lastnameInput.value.trim();
    const nameRegex = /^[A-Za-z]{2,25}$/;

    if (val === "") {
        setError(lastnameInput, "lastnameError", "Last name is required.");
        return false;
    } else if (!nameRegex.test(val)) {
        setError(lastnameInput, "lastnameError", "Letters only (2-25 characters).");
        return false;
    }
    setSuccess(lastnameInput, "lastnameError");
    return true;
}

// Student PRN: Exactly 11 numeric digits
function validateStudentPrn() {
    const val = studentPrnInput.value.trim();
    const prnRegex = /^\d{11}$/;

    if (val === "") {
        setError(studentPrnInput, "studentPrnError", "PRN / Roll No is required.");
        return false;
    } else if (!prnRegex.test(val)) {
        setError(studentPrnInput, "studentPrnError", "PRN must be exactly 11 numeric digits.");
        return false;
    }
    setSuccess(studentPrnInput, "studentPrnError");
    return true;
}

// College Name
function validateCollegeName() {
    const val = collegeNameInput.value.trim();
    if (val.length < 3) {
        setError(collegeNameInput, "collegeNameError", "Please enter valid college/university name.");
        return false;
    }
    setSuccess(collegeNameInput, "collegeNameError");
    return true;
}

// Department / Branch
function validateDepartment() {
    if (departmentSelect.value === "") {
        setError(departmentSelect, "departmentError", "Please select your academic department.");
        return false;
    }
    setSuccess(departmentSelect, "departmentError");
    return true;
}

// Academic Year
function validateAcademicYear() {
    if (academicYearSelect.value === "") {
        setError(academicYearSelect, "academicYearError", "Please select your academic year.");
        return false;
    }
    setSuccess(academicYearSelect, "academicYearError");
    return true;
}

// Email: Strict standard email regex (Practical 6)
function validateStudentEmail() {
    const val = studentEmailInput.value.trim();
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

    if (val === "") {
        setError(studentEmailInput, "studentEmailError", "Email address is required.");
        return false;
    } else if (!emailRegex.test(val)) {
        setError(studentEmailInput, "studentEmailError", "Enter a valid email address (e.g. name@domain.com).");
        return false;
    }
    setSuccess(studentEmailInput, "studentEmailError");
    return true;
}

// Phone: Indian 10-digit mobile starting with 6-9
function validateStudentPhone() {
    const val = studentPhoneInput.value.trim();
    const phoneRegex = /^[6-9]\d{9}$/;

    if (val === "") {
        setError(studentPhoneInput, "studentPhoneError", "Contact number is required.");
        return false;
    } else if (!phoneRegex.test(val)) {
        setError(studentPhoneInput, "studentPhoneError", "Enter valid 10-digit mobile number (starts with 6-9).");
        return false;
    }
    setSuccess(studentPhoneInput, "studentPhoneError");
    return true;
}

// Workshop Track
function validateWorkshopTrack() {
    if (workshopTrackSelect.value === "") {
        setError(workshopTrackSelect, "workshopTrackError", "Please choose a workshop track.");
        return false;
    }
    setSuccess(workshopTrackSelect, "workshopTrackError");
    return true;
}

// Pass Tier
function validatePassTier() {
    if (passTierSelect.value === "") {
        setError(passTierSelect, "passTierError", "Please select a ticket tier.");
        return false;
    }
    setSuccess(passTierSelect, "passTierError");
    return true;
}

// Batch Time
function validateBatchTime() {
    if (batchTimeSelect.value === "") {
        setError(batchTimeSelect, "batchTimeError", "Please select preferred batch timing.");
        return false;
    }
    setSuccess(batchTimeSelect, "batchTimeError");
    return true;
}

// Ticket Quantity (1 - 5)
function validateTicketQuantity() {
    const val = Number(ticketQuantityInput.value);
    if (isNaN(val) || val < 1 || val > 5) {
        setError(ticketQuantityInput, "ticketQuantityError", "Quantity must be between 1 and 5.");
        return false;
    }
    setSuccess(ticketQuantityInput, "ticketQuantityError");
    return true;
}

// Custom UPI validation if UPI + other selected
function validateCustomUpi() {
    const selectedPayRadio = document.querySelector('input[name="paymentMethod"]:checked');
    if (selectedPayRadio && selectedPayRadio.value === "UPI" && upiAppSelect.value === "other") {
        const val = customUpiIdInput.value.trim();
        const upiRegex = /^[\w.-]+@[\w.-]+$/;
        if (val === "" || !upiRegex.test(val)) {
            setError(customUpiIdInput, "customUpiIdError", "Please enter a valid UPI VPA (e.g. user@bank).");
            return false;
        }
        setSuccess(customUpiIdInput, "customUpiIdError");
    }
    return true;
}

// Terms Agreement Checkbox
function validateTerms() {
    const termsError = document.getElementById("termsError");
    if (!termsAgreementCheckbox.checked) {
        termsError.textContent = "You must accept the Workshop terms and attendance guidelines.";
        return false;
    }
    termsError.textContent = "";
    return true;
}

// Overall Form Validation Sweep
function validateEntireForm() {
    const v1 = validateFirstName();
    const v2 = validateLastName();
    const v3 = validateStudentPrn();
    const v4 = validateCollegeName();
    const v5 = validateDepartment();
    const v6 = validateAcademicYear();
    const v7 = validateStudentEmail();
    const v8 = validateStudentPhone();
    const v9 = validateWorkshopTrack();
    const v10 = validatePassTier();
    const v11 = validateBatchTime();
    const v12 = validateTicketQuantity();
    const v13 = validateCustomUpi();
    const v14 = validateTerms();

    return v1 && v2 && v3 && v4 && v5 && v6 && v7 && v8 && v9 && v10 && v11 && v12 && v13 && v14;
}

// ==============================================================================
// 6. EVENT LISTENERS SETUP (Practical 7)
// ==============================================================================
function attachFormEventListeners() {
    // FOCUS & BLUR Listeners
    const monitoredFields = [
        { el: firstnameInput, name: "First Name", validator: validateFirstName },
        { el: lastnameInput, name: "Last Name", validator: validateLastName },
        { el: studentPrnInput, name: "Student PRN", validator: validateStudentPrn },
        { el: collegeNameInput, name: "College Name", validator: validateCollegeName },
        { el: studentEmailInput, name: "Student Email", validator: validateStudentEmail },
        { el: studentPhoneInput, name: "Mobile Phone", validator: validateStudentPhone },
        { el: customUpiIdInput, name: "Custom UPI ID", validator: validateCustomUpi }
    ];

    monitoredFields.forEach(item => {
        if (!item.el) return;
        // FOCUS Event
        item.el.addEventListener("focus", function () {
            logEvent("FOCUS", `User entered field '${item.name}'`);
        });

        // BLUR Event
        item.el.addEventListener("blur", function () {
            logEvent("BLUR", `User exited field '${item.name}'`);
            item.validator();
        });
    });

    // INPUT Events (continuous validation and recalculation)
    studentEmailInput.addEventListener("input", function () {
        if (studentEmailInput.classList.contains("invalid")) validateStudentEmail();
    });

    studentPhoneInput.addEventListener("input", function () {
        if (studentPhoneInput.classList.contains("invalid")) validateStudentPhone();
    });

    ticketQuantityInput.addEventListener("input", function () {
        logEvent("INPUT", `Ticket quantity adjusted: ${ticketQuantityInput.value}`);
        validateTicketQuantity();
        calculateBilling();
    });

    // CHANGE Events (Select dropdowns & checkboxes)
    workshopTrackSelect.addEventListener("change", function () {
        logEvent("CHANGE", `Workshop Track selected: ${workshopTrackSelect.value}`);
        validateWorkshopTrack();
        calculateBilling();
    });

    passTierSelect.addEventListener("change", function () {
        logEvent("CHANGE", `Pass Tier changed: ${passTierSelect.value}`);
        validatePassTier();
        calculateBilling();
    });

    membershipTypeSelect.addEventListener("change", function () {
        logEvent("CHANGE", `Membership changed: ${membershipTypeSelect.value}`);
        calculateBilling();
    });

    batchTimeSelect.addEventListener("change", function () {
        logEvent("CHANGE", `Batch Timing selected: ${batchTimeSelect.value}`);
        validateBatchTime();
    });

    departmentSelect.addEventListener("change", validateDepartment);
    academicYearSelect.addEventListener("change", validateAcademicYear);
    termsAgreementCheckbox.addEventListener("change", validateTerms);

    // MOUSEOVER & MOUSEOUT Events (Interactive buttons)
    submitBtn.addEventListener("mouseover", function () {
        logEvent("MOUSEOVER", "User hovering on 'Confirm & Book Ticket' button");
    });
    submitBtn.addEventListener("mouseout", function () {
        logEvent("MOUSEOUT", "User hovered off submit button");
    });

    // RESET Event
    workshopForm.addEventListener("reset", function () {
        logEvent("RESET", "Form reset event triggered by user");
        setTimeout(() => {
            // Remove validation styling
            workshopForm.querySelectorAll("input, select").forEach(el => {
                el.classList.remove("valid", "invalid");
            });
            workshopForm.querySelectorAll(".error-msg").forEach(el => el.textContent = "");
            activePromoDiscount = 0;
            appliedPromoCode = "";
            document.getElementById("promoStatus").textContent = "Available: SIT50 (₹50 off), TECH100 (₹100 off on ₹800+), SAVE20 (20% off)";
            togglePaymentFields();
            calculateBilling();
        }, 10);
    });

    // SUBMIT Event
    workshopForm.addEventListener("submit", handleFormSubmit);
}

// ==============================================================================
// 7. DYNAMIC BILLING CALCULATIONS (Practical 2 & Practical 5)
// ==============================================================================
function calculateBilling() {
    const selectedTrackOption = workshopTrackSelect.options[workshopTrackSelect.selectedIndex];
    const basePrice = selectedTrackOption && selectedTrackOption.value !== ""
        ? Number(selectedTrackOption.dataset.baseprice)
        : 0;

    const trackName = selectedTrackOption && selectedTrackOption.value !== ""
        ? selectedTrackOption.value
        : "None selected";

    const selectedTierOption = passTierSelect.options[passTierSelect.selectedIndex];
    const tierMultiplier = selectedTierOption ? Number(selectedTierOption.dataset.multiplier) : 1;
    const tierName = selectedTierOption ? selectedTierOption.text.split(" (")[0] : "Standard";

    const qty = Math.max(1, Number(ticketQuantityInput.value) || 1);

    // Subtotal before discounts
    const subtotal = (basePrice * tierMultiplier) * qty;

    // Membership discount calculation
    const membership = membershipTypeSelect.value;
    let memberDiscount = 0;
    if (membership === "ieee") {
        memberDiscount = subtotal * 0.15; // 15% off
    } else if (membership === "sit_student") {
        memberDiscount = subtotal * 0.20; // 20% off
    } else if (membership === "core_team") {
        memberDiscount = subtotal * 0.30; // 30% off
    }

    // Promo code discount calculation
    let promoDiscount = 0;
    if (appliedPromoCode === "SIT50" && subtotal >= 300) {
        promoDiscount = 50;
    } else if (appliedPromoCode === "TECH100" && subtotal >= 800) {
        promoDiscount = 100;
    } else if (appliedPromoCode === "SAVE20") {
        promoDiscount = (subtotal - memberDiscount) * 0.20;
    }

    // Apply GST (18%) on taxable value
    const taxableAmount = Math.max(0, subtotal - memberDiscount - promoDiscount);
    const gstAmount = taxableAmount > 0 ? taxableAmount * 0.18 : 0;
    const finalPayable = taxableAmount + gstAmount;

    // Update Billing UI Card
    billTrackName.textContent = trackName;
    billBaseRate.textContent = `₹${(basePrice * qty).toFixed(2)} (₹${basePrice} × ${qty})`;
    billTier.textContent = `${tierName} (${tierMultiplier}x)`;
    billMemberDiscount.textContent = `- ₹${memberDiscount.toFixed(2)}`;
    billPromoDiscount.textContent = `- ₹${promoDiscount.toFixed(2)}`;
    billGst.textContent = `₹${gstAmount.toFixed(2)}`;
    billFinalAmount.textContent = `₹${finalPayable.toFixed(2)}`;

    // Perk Note toggle
    const perkNote = document.getElementById("freePerkNote");
    if (qty >= 2) {
        perkNote.innerHTML = `🎉 <strong>Bonus Unlocked:</strong> Group Booking of ${qty} tickets includes complimentary Workshop Hardware Kits!`;
        perkNote.style.color = "var(--accent)";
    } else {
        perkNote.innerHTML = `💡 Tip: Book 2 or more tickets to receive a complimentary Workshop Certification Kit!`;
    }

    return {
        basePrice,
        tierMultiplier,
        qty,
        subtotal,
        memberDiscount,
        promoDiscount,
        gstAmount,
        finalPayable
    };
}

// Promo Code handler (Practical 2)
function applyPromo() {
    const code = promoCodeInput.value.trim().toUpperCase();
    const statusEl = document.getElementById("promoStatus");

    if (code === "") {
        alert("Please enter a coupon code first.");
        return;
    }

    if (code === "SIT50" || code === "TECH100" || code === "SAVE20") {
        appliedPromoCode = code;
        statusEl.innerHTML = `✅ Coupon <strong>${code}</strong> applied successfully!`;
        statusEl.style.color = "var(--accent)";
        logEvent("PROMO_APPLIED", `User applied coupon code: ${code}`);
        calculateBilling();
    } else {
        appliedPromoCode = "";
        statusEl.innerHTML = `❌ Invalid coupon code '${escapeHtml(code)}'. Try SIT50, TECH100, or SAVE20.`;
        statusEl.style.color = "var(--danger)";
        calculateBilling();
    }
}

// Payment Mode Conditional UI Toggle (Practical 2)
function togglePaymentFields() {
    const selectedPayRadio = document.querySelector('input[name="paymentMethod"]:checked');
    const mode = selectedPayRadio ? selectedPayRadio.value : "UPI";

    if (mode === "UPI") {
        upiBox.style.display = "block";
    } else {
        upiBox.style.display = "none";
    }
}

function toggleUpiIdField() {
    if (upiAppSelect.value === "other") {
        customUpiGroup.style.display = "block";
    } else {
        customUpiGroup.style.display = "none";
    }
}

// ==============================================================================
// 8. FORM SUBMISSION & TICKET CREATION (Practicals 1, 2, 5, 7)
// ==============================================================================
function handleFormSubmit(e) {
    e.preventDefault();
    console.time("TicketBookingProcessing");
    logEvent("SUBMIT", "Workshop registration submission triggered.");

    // Validate entire form
    const isValid = validateEntireForm();
    if (!isValid) {
        logEvent("VALIDATION_FAIL", "Form validation failed. Please review red highlighted fields.");
        alert("⚠️ Please review the form and correct errors before booking your ticket.");
        console.timeEnd("TicketBookingProcessing");
        return;
    }

    // Generate Unique Ticket Reference (Practical 2)
    const bookingId = "TKT-" + Math.floor(100000 + Math.random() * 900000);
    const bookingTimestamp = new Date().toLocaleString();

    // Compute bill figures
    const bill = calculateBilling();

    // Determine payment details string
    const selectedPayRadio = document.querySelector('input[name="paymentMethod"]:checked');
    const payMode = selectedPayRadio ? selectedPayRadio.value : "UPI";
    let paymentDetail = payMode;
    if (payMode === "UPI") {
        if (upiAppSelect.value === "other") {
            paymentDetail = `UPI (${customUpiIdInput.value.trim()})`;
        } else {
            paymentDetail = `UPI (${upiAppSelect.value})`;
        }
    }

    // Build New Booking Object (Practical 5)
    const newBooking = {
        bookingId: bookingId,
        studentName: `${firstnameInput.value.trim()} ${lastnameInput.value.trim()}`,
        prn: studentPrnInput.value.trim(),
        college: collegeNameInput.value.trim(),
        department: departmentSelect.value,
        academicYear: academicYearSelect.value,
        email: studentEmailInput.value.trim(),
        phone: studentPhoneInput.value.trim(),
        workshopTrack: workshopTrackSelect.value,
        passTier: passTierSelect.options[passTierSelect.selectedIndex].text.split(" (")[0],
        batchTime: batchTimeSelect.value,
        quantity: bill.qty,
        attendanceMode: document.querySelector('input[name="attendanceMode"]:checked').value,
        bringLaptop: bringLaptopCheckbox.checked ? "Yes" : "No",
        paymentMode: paymentDetail,
        finalAmount: bill.finalPayable.toFixed(2),
        bookingDate: bookingTimestamp
    };

    // Array push (Practical 5)
    workshopBookings.push(newBooking);

    // Save to localStorage (Practical 9)
    saveBookingsToStorage();

    // Practical 1: Greeting alert & console logging
    alert(
        `🎉 Workshop Ticket Confirmed!\n\n` +
        `• Booking ID: ${bookingId}\n` +
        `• Student: ${newBooking.studentName}\n` +
        `• Workshop: ${newBooking.workshopTrack}\n` +
        `• Amount Paid: ₹${newBooking.finalAmount}\n\n` +
        `An official e-ticket pass has been added to your records below.`
    );

    // Practical 1: console.table & console.timeEnd
    console.log("Registered Workshop Bookings Table:");
    console.table(workshopBookings);
    console.timeEnd("TicketBookingProcessing");

    logEvent("SUBMIT_SUCCESS", `Ticket ${bookingId} issued for ${newBooking.studentName}. Total: ₹${newBooking.finalAmount}`);

    // Update Table & UI
    renderBookingsTable(workshopBookings);

    // Open Printable Ticket Pass
    openTicketPassModal(newBooking);

    // Clear Draft from localStorage
    localStorage.removeItem(STORAGE_KEY_DRAFT);

    // Reset Form fields
    workshopForm.reset();
}

// ==============================================================================
// 9. DYNAMIC DOM TABLE & RECORD ACTIONS (Practicals 2, 5, 7, 8)
// ==============================================================================
function renderBookingsTable(bookingsArray) {
    // Clear existing body rows
    bookingsTableBody.innerHTML = "";

    if (bookingsArray.length === 0) {
        bookingsTableBody.appendChild(emptyTableRow);
        totalRecordsBadge.textContent = `Total Bookings: 0`;
        totalRevenueBadge.textContent = `Total Collected: ₹0`;
        return;
    }

    // Array forEach iteration (Practical 2 & Practical 5)
    bookingsArray.forEach((booking, index) => {
        // Create <tr> element (Practical 7 DOM Node Creation)
        const tr = document.createElement("tr");
        tr.dataset.id = booking.bookingId;

        tr.innerHTML = `
            <td>
                <span class="badge badge-primary">${escapeHtml(booking.bookingId)}</span><br>
                <small style="color:var(--text-muted);">${escapeHtml(booking.bookingDate)}</small>
            </td>
            <td>
                <strong>${escapeHtml(booking.studentName)}</strong><br>
                <small>PRN: ${escapeHtml(booking.prn)}</small><br>
                <small style="color:var(--text-muted);">${escapeHtml(booking.email)}</small>
            </td>
            <td>
                <strong>${escapeHtml(booking.college)}</strong><br>
                <span class="badge badge-info">${escapeHtml(booking.department)} (${escapeHtml(booking.academicYear)})</span>
            </td>
            <td>
                <strong>${escapeHtml(booking.workshopTrack)}</strong><br>
                <small style="color:var(--secondary);">${escapeHtml(booking.batchTime)}</small>
            </td>
            <td>
                <span class="badge badge-accent">${escapeHtml(booking.passTier)}</span><br>
                <small>${escapeHtml(booking.attendanceMode)}</small>
            </td>
            <td>
                <strong>${booking.quantity}</strong>
            </td>
            <td>
                <strong style="color:var(--primary);">₹${booking.finalAmount}</strong><br>
                <small style="font-size:10px;">${escapeHtml(booking.paymentMode)}</small>
            </td>
            <td>
                <div class="action-btn-group">
                    <button class="btn btn-outline btn-xs view-pass-btn" title="View & Print Pass">🎟️ Pass</button>
                    <button class="btn btn-secondary btn-xs edit-student-btn" title="Edit Student Details">✏️ Edit</button>
                    <button class="btn btn-danger btn-xs cancel-booking-btn" title="Cancel Booking">🗑️</button>
                </div>
            </td>
        `;

        // Attach DOM Traversal action listeners (Practical 7)
        const viewBtn = tr.querySelector(".view-pass-btn");
        const editBtn = tr.querySelector(".edit-student-btn");
        const cancelBtn = tr.querySelector(".cancel-booking-btn");

        // View Ticket Pass Action
        viewBtn.addEventListener("click", function () {
            logEvent("CLICK", `Viewing Ticket Pass for booking ${booking.bookingId}`);
            openTicketPassModal(booking);
        });

        // Edit Student Action via DOM Traversal (Practical 7)
        editBtn.addEventListener("click", function () {
            logEvent("CLICK", `Editing booking ${booking.bookingId}`);
            const newName = prompt("Edit Student Full Name:", booking.studentName);
            const newEmail = prompt("Edit Student Email Address:", booking.email);

            if (newName && newName.trim() !== "") {
                booking.studentName = newName.trim();
            }
            if (newEmail && newEmail.trim() !== "") {
                booking.email = newEmail.trim();
            }

            saveBookingsToStorage();
            renderBookingsTable(workshopBookings);
            logEvent("DOM_EDIT", `Booking ${booking.bookingId} updated via DOM traversal.`);
        });

        // Cancel / Delete Action (Practical 5 Array splice & Practical 7 Node removal)
        cancelBtn.addEventListener("click", function () {
            if (confirm(`Are you sure you want to cancel booking ${booking.bookingId} for ${booking.studentName}?`)) {
                // DOM node removal
                const row = cancelBtn.parentElement.parentElement.parentElement;
                row.remove();

                // Array splice removal (Practical 5)
                const targetIdx = workshopBookings.findIndex(b => b.bookingId === booking.bookingId);
                if (targetIdx !== -1) {
                    workshopBookings.splice(targetIdx, 1);
                }

                saveBookingsToStorage();
                updateRecordAggregations();
                logEvent("DOM_DELETE", `Booking ${booking.bookingId} deleted from records.`);

                if (workshopBookings.length === 0) {
                    bookingsTableBody.appendChild(emptyTableRow);
                }
            }
        });

        bookingsTableBody.appendChild(tr);
    });

    updateRecordAggregations();
}

// Array reduce & aggregate metrics (Practical 5)
function updateRecordAggregations() {
    // Array reduce to compute total revenue and total tickets
    const totalRevenue = workshopBookings.reduce((sum, b) => sum + Number(b.finalAmount), 0);
    const totalTickets = workshopBookings.reduce((sum, b) => sum + Number(b.quantity), 0);

    totalRecordsBadge.textContent = `Total Bookings: ${workshopBookings.length} (${totalTickets} Tickets)`;
    totalRevenueBadge.textContent = `Total Collected: ₹${totalRevenue.toFixed(2)}`;

    updateStoragePreviews();
}

// ==============================================================================
// 10. LIVE SEARCH & FILTERING (Practical 8.2)
// ==============================================================================
function filterBookings() {
    const searchVal = document.getElementById("searchInput").value.trim().toLowerCase();
    const selectedTrack = document.getElementById("filterTrack").value;

    // Array filter method (Practical 5 & Practical 8.2)
    const filtered = workshopBookings.filter(b => {
        const matchesQuery = searchVal === "" ||
            b.studentName.toLowerCase().includes(searchVal) ||
            b.prn.includes(searchVal) ||
            b.email.toLowerCase().includes(searchVal) ||
            b.bookingId.toLowerCase().includes(searchVal);

        const matchesTrack = selectedTrack === "all" || b.workshopTrack === selectedTrack;

        return matchesQuery && matchesTrack;
    });

    logEvent("FILTER", `Filter executed: ${filtered.length} matching bookings found`);
    renderBookingsTable(filtered);
}

function clearFilters() {
    document.getElementById("searchInput").value = "";
    document.getElementById("filterTrack").value = "all";
    renderBookingsTable(workshopBookings);
}

// Array map analytics exported to console (Practical 1 & 5)
function exportConsoleAnalytics() {
    console.time("AnalyticsReport");
    console.log("================= WORKSHOP ENROLLMENT ANALYTICS =================");

    // Array map to extract student emails & tracks (Practical 5)
    const studentDirectory = workshopBookings.map(b => ({
        ID: b.bookingId,
        Name: b.studentName,
        Email: b.email,
        Track: b.workshopTrack,
        Paid: "₹" + b.finalAmount
    }));

    console.table(studentDirectory);
    console.timeEnd("AnalyticsReport");
    alert(`📊 Console Analytics generated!\nPress F12 or inspect console to view the complete student directory table.`);
}

// ==============================================================================
// 11. PRINTABLE TICKET PASS MODAL (Practical 2)
// ==============================================================================
function openTicketPassModal(booking) {
    const printableTicket = document.getElementById("printableTicket");
    printableTicket.innerHTML = `
        <div class="ticket-pass">
            <div class="ticket-pass-header">
                <div>
                    <span class="badge badge-primary">SIT TECH WORKSHOP 2026</span>
                    <div class="ticket-pass-title">${escapeHtml(booking.workshopTrack)}</div>
                </div>
                <div class="ticket-pass-id">
                    Pass Ref: <strong>${escapeHtml(booking.bookingId)}</strong>
                </div>
            </div>

            <div class="ticket-pass-body">
                <div class="ticket-field">
                    <span>Attendee Name</span>
                    <strong>${escapeHtml(booking.studentName)}</strong>
                </div>
                <div class="ticket-field">
                    <span>PRN / Roll No</span>
                    <strong>${escapeHtml(booking.prn)}</strong>
                </div>
                <div class="ticket-field">
                    <span>College / Branch</span>
                    <strong>${escapeHtml(booking.college)} (${escapeHtml(booking.department)})</strong>
                </div>
                <div class="ticket-field">
                    <span>Pass Tier & Qty</span>
                    <strong>${escapeHtml(booking.passTier)} &times; ${booking.quantity}</strong>
                </div>
                <div class="ticket-field">
                    <span>Batch & Schedule</span>
                    <strong>${escapeHtml(booking.batchTime)}</strong>
                </div>
                <div class="ticket-field">
                    <span>Mode of Entry</span>
                    <strong>${escapeHtml(booking.attendanceMode)}</strong>
                </div>
                <div class="ticket-field">
                    <span>Fee Paid</span>
                    <strong>₹${booking.finalAmount} (${escapeHtml(booking.paymentMode)})</strong>
                </div>
                <div class="ticket-field">
                    <span>Date of Issue</span>
                    <strong>${escapeHtml(booking.bookingDate)}</strong>
                </div>
            </div>

            <div class="ticket-barcode-sim">
                |||| | ||||| || |||||| | |||| | |||||||| | ||
            </div>
        </div>
    `;

    document.getElementById("ticketModal").style.display = "flex";
}

function closeTicketModal() {
    document.getElementById("ticketModal").style.display = "none";
}

function printTicketPass() {
    logEvent("PRINT", "User invoked window.print() on ticket pass.");
    window.print();
}

// ==============================================================================
// 12. WEB STORAGE MANAGER: localStorage vs sessionStorage (Practical 9)
// ==============================================================================
function saveBookingsToStorage() {
    const jsonStr = JSON.stringify(workshopBookings);
    localStorage.setItem(STORAGE_KEY_BOOKINGS, jsonStr);
    updateStoragePreviews();
}

function loadBookingsFromStorage() {
    const saved = localStorage.getItem(STORAGE_KEY_BOOKINGS);
    if (saved) {
        try {
            workshopBookings = JSON.parse(saved);
        } catch (e) {
            workshopBookings = [];
        }
    } else {
        // Seed default initial booking for instant showcase
        workshopBookings = [
            {
                bookingId: "TKT-849201",
                studentName: "Vedant Nawghare",
                prn: "24070521047",
                college: "SIT Nagpur",
                department: "CSE",
                academicYear: "2nd Year",
                email: "vedant@sitnagpur.edu.in",
                phone: "9876543210",
                workshopTrack: "Generative AI & LLM Agents",
                passTier: "Pro Pass",
                batchTime: "Morning Batch (9:00 AM - 1:00 PM)",
                quantity: 1,
                attendanceMode: "Offline (Campus Lab)",
                bringLaptop: "Yes",
                paymentMode: "UPI (Google Pay)",
                finalAmount: "618.32",
                bookingDate: new Date().toLocaleString()
            }
        ];
        saveBookingsToStorage();
    }
    renderBookingsTable(workshopBookings);
}

function clearLocalBookings() {
    if (confirm("Clear all bookings saved in localStorage?")) {
        localStorage.removeItem(STORAGE_KEY_BOOKINGS);
        workshopBookings = [];
        renderBookingsTable(workshopBookings);
        logEvent("STORAGE", "Cleared localStorage workshop bookings.");
        alert("🗑️ LocalStorage bookings cleared!");
    }
}

// Save form draft to localStorage
function saveDraftToLocalStorage() {
    const draft = {
        firstname: firstnameInput.value,
        lastname: lastnameInput.value,
        studentPrn: studentPrnInput.value,
        collegeName: collegeNameInput.value,
        department: departmentSelect.value,
        academicYear: academicYearSelect.value,
        studentEmail: studentEmailInput.value,
        studentPhone: studentPhoneInput.value,
        workshopTrack: workshopTrackSelect.value,
        passTier: passTierSelect.value,
        savedAt: new Date().toLocaleTimeString()
    };

    localStorage.setItem(STORAGE_KEY_DRAFT, JSON.stringify(draft));
    logEvent("STORAGE", "Draft saved into localStorage.");
    updateStoragePreviews();
    alert(`💾 Draft successfully saved to Local Storage at ${draft.savedAt}!\n(Your form input will persist even after page refresh)`);
}

function restoreDraftIfAvailable() {
    const rawDraft = localStorage.getItem(STORAGE_KEY_DRAFT);
    if (rawDraft) {
        try {
            const draft = JSON.parse(rawDraft);
            if (firstnameInput.value === "" && draft.firstname) firstnameInput.value = draft.firstname;
            if (lastnameInput.value === "" && draft.lastname) lastnameInput.value = draft.lastname;
            if (studentPrnInput.value === "" && draft.studentPrn) studentPrnInput.value = draft.studentPrn;
            if (collegeNameInput.value === "" && draft.collegeName) collegeNameInput.value = draft.collegeName;
            if (draft.department) departmentSelect.value = draft.department;
            if (draft.academicYear) academicYearSelect.value = draft.academicYear;
            if (studentEmailInput.value === "" && draft.studentEmail) studentEmailInput.value = draft.studentEmail;
            if (studentPhoneInput.value === "" && draft.studentPhone) studentPhoneInput.value = draft.studentPhone;
            if (draft.workshopTrack) workshopTrackSelect.value = draft.workshopTrack;
            if (draft.passTier) passTierSelect.value = draft.passTier;
            logEvent("STORAGE", "Restored existing form draft from localStorage.");
        } catch (e) {
            console.error("Draft parsing failed", e);
        }
    }
}

// SessionStorage Setup & Countdown Timer (Practical 9)
function initSessionStorage() {
    let token = sessionStorage.getItem(SESSION_KEY_TOKEN);
    if (!token) {
        token = "SESS-" + Math.random().toString(36).substring(2, 10).toUpperCase();
        sessionStorage.setItem(SESSION_KEY_TOKEN, token);
    }

    let savedRemaining = sessionStorage.getItem(SESSION_KEY_TIME);
    sessionSecondsRemaining = savedRemaining ? parseInt(savedRemaining, 10) : 600;

    startSessionCountdown();
}

function startSessionCountdown() {
    if (sessionTimerInterval) clearInterval(sessionTimerInterval);

    sessionTimerInterval = setInterval(() => {
        sessionSecondsRemaining--;
        sessionStorage.setItem(SESSION_KEY_TIME, sessionSecondsRemaining);

        const mins = Math.floor(sessionSecondsRemaining / 60);
        const secs = sessionSecondsRemaining % 60;
        sessionTimerDisplay.textContent = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;

        if (sessionSecondsRemaining <= 0) {
            clearInterval(sessionTimerInterval);
            alert("⏱️ Session hold expired! Your temporary ticket hold has timed out.");
            resetSessionTimer();
        }
    }, 1000);
}

function resetSessionTimer() {
    sessionSecondsRemaining = 600;
    sessionStorage.setItem(SESSION_KEY_TIME, "600");
    startSessionCountdown();
    logEvent("STORAGE", "Session timer reset to 10:00.");
}

function refreshSessionPreview() {
    updateStoragePreviews();
    alert("🔍 SessionStorage inspector refreshed!");
}

// Real-time Storage Monitor Displays (Practical 9.2)
function updateStoragePreviews() {
    // LocalStorage preview
    const rawLocal = localStorage.getItem(STORAGE_KEY_BOOKINGS);
    if (rawLocal) {
        localDataPreview.textContent = `Key: ${STORAGE_KEY_BOOKINGS}\nSize: ${rawLocal.length} bytes\nData:\n${rawLocal.substring(0, 120)}...`;
    } else {
        localDataPreview.innerHTML = `<span class="placeholder-text">(localStorage is empty)</span>`;
    }

    // SessionStorage preview
    const token = sessionStorage.getItem(SESSION_KEY_TOKEN);
    const time = sessionStorage.getItem(SESSION_KEY_TIME);
    if (token) {
        sessionDataPreview.textContent = `Session Token: ${token}\nTime Remaining: ${time}s\nStatus: Active (Temporary)`;
    } else {
        sessionDataPreview.innerHTML = `<span class="placeholder-text">(sessionStorage is empty)</span>`;
    }
}

// Theme Preference Toggle (Practical 9.1)
function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute("data-theme") || "light";
    const newTheme = currentTheme === "dark" ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", newTheme);
    localStorage.setItem(STORAGE_KEY_THEME, newTheme);
    updateThemeButton(newTheme);
    logEvent("THEME", `Theme toggled to ${newTheme} mode.`);
}

function updateThemeButton(theme) {
    const btn = document.getElementById("themeToggleBtn");
    if (btn) {
        btn.innerHTML = theme === "dark" ? "☀️ Light Mode" : "🌙 Dark Mode";
    }
}

function initTheme() {
    const savedTheme = localStorage.getItem(STORAGE_KEY_THEME) || "light";
    document.documentElement.setAttribute("data-theme", savedTheme);
    updateThemeButton(savedTheme);
}

// Safe HTML Escaping utility
function escapeHtml(str) {
    if (!str) return "";
    return String(str)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}
