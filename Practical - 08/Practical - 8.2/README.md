# Practical 8.2

## Experiment Title

Implement JavaScript Form Validation, Event Handling, and Dynamic Product Filtering by developing an Interactive E-Commerce Product Search and Filter System.

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

To understand and implement JavaScript form validation, event handling, DOM manipulation, data attributes, and dynamic filtering of products based on search keywords and categories.

## Concepts Used

- JavaScript Form Validation
- Event Handling
- DOM Manipulation
- `addEventListener()`
- `input` Event
- `change` Event
- `click` Event
- `submit` Event
- Regular Expressions
- Conditional Statements
- Array Iteration
- `forEach()`
- `dataset`
- String Methods
- Dynamic Content Display
- Product Filtering

## Case Study

### ShopSphere E-Commerce Product Search and Filter System

An interactive e-commerce product search and filtering system named **ShopSphere** is developed using HTML, CSS, and JavaScript.

The application allows users to search for products by name and filter products according to categories such as Electronics, Clothing, Books, and Accessories. JavaScript validates the search input and dynamically displays matching products along with the total number of visible products.

## Features

- E-commerce shopping interface
- Product search functionality
- Product category filtering
- Search by product name
- Electronics category
- Clothing category
- Books category
- Accessories category
- Real-time product filtering
- Search input validation
- Only letters and spaces allowed in search
- Clear search and category filters
- Dynamic product count
- No products found message
- Form submission validation
- Dynamic product card display

## JavaScript Events Used

| Event | Purpose |
|---|---|
| `input` | Validates the search text and filters products while typing. |
| `change` | Filters products according to the selected category. |
| `click` | Clears the search box and resets all filters. |
| `submit` | Validates the search box before applying the filter. |

## Validation Method Used

| Validation | Purpose |
|---|---|
| Search Validation | Checks whether the search input contains only letters and spaces. |
| Regular Expression | `/^[A-Za-z ]+$/` is used to validate the search text. |
| Empty Search Check | Allows the user to view all products when the search box is empty. |

## Product Filtering Logic

| Operation | Purpose |
|---|---|
| Search Text | Matches the entered text with the product name. |
| Category Selection | Matches the selected category with the product category. |
| `dataset.name` | Retrieves the product name from the HTML data attribute. |
| `dataset.category` | Retrieves the product category from the HTML data attribute. |
| `includes()` | Checks whether the product name contains the searched text. |
| `forEach()` | Iterates through all product cards. |
| Product Count | Displays the number of currently visible products. |
| No Products Message | Displays a message when no product matches the filters. |

## DOM Methods and Properties Used

| Method / Property | Purpose |
|---|---|
| `getElementById()` | Accesses required HTML elements. |
| `querySelectorAll()` | Selects all product cards. |
| `addEventListener()` | Handles user interaction events. |
| `value` | Gets or changes the search and category values. |
| `dataset` | Retrieves product name and category data attributes. |
| `style.display` | Shows or hides product cards dynamically. |
| `innerHTML` | Updates error messages and product count. |
| `trim()` | Removes unnecessary spaces from the search input. |
| `toLowerCase()` | Converts search text to lowercase for comparison. |
| `preventDefault()` | Prevents normal form submission. |

## Product Categories

- Electronics
- Clothing
- Books
- Accessories

## File Structure

```text
Practical-08/
└── Practical-8.2/
    ├── index.html
    ├── script.js
    └── style.css
````

## Output

The output of the program is shown below:

![Output 1](output1.png)

![Output 2](output2.png)

## Result

The ShopSphere E-Commerce Product Search and Filter System was successfully implemented using JavaScript form validation, event handling, DOM manipulation, and dynamic product filtering. The application successfully filters products according to the entered search text and selected category.

## Conclusion

This practical provided an understanding of JavaScript event handling, form validation, DOM manipulation, and dynamic filtering. Events such as `input`, `change`, `click`, and `submit` were used to create an interactive e-commerce product search system with real-time filtering and product count updates.
