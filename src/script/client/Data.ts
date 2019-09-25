import * as Cookie from 'js-cookie';

export class Data {
    private internalName: string;

    constructor() {
        this.internalName = '';
    }

    get name(): string {
        if(this.internalName)
            return this.internalName;
        else {
            const name = Cookie.get('name');
            if(name) {
                this.internalName = name;
                return name;
            }
            else
                return '';
        }
    }

    set name(name: string) {
        this.internalName = name;
        Cookie.set('name', name);
    }

    hasName(): boolean {
        return !!this.name;
    }
}
