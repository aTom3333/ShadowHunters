import './../style/main.scss';

import * as _ from 'lodash';
import * as $ from 'jquery';
import * as io from 'socket.io-client';
import RoomApi from './client/RoomApi';


function makeAnswerChoiceRequest(socket) {
    // TODO Put elsewhere
    return function(data) {
        const form = $('<form><label><span></span><select></select></label><input type="submit" value="Envoyer"/></form>');
        form.find('span').text(data.title);
        for(const opt of data.choices) {
            form.find('select').append($('<option>'+opt+'</option>'));
        }
        form.appendTo($('body'));
        form.on('submit', function(e) {
            const v = $(this).find('select').val();
            console.log(v);
            socket.emit('response:choice', v);
            form.remove();
        });
    }
}


async function joinRoom(room, name: string) { // TODO Temp
    const state = await RoomApi.join(room, name);
    // Save current Game state
    const socket = io();

    // Bind update events
    socket.on('update:blabla', () => {});
    socket.on('update:truc', () => {});

    socket.on('update:playerjoined', player => { console.log(player.name + ' joined the room')});

    socket.on('error', payload => { console.error(payload)});

    socket.on('request:choice', makeAnswerChoiceRequest(socket));

    // Let know the server this socket is ready to be used in the correct room
    socket.emit('request:joinroom', { room, name });
}

// Temp
(async()=>{
    const response = await RoomApi.list();
    console.log(response);
    console.log(await RoomApi.create("room1"));
    console.log(await RoomApi.list());
    joinRoom({name: 'room1'}, (<HTMLInputElement>document.getElementById('namefield')).value);
})();

