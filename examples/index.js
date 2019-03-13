// 先执行 node server.js
import { Socket } from '../src/index';

const socket = new Socket();

socket.connect(`ws://${location.hostname}:8832`);

socket.on('message', (e) => {
	console.log(`[Global Message]: ${e.data}`);
});

let html = '';
let target = document.getElementById('test');

socket.on('client-event-sub', (res) => {
	let { id, content } = res || {};
	html += `${id}: ${content}<br />`;
	target.innerHTML = html;
});

document.querySelector("button").addEventListener('click', (e) => {
	// 发布 -> 服务器
	socket.emit('server-event-sub', document.querySelector("input").value);
});
