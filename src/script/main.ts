import * as _ from 'lodash';
import * as io from 'socket.io-client';
import RoomApi from './client/RoomApi';

// Temp
(async()=>{
    const response = await RoomApi.list();
    console.log(response);
    console.log(await RoomApi.create("room1"));
    console.log(await RoomApi.list());
})();

const socket = io();
