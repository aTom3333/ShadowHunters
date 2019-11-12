import * as crelLib from "crel";
import {Location} from "../common/Game/CharacterState";
import {breakText} from "./stringUtil";
import {outlineFilter} from "./SVGFilter";
import {Character, Faction} from "../common/Game/Character";

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

    private static locationNameToImageUrl(locationName: string) {
        switch (locationName) {
            case 'Forêt hantée':
                return 'img/weirdwoods2.jpg';
            default:
                return 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAIAAACQd1PeAAAACXBIWXMAAC4jAAAuIwF4pT92AAAAB3RJTUUH4wodDwIAja1x0AAAABl0RVh0Q29tbWVudABDcmVhdGVkIHdpdGggR0lNUFeBDhcAAAAMSURBVAjXY/j//z8ABf4C/tzMWecAAAAASUVORK5CYII='
        }
    }

    static locationCard(location: Location) {
        return crsvg.svg({
                xmlns: "http://www.w3.org/2000/svg",
                'class': 'card-image',
                // width: 784,
                // height: 1076,
                viewBox: '0 0 784 1076'
            },
            crsvg.image({
                width: '100%',
                height: '100%',
                preserveAspectRatio: 'none',
                href: SVGGenerator.locationNameToImageUrl(location.name)
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

    private static characterNameToImageUrl(name: string) {
        switch (name) {
            case 'Franklin':
                return 'img/franklin.png';
            case 'Emi':
                return 'img/emi.png';
            case 'Georges':
                return 'img/georges.png';
            case 'Vampire':
                return 'img/vampire.png';
            case 'Loup-garou':
                return 'img/loup-garou.png';
            case 'Métamorphe':
                return 'img/metamorph.png';
            case 'Allie':
                return 'img/allie.png';
            case 'Bob':
                return 'img/bob.png';
            case 'Charles':
                return 'img/charles.png';
            case 'Daniel':
                return 'img/daniel.png';
            default:
                return 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAIAAACQd1PeAAAACXBIWXMAAC4jAAAuIwF4pT92AAAAB3RJTUUH4wodDwIAja1x0AAAABl0RVh0Q29tbWVudABDcmVhdGVkIHdpdGggR0lNUFeBDhcAAAAMSURBVAjXY/j//z8ABf4C/tzMWecAAAAASUVORK5CYII=';
        }
    }

    static characterCard(character: Character) {
        if(character === null)
            return SVGGenerator.characterBack();
        const victoryConditionLines = breakText(character.victoryCondition.description, 200);
        const powerLines = breakText(character.power.description, 200);
        return crsvg.svg({
                xmlns: "http://www.w3.org/2000/svg",
                'class': 'card-image',
                // width: 784,
                // height: 1076,
                viewBox: '0 0 784 1076'
            },
            crsvg.image({
                width: '100%',
                height: '100%',
                preserveAspectRatio: 'none',
                href: SVGGenerator.characterNameToImageUrl(character.name)
            }),
            crsvg.text({
                'font-size': 120,
                x: 130,
                y: 165,
                'text-anchor': 'middle',
                fill: 'black',
                style: {
                    filter: `url(#${outlineFilter('#D0D0D0', 3)})`
                },
                'class': 'character-name'
            }, character.name.substr(0, 1).toUpperCase()),
            crsvg.text({
                'font-size': 60,
                x: 220,
                y: 85,
                fill: 'black',
                style: {
                    filter: `url(#${outlineFilter('#D0D0D0', 1)})`
                },
                'class': 'character-name'
            }, character.name.substr(1).toLowerCase()),
            crsvg.text({
                'font-size': 60,
                x: 110,
                y: 660,
                fill: 'black',
                style: {
                    filter: `url(#${outlineFilter('#D0D0D0', 1)})`
                }
            }, character.faction === Faction.Neutral ? 'Neutre' : character.faction === Faction.Hunter ? 'Hunter' : 'Shadow'),
            crsvg.text({
                'font-size': 60,
                x: 550,
                y: 660,
                fill: 'black',
                style: {
                    filter: `url(#${outlineFilter('#D0D0D0', 1)})`,
                    'font-family': 'Times New Roman'
                }
            }, 'PV'),
            crsvg.text({
                'font-size': 70,
                x: 695,
                y: 660,
                fill: 'black',
                'text-anchor': 'middle',
                style: {
                    filter: `url(#${outlineFilter('#D0D0D0', 1)})`,
                    'font-family': 'Times New Roman'
                }
            }, character.hp),
            crsvg.text({
                'font-size': 35,
                x: 110,
                y: 738,
                fill: '#D0D0D0',
            }, 'Condition de Victoire :'),
            victoryConditionLines.map((s, index) => crsvg.text({
                'font-size': 30,
                x: 120,
                y: 773 + 30*index,
                fill: '#D0D0D0',
            }, s)),
            crsvg.text({
                'font-size': 35,
                x: 110,
                y: 783 + 30*victoryConditionLines.length,
                fill: '#D0D0D0',
            }, 'Pouvoir : ' + character.power.name),
            powerLines.map((s, index) => crsvg.text({
                'font-size': 30,
                x: 120,
                y: 778 + 30*victoryConditionLines.length + 35 + 30*index,
                fill: '#D0D0D0',
            }, s)),
        );
    }

    static characterBack() {
        return crsvg.svg({
                xmlns: "http://www.w3.org/2000/svg",
                'class': 'card-image',
                // width: 784,
                // height: 1076,
                viewBox: '0 0 784 1076'
            },
            crsvg.image({
                width: '100%',
                height: '100%',
                preserveAspectRatio: 'none',
                href: window.location.origin + '/img/character back.png'
            })
        );
    }
}
