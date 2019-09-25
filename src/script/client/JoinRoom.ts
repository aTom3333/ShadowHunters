import RoomApi from "./RoomApi";
import {StatusType} from "../common/Protocol/JsonResponse";
import {UIManager} from "./UIManager";
import {RoomSummary} from "../common/Protocol/RoomInterface";
import * as io from 'socket.io-client';
import {GameManager} from "./GameManager";
import waitFor from "../common/Utility/waitForSocket";


export async function joinRoom(uimanager: UIManager, room: RoomSummary) {
    const name = uimanager.data.name;
    console.log('Join Room '+room.name+' as '+name);
    const response = await RoomApi.join(room, name);
    if(response.status.type !== StatusType.success) {
        // TODO Error
    } else {
        const data = response.content;
        const socket = io();

        new GameManager(socket, data);
        // TODO Link GameManager and UIManager
        // TODO Change state of UIManager

        // Let know the server this socket is ready to be used in the correct room
        socket.emit('request:joinroom', { room, name });
        await waitFor(socket, 'response:roomjoined');
    }
}
