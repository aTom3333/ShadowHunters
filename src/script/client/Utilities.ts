import * as crelLib from "crel";


const lib = crelLib.default;
console.debug(lib);


export function random(min: number, max: number) {
    if(min === undefined)
        return Math.random();
    if(max === undefined)
        return random(0, min);
    return Math.floor(Math.random() * (max-min)) + min;
}

export function instantiateTemplate(template: HTMLTemplateElement, data: {[selector: string]: string|Element}): DocumentFragment {
    const node = document.importNode(template.content, true);
    for(const selector in data) {
        if(data.hasOwnProperty(selector)) {
            node.querySelector(selector).append(data[selector])
        }
    }

    return node;
}

export const crel = lib.proxy;
lib.attrMap['style'] = (element, value) => {
    for (const property in value) {
        if(value.hasOwnProperty(property)) {
            element.style[property] = value[property];
        }
    }
};
const crelns: any = function(namespace, type) {
    const element = document.createElementNS(namespace, type);
    return lib.apply(null, [element].concat(Array.prototype.slice.call(arguments, 2)));
};

export const crsvg = new Proxy(crelns, {
    get: (target, p) =>  {
        !(p in crelns) && (crelns[p] = crelns.bind(null, 'http://www.w3.org/2000/svg', p));
        return crelns[p];
    }
});

export function sleep(ms: number): Promise<void> {
    return new Promise<void>((resolve, reject) => {
        setTimeout(resolve, ms);
    });
}
