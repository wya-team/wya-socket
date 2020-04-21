const WebSocket = require('ws');

const port = 8832;
const host = '0.0.0.0';

// 实例化:
const wss = new WebSocket.Server({
	port,
	host
}, () => {
	console.log(`Wss Server: ws://${host}:${port}`);
});

// socket集合，会有多个客服端接入
let socketArr = [];
wss.on('connection', (socket, request) => {
	socketArr.push(socket);
	// 服务端订阅
	socket.on('message', (res) => {
		let obj = {};
		try {
			obj = JSON.parse(res);
		} catch (e) {
			obj = {};
		}
		const { event, data } = obj;
		switch (event) {
			case 'server-event-sub':
				// 发布 -> 客服端
				// 每个都发送
				socketArr.map(it => {
					let sendInfo; 
					if (it === socket) {
						sendInfo = {
							event: "client-event-sub",
							id: `本人__${Date.now()}`,
							content: data
						};
					} else {
						sendInfo = {
							event: "client-event-sub",
							id: `其他人__${Date.now()}`,
							content: data
						};
					}
					it.send(JSON.stringify(sendInfo));
				});
			default :
				return;
		}
	});
});
