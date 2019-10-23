var str = "Rånades på Skyttis i Ö-vik";
var combining = /[\u0300-\u036F]/g;

console.log(str.normalize('NFKD').replace(combining, ''));

export function asciify(str: string) {
    const combining = /[\u0300-\u036F]/g;
    const approximated = str.normalize('NFKD').replace(combining, '');
    return approximated.replace(/[^\u0000-\u007F]/g, '?');
}

export const defaultTable = [0, 0, 0, 0];

export function textWidth(str: string, widthTable: Array<number> = defaultTable) {
    return measureText(asciify(str));
}

export function breakText(str: string, width: number, widthTable: Array<number> = defaultTable) {
    const words = str.split(' ');
    const result = [];

    for(const word of words) {
        if(result.length === 0)
            result.push(word);
        else {
            if(textWidth(result[result.length-1] + ' ' + word) <= width) {
                result[result.length-1] += ' ' + word;
            } else {
                result.push(word);
            }
        }
    }

    return result;
}

function appendToLast(arr: Array<string>, str: string) {
    arr[arr.length-1] += ' ' + str;
}

// See https://stackoverflow.com/a/48172630
function measureText(str, fontSize = 10) {
    const widths = [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0.2796875,0.2765625,0.3546875,0.5546875,0.5546875,0.8890625,0.665625,0.190625,0.3328125,0.3328125,0.3890625,0.5828125,0.2765625,0.3328125,0.2765625,0.3015625,0.5546875,0.5546875,0.5546875,0.5546875,0.5546875,0.5546875,0.5546875,0.5546875,0.5546875,0.5546875,0.2765625,0.2765625,0.584375,0.5828125,0.584375,0.5546875,1.0140625,0.665625,0.665625,0.721875,0.721875,0.665625,0.609375,0.7765625,0.721875,0.2765625,0.5,0.665625,0.5546875,0.8328125,0.721875,0.7765625,0.665625,0.7765625,0.721875,0.665625,0.609375,0.721875,0.665625,0.94375,0.665625,0.665625,0.609375,0.2765625,0.3546875,0.2765625,0.4765625,0.5546875,0.3328125,0.5546875,0.5546875,0.5,0.5546875,0.5546875,0.2765625,0.5546875,0.5546875,0.221875,0.240625,0.5,0.221875,0.8328125,0.5546875,0.5546875,0.5546875,0.5546875,0.3328125,0.5,0.2765625,0.5546875,0.5,0.721875,0.5,0.5,0.5,0.3546875,0.259375,0.353125,0.5890625]
    const avg = 0.5279276315789471;
    return str
        .split('')
        .map(c => c.charCodeAt(0) < widths.length ? widths[c.charCodeAt(0)] : avg)
        .reduce((cur, acc) => acc + cur) * fontSize
}
