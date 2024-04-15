# event-emitter

## Environment agnostic event emitter

Installation
```
$ npm install @supercat1337/event-emitter
```

Usage

Basic example
```js
import { EventEmitter } from "@supercat1337/event-emitter/src/EventEmitter.js";

var ev = new EventEmitter();
ev.on("foo", () => {
    console.log("Hello!");
});

ev.emit("bar");
ev.emit("foo");
```

Example of unsubscribing from an event
```js
import { EventEmitter } from "@supercat1337/event-emitter/src/EventEmitter.js";

var ev = new EventEmitter;
var foo = 0
var action = () => {
    foo++;
};

var unsubscriber = ev.on("foo", action);

ev.emit("foo");
unsubscriber();

ev.emit("foo");

if (foo == 1) {
    console.log("Success!");
} else {
    console.log("Fail!");
}
```

Example of using the Once method
```js
import { EventEmitter } from "@supercat1337/event-emitter/src/EventEmitter.js";

var ev = new EventEmitter;
var foo = 0
ev.once("foo", () => {
    foo++;
});

ev.emit("foo");
ev.emit("foo");
ev.emit("foo");

if (foo == 1) {
    console.log("Success!");
} else {
    console.log("Fail!");
}
```

