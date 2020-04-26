let Socket;
if (typeof window !== 'undefined') {
	Socket = require('./browser').default;
} else if (typeof process !== 'undefined') {
	// TODO
	Socket = require('./node').default;
}

export { Socket };