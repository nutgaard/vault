import {DependencyList, EffectCallback, useCallback, useEffect} from "react";

/* eslint-disable react-hooks/exhaustive-deps */
export function useDelayedEffect(effect: EffectCallback, delay: number, deps: DependencyList) {
    const memoized = useCallback(() => { setTimeout(effect, delay); }, deps);
    useEffect(memoized, [memoized])
}
