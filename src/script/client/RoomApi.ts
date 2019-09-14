import JsonResponse from "../common/Protocol/JsonResponse";

export default class RoomApi {

    /**
     * Request the server to get the list of Room
     */
    static async list(): Promise<JsonResponse<Array<any>>> { // TODO Change type to be Rooms
        const response = await fetch('http://shadowhunter/api/list');
        if(response.status !== 200)
            throw new Error('Problem while listing the rooms');

        return await response.json();
    }


    /**
     * Request the server to create a Room
     * @param name The name of the room to create
     */
    static async create(name: string): Promise<JsonResponse<any>> { // TODO return created Room
        const response = await fetch('http://shadowhunter/api/create', {
            method: 'post',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ name })
        });
        if(response.status !== 200)
            throw new Error('Problem while creating the room');

        return await response.json();
    }


    /**
     * Request the server to join a room
     * @param room The room to join
     * @param name The username
     */
    static async join(room, name: string): Promise<JsonResponse<void>> { // TODO add Room type
        const response = await fetch('http://shadowhunter/api/join', {
            method: 'post',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ room, name })
        });
        if(response.status !== 200)
            throw new Error('Problem while joining the room');

        return await response.json();
    }

}
