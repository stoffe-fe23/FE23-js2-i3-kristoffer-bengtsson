/*
    Dummy Webshop - Inlämningsuppgift 3 - Javascript 2 - FE23
    By Kristoffer Bengtsson

    main.js
    Main script of the fake webshop page. Initialization and interface event handlers. 
*/
import Webshop from './modules/Webshop.ts';


const shop = new Webshop('https://dummyjson.com');
shop.onProductClick = onProductClick;
shop.onPurchaseSubmit = onPurchaseSubmit;
shop.loadCategories(document.querySelector("#search-category") as HTMLSelectElement).catch(alert);
shop.getProducts().catch(alert);

(document.querySelector("#categoryform") as HTMLFormElement).addEventListener("submit", onCategorySubmit);
(document.querySelector("#searchform") as HTMLFormElement).addEventListener("submit", onSearchSubmit);
(document.querySelector("#pages-nav") as HTMLFormElement).addEventListener("submit", onResultPageNav);
(document.querySelector("#pages-goto-form") as HTMLFormElement).addEventListener("submit", onGotoPageSubmit);

(document.querySelector("#search-product") as HTMLInputElement).addEventListener("click", (event) => (event.currentTarget as HTMLInputElement).select());
(document.querySelector("#show-cart") as HTMLButtonElement).addEventListener("click", onShoppingCartShow);


//////////////////////////////////////////////////////////////////////////////////////////////
// Event handler for the category filter form
function onCategorySubmit(event) {
    event.preventDefault();
    const formData: FormData = new FormData(event.currentTarget);
    shop.getProductsByCategory(formData.get("category") as string ?? "").catch(alert);

    (document.querySelector("#search-product") as HTMLInputElement).value = "";
    event.currentTarget.querySelector("button").blur();
}


//////////////////////////////////////////////////////////////////////////////////////////////
// Event handler for the search filter form
function onSearchSubmit(event) {
    event.preventDefault();
    const formData: FormData = new FormData(event.currentTarget);
    shop.getProducts(formData.get("product") as string ?? "").catch(alert);

    (document.querySelector("#search-category") as HTMLSelectElement).value = "";
    event.currentTarget.querySelector("button").blur();
}


//////////////////////////////////////////////////////////////////////////////////////////////
// Event handler for the buy product forms, adding it to the shopping cart. 
function onPurchaseSubmit(event) {
    event.preventDefault();
    const productId: number = event.currentTarget.closest("article").dataset.productid;
    const formData: FormData = new FormData(event.currentTarget);

    const product = shop.findCurrentProductById(productId);
    if (product) {
        shop.cart.addProduct(productId, product.title, Number(formData.get("quantity")) ?? 1, product.price);
    }

    event.currentTarget.reset();
    event.currentTarget.querySelector("input").blur();
    event.currentTarget.querySelector("button").blur();
}


//////////////////////////////////////////////////////////////////////////////////////////////
// Event handler to focus its buy quantity field when clicking on a product card
function onProductClick(event) {
    const buyButton = event.currentTarget.querySelector("form button");
    if (event.target != buyButton) {
        const qtyField = event.currentTarget.querySelector("form input");
        qtyField.focus();
        qtyField.select();
    }
}


//////////////////////////////////////////////////////////////////////////////////////////////
// Event handler for the product results page navigation form
function onResultPageNav(event) {
    event.preventDefault();
    switch (event.submitter.id) {
        case "pages-nav-prev": shop.getProductsPage('prev').catch(alert); break;
        case "pages-nav-next": shop.getProductsPage('next').catch(alert); break;
        case "pages-nav-first": shop.getProductsPage('first').catch(alert); break;
        case "pages-nav-last": shop.getProductsPage('last').catch(alert); break;
        case "pages-nav-goto": // Show popup dialog for navigating to specific product page
            const pageInput = document.querySelector("#pages-goto-page") as HTMLInputElement;
            pageInput.setAttribute("max", shop.resultPages.toString());
            pageInput.value = shop.currentPage.toString();
            pageInput.select();
            (document.querySelector("#pages-goto-dialog") as HTMLDialogElement).showModal();
            break;
    }
    event.submitter.blur();
}


//////////////////////////////////////////////////////////////////////////////////////////////
// Event handler when submitting the Go to Page form in the popup dialog. 
function onGotoPageSubmit(event) {
    event.preventDefault();
    const dialog = event.currentTarget.closest("dialog");
    const pageInput: number = Number((document.querySelector("#pages-goto-page") as HTMLInputElement).value);

    if (!isNaN(pageInput) && (pageInput > 0) && (pageInput <= shop.resultPages)) {
        shop.getProductsPage('page', pageInput).catch(alert);
    }
    if (dialog) {
        dialog.close();
    }
}


//////////////////////////////////////////////////////////////////////////////////////////////
// Event handler for clicking on the button to show the shopping cart.
function onShoppingCartShow(event) {
    shop.cart.show();
    event.currentTarget.blur();
}
