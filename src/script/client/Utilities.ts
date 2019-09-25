


export function instantiateTemplate(template: HTMLTemplateElement, data: {[selector: string]: string}): DocumentFragment {
    const node = document.importNode(template.content, true);
    for(const selector in data) {
        if(data.hasOwnProperty(selector)) {
            node.querySelector(selector).textContent = data[selector];
        }
    }

    return node;
}
