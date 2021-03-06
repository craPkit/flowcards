/* eslint-disable @typescript-eslint/explicit-function-return-type */

import * as bp from "../src/bid";
import { scenarios } from "../src/index";
import { BTContext, ThreadState } from '../src/bthread';


test("a thread gets reset, when the arguments change", () => {
    let initCount = 0;
    let receivedValue;
    function* threadA(this: BTContext) {
        yield bp.request('A');
        this.setState('foo');
    }

    function* threadB(value: string) {
        initCount++;
        receivedValue = value;
        yield bp.wait('A');
    }

    scenarios((enable) => {
        const state = enable(threadA);
        enable(threadB, [state.value]);
    });

    expect(initCount).toBe(2);
    expect(receivedValue).toBe('foo');
});


test("a state from another thread is a fixed Ref-Object. Passing this Object will not reset a receiving thread", () => {
    let initCount = 0;
    let receivedValue;
    function* threadA(this: BTContext) {
        this.setState('foo');
        yield bp.request('A');
    }

    function* threadB(stateFromThreadA: ThreadState) {
        initCount++;
        yield bp.wait('A');
        receivedValue = stateFromThreadA.value;
    }

    scenarios((enable) => {
        const state = enable(threadA);
        enable(threadB, [state]);  // instead of state.value, we will pass state.
    });

    expect(initCount).toBe(1);
    expect(receivedValue).toBe('foo');
});



test("when a thread resets, the bids will be re-evaluated", () => {
    let threadBCount = 0;
    function* threadA(this: BTContext) {
        yield bp.request('A');
    }

    function* threadB() {
        threadBCount++;
        yield bp.wait('A');
    }

    scenarios((enable) => {
        const threadAState = enable(threadA);
        enable(threadB, [threadAState.nrProgressions]);  // instead of state.value, we will pass state.
    }, ({dispatch, thread}) => {
        expect(thread.threadB.isCompleted === false);
        expect(threadBCount).toEqual(2);
        expect(dispatch).toHaveProperty('A');
    });
});