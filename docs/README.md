<p align="center"><image src="https://avatars1.githubusercontent.com/u/34465004?s=400&u=25c4b1279b2f092b368102edac8b7b54dc708d00&v=4" width="128"></p>

# @wya/socket
[![npm][npm-image]][npm-url] [![changelog][changelog-image]][changelog-url]

<!--  以下内容无视  -->
[changelog-image]: https://img.shields.io/badge/changelog-md-blue.svg
[changelog-url]: CHANGELOG.md

[npm-image]: https://img.shields.io/npm/v/@wya/socket.svg
[npm-url]: https://www.npmjs.com/package/@wya/socket

**@wya/socket** 是原生版本WebSocket

> - 初入`WebSocket`, 很遗憾由于目前后端限制，我们使用了原生的`WebSocket`;
> - 此库的设计目的也是为今后学习`socket.io`的源码设计，做个铺垫

## 安装
``` shell
$ npm install @wya/socket --save
```

## 示例

```javascript
const socket = new Socket();

socket.connect('请输入链接地址');

/**
 * 默认事件订阅
 */
socket.on('message', (e) => {
	console.log(e);
});

/**
 * 自定义事件订阅
 */
socket.on('event-diy', (e) => {
	console.log(e);
});

/**
 * 监听
 */
socket.on((e) => {
	console.log(e);
});
```

## 设置开发环境
克隆仓库之后，运行：

```shell
$ yarn install # 是的，推荐使用 yarn。 :)
```

```shell
# 监听并自动重新构建
$ npm run dev

# 单元测试
$ npm run test

# 构建所有发布文件
$ npm run lib
```

## 项目结构
+ **`assets`**: logo 文件。
+ **`config`**: 包含所有和构建过程相关的配置文件。
+ **`docs`**: 项目主页及文档。
+ **`lib`**: 包含用来发布的文件，执行 `npm run lib` 脚本后，这个目录不会被上传。
+ **`tests`**: 包含所有的测试，单元测试使用
+ **`src`**: 源代码目录。
+ **`demo`**: 在线运行的例子。
+ **`examples`**: 在线运行的源代码。

## API

---

### `connect` 

`socket.connect(url: String)`

订阅事件

+ **url**: 绑定对应的socket链接。

**示例**
```javascript
socket.connect('wss://github.com');
```

---

### `on` 

`socket.on(eventName: String, callback: Function)`

订阅事件

+ **eventName**: 绑定的事件名。
+ **callback**: 回调。

**示例**
```javascript
/**
 * 默认事件订阅
 */
socket.on('message', (e) => {
	console.log(e);
});

/**
 * 自定义事件订阅
 */
socket.on('event-diy', (e) => {
	console.log(e);
});

/**
 * 监听
 */
socket.on((e) => {
	console.log(e);
});
```

---

### `once` 

`socket.once(eventName: String, callback: Function)`

一次订阅

+ **eventName**: 绑定的事件名。
+ **callback**: 回调。

**示例**
```javascript
socket.once('[event-name]', ({ name }) => {
	console.log(name, this);
});
```

---

### `off` 

`socket.off(eventName: String, callback: Function)`

取消订阅

+ **eventName**: 绑定的事件名。
+ **callback**: 回调。

**示例**
```javascript
/**
 * 取消事件订阅, 指定回调
 */
socket.off('[event-name]', fn);

/**
 * 取消事件订阅
 */
socket.off('[event-name]');

/**
 * 取消订阅listener
 */
socket.off();
```

---

### `emit` 

`socket.emit(eventName: String, params: Object)`

发布事件 -> 服务器

+ **eventName**: 触发事件名。
+ **params**: 给回调的参数。

**示例**
```javascript
/**
 * [name description]
 */
socket.emit('[event-name]', { name: 'wya-socket' }); 
```

---

### `send` 

`socket.send(msg: String | Object)`

发送消息 `{ data }`

+ **msg**: 发给服务端的数据

**示例**
```javascript
socket.send({ event: 'test', data: {} }); 
```

---

### `close` 

`socket.close(msg: String | Object)`

关闭Socket

+ **msg**: 发给服务端的数据

**示例**
```javascript
socket.close(); 
```

---

### `listener` 

`socket.on(callback: Function)`

监听

+ **params**: 监听器的回调。

**示例**
```javascript
/**
 * 订阅listener
 */
socket.on(({ name }) => {
	console.log(name, this);
});

/**
 * 取消订阅listener
 */
socket.off();
```



## 开源许可类型
MIT

## FAQ
Q: ？  
A: 。


