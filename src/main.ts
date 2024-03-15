/*
    Dummy Webshop - Inlämningsuppgift 3 - Javascript 2 - FE23
    By Kristoffer Bengtsson

    main.js
    Main script of the fake webshop. Interface event handlers. 
*/
import Webshop from './modules/Webshop.ts';

const shop = new Webshop('https://dummyjson.com');
shop.onProductClick = onProductClick;
shop.onPurchaseSubmit = onPurchaseSubmit;
shop.loadCategories(document.querySelector("#search-category") as HTMLSelectElement);
shop.getProducts();

(document.querySelector("#categoryform") as HTMLFormElement).addEventListener("submit", onCategorySubmit);
(document.querySelector("#searchform") as HTMLFormElement).addEventListener("submit", onSearchSubmit);
(document.querySelector("#pages-nav") as HTMLFormElement).addEventListener("submit", onResultPageNav);
(document.querySelector("#pages-goto-form") as HTMLFormElement).addEventListener("submit", onGotoPageSubmit);
(document.querySelector("#search-product") as HTMLInputElement).addEventListener("click", (event) => (event.currentTarget as HTMLInputElement).select());


//////////////////////////////////////////////////////////////////////////////////////////////
// Event handler for the category filter form
function onCategorySubmit(event) {
    event.preventDefault();
    const formData: FormData = new FormData(event.currentTarget);
    shop.getProductsByCategory(formData.get("category") as string ?? "");

    (document.querySelector("#search-product") as HTMLInputElement).value = "";
    event.currentTarget.querySelector("button").blur();
}

//////////////////////////////////////////////////////////////////////////////////////////////
// Event handler for the search filter form
function onSearchSubmit(event) {
    event.preventDefault();
    const formData: FormData = new FormData(event.currentTarget);
    shop.getProducts(formData.get("product") as string ?? "");

    (document.querySelector("#search-category") as HTMLSelectElement).value = "";
    event.currentTarget.querySelector("button").blur();
}


//////////////////////////////////////////////////////////////////////////////////////////////
// Event handler for the buy product forms
function onPurchaseSubmit(event) {
    event.preventDefault();
    const productId: string = event.currentTarget.closest("article").dataset.productid;
    const formData: FormData = new FormData(event.currentTarget);

    console.log("Buying! ", productId, formData.get("quantity"));
    event.currentTarget.reset();
    event.currentTarget.querySelector("input").blur();
    event.currentTarget.querySelector("button").blur();
}


//////////////////////////////////////////////////////////////////////////////////////////////
// Highlight its buy quantity field when clicking a product card
function onProductClick(event) {
    const qtyField = event.currentTarget.querySelector("form input");
    const buyButton = event.currentTarget.querySelector("form button");

    if (event.target != buyButton) {
        qtyField.focus();
        qtyField.select();
    }
}


//////////////////////////////////////////////////////////////////////////////////////////////
// Event handler for the product results page navigation form
function onResultPageNav(event) {
    event.preventDefault();
    switch (event.submitter.id) {
        case "pages-nav-prev": shop.getProductsPage('prev'); break;
        case "pages-nav-next": shop.getProductsPage('next'); break;
        case "pages-nav-first": shop.getProductsPage('first'); break;
        case "pages-nav-last": shop.getProductsPage('last'); break;
        case "pages-nav-goto": // Show popup dialog for navigating to page
            const pageInput = document.querySelector("#pages-goto-page") as HTMLInputElement;
            pageInput.setAttribute("max", Math.ceil(shop.currentResult.total / shop.pageSize).toString());
            pageInput.value = Math.ceil((shop.currentResult.skip / shop.pageSize) + 1).toString();
            pageInput.select();
            (document.querySelector("#pages-goto-dialog") as HTMLDialogElement).showModal();
            break;
    }
    event.submitter.blur();
}


//////////////////////////////////////////////////////////////////////////////////////////////
function onGotoPageSubmit(event) {
    event.preventDefault();
    const dialog = event.currentTarget.closest("dialog");
    const pageInput: number = Number((document.querySelector("#pages-goto-page") as HTMLInputElement).value);

    if (!isNaN(pageInput) && (pageInput > 0) && (pageInput <= Math.ceil(shop.currentResult.total / shop.pageSize))) {
        shop.getProductsPage('page', pageInput);
    }

    if (dialog) {
        dialog.close();
    }
}