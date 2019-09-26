import RoomApi from "./RoomApi";
import {StatusType} from "../common/Protocol/JsonResponse";
import {UIManager, UIState} from "./UIManager";
import {RoomSummary} from "../common/Protocol/RoomInterface";
import * as io from 'socket.io-client';
import {GameManager} from "./GameManager";
import waitFor from "../common/Utility/waitForSocket";


export async function joinRoom(uimanager: UIManager, room: RoomSummary) {
    if(room.name === uimanager.currentRoomName)
        return;
    uimanager.currentRoomName = room.name;

    const name = uimanager.data.name;
    console.log('Join Room '+room.name+' as '+name);
    const response = await RoomApi.join(room, name);
    if(response.status.type !== StatusType.success) {
        // TODO Error
        uimanager.currentRoomName = '';
    } else {
        const data = response.content;
        const socket = io();

        uimanager.data.roomName = room.name;

        const newGame = new GameManager(socket, data, uimanager);

        if(uimanager.game)
            uimanager.game.destroy();
        uimanager.game = newGame;

        // TODO Change state of UIManager depending of if game is started
        uimanager.switchTo(UIState.BeforeGame);

        // Let know the server this socket is ready to be used in the correct room
        socket.emit('request:joinroom', { room, name });
        await waitFor(socket, 'response:roomjoined');
    }
}
