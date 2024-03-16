/*
    Dummy Webshop - Inlämningsuppgift 3 - Javascript 2 - FE23
    By Kristoffer Bengtsson

    TypeDefinitions.js
    Type alias definitions.
*/

// Product object
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

// Response data received from API when requesting a product list
export type ProductsResult = {
    products: Product[],
    total: number,
    skip: number,
    limit: number
}

// Product in the shopping cart
export type CartProduct = {
    id: number,
    name: string,
    quantity: number,
    price: number
}

// Parameters when doing an API request
export type APIQueryParams = Record<string, string | Array<string>> | null;

// Data passed to the API functions when doing a non-GET request
export type APIQueryValue = string | number | boolean | Array<string | number>;
export type APIQueryData = FormData | Record<string, APIQueryValue> | null;

// Tracking info about the last API query performed
export type APILastRequest = {
    url: URL | null,
    method: 'GET' | 'POST' | 'PATCH' | 'DELETE' | 'None',
    options: RequestInit | undefined
}