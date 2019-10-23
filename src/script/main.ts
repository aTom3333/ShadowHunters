import './../style/main.scss';
import * as $ from 'jquery';
import * as io from 'socket.io-client';
import RoomApi from './client/RoomApi';
import waitFor from "./common/Utility/waitForSocket";
import {GameManager} from "./client/GameManager";
import {StatusType} from "./common/Protocol/JsonResponse";
import {UIManager} from "./client/UIManager";
import {Data} from "./client/Data";


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


new UIManager(new Data());
