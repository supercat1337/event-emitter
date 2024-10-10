# event-emitter

## Environment agnostic event emitter

This package allows you to create an event emitter that can be used in any environment.
You can define types for the events that you want to emit and listen to.

Installation
```
$ npm install @supercat1337/event-emitter
```

Usage

Basic example
```js
import { EventEmitter } from "@supercat1337/event-emitter";

// Create an event emitter with a custom event type
/** @type {EventEmitter<"foo">} */
var ev = new EventEmitter();

ev.on("foo", () => {
    console.log("Hello!");
});

// IDE will complain if we emit an event that doesn't exist
ev.emit("bar"); // $ExpectError
ev.emit("foo");
```

Example of unsubscribing from an event
```js
import { EventEmitter } from "@supercat1337/event-emitter";

/** @type {EventEmitter<"foo">} */
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
import { EventEmitter } from "@supercat1337/event-emitter";

/** @type {EventEmitter<"foo">} */
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

