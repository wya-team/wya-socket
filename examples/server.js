const WebSocket = require('ws');

const localPort = 8832;
const localIp = (() => {
	let ips = [];
	let os = require('os');
	let ntwk = os.networkInterfaces();
	for (let k in ntwk) {
		for (let i = 0; i < ntwk[k].length; i++) {
			let _add = ntwk[k][i].address;
			if (_add && _add.split('.').length == 4 && !ntwk[k][i].internal && ntwk[k][i].family == 'IPv4') {
				ips.push(ntwk[k][i].address);
			}
		}
	}
	return ips[0] || 'localhost';
})();

// 实例化:
const wss = new WebSocket.Server({
	port: localPort,
	host: localIp
}, () => {
	console.log(`Wss Server: ws://${localIp}:${localPort}`);
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
