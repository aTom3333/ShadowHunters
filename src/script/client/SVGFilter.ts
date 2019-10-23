

export function outlineFilter(color: string, size: number) {
    if(!color.match(/#[0-9a-fA-F]{6}/))
        throw new Error('Invalid color string');

    const id = `outline-${size}-${color.substr(1)}`;
    if(document.getElementById(id))
        return id;

    const template = document.getElementById('outline-filter-template') as HTMLTemplateElement;
    const svg = document.importNode(template.content, true);

    svg.querySelector('filter').id = id;
    svg.querySelector('feMorphology').setAttribute('radius', size.toString());
    svg.querySelector("feFlood").setAttribute('flood-color', color);

    document.body.appendChild(svg);

    return id;
}

export function setFilter(elem: HTMLElement, filterId: string) {
    elem.style.filter = `url(#${filterId})`;
}
