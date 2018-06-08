import { Socket } from '../src/main';

const socket = new Socket();

socket.connect('wss://www.baidu.com');

socket.on('message', (e) => {
	console.log(e);
});

// socket.send('eeee');