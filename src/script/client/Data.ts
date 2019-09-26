import * as Cookie from 'js-cookie';

export class Data {
    private internalName: string;
    private internalRoomName: string;

    constructor() {
        this.internalName = '';
        this.internalRoomName = '';
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

    get roomName(): string {
        if(this.internalRoomName)
            return this.internalRoomName;

        const hash = window.location.hash;
        if(hash) {
            let name = hash.substring(1);
            name = decodeURI(name);
            this.internalRoomName = name;
            return name;
        } else
            return '';
    }

    set roomName(roomName: string) {
        this.internalRoomName = roomName;
        window.location.hash = encodeURI(roomName);
    }
}
