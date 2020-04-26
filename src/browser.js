let createSocket = (ctx) => {
	return new Promise((resolve, reject) => {
		ctx._resolve = resolve;
		ctx._reject = reject;
	});
};

class Socket {
	constructor(opts = {}) {
		this.socket = createSocket(this);
		// 内部使用的映射，用于正在连接的过程中出现的操作
		this._socket = null;
		// socket返回数据解析器
		this._parser = opts.parser;
		// 链接的次数
		this._count = 1;
		// 监听的函数
		this._listeners = [];
		// 订阅的事件
		this._events = {};
		// socket原生订阅事件
		this._native = {};

		/**
		 * 0: 未连接
		 * 1: 正在连接
		 * 2: 已连接
		 * 3: 已关闭连接
		 */
		this._connectStatus = 0;
	}

	connect(url, opts = {}) {
		if ([1, 2].includes(this._connectStatus)) {
			throw new Error(this._connectStatus > 1 ? `已存在连接` : `正在尝试连接中`);
			return;
		}

		if (!url) {
			throw new Error(`参数错误 -> url必填`);
		}

		this._connectStatus = 1;

		const socket = new WebSocket(url.replace('http', 'ws'));
		socket.addEventListener("open", e => {
			console.info('@wya/socket: open -> ', e);

			this._connectStatus = 2;
			this._resolve(socket);

			this._count = 1;
		});

		/**
		 * 一般在error之后才会触发close
		 * Android端断开之后不会触发error事件，所以在close里面处理重连
		 */
		const { limit = 10, interval = 3000, onError = () => {} } = opts;
		socket.addEventListener("close", e => {
			if (this._connectStatus === 3) return; // 主动关闭时不再执行逻辑

			this._reject({ msg: '连接中断，重置Socket' }); // 主要针对正在等待连接成功的Promise
			this._connectStatus = 0;
			this.socket = createSocket(this);
			this._socket = null;

			if (limit && this._count >= limit) {
				onError({ msg: '超过重连限制, 请尝试刷新页面' });
				return;
			}

			if (this._count === 1) {
				socket.close();
				onError({ msg: '连接已断开, 正在尝试重连...' });
			}

			this._count++;
			setTimeout(() => {
				this.connect(url, opts);
				this._rebind();
			}, interval);
		});
		
		socket.addEventListener("error", e => {
			console.error('@wya/socket: error -> ', e);
			onError && onError(e);
		});

		// 默认处理
		socket.addEventListener("message", ({ data }) => {
			try {
				data = (this._parser || JSON.parse)(data);
			} catch (e) {
				console.error('@wya/socket: parse -> ', e);
			}
			if (typeof data === 'object' && data.event) {
				const { event, ...rest } = data;
				this._publish(event, {
					...rest
				});
			} else {
				this._publish({
					data
				});
			}
		});

		// 做一个映射
		this._socket = socket;
		return this;
	}
	/**
	 * socket原生订阅
	 */
	on(event, callback) {
		switch (event) {
			case 'close':
			case 'message':
			case 'open':
			case 'error':
				this._native[event] = callback;
				this.socket
					.then((socket) => {
						socket.addEventListener(event, callback);
					}).catch((e) => {
						console.error('@wya/socket: connect -> ', e.message || e.msg);
					});
				
				return this;
			default:
				this._subscribe(event, callback);
				return this;
		}
		return this;
	}
	/**
	 * 一次订阅，发布后取消
	 */
	once(event, callback) {
		if (typeof event === 'string' && ( !this._events[event] || this._events[event].length === 0)) {
			let fired = false;

			const _callback = (opts) => {
				this.off(event);
				if (!fired) {
					fired = true;
					callback.call(this, opts);
				}
			};
			this.on(event, _callback);
		}
		return this;
	}
	/**
	 * 只执行第一次订阅
	 */
	first(event, callback) {
		if (typeof event === 'string' && ( !this._events[event] || this._events[event].length === 0)) {
			this.on(event, callback);
		}
		return this;
	}
	/**
	 * 只执行最后一次订阅
	 */
	last(event, callback) {
		if (typeof event === 'string') {
			// 如果存在，先卸载事件
			if (this._events[event] && this._events[event].length !== 0) {
				this.off(event);
			}
			this.on(event, callback);
		}
		return this;
	}
	/**
	 * 发送
	 */
	send(msg) {
		this.socket
			.then((socket) => {
				socket.send(
					typeof msg === 'object' 
						? JSON.stringify(msg) 
						: msg
				);
			}).catch((e) => {
				console.error('@wya/socket: connect -> ', e.message || e.msg);
			});

		return this;
	}
	/**
	 * 关闭
	 */
	close() {
		if ([0, 3].includes(this._connectStatus)) return;

		let done = () => {
			this._connectStatus = 3;
			this.socket = createSocket(this);
			this._listeners = [];
			this._events = {};
			this._native = {};
			this._socket = null;
		};

		this._connectStatus === 1 && this._reject({ msg: '主动关闭' });
		this._socket && this._socket.close();
		done();
	}
	/**
	 * 发布的事件推向服务器的
	 */
	emit(event, data) {
		this.socket
			.then((socket) => {
				socket.send(JSON.stringify({
					event,
					data
				}));
			}).catch((e) => {
				console.error('@wya/socket: connect -> ', e.message || e.msg);
			});

		return this;
	}
	/**
	 * unsubscribe/off
	 * 删除一个指定的事件队列
	 * @param  {string} event 需要删除的事件名
	 * @param  {func} fn 需要卸载的函数名
	 * @return {object} 返回自身以便于链式调用
	 */
	off(event, fn) {
		switch (event) {
			case 'close':
			case 'message':
			case 'open':
			case 'error':
				delete this._native[event];
				this.socket
					.then((socket) => {
						socket.removeEventListener(event, fn);
					}).catch((e) => {
						console.error('@wya/socket: connect -> ', e.message || e.msg);
					});
				return this;
			default:
				if (typeof event === 'string') {
					this._events[event] = [];
				} else if (typeof event === undefined){
					this._listeners = [];
				}
				return this;
		}
	}
	/**
	 * 客服端订阅
	 * 服务器推的发布事件，后出发
	 * 私有方法，内部使用
	 */
	_subscribe(action, callback) {
		if (typeof action === "object") {
			for (key in action) {
				if (action.hasOwnProperty(key) 
					&& (typeof action[key] === "function")
				) {
					this._subscribe(key, action[key]);
				}
			}

		} else if (typeof action === "string" && typeof callback === "function") {

			this._events[action] || (this._events[action] = []);
			this._events[action].push(callback);

		} else if (typeof action === 'function') {
			this._listeners.push(action);
		}

		return this;
	}
	/**
	 * 指当接收到服务端相应的时候，客服端主动发布订阅，触发相关_events 和 _listeners
	 * 待开发: 服务器推的事件
	 * 私有方法，内部使用
	 */
	_publish(event, opts = {}) {
		if (opts instanceof Array || typeof opts !== 'object' || opts.event) {
			console.error('参数必须是对象, 且别带event关键字');
			return this;
		}
		if (typeof event === 'string' 
				&& this._events.hasOwnProperty(event) 
				&& (this._events[event] instanceof Array)
		) {
			// 每个订阅器都会触发，直到某个返回false
			for (let i = 0; i < this._events[event].length; i++) {
				if (this._events[event][i].call(this, opts) === false) break;
			}
		}
		// 每个监听器都会触发，直到某个返回false
		for (let i = 0; i < this._listeners.length; i++) {
			if (this._listeners[i].call(this, { ...opts, event }) === false) break;
		}
		return this;
	}
	/**
	 * 由于重连，socket实例变更，需重新绑定原先订阅的事件
	 */
	_rebind() {
		const events = Object.keys(this._native);

		this.socket
			.then((socket) => {
				for (let i = 0, length = events.length; i < length; i++) {
					let event = events[i];
					socket.addEventListener(event, this._native[event]);
				}
			}).catch((e) => {
				console.error('@wya/socket: connect -> ', e.message || e.msg);
			});
	}
};

export default Socket;
