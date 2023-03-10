import {dataHandler} from "./DataHandler.js";


const htmlElements = {
    categories: document.querySelector("ul#category-list"),
    suppliers: document.querySelector("ul#supplier-list"),
    productContainer: document.querySelector("div#products")
}

function main() {
    addEventListeners();
    refreshCartItemCount();
}

function addEventListeners() {
    htmlElements.categories.querySelectorAll("input").forEach(
        (checkbox) => checkbox.addEventListener("click", refreshProducts));
    htmlElements.suppliers.querySelectorAll("input").forEach(
        (checkbox) => checkbox.addEventListener("click", refreshProducts));
    addButtonEventListener();
}

function addButtonEventListener() {
    document.querySelectorAll(".add-product").forEach(
        (button) => button.addEventListener("click", addProductToCart));
}

function getSelectedIds(checkBoxList) {
    let idList = []
    checkBoxList.querySelectorAll("li input")
        .forEach(checkBox => {
            if (checkBox.checked) {
                idList.push(checkBox.getAttribute("value"));
                checkBox.setAttribute("data-checked", "true");
            } else {
                checkBox.setAttribute("data-checked", "false");
            }
        });
    return idList;
}

function changeCheckboxAvailability(numberOfProductsInCategories) {
    disableAllCategoryCheckbox();
    htmlElements.categories.querySelectorAll("label.checkbox-label").forEach(checkboxLabel => {
        changeCheckboxCondition(checkboxLabel, numberOfProductsInCategories);
        // if (checkbox.disabled) {numberOfProducts.innerHTML = '0';}
        changeCheckboxCheckedCondition(checkboxLabel);
    });
}

function changeCheckboxCondition(checkboxLabel, numberOfProductsInCategories) {
    let checkbox = checkboxLabel.children.namedItem("category-filter");
    let numberOfProducts = checkboxLabel.querySelector("em");
    for (let [categoryValue, numberOfAvailableProducts] of Object.entries(numberOfProductsInCategories)) {
        if (checkbox.disabled === true && categoryValue === checkbox.value) {
            checkbox.disabled = false;
            numberOfProducts.innerHTML = numberOfAvailableProducts;
        }
    }
}

function changeCheckboxCheckedCondition(checkboxLabel) {
    let checkbox = checkboxLabel.children.namedItem("category-filter");
    if (checkbox.getAttribute("data-checked") === "true" && checkbox.disabled) {
        checkbox.checked = false;
    }
}

function disableAllCategoryCheckbox() {
    htmlElements.categories.querySelectorAll("input").forEach((inp) => inp.disabled = true);
}

async function refreshProducts() {
    let supplierIdList = getSelectedIds(htmlElements.suppliers);
    let categoryIdList = getSelectedIds(htmlElements.categories);
    const refreshedProducts = await dataHandler.getProducts(supplierIdList, categoryIdList);
    await changeCheckboxAvailability(refreshedProducts.numberOfProductsInCategories);
    await changeProducts(refreshedProducts.productsByFilter);
    await addButtonEventListener();
}

function changeProducts(products) {
    htmlElements.productContainer.innerHTML = "";
    for (const product of products) {
        const element = createProductElement(product);
        htmlElements.productContainer.insertAdjacentHTML("beforeend", element);
    }
}

function createProductElement(product) {
    return `<div class="product col col-sm-12 col-md-6 col-lg-4">
            <div class="card">
                <img class="" src='/static/img/${product.imageName}' alt=""/>
                <div class="card-header">
                    <h4 class="card-title">${product.name}</h4>
                    <p class="card-supplier">${product.supplier.name}</p>
                    <p class="card-text">${product.description}</p>
                </div>
                <div class="card-body">
                    <div class="card-text">
                        <p class="lead">${product.defaultPrice} ${product.defaultCurrency}</p>
                    </div>
                    <div class="card-text">
                        <a class="btn btn-success add-product" data-id="${product.id}">Add to cart</a>
                    </div>
                </div>
            </div>
        </div>`;
}

async function addProductToCart(event) {
    const productId = event.currentTarget.getAttribute("data-id");
    await dataHandler.addProductToCart(productId);
    await refreshCartItemCount();
}

async function refreshCartItemCount() {
    const cartItemCount = document.querySelector(".cart-item-count");
    const cart = await dataHandler.getCart();
    const cartItems = cart["cartItems"];
    cartItemCount.textContent = cartItems.length;
}

main();