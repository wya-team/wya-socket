import { Socket } from '../src/main';

const socket = new Socket();

socket.connect('ws://116.62.29.171:7272');

socket.on('message', (e) => {
	console.log(e);
});

// socket.send('eeee');