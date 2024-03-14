/*
    Dummy Webshop - Inlämningsuppgift 3 - Javascript 2 - FE23
    By Kristoffer Bengtsson

    RestApi.js
    Class for making requests to a REST API using JSON data. 
*/
import { APIQueryParams, APIQueryValue, APIQueryData } from './TypeDefinitions.ts';


export default class RestApi {
    private readonly urlBase: string;
    private readonly urlSuffix: string;

    // Set the base URL to access the api, and any default suffix (like ".json" on Firebase)
    // Each individual request method can then extend on the base url, and add query parameters. 
    constructor(baseUrl: string, urlSuffix: string = "") {
        this.urlBase = baseUrl;
        this.urlSuffix = urlSuffix;
    }


    //////////////////////////////////////////////////////////////////////////////////////////////////////
    // Send GET request to API
    async getJson<Type>(urlPath: string = '', queryParams: APIQueryParams = null): Promise<Type> {
        const response = await fetch(this.buildRequestUrl(urlPath, queryParams));
        const result = await response.json();
        if (!response.ok) {
            this.handleResponseErrors(response, result);
        }
        return result as Type;
    }


    //////////////////////////////////////////////////////////////////////////////////////////////////////
    // Send POST request to API
    async postJson<Type>(urlPath: string = '', formData: APIQueryData = null, queryParams: APIQueryParams = null): Promise<Type> {
        let response = await fetch(this.buildRequestUrl(urlPath, queryParams), this.getFetchOptions("POST", formData ?? {}));
        let result = await response.json();
        if (!response.ok) {
            this.handleResponseErrors(response, result);
        }
        return result as Type;
    }


    //////////////////////////////////////////////////////////////////////////////////////////////////////
    // Send PATCH request to API
    async updateJson<Type>(urlPath: string = '', formData: APIQueryData = null, queryParams: APIQueryParams = null): Promise<Type> {
        let response = await fetch(this.buildRequestUrl(urlPath, queryParams), this.getFetchOptions("PATCH", formData ?? {}));
        let result = await response.json();
        if (!response.ok) {
            this.handleResponseErrors(response, result);
        }
        return result as Type;
    }


    //////////////////////////////////////////////////////////////////////////////////////////////////////
    // Send DELETE request to API
    async deleteJson<Type>(urlPath: string = '', formData: APIQueryData = null, queryParams: APIQueryParams = null): Promise<Type> {
        let response = await fetch(this.buildRequestUrl(urlPath, queryParams), this.getFetchOptions("DELETE", formData ?? {}));
        let result = await response.json();
        if (!response.ok) {
            this.handleResponseErrors(response, result);
        }
        return result as Type;
    }


    //////////////////////////////////////////////////////////////////////////////////////////////////////
    // Create a json-encoded object from a FormData object
    formdataToJson(formData: FormData): string {
        var dataObject = {};
        if (formData instanceof FormData) {
            formData.forEach((value, key) => {
                // In case the remote api is type sensitive (like Firebase), convert to numbers and booleans from FormData strings 
                let currValue: APIQueryValue = value as string;
                if (!isNaN(Number(value))) {
                    currValue = parseInt(value as string);
                }
                else if ((value === "true") || (value === "false")) {
                    currValue = (value === "true");
                }

                // Handle formdata with multiple value fields with the same name attribute (like SELECT tags 
                //  with the "multiple" attribute, checkbox groups etc)
                if (!(key in dataObject)) {
                    dataObject[key] = currValue;
                }
                else {
                    if (!Array.isArray(dataObject[key])) {
                        dataObject[key] = [dataObject[key]];
                    }
                    dataObject[key].push(currValue);
                }
            });
        }
        return JSON.stringify(dataObject);
    }


    //////////////////////////////////////////////////////////////////////////////////////////////////////
    // Handle error responses from the API requests
    private handleResponseErrors(response: Response, result: any): void {
        if ((response.status == 400)) {
            throw new ApiError(response.status, `Bad request: ${result.error ?? ""}  (${response.statusText})`);
        }
        // Server errors - show the error message from API
        else if (response.status == 500) {
            throw new ApiError(response.status, `Server error: ${result.error ?? ""}  (${response.statusText})`);
        }
        // Other errors - show request status message
        else {
            throw new ApiError(response.status, `API Error: ${response.statusText}`);
        }
    }


    //////////////////////////////////////////////////////////////////////////////////////////////////////
    // Assemble URL to send requests to.
    private buildRequestUrl(urlPath: string = '', queryParams: APIQueryParams = null): URL {
        const url: URL = new URL(`${this.urlBase}${urlPath.length ? "/" + urlPath : ""}${this.urlSuffix}`);
        if (queryParams) {
            for (const key in queryParams) {
                if (Array.isArray(queryParams[key])) {
                    for (const elem of queryParams[key]) {
                        url.searchParams.append(key, elem);
                    }
                }
                else {
                    url.searchParams.append(key, queryParams[key] as string);
                }
            }
        }
        return url;
    }

    //////////////////////////////////////////////////////////////////////////////////////////////////////
    // Build options object for fetch() for submitting JSON data.
    private getFetchOptions(reqMethod: string, formData: APIQueryData): RequestInit {
        const options: RequestInit = {
            method: reqMethod,
            headers: { "Content-Type": "application/json" },
            body: (formData instanceof FormData ? this.formdataToJson(formData) : JSON.stringify(formData)),
        };
        return options;
    }
}


// Exception class for keeping response/error codes separate from the message text.
export class ApiError extends Error {
    public readonly errorCode: number;

    constructor(errorCode: number, errorMessage: string) {
        super(errorMessage);
        this.errorCode = errorCode;
    }
}