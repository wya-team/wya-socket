class Socket {
	constructor(opts = {}) {
		this.socket = undefined;
		// socket返回数据解析器
		this.__parser__ = opts.parser;
		// 链接的次数
		this.__count__ = 1;
		// 监听的函数
		this.__listeners__ = [];
		// 订阅的事件
		this.__events__ = {};
		// socket原生订阅事件
		this.__native__ = {};
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
		const { limit, onError } = opts;
		this.socket = new WebSocket(url.replace('http', 'ws'));

		// 失败重连
		this.socket.addEventListener("error", e => {
			this.socket.close();
			this.socket = null;
			if (limit && this.__count__ >= limit) {
				throw new Error(`超过重连限制 -> limit: ${limit}`);
				onError && onError();
				return;
			}
			this.__count__++;
			this.connect(url, opts);
			this._rebind();
		});
		this.socket.addEventListener("open", e => {
			console.info(e);
			this.__count__ = 1; // 连接成功后重置计数器
		});
		this.socket.addEventListener("close", e => console.info(e));

		// 默认处理
		this.socket.addEventListener("message", ({ data }) => {
			try {
				data = (this.__parser__ || JSON.parse)(data);
			} catch (e) {
				console.error(e);
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
				if (this.validator(2)) return;
				this.__native__[event] = callback;
				this.socket.addEventListener(event, callback);
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
		if (typeof event === 'string' && ( !this.__events__[event] || this.__events__[event].length === 0)) {
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
		if (typeof event === 'string' && ( !this.__events__[event] || this.__events__[event].length === 0)) {
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
			if (this.__events__[event] && this.__events__[event].length !== 0) {
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
		if (this.validator(2)) return;
		this.socket.send(
			typeof msg === 'object' 
				? JSON.stringify(msg) 
				: msg
		);

		return this;
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
		this.__native__ = {};
	}
	/**
	 * 发布的事件推向服务器的
	 */
	emit(event, data) {
		this.socket.send(JSON.stringify({
			event,
			data
		}));

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
				if (this.validator(2) || !fn) return this;
				delete this.__native__[event];
				this.socket.removeEventListener(event, fn);
				return this;
			default:
				if (typeof event === 'string') {
					this.__events__[event] = [];
				} else if (typeof event === undefined){
					this.__listeners__ = [];
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
	 * 私有方法，内部使用
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
	/**
	 * 由于重连，socket实例变更，需重新绑定原先订阅的事件
	 */
	_rebind() {
		let events = Object.keys(this.__native__);
		for (let i = 0, length = events.length; i < length; i++) {
			let event = events[i];
			this.socket.addEventListener(event, this.__native__[event]);
		}
	}
};
export default Socket;
