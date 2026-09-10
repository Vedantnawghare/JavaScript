Yes bro, **Practical 8.1** ke exact code ke according same README format:

````md
# Practical 8.1

## Experiment Title

Implement JavaScript Form Validation and Event Handling by developing an Interactive Gym Membership Admission Form.

## Student Details

- **Name:** Vedant Nawghare
- **PRN:** 24070521047

## Software / Tools Required

- Visual Studio Code
- Google Chrome / Any Modern Web Browser
- HTML5
- CSS3
- JavaScript (ES6)

## Aim

To understand and implement JavaScript form validation, event handling, regular expressions, DOM manipulation, and dynamic error handling for an interactive gym membership registration form.

## Concepts Used

- JavaScript Form Validation
- Event Handling
- DOM Manipulation
- `addEventListener()`
- `input` Event
- `blur` Event
- `change` Event
- `submit` Event
- Regular Expressions
- Conditional Statements
- User Input Handling
- Error Message Handling
- `dispatchEvent()`
- `preventDefault()`
- Number Conversion
- String Methods

## Case Study

### Gym Membership Admission System

A Gym Membership Admission System named **IronPulse Fitness Club** is developed using HTML, CSS, and JavaScript. The application allows users to enter their personal details and select a membership plan.

JavaScript is used to validate the user's name, age, mobile number, email address, and membership plan. Different events are used to provide real-time validation and display appropriate error messages.

## Features

- Gym membership registration form
- Full name validation
- Age validation between 16 and 60 years
- 10-digit mobile number validation
- Email address validation
- Membership plan selection
- Monthly membership option
- Quarterly membership option
- Yearly membership option
- Real-time input validation
- Dynamic error messages
- Form submission validation
- Successful admission message
- Error alert for invalid form submission
- Responsive and visually styled gym interface

## JavaScript Events Used

| Event | Purpose |
|---|---|
| `input` | Validates name, email, and mobile number while the user enters data. |
| `blur` | Validates the age when the input field loses focus. |
| `change` | Validates the selected membership plan. |
| `submit` | Validates the complete form before admission. |

## Validation Methods Used

| Validation | Purpose |
|---|---|
| Name Validation | Allows only letters and spaces in the full name. |
| Age Validation | Checks whether the age is between 16 and 60. |
| Mobile Validation | Checks whether the mobile number contains exactly 10 digits. |
| Email Validation | Checks whether the email follows a valid email format. |
| Membership Validation | Ensures that a membership plan is selected. |
| Form Validation | Checks all fields before successful admission. |

## Regular Expressions Used

| Pattern | Purpose |
|---|---|
| `/^[A-Za-z ]+$/` | Validates that the name contains only letters and spaces. |
| `/^\d{10}$/` | Validates a 10-digit mobile number. |
| `/^[^\s@]+@[^\s@]+\.[^\s@]+$/` | Validates the email address format. |

## DOM Methods Used

| Method | Purpose |
|---|---|
| `getElementById()` | Accesses form elements using their IDs. |
| `addEventListener()` | Attaches events to form elements. |
| `innerHTML` | Displays and clears validation messages dynamically. |
| `value` | Retrieves the value entered or selected by the user. |
| `trim()` | Removes unnecessary spaces from the name input. |
| `dispatchEvent()` | Triggers validation events during form submission. |
| `preventDefault()` | Prevents the default form submission behaviour. |

## Membership Plans

| Plan | Description |
|---|---|
| Monthly | Flexible membership option. |
| Quarterly | Best value membership option. |
| Yearly | Maximum savings membership option. |

## File Structure

```text
Practical-08/
└── Practical-8.1/
    ├── index.html
    ├── gym-interior.png
    ├── gym-pattern.png
    └── logo.png
````

## Output

The output of the program is shown below:

![Output 1](output1.png)

![Output 2](output2.png)

## Result

The IronPulse Gym Membership Admission System was successfully implemented using JavaScript form validation and event handling. The application validates user details and displays appropriate error messages or a successful gym admission message.

## Conclusion

This practical provided an understanding of JavaScript form validation and event handling. Different events such as `input`, `blur`, `change`, and `submit` were used along with regular expressions and DOM manipulation to create an interactive and user-friendly gym membership admission form.

```
```
