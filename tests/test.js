//@ts-check

//import test from "ava";
import { EventEmitter } from "./../src/index.js";
import test from "./../node_modules/ava/entrypoints/main.mjs";

test("on(), emit()", (t) => {
    /** @type {EventEmitter<"foo"|"bar">} */
    let ev = new EventEmitter();
    ev.on("foo", () => {
        t.pass();
    });

    ev.emit("bar");
    ev.emit("foo");
});

test("once(), emit()", (t) => {
    /** @type {EventEmitter<"foo">} */
    let ev = new EventEmitter();
    let foo = 0;
    ev.once("foo", () => {
        foo++;
    });

    ev.emit("foo");
    ev.emit("foo");
    ev.emit("foo");

    if (foo == 1) {
        t.pass();
    } else {
        t.fail();
    }
});

test("off(), removeListener()", (t) => {
    /** @type {EventEmitter<"foo">} */
    let ev = new EventEmitter();
    let foo = 0;
    let action = () => {
        foo++;
    };

    ev.on("foo", action);
    ev.off("foo", action);

    ev.emit("foo");
    ev.emit("foo");

    t.notThrows(() => {
        // This should not throw
        // @ts-ignore
        ev.removeListener("foo1", action);
    });
    ev.destroy();
    t.notThrows(() => {
        ev.off("foo", action);
    });

    if (foo == 0) {
        t.pass();
    } else {
        t.fail();
    }
});

test("Call unsubscriber", (t) => {
    /** @type {EventEmitter<"foo">} */
    let ev = new EventEmitter();
    let foo = 0;
    let action = () => {
        foo++;
    };

    let unsubscriber = ev.on("foo", action);

    ev.emit("foo");
    unsubscriber();

    ev.emit("foo");

    if (foo == 1) {
        t.pass();
    } else {
        t.fail();
    }
});

test("on(), emit() with error", (t) => {
    /** @type {EventEmitter<"foo">} */
    let ev = new EventEmitter();
    let foo = 0;

    /**
     *
     * @param {number} bar
     */
    function func(bar) {
        if (bar % 2) {
            throw new Error("Custom error");
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
        t.fail();
    }
});

test("waitForEvent()", async (t) => {
    /** @type {EventEmitter<"foo">} */
    let ev = new EventEmitter();
    let foo = 0;
    let action = () => {
        foo++;
    };

    ev.on("foo", action);

    setTimeout(() => {
        ev.emit("foo");
    }, 10);

    await ev.waitForEvent("foo");
    if (foo == 1) {
        t.pass();
    } else {
        t.fail();
    }
});

test("waitForEvent() with timeout  and no event", async (t) => {
    /** @type {EventEmitter<"foo">} */
    let ev = new EventEmitter();
    let foo = 0;
    let action = () => {
        foo++;
    };

    ev.on("foo", action);

    setTimeout(() => {
        ev.emit("foo");
    }, 200);

    await ev.waitForEvent("foo", 50);
    if (foo == 0) {
        t.pass();
    } else {
        t.fail();
    }
});

test("waitForEvent() with timeout", async (t) => {
    /** @type {EventEmitter<"foo">} */
    let ev = new EventEmitter();
    let foo = 0;
    let action = () => {
        foo++;
    };

    ev.on("foo", action);

    setTimeout(() => {
        ev.emit("foo");
    }, 50);

    await ev.waitForEvent("foo", 200);
    if (foo == 1) {
        t.pass();
    } else {
        t.fail();
    }
});

test("waitForAnyEvent()", async (t) => {
    /** @type {EventEmitter<"foo"|"bar">} */
    let ev = new EventEmitter();
    let foo = 0;
    let bar = 0;

    ev.on("foo", () => {
        foo++;
    });

    ev.on("bar", () => {
        bar++;
    });

    setTimeout(() => {
        ev.emit("foo");
    }, 10);

    await ev.waitForAnyEvent(["foo", "bar"]);

    setTimeout(() => {
        ev.emit("bar");
    }, 10);

    await ev.waitForAnyEvent(["foo", "bar"]);

    if (foo == 1 && bar == 1) {
        t.pass();
    } else {
        t.fail();
    }
});

test("waitForAnyEvent() with timeout and no event", async (t) => {
    /** @type {EventEmitter<"foo"|"bar">} */
    let ev = new EventEmitter();
    let foo = 0;
    let bar = 0;

    ev.on("foo", () => {
        foo++;
    });

    ev.on("bar", () => {
        bar++;
    });

    setTimeout(() => {
        ev.emit("foo");
    }, 50);

    setTimeout(() => {
        ev.emit("bar");
    }, 300);

    await ev.waitForAnyEvent(["foo", "bar"], 100);

    if (foo == 1 && bar == 0) {
        t.pass();
    } else {
        t.fail();
    }
});

test("waitForAnyEvent() with timeout", async (t) => {
    /** @type {EventEmitter<"foo"|"bar">} */
    let ev = new EventEmitter();
    let foo = 0;
    let bar = 0;

    ev.on("foo", () => {
        foo++;
    });

    ev.on("bar", () => {
        bar++;
    });

    setTimeout(() => {
        ev.emit("foo");
    }, 200);

    await ev.waitForAnyEvent(["foo", "bar"], 50);

    if (foo == 0 && bar == 0) {
        t.pass();
    } else {
        t.fail();
    }
});

test("clearEventListeners()", (t) => {
    /** @type {EventEmitter<"foo"|"bar">} */
    let ev = new EventEmitter();
    let foo = 0;

    ev.on("foo", () => {
        foo++;
    });

    ev.emit("foo");

    ev.clearEventListeners("foo");
    ev.clearEventListeners("bar");

    ev.emit("foo");
    ev.emit("foo");
    ev.emit("foo");

    t.is(foo, 1);
});

test("destroy()", (t) => {
    /** @type {EventEmitter<"foo">} */
    let ev = new EventEmitter();
    let foo = 0;

    ev.on("foo", () => {
        foo++;
    });

    ev.onHasEventListeners(() => {
        foo++;
    });

    ev.onNoEventListeners(() => {
        foo++;
    });

    ev.destroy();

    t.throws(() => {
        ev.on("foo", () => {});
    });

    ev.emit("foo");
    ev.emit("foo");
    ev.emit("foo");

    t.is(foo, 0);
});

test("isDestroyed", (t) => {
    /** @type {EventEmitter<"foo">} */
    let ev = new EventEmitter();
    t.is(ev.isDestroyed, false);
    ev.destroy();
    t.is(ev.isDestroyed, true);
});

test("onHasEventListeners(), onNoEventListeners()", (t) => {
    /** @type {EventEmitter<"foo">} */
    let ev = new EventEmitter();
    let foo = 0;
    let bar = 0;

    // Test that onHasEventListeners() and onNoEventListeners() are called when appropriate
    let unsubscriberOnHasEventListeners = ev.onHasEventListeners(() => {
        // Increment when onHasEventListeners() is called
        bar++;
    });
    let unsubscriberOnNoEventListeners = ev.onNoEventListeners(() => {
        // Decrement when onNoEventListeners() is called
        bar--;
    });

    t.is(bar, 0);
    t.is(foo, 0);

    // Subscribe to the event and emit it
    let unsubscriber = ev.on("foo", () => {
        foo++;
    });
    ev.emit("foo");
    t.is(bar, 1);
    t.is(foo, 1);

    // Unsubscribe and emit the event again
    unsubscriber();
    t.is(bar, 0);
    t.is(foo, 1);

    // Subscribe again and emit the event again
    let unsubscriber2 = ev.on("foo", () => {
        foo++;
    });
    ev.emit("foo");
    t.is(bar, 1);
    t.is(foo, 2);

    // Unsubscribe and emit the event again
    unsubscriberOnNoEventListeners();
    unsubscriber2();
    t.is(bar, 1);
    t.is(foo, 2);
});

test("onListenerError()", (t) => {
    /** @type {EventEmitter<"foo">} */
    let ev = new EventEmitter();
    let foo = 0;
    let errorCaught = false;

    // Subscribe to the event and emit it
    let unsubscriber = ev.on("foo", () => {
        foo++;
        throw new Error("test");
    });
    ev.onListenerError(() => {
        errorCaught = true;
    });
    ev.emit("foo");
    t.is(errorCaught, true);
    t.is(foo, 1);
});

test("onListenerError() with error in onHasEventListeners(), onNoEventListeners() callbacks", (t) => {
    /** @type {EventEmitter<"foo">} */
    let ev = new EventEmitter();
    let foo = 0;
    let onHasEventListenersErrorCaught = false;
    let onNoEventListenersErrorCaught = false;

    ev.onHasEventListeners(() => {
        throw new Error("onHasEventListeners");
    });
    ev.onNoEventListeners(() => {
        throw new Error("onNoEventListenersErrorCaught");
    });
    ev.onListenerError((e) => {
        if (e.message === "onHasEventListeners") {
            onHasEventListenersErrorCaught = true;
        }
        if (e.message === "onNoEventListenersErrorCaught") {
            onNoEventListenersErrorCaught = true;
        }
    });

    ev.onListenerError(() => {
        throw new Error("ListenerErrorInOnListenerError");
    });

    // Subscribe to the event and emit it
    let unsubscriber = ev.on("foo", () => {
        foo++;
        throw new Error("test");
    });
    ev.emit("foo");
    t.is(foo, 1);
    t.is(onHasEventListenersErrorCaught, true);
    t.is(onNoEventListenersErrorCaught, false);
    unsubscriber();
    t.is(onNoEventListenersErrorCaught, true);
});

test("when destroyed", (t) => {
    /** @type {EventEmitter<"foo">} */
    let ev = new EventEmitter();
    ev.destroy();

    t.notThrows(() => {
        ev.emit("foo");
    });

    t.notThrows(() => {
        ev.destroy();
    });

    t.notThrows(() => {
        ev.removeListener("foo", () => {});
    });

    t.notThrows(() => {
        ev.clearEventListeners("foo");
    });

    t.notThrows(() => {
        ev.off("foo", () => {});
    });

    t.throws(() => {
        ev.on("foo", () => {});
    });

    t.throws(() => {
        ev.once("foo", () => {});
    });

    t.throws(() => {
        ev.onHasEventListeners(() => {});
    });

    t.throws(() => {
        ev.onNoEventListeners(() => {});
    });

    t.throws(() => {
        ev.onListenerError(() => {});
    });

    t.throws(() => {
        ev.waitForEvent("foo");
    });

    t.throws(() => {
        ev.waitForAnyEvent(["foo"]);
    });
});

test("clear", (t) => {
    /** @type {EventEmitter<"foo">} */
    let ev = new EventEmitter();
    let foo = 0;
    ev.on("foo", () => {
        foo++;
    });
    ev.clear();
    ev.emit("foo");
    t.is(foo, 0);
    t.deepEqual(ev.events, {});
});
