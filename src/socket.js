class Socket {
	constructor() {
		this.socket = undefined;
		// 链接的次数
		this.__count__ = 1;
		// 监听的函数
		this.__listeners__ = [];
		// 订阅的事件
		this.__events__ = {};
	}
	validator(type = 0) {
		if (this.socket && type === 1) {
			throw new Error(`已有一个实例，请先关闭`);
			return true;
		} else if (!this.socket && type === 2) {
			throw new Error(`不存在实例，请先创建`);
			return true;
		}
		return false;
	}
	connect(url, opts = {}) {
		if (this.validator(1)) return;
		if (!url) {
			throw new Error(`参数错误 -> url必填`);
			return;
		}
		const { limit = 3, onError } = opts;
		this.socket = new WebSocket(url);

		// 失败重连
		this.socket.addEventListener("error", e => {
			this.socket.close();
			this.socket = null;
			if (this.__count__ >= limit) {
				throw new Error(`超过重连限制 -> limit: ${limit}`);
				onError && onError();
				return;
			}
			this.__count__++;
			this.connect(url.replace('http', 'ws'), opts);
		});
		this.socket.addEventListener("open", e => console.info(e));
		this.socket.addEventListener("close", e => console.info(e));

		// 默认处理
		this.socket.addEventListener("message", ({ data }) => {
			try {
				data = JSON.parse(data);
			} catch (e) {
				
			}
			if (typeof data === 'object' && data.event) {
				const { event, ...rest } = data;
				this._publish(event, {
					data: rest
				});
			} else {
				this._publish({
					data
				});
			}
			
		});
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
				if (this.validator(2)) return;
				this.socket.addEventListener(event, callback);
				return;
			default:
				this._subscribe(event, callback);
				return;
		}
	}
	/**
	 * 发送
	 */
	send(msg) {
		if (this.validator(2)) return;
		this.socket.send(
			typeof msg === 'object' 
				? JSON.stringify(msg) 
				: msg
		);
	}
	/**
	 * 关闭
	 */
	close() {
		if (this.validator(2)) return;

		// 垃圾回收
		this.socket.close();
		this.socket = null;
		this.__listeners__ = [];
		this.__events__ = {};
	}
	/**
	 * 发布的事件推向服务器的
	 */
	emit(event, data) {
		this.socket.send(JSON.stringify({
			event,
			data
		}));
	}
	/**
	 * unsubscribe/off
	 * 删除一个指定的事件队列
	 * @param  {string} event 需要删除的事件名
	 * @return {object} 返回自身以便于链式调用
	 */
	off(event) {
		if (typeof event === 'string') {
			this.__events__[event] = [];
		} else if (typeof event === undefined){
			this.__listeners__ = [];
		}

		return this;
	}
	/**
	 * 客服端订阅
	 * 服务器推的发布事件，后出发
	 * 私有类，内部使用
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

			this.__events__[action] || (this.__events__[action] = []);
			this.__events__[action].push(callback);

		} else if (typeof action === 'function') {
			this.__listeners__.push(action);
		}

		return this;
	}
	/**
	 * 指当接收到服务端相应的时候，客服端主动发布订阅，触发相关__events__ 和 __listeners__
	 * 待开发: 服务器推的事件
	 * 私有类，内部使用
	 */
	_publish(event, opts = {}) {
		if (opts instanceof Array || typeof opts !== 'object' || opts.event) {
			throw new TypeError('参数必须是对象, 且别带event关键字');
			return this;
		}
		if (typeof event === 'string' 
				&& this.__events__.hasOwnProperty(event) 
				&& (this.__events__[event] instanceof Array)
		) {
			// 每个订阅器都会触发，直到某个返回false
			for (let i = 0; i < this.__events__[event].length; i++) {
				if (this.__events__[event][i].call(this, opts) === false) break;
			}
		}
		// 每个监听器都会触发，直到某个返回false
		for (let i = 0; i < this.__listeners__.length; i++) {
			if (this.__listeners__[i].call(this, { ...opts, event }) === false) break;
		}
		return this;
	}
};
export default Socket;
