import { Socket } from '..';
import { exec } from 'child_process';

describe('socket.js', () => {
	test('basic', async () => {
		try {
			let done;
			let promise = new Promise(r => done = r);
			let data;
			expect(typeof Socket).toBe('function');

			const client1 = new Socket();
			const client2 = new Socket();

			client1.connect(`ws://0.0.0.0:8832`);
			client2.connect(`ws://0.0.0.0:8832`);

			client1.on('message', (e) => {
				console.log(`[Global Message]: ${e.data}`);
			});
			client1.on('client-event-sub', (res) => {
				let { id, content } = res || {};
				expect(content).toBe('test');
				client2.close();
				done();
			});

			await client1.socket;
			await client2.socket;
			// 发布 -> 服务器
			client2.emit('server-event-sub', 'test');

			await promise;
		} catch (e) {
			if (e.msg === '连接中断，重置Socket') {
				console.warn('请先执行 npm run serve');
			}
		}
	});
});
