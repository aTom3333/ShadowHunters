import {Popup} from "./Popup";
import {Location} from "../common/Game/CharacterState";
import * as crelLib from "crel";
import * as crelns from "crelns";
import {asciify, breakText} from "./stringUtil";
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

function outlineShadow(size: string, color: string, repeat: number = 5) {
    const single = `0 0 ${size} ${color}`;
    let result = single;
    for(let i = 1; i < repeat; i++)
        result += ', ' + single;
    return result;
}

function strokedText(attr, strokeAttr, content) {
    const firstAttr = { ...attr, ...strokeAttr };
    return [
        crsvg.text(firstAttr, content),
        //crsvg.text(attr, content)
    ];
}

export class LocationPopup<T> extends Popup<T> {
    private resizeListener: EventListenerOrEventListenerObject;

    constructor(location: Location) {
        let svg;

        const card = crel.div({
            'class': 'card-container'
        },
            // crel.div({'class': 'card-description'},
            //     crel.h5({'class': 'card-title'}, location.name),
            //     location.description
            // ),
            svg = crsvg.svg({
                xmlns: "http://www.w3.org/2000/svg",
                'class': 'card-image',
                width: 784,
                height: 1076,
                viewBox: '0 0 784 1076'
            },
                crsvg.image({
                    width: '100%',
                    height: '100%',
                    href: LocationPopup.nameToImageUrl(location.name)
                }),
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
            )
        );

        super(card);
        this.resizeImage();

        this.resizeListener = () => {
            this.resizeImage();
        };
        window.addEventListener('resize', this.resizeListener);
    }

    private resizeImage() {
        const cardAspectRatio = 196/269;
        let height = window.innerHeight * 0.8;
        let width = height * cardAspectRatio;
        const otherWidth = window.innerWidth * 0.8;
        if(otherWidth < width) {
            width = otherWidth;
            height = width / cardAspectRatio;
        }
        const svg: SVGImageElement = this.content.querySelector('.card-image');
        svg.style.width = width + 'px';
        svg.style.height = height + 'px';
    }

    static nameToImageUrl(locationName: string) {
        switch (locationName) {
            case 'Forêt hantée':
                return window.location.origin + '/img/weirdwoods2.jpg';
            default:
                return ''
        }
    }

    cleanup() {
        window.removeEventListener('resize', this.resizeListener);
    }
}
