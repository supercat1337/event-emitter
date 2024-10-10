//@ts-check

//import test from "ava";
import { EventEmitter } from "./../index.js";
import test from "./../node_modules/ava/entrypoints/main.mjs";


test("on(), emit()", t => {
    /** @type {EventEmitter<"foo"|"bar">} */
    var ev = new EventEmitter;
    ev.on("foo", () => {
        t.pass();
    });

    ev.emit("bar");
    ev.emit("foo");

});

test("once(), emit()", t => {
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
        t.pass();
    } else {
        t.fail()
    }
});

test("removeListener()", t => {
    var ev = new EventEmitter;
    var foo = 0
    var action = () => {
        foo++;
    };

    ev.on("foo", action);
    ev.removeListener("foo", action);

    ev.emit("foo");
    ev.emit("foo");

    if (foo == 0) {
        t.pass();
    } else {
        t.fail()
    }
});

test("Call unsubscriber", t => {
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
        t.pass();
    } else {
        t.fail()
    }
});


test("on(), emit() with error", t => {
    var ev = new EventEmitter;
    var foo = 0;

    /**
     * 
     * @param {number} bar 
     */
    function func(bar) {
        if (bar % 2) {
            throw new Error("Custom error")
        } else {
            foo++;
        }
    }

    ev.on("foo", () => {
        func(foo);
    });

    ev.emit("foo");
    ev.emit("foo");
    ev.emit("foo");

    if (foo == 1) {
        t.pass();
    } else {
        t.fail()
    }

});