/*
    Dummy Webshop - Inlämningsuppgift 3 - Javascript 2 - FE23
    By Kristoffer Bengtsson

    utilities.js
    My general utility functions module (trimmed down to only what is used here)
*/

///////////////////////////////////////////////////////////////////////////////
// Create and return (or attach) a HTML element based on a template.
//  - templateId is the ID of the <template> tag in the HTML file to use.
//  - container is the parent element to insert the new element into.
//  - values is an object where the key is a classname and value is the value
//    to set as innerText/HTML of the matching element within the new object
//    (or href for links, src for images, value for form fields)
export function createHTMLFromTemplate(templateId: string, container: HTMLElement | null = null, values: Record<string, string | number | boolean> = {}, attributes: Record<string, string> | null = null, allowHTML: boolean = false): HTMLElement {
    let newElement: HTMLElement;
    const template = document.getElementById(templateId) as HTMLTemplateElement;

    if (template) {
        newElement = template.content.firstElementChild!.cloneNode(true) as HTMLElement;

        for (const key in values) {
            const targetElement = newElement.querySelector(`.${key}`);
            if (targetElement) {
                switch (targetElement.tagName) {
                    case "IMG": (targetElement as HTMLImageElement).src = values[key] as string; break;
                    case "A": (targetElement as HTMLAnchorElement).href = values[key] as string; break;
                    case "TEXTAREA":
                    case "SELECT":
                    case "INPUT": (targetElement as HTMLInputElement).value = values[key] as string; break;
                    default: targetElement[allowHTML ? "innerHTML" : "innerText"] = values[key] as string; break;
                }
            }
        }

        if (attributes) {
            for (const key in attributes) {
                const attr = newElement.querySelector(`[${key}]`);
                if (newElement.getAttribute(key)) {
                    newElement.setAttribute(key, attributes[key]);
                }
                else if (attr) {
                    attr.setAttribute(key, attributes[key]);
                }
            }
        }

        if (container) {
            container.appendChild(newElement);
        }
    }
    else {
        newElement = createHTMLElement("div", `Template not found: ${templateId}`, container, 'error');
    }

    return newElement;
}


//////////////////////////////////////////////////////////////////////////////////////////////////////
// Oneliner to create and return a new DOM element with content, optionally appending it to a parent element.
//  * elementText can either be a string holding the content of the tag or the ALT of an img tag, or an array of strings 
//    containing the listitems/options for UL, OL, SELECT and DATALIST tags. In the case of SELECT/DATALIST the strings 
//    can also be formated like: SELECT: value|textlabel|optgroup      DATALIST: value|textlabel
//  * elementClass can be a string or an array of strings holding CSS class(es) to apply to the element. 
//  * The elementAttributes parameter can be an object with a property for each attribute to set on the HTML element. 
// Function returns the newly created DOM element (or its wrapper element if a wrapper is created).
// Remember: Set CSS "white-space: pre-wrap;" on element if allowHTML is true and newlines still should displayed like with innerText. 
export function createHTMLElement(elementType: string, elementText: string | string[], parentElement: HTMLElement | null = null, elementClass: string | string[] = '', elementAttributes: Record<string, string> | null = null, allowHTML: boolean = false): HTMLElement {
    let newElement = document.createElement(elementType);

    elementType = elementType.toLowerCase();

    if (elementAttributes && (typeof elementAttributes == "object") && Object.keys(elementAttributes).length) {
        for (const attributeName in elementAttributes) {
            newElement.setAttribute(attributeName, elementAttributes[attributeName]);
        }
    }
    addClassToElement(newElement, elementClass);

    if (elementText && elementText.length && Array.isArray(elementText)) {
        // If type is a list and text is an array, build list items
        if ((elementType == 'ul') || (elementType == 'ol')) {
            for (const listItemText of elementText) {
                const newListItem = document.createElement("li");
                newListItem[allowHTML ? "innerHTML" : "innerText"] = listItemText;
                newElement.appendChild(newListItem);
            }
        }
        // If type is a select form element and text is an array, build select option list
        else if ((elementType == 'select') || (elementType == 'datalist')) {
            for (const optionItemText of elementText) {
                const [optValue, optLabel, optGroup] = optionItemText.split('|');
                const newOptionItem = document.createElement("option");

                newOptionItem[allowHTML ? "innerHTML" : "innerText"] = (optLabel ?? optValue);
                newOptionItem.value = optValue;

                if (optGroup !== undefined) {
                    let optionGroup: HTMLOptGroupElement | null = newElement.querySelector(`optgroup[label="${optGroup}"]`);
                    if ((optionGroup === undefined) || (optionGroup === null)) {
                        optionGroup = document.createElement("optgroup");
                        optionGroup.label = optGroup;
                        newElement.appendChild(optionGroup);
                    }
                    optionGroup.appendChild(newOptionItem);
                }
                else {
                    newElement.appendChild(newOptionItem);
                }
            }
        }
        // Array but not a list-type element, just use the first string 
        else {
            newElement[allowHTML ? "innerHTML" : "innerText"] = elementText[0];
        }
    }
    else if (elementText && elementText.length) {
        if (elementType == 'img') {
            (newElement as HTMLImageElement).alt = elementText as string;
        }
        // Special case for input fields, create wrapper and labels for them.
        else if ((elementType == 'input') && (elementText.length > 0)) {
            const actualNewElement = newElement;
            const newElementLabel = document.createElement("label");
            newElement = document.createElement("div");
            newElement.id = `${actualNewElement.id}-wrapper`;
            if (elementClass.length > 0) {
                newElement.classList.add((Array.isArray(elementClass) ? elementClass[0] : elementClass) + "-wrapper");
            }

            newElementLabel.setAttribute("for", actualNewElement.id);
            newElementLabel[allowHTML ? "innerHTML" : "innerText"] = elementText as string;

            if ((actualNewElement.getAttribute("type") == "radio") || (actualNewElement.getAttribute("type") == "checkbox")) {
                newElementLabel.classList.add(`input-box-label`);
                newElement.append(actualNewElement, newElementLabel);
            }
            else {
                newElement.append(newElementLabel, actualNewElement);
            }

        }
        else {
            newElement[allowHTML ? "innerHTML" : "innerText"] = elementText as string;
        }
    }

    if ((parentElement !== undefined) && (parentElement !== null)) {
        parentElement.appendChild(newElement);
    }
    return newElement;
}


//////////////////////////////////////////////////////////////////////////////////////////////////////
// Add CSS class(es) to a DOM element
export function addClassToElement(targetElement: HTMLElement, classesToAdd: string | string[]): void {
    if ((targetElement !== undefined) && (targetElement !== null)) {
        if (classesToAdd.length > 0) {
            if (Array.isArray(classesToAdd)) {
                targetElement.classList.add(...classesToAdd);
            }
            else if (classesToAdd && classesToAdd.length) {
                targetElement.classList.add(classesToAdd);
            }
        }
    }
}


//////////////////////////////////////////////////////////////////////////////////////////////////////
// Build a rating display with stars from a rating value
export function createRatingScoreDisplay(score: number, scoreMax: number): HTMLElement {
    const scoreBox = document.createElement("div");
    const scoreValueBox = document.createElement("span");

    for (let i = 1; i <= scoreMax; i++) {
        scoreValueBox.appendChild(createRatingScoreElement(i, scoreMax, score));
    }
    scoreBox.appendChild(scoreValueBox);
    return scoreBox;
}

function createRatingScoreElement(currElement: number, maxElements: number, score: number): SVGSVGElement {
    const newSVG = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    const newUse = document.createElementNS('http://www.w3.org/2000/svg', 'use');
    const scoreRounded: number = Math.max(Math.min(Math.round(score), maxElements), 0);

    if (scoreRounded >= currElement) {
        newSVG.classList.add("scored");
        if ((currElement > score) && ((score % 1) >= 0.5)) {
            newUse.setAttribute("mask", "url(#halfscore)");
        }
    }

    newSVG.classList.add("points");
    newUse.setAttribute("href", "#points-image");
    newSVG.appendChild(newUse);
    return newSVG;
}