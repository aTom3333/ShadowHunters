import RoomApi from "./RoomApi";
import {StatusType} from "../common/Protocol/JsonResponse";
import {UIManager, UIState} from "./UIManager";
import {FullRoom, RoomSummary} from "../common/Protocol/RoomInterface";
import * as io from 'socket.io-client';
import {GameManager} from "./GameManager";
import waitFor from "../common/Utility/waitForSocket";


export async function joinRoom(uimanager: UIManager, room: RoomSummary) {
    if(room.name === uimanager.currentRoomName)
        return;
    uimanager.currentRoomName = room.name;

    const name = uimanager.data.name;
    const response = await RoomApi.join(room, name);
    if(response.status.type !== StatusType.success) {
        // TODO Error
        uimanager.currentRoomName = '';
        uimanager.data.roomName = '';
        uimanager.switchTo(UIState.RoomSelection);
    } else {
        const data: FullRoom = response.content;
        const socket = io();

        uimanager.data.roomName = room.name;

        const newGame = new GameManager(socket, data, uimanager);

        if(uimanager.game)
            uimanager.game.destroy();
        uimanager.game = newGame;

        if(data.board)
            uimanager.switchTo(UIState.InGame);
        else
            uimanager.switchTo(UIState.BeforeGame);

        // Let know the server this socket is ready to be used in the correct room
        socket.emit('request:joinroom', { room, name });
        await waitFor(socket, 'response:roomjoined');
    }
}
