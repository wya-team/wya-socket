# wya-socket
[![npm][npm-image]][npm-url] [![changelog][changelog-image]][changelog-url]

## [Demo](https://wya-team.github.io/wya-socket/demo/index.html)

> 微一案WebSocket二次封装

> - 初入`WebSocket`, 很遗憾由于目前后端限制，我们使用了原生的`WebSocket`;
> - 此库的设计目的也是为今后学习`socket.io`的源码设计，做个铺垫


## 安装

```vim
npm install wya-socket --save
```
## 使用方法
- `connect` 链接
- `on` 客服端订阅
- `once` 客服端订阅（一次）
- `emit` 发布事件 -> 服务器
- `send` 发送消息 `{ data }`
- `close` 关闭
- `off` 取消订阅

##### 其他
- `first` 客服端订阅（保留第一个, 也可以直接用`off`后用`on`）
- `last` 客服端订阅（保留最后一个, 也可以直接用`off`后用`on`）

```js
import { Socket } from 'wya-socket';

const socket = new Socket();

socket.connect('请输入链接地址');
// 默认事件订阅 
socket.on('message', (e) => {
	console.log(e);
});

// 自定义事件订阅 
socket.on('event-diy', (e) => {
	console.log(e);
});

// 监听 
socket.on((e) => {
	console.log(e);
});
```
## 待开发
。。。

<!--  以下内容无视  -->
[changelog-image]: https://img.shields.io/badge/changelog-md-blue.svg
[changelog-url]: CHANGELOG.md

[npm-image]: https://img.shields.io/npm/v/wya-socket.svg
[npm-url]: https://www.npmjs.com/package/wya-socket
