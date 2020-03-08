import { useReducer, useRef } from "react";
import { 
    UpdateLoopFunction, 
    ScaffoldingFunction, 
    createUpdateLoop,
    getOverrides,
    Logger,
    DispatchByWait,
    OverridesByComponent,
    DispatchedActions } from "@flowcards/core";


function reducer(state: DispatchedActions, nextActions: DispatchedActions): DispatchedActions {
    return nextActions;
}

export function useScenarios(scaffoldingFn: ScaffoldingFunction, logger?: Logger) : [OverridesByComponent, DispatchByWait] {
    const [nextActions, dispatch] = useReducer(reducer, { isReplay: false, actions: []});
    const updateLoopRef = useRef<null | UpdateLoopFunction>(null);
    if(updateLoopRef.current === null) {
        updateLoopRef.current = createUpdateLoop(scaffoldingFn, dispatch, logger);
    }
    const updateInfo = updateLoopRef.current(nextActions);
    const overrides = getOverrides(updateInfo);
    return [overrides, updateInfo.dispatchByWait];
}
