# \@wya/socket
[![npm][npm-image]][npm-url] [![changelog][changelog-image]][changelog-url]

- [Documents](https://wya-team.github.io/wya-socket/docs/#/)

> 微一案WebSocket二次封装

> - 后端限制问题导出了这个库，仅支持浏览器的`WebSocket`
> - 当后端支持，请使用`socket.io`;


## 安装

```vim
npm install @wya/socket --save
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

[npm-image]: https://img.shields.io/npm/v/@wya/socket.svg
[npm-url]: https://www.npmjs.com/package/@wya/socket
