/*
    Dummy Webshop - Inlämningsuppgift 3 - Javascript 2 - FE23
    By Kristoffer Bengtsson

    Type main.js
    Main script of the fake webshop. 
*/
import RestApi from './modules/RestApi.ts';
import * as utilities from './modules/utilities.ts';
import { Product, ProductsResult } from './modules/TypeDefinitions.ts';

// https://dummyjson.com/docs/products
const api = new RestApi('https://dummyjson.com');

showProducts();

async function showProducts() {
    const productsBox = document.querySelector("#productlist") as HTMLElement;
    const response: ProductsResult = await api.getJson("products");

    if (productsBox) {
        productsBox.innerHTML = "";

        if ((response.total > 0) && (response.products.length > 0)) {
            for (const product of response.products) {
                const card = utilities.createHTMLFromTemplate("tpl-product-card", productsBox, product, { "data-productid": product.id.toString() });
                const score = utilities.createRatingScoreDisplay(product.rating, 5);

                card.querySelector(".rating")!.prepend(score);
                card.querySelector("form")!.addEventListener("submit", onPurchaseSubmit);
                if (product.stock < 10) {
                    card.querySelector(".stock")!.classList.add("alert");
                }
            }
        }
        else {
            utilities.createHTMLElement("div", "No products found.", productsBox, 'products-none');
        }
    }
}

function onPurchaseSubmit(event) {
    event.preventDefault();
    console.log("Buying! ", event.currentTarget.closest("article").dataset.productid);
}

