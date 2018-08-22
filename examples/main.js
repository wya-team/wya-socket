// 先执行 node server.js
import { Socket } from '../src/main';

const socket = new Socket();

socket.connect('ws://192.168.23.115:8832');

socket.on('message', (e) => {
	console.log(`[Global Message]: ${e.data}`);
});

let html = '';
let target = document.getElementById('test');

socket.on('client-event-sub', ({ data }) => {
	let { id, content } = data || {};
	html += `${id}: ${content}<br />`;
	target.innerHTML = html;
});

document.querySelector("button").addEventListener('click', (e) => {
	// 发布 -> 服务器
	socket.emit('server-event-sub', document.querySelector("input").value);
});