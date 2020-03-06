const _sleep = ms => new Promise(r => setTimeout(() => r(), ms)) //this is cool to read, so i left it here.

export function sleep (ms) { return new Promise(r => setTimeout(() => r(), ms))}
