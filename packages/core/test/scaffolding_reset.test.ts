/* eslint-disable @typescript-eslint/explicit-function-return-type */

import bp from "../src/bid";
import { createUpdateLoop, ScaffoldingFunction } from '../src/updateloop';
import { Logger } from "../src/logger";
import { ThreadContext, ThreadState } from '../src/bthread';

type TestLoop = (enable: ScaffoldingFunction) => Logger;
let updateLoop: TestLoop;

beforeEach(() => {
    updateLoop = (enable: ScaffoldingFunction): Logger => {
        const logger = new Logger();
        createUpdateLoop(enable, () => null, logger)();
        return logger;
    };
});


test("a thread gets reset, when the arguments change", () => {
    let initCount = 0;
    let receivedValue;
    function* threadA(this: ThreadContext) {
        yield bp.request('A');
        this.setState('foo');
    }

    function* threadB(value: string) {
        initCount++;
        receivedValue = value;
        yield bp.wait('A');
    }

    updateLoop((enable) => {
        const state = enable(threadA);
        enable(threadB, [state.value]);
    });

    expect(initCount).toBe(2);
    expect(receivedValue).toBe('foo');
});


test("a state from another thread is a fixed Ref-Object. Passing this Object will not reset a receiving thread", () => {
    let initCount = 0;
    let receivedValue;
    function* threadA(this: ThreadContext) {
        this.setState('foo');
        yield bp.request('A');
    }

    function* threadB(stateFromThreadA: ThreadState) {
        initCount++;
        yield bp.wait('A');
        receivedValue = stateFromThreadA.value;
    }

    updateLoop((enable) => {
        const state = enable(threadA);
        enable(threadB, [state]);  // instead of state.value, we will pass state.
    });

    expect(initCount).toBe(1);
    expect(receivedValue).toBe('foo');
});