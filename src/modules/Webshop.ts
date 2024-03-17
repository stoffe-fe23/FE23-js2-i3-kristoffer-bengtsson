/*
    Dummy Webshop - Inlämningsuppgift 3 - Javascript 2 - FE23
    By Kristoffer Bengtsson

    Webshop.js
    Main class of the fake webshop. Fetch and display products. 
*/
import RestApi from './RestApi.ts';
import ShoppingCart from './ShoppingCart.ts';
import * as utilities from './utilities.ts';
import { APIQueryParams, ProductsResult, Product } from './TypeDefinitions.ts';


export default class Webshop {
    private api: RestApi;
    private currentResult: ProductsResult;
    public readonly cart: ShoppingCart;
    public readonly pageSize: number;
    public onPurchaseSubmit: Function;
    public onProductClick: Function;

    constructor(apiUrl: string, resultsPerPage: number = 20) {
        this.api = new RestApi(apiUrl);
        this.cart = new ShoppingCart();
        this.pageSize = resultsPerPage;
        this.currentResult = {
            products: [],
            total: 0,
            skip: 0,
            limit: 0
        };
    }

    // Get the total number of result pages of the current product result.
    public get resultPages(): number {
        return Math.ceil(this.currentResult.total / this.pageSize);
    }

    // Get the currently shown page of the current product result.
    public get currentPage(): number {
        return Math.ceil((this.currentResult.skip / this.pageSize) + 1);
    }

    //////////////////////////////////////////////////////////////////////////////////////////////
    // Load categories from API as options of select form element.
    public async loadCategories(catSelect: HTMLSelectElement): Promise<void> {
        if (catSelect) {
            const categories: string[] = await this.api.getJson("products/categories");

            categories.sort((a: string, b: string) => a.localeCompare(b));

            catSelect.innerHTML = "";
            utilities.addSelectOption(catSelect, "", "- All categories -");
            for (const category of categories) {
                utilities.addSelectOption(catSelect, category);
            }
        }
    }


    //////////////////////////////////////////////////////////////////////////////////////////////
    // Display all products matching the specified name filter, or all products if unspecified. 
    public async getProducts(nameFilter: string = '', resultPage: number = 0): Promise<ProductsResult> {
        const queryParams: APIQueryParams = {
            q: nameFilter,
            limit: this.pageSize.toString(),
            skip: (this.pageSize * resultPage).toString()
        }

        const response: ProductsResult = await this.api.getJson(nameFilter.length ? "products/search" : "products", queryParams);
        this.currentResult = response;
        this.showResultNav(response.products.length < response.total);
        this.displayProducts(response);
        return response;
    }


    //////////////////////////////////////////////////////////////////////////////////////////////
    // Display all products belonging to the specified category. 
    public async getProductsByCategory(categoryFilter: string = '', resultPage: number = 0): Promise<ProductsResult> {
        const queryParams: APIQueryParams = {
            limit: this.pageSize.toString(),
            skip: (this.pageSize * resultPage).toString()
        }

        const response: ProductsResult = await this.api.getJson(categoryFilter.length ? `products/category/${categoryFilter}` : `products`, queryParams);
        this.currentResult = response;
        this.showResultNav(response.products.length < response.total);
        this.displayProducts(response);
        return response;
    }


    //////////////////////////////////////////////////////////////////////////////////////////////
    // Display the specified page of products results.
    public async getProductsPage(pageType: 'prev' | 'next' | 'first' | 'last' | 'page', pageNum: number = 0): Promise<ProductsResult> {
        let resultPage = Math.ceil(this.currentResult.skip / this.pageSize);
        const maxPage = Math.ceil(this.currentResult.total / this.pageSize);

        if (pageNum && (pageNum <= maxPage) && (pageType == 'page')) {
            resultPage = (pageNum - 1);
        }
        else {
            switch (pageType) {
                case 'prev': resultPage = (resultPage - 1 >= 0 ? resultPage - 1 : 1); break;
                case 'next': resultPage = (resultPage + 1 < maxPage ? resultPage + 1 : maxPage); break;
                case 'first': resultPage = 0; break;
                case 'last': resultPage = maxPage - 1; break;
            }
        }

        const queryParams = { skip: (this.pageSize * resultPage).toString() }
        const response: ProductsResult = await this.api.repeatRequestJson('', queryParams);

        this.currentResult = response;
        this.showResultNav(response.products.length < response.total);
        this.displayProducts(response);
        return response;
    }


    //////////////////////////////////////////////////////////////////////////////////////////////
    // Display all the specified products on the page. 
    public displayProducts(productData: ProductsResult) {
        const productsBox = document.querySelector("#productlist") as HTMLElement;
        const summaryBox = document.querySelector("#search-summary") as HTMLDivElement;

        if (summaryBox) {
            summaryBox.innerText = `Found ${productData.total} product${productData.total != 1 ? "s" : ""}.`;
            if (productData.total > productData.products.length) {
                const bounds = (this.currentResult.skip + this.pageSize > productData.total ? productData.total : this.currentResult.skip + this.pageSize);
                summaryBox.innerText += ` Showing ${this.currentResult.skip + 1} to ${bounds}`;
            }
        }
        if (productsBox) {
            productsBox.innerHTML = "";
            if ((productData.total > 0) && (productData.products.length > 0)) {
                for (const product of productData.products) {
                    const card = utilities.createHTMLFromTemplate("tpl-product-card", productsBox, product, { "data-productid": product.id.toString() });
                    card.addEventListener("click", this.onProductClick.bind(this));
                    (card.querySelector(".rating") as HTMLElement).prepend(utilities.createRatingScoreDisplay(product.rating, 5));
                    (card.querySelector("form") as HTMLFormElement).addEventListener("submit", this.onPurchaseSubmit.bind(this));

                    if (product.stock < 10) {
                        (card.querySelector(".stock") as HTMLElement).classList.add("alert");
                    }

                    if (this.cart.isInCart(product.id)) {
                        this.cart.showAddedIndicator(product.id, true);
                    }
                }
            }
            else {
                utilities.createHTMLElement("div", "No products found.", productsBox, 'products-none');
            }
        }
    }


    //////////////////////////////////////////////////////////////////////////////////////////////
    // Show or hide the control for navigating product results if more exists than the per-page limit.
    public showResultNav(isMultiplePages: boolean): void {
        const pageNav = document.querySelector("#pages-nav") as HTMLFormElement;
        if (isMultiplePages) {
            const resultPage = Math.ceil(this.currentResult.skip / this.pageSize) + 1;
            const maxPage = Math.ceil(this.currentResult.total / this.pageSize);

            (pageNav.querySelector("#pages-nav-goto") as HTMLButtonElement).innerHTML = `Page ${resultPage} / ${maxPage}`;
            (pageNav.querySelector("#pages-nav-first") as HTMLButtonElement).disabled = (resultPage <= 1);
            (pageNav.querySelector("#pages-nav-prev") as HTMLButtonElement).disabled = (resultPage <= 1);
            (pageNav.querySelector("#pages-nav-next") as HTMLButtonElement).disabled = (resultPage == maxPage);
            (pageNav.querySelector("#pages-nav-last") as HTMLButtonElement).disabled = (resultPage == maxPage);

            pageNav.classList.add("show");
        }
        else {
            pageNav.classList.remove("show");
        }
    }


    //////////////////////////////////////////////////////////////////////////////////////////////
    // Get information about a currently displayed product by its product ID. 
    public findCurrentProductById(productId: number): Product | undefined {
        return this.currentResult.products.find((product) => product.id == productId);
    }
}
