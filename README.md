# event-emitter

## Environment agnostic event emitter

This package allows you to create an event emitter that can be used in any environment.
You can define types for the events that you want to emit and listen to.

### Installation
```
$ npm install @supercat1337/event-emitter
```

### Methods
 - on(event, listener) - Add a callback function that's going to be executed when the event is triggered. Returns a function that can be used to unsubscribe from the event
 - emit(event) - Trigger an event. 
 - once(event, listener) - Add a callback function that's going to be executed only once when the event is triggered. Returns a function that can be used to unsubscribe from the event
 - removeListener(event, listener) - Remove an event listener.
 - waitForEvent(event, max_wait_ms = 0) - Wait for an event to be emitted. If max_wait_ms is set to 0, the function will wait indefinitely.
 - waitForAnyEvent(events, max_wait_ms = 0) - Wait for any of the specified events to be emitted. If max_wait_ms is set to 0, the function will wait indefinitely.

### Usage

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

