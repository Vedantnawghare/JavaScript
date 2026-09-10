// Get the required elements from the page
const searchBox = document.getElementById("searchBox");
const category = document.getElementById("category");
const filterForm = document.getElementById("filterForm");
const clearBtn = document.getElementById("clearBtn");

const searchError = document.getElementById("searchError");
const productList = document.getElementById("productList");
const productCards = document.querySelectorAll(".product-card");
const noProducts = document.getElementById("noProducts");
const productCount = document.getElementById("productCount");

// Validate search text
function validateSearch() {
    const searchText = searchBox.value.trim();

    if (searchText === "" || /^[A-Za-z ]+$/.test(searchText)) {
        searchError.innerHTML = "";
        return true;
    }

    searchError.innerHTML = "Only letters and spaces are allowed.";
    return false;
}

// Filter products using search text and selected category
function filterProducts() {
    const searchText = searchBox.value.trim().toLowerCase();
    const selectedCategory = category.value;
    let visibleProducts = 0;

    productCards.forEach(function(card) {
        const productName = card.dataset.name;
        const productCategory = card.dataset.category;

        const nameMatches =
            searchText === "" || productName.includes(searchText);

        const categoryMatches =
            selectedCategory === "all" ||
            productCategory === selectedCategory;

        if (nameMatches && categoryMatches) {
            card.style.display = "block";
            visibleProducts++;
        } else {
            card.style.display = "none";
        }
    });

    productCount.innerHTML =
        visibleProducts + (visibleProducts === 1 ? " product" : " products");

    if (visibleProducts === 0) {
        noProducts.style.display = "block";
    } else {
        noProducts.style.display = "none";
    }
}

// input event: validate and filter while typing
searchBox.addEventListener("input", function() {
    if (validateSearch()) {
        filterProducts();
    }
});

// change event: filter according to selected category
category.addEventListener("change", function() {
    filterProducts();
});

// click event: clear all filters
clearBtn.addEventListener("click", function() {
    searchBox.value = "";
    category.value = "all";
    searchError.innerHTML = "";
    filterProducts();
});

// submit event: validate before searching
filterForm.addEventListener("submit", function(event) {
    event.preventDefault();

    if (validateSearch()) {
        filterProducts();
    } else {
        alert("Please correct the search box before searching.");
    }
});

// Initially display all products
filterProducts();
