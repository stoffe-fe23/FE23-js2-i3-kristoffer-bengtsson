/*
    Dummy Webshop - Inlämningsuppgift 3 - Javascript 2 - FE23
    By Kristoffer Bengtsson

    ShoppingCart.js
    Class for managing the shopping cart, managing products the user is "buying".
*/
import * as utilities from './utilities.ts';
import { CartProduct } from './TypeDefinitions.ts';


export default class ShoppingCart {
    private products: CartProduct[];

    constructor() {
        this.products = [];

        const cartForm = document.querySelector("#cart-products");
        if (cartForm) {
            cartForm.addEventListener("submit", this.onQuantityChange.bind(this));
        }

        const cartDialogClose = document.querySelector("#cart-close");
        if (cartDialogClose) {
            cartDialogClose.addEventListener("click", (event) => {
                (document.querySelector("#shoppingcart") as HTMLDialogElement).close();
            });
        }

        const cartDialogCheckout = document.querySelector("#cart-checkout");
        if (cartDialogCheckout) {
            cartDialogCheckout.addEventListener("click", (event) => {
                alert("Not implemented. (Yet?)");
            });
        }
    }


    //////////////////////////////////////////////////////////////////////////////////////////////
    // Get the number of unique products present in the shopping cart (not including quantity)
    public get productCount() {
        return this.products.length;
    }


    //////////////////////////////////////////////////////////////////////////////////////////////
    // Get the total price of all items in the shopping cart.
    private getPriceSum(): number {
        let sum: number = 0;
        this.products.forEach((product) => {
            sum += (product.price * product.quantity);
        });
        return sum;
    }


    //////////////////////////////////////////////////////////////////////////////////////////////
    // Add a product to the shopping cart. 
    public addProduct(id: number, name: string, quantity: number, price: number): void {
        if (!isNaN(id) && (id > 0) && !isNaN(quantity) && (quantity > 0)) {
            const product: CartProduct = {
                id: id,
                name: name,
                quantity: Number(quantity),
                price: Number(price)
            }

            this.products.push(product);
            this.updateProductCountDisplay();
            this.showAddedIndicator(id, true);
        }
    }


    //////////////////////////////////////////////////////////////////////////////////////////////
    // Remove a product from the shopping cart. 
    public removeProduct(id: number): void {
        const idx = this.products.findIndex((product) => product.id == id);
        if (idx !== -1) {
            this.products.splice(idx, 1);
            this.updateProductCountDisplay();
            this.showAddedIndicator(id, false);
        }
    }


    //////////////////////////////////////////////////////////////////////////////////////////////
    // Update the quantity of a product in the shopping cart. 
    public updateProduct(id: number, quantity: number): void {
        const product = this.products.find((product) => product.id == id);
        if (product && !isNaN(quantity)) {
            product.quantity = (quantity ? quantity : 1);
        }
    }


    //////////////////////////////////////////////////////////////////////////////////////////////
    // Create a list of all items in the shopping cart with form controls to change quantity.
    public buildProductList(): void {
        const container = document.querySelector("#cart-productlist") as HTMLElement;
        const priceSumBox = document.querySelector("#cart-price-sum") as HTMLElement;

        priceSumBox.innerText = `Price total: $${this.getPriceSum()}`;
        container.innerHTML = "";

        for (const product of this.products) {
            utilities.createHTMLFromTemplate("tpl-product-cart", container, product, { "data-productid": product.id.toString() });
        }
    }


    //////////////////////////////////////////////////////////////////////////////////////////////
    // Display the shopping cart in a popup dialog.
    public show(): void {
        const shoppingCartDialog = document.querySelector("#shoppingcart") as HTMLDialogElement;

        this.buildProductList();
        shoppingCartDialog.showModal();
        (document.querySelector("#cart-close") as HTMLButtonElement).focus();
    }


    //////////////////////////////////////////////////////////////////////////////////////////////
    // Event handler when changing the quantity of an item in the cart. If set to zero the item is removed from the cart. 
    private onQuantityChange(event) {
        event.preventDefault();

        const productRow = event.submitter.closest("article") as HTMLElement;
        if (productRow) {
            const priceSumBox = document.querySelector("#cart-price-sum") as HTMLElement;
            const id: number = Number(productRow.dataset.productid);
            const qty: number = Number((productRow.querySelector(".quantity") as HTMLInputElement).value);

            if ((qty <= 0) && id) {
                this.removeProduct(id);
                this.buildProductList();
            }
            else if (id && qty) {
                this.updateProduct(id, qty);
                priceSumBox.innerText = `Price total: $${this.getPriceSum()}`;
            }
        }

        event.submitter.blur();
    }


    //////////////////////////////////////////////////////////////////////////////////////////////
    // Updates the indicator next to the shopping cart icon with the number of items in the cart. 
    public updateProductCountDisplay(): void {
        (document.querySelector("#show-cart-count") as HTMLSpanElement).innerText = this.productCount.toString();
    }


    //////////////////////////////////////////////////////////////////////////////////////////////
    // Toggle showing an indicator on a displayed product card that the item is in the cart. 
    public showAddedIndicator(id: number, isVisible: boolean): void {
        const formElement = document.querySelector(`article[data-productid="${id}"] form`);
        if (formElement) {
            formElement.classList[isVisible ? "add" : "remove"]("bought");
        }
    }


    //////////////////////////////////////////////////////////////////////////////////////////////
    // Check if a product with the specified product ID is in the shopping cart. 
    public isInCart(id: number): boolean {
        return this.products.findIndex((product) => product.id == id) !== -1;
    }
}