import JsonResponse from "../common/Protocol/JsonResponse";
import {FullRoom, RoomSummary} from "../common/Protocol/RoomInterface";

export default class RoomApi {

    /**
     * Request the server to get the list of Room
     */
    static async list(): Promise<JsonResponse<Array<RoomSummary>>> {
        const response = await fetch('api/list');
        if(response.status !== 200)
            throw new Error('Problem while listing the rooms');

        return await response.json();
    }


    /**
     * Request the server to create a Room
     * @param name The name of the room to create
     */
    static async create(name: string): Promise<JsonResponse<RoomSummary>> {
        const response = await fetch('api/create', {
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
    static async join(room, name: string): Promise<JsonResponse<FullRoom>> {
        const response = await fetch('api/join', {
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
