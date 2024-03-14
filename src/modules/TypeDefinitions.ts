/*
    Dummy Webshop - Inlämningsuppgift 3 - Javascript 2 - FE23
    By Kristoffer Bengtsson

    Type Definitions.js
    Type aliases.
*/

// Structure of a product object
export type Product = {
    id: number,
    title: string,
    brand: string,
    description: string,
    price: number,
    discountPercentage: number,
    rating: number,
    stock: number,
    category: string,
    thumbnail: string
}

// Structure of response data received from API when requesting a product list
export type ProductsResult = {
    products: Product[],
    total: number,
    skip: number,
    limit: number
}

// Structure of parameters when doing an API request
export type APIQueryParams = Record<string, string | Array<string>> | null;

// Structure of data passed to the API functions when doing a non-GET request
export type APIQueryValue = string | number | boolean | Array<string | number>;
export type APIQueryData = FormData | Record<string, APIQueryValue> | null;