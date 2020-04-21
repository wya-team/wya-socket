// let Socket;
// if (typeof window !== 'undefined') {
// 	Socket = require('./browser');
// } else if (typeof process !== 'undefined') {
// 	// TODO
// 	Socket = require('./node');
// }

// exports.Socket = Socket;
export { Socket } from './browser';