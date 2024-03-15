/*
    Dummy Webshop - Inlämningsuppgift 3 - Javascript 2 - FE23
    By Kristoffer Bengtsson

    Webshop.js
    Main class of the fake webshop. Fetch and display products. 
*/
import RestApi from './RestApi.ts';
import * as utilities from './utilities.ts';
import { APIQueryParams, ProductsResult } from './TypeDefinitions.ts';

// const shop = new Webshop('https://dummyjson.com');

export default class Webshop {
    private api: RestApi;
    public readonly pageSize: number;
    public currentResult: ProductsResult;
    public onPurchaseSubmit: Function;
    public onProductClick: Function;

    constructor(apiUrl: string, resultsPerPage: number = 20) {
        this.api = new RestApi(apiUrl);
        this.pageSize = resultsPerPage;
        this.currentResult = {
            products: [],
            total: 0,
            skip: 0,
            limit: 0
        };
    }


    //////////////////////////////////////////////////////////////////////////////////////////////
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
                    card.querySelector(".rating")!.prepend(utilities.createRatingScoreDisplay(product.rating, 5));
                    card.querySelector("form")!.addEventListener("submit", this.onPurchaseSubmit.bind(this));
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


    //////////////////////////////////////////////////////////////////////////////////////////////
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
}
