import * as crelLib from "crel";
import {Location} from "../common/Game/CharacterState";
import {breakText} from "./stringUtil";
import {outlineFilter} from "./SVGFilter";

const crel = crelLib.proxy;
crelLib.attrMap['style'] = (element, value) => {
    for (const property in value) {
        if(value.hasOwnProperty(property)) {
            element.style[property] = value[property];
        }
    }
};

const crelns: any = function(namespace, type) {
    const element = document.createElementNS(namespace, type);
    return crelLib.apply(null, [element].concat(Array.prototype.slice.call(arguments, 2)));
};

const crsvg = new Proxy(crelns, {
    get: (target, p) =>  {
        !(p in crelns) && (crelns[p] = crelns.bind(null, 'http://www.w3.org/2000/svg', p));
        return crelns[p];
    }
});

export class SVGGenerator {

    private static nameToImageUrl(locationName: string) {
        switch (locationName) {
            case 'Forêt hantée':
                return window.location.origin + '/img/weirdwoods2.jpg';
            default:
                return 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAIAAACQd1PeAAAACXBIWXMAAC4jAAAuIwF4pT92AAAAB3RJTUUH4wodDwIAja1x0AAAABl0RVh0Q29tbWVudABDcmVhdGVkIHdpdGggR0lNUFeBDhcAAAAMSURBVAjXY/j//z8ABf4C/tzMWecAAAAASUVORK5CYII='
        }
    }

    static locationCard(location: Location) {
        return crsvg.svg({
                xmlns: "http://www.w3.org/2000/svg",
                'class': 'card-image',
                width: 784,
                height: 1076,
                viewBox: '0 0 784 1076'
            },
            crsvg.image({
                width: '100%',
                height: '100%',
                preserveAspectRatio: 'none',
                href: SVGGenerator.nameToImageUrl(location.name)
            }),
            crsvg.text({
                'font-size': 150,
                x: '50%',
                y: 700,
                'text-anchor': 'middle',
                fill: '#efe50a',
                style: {
                    filter: `url(#blackspots)`
                },
                'class': 'numbers'
            }, location.numbers.join('/')),
            crsvg.text({
                'font-size': 60,
                x: '50%',
                y: 800,
                'text-anchor': 'middle',
                fill: '#efe50a',
                style: {
                    filter: `url(#outline-2-48276b)`
                },
                'class': 'card-title'
            }, location.name),
            breakText(location.description, 120).map((line, index) => {
                return crsvg.text({
                    x: '50%',
                    y: 868 + 48*index,
                    'text-anchor': 'middle',
                    style: {
                        fill: '#7c7837',
                        'font-size': '40px',
                        filter: `url(#${outlineFilter('#000000', 3)})`
                    }
                }, line);
            })
        );
    }
}
