import {DependencyList, EffectCallback, useCallback, useEffect} from 'react';

/* eslint-disable react-hooks/exhaustive-deps */
export type AsyncEffectCallback = () => Promise<(void | (() => void | undefined))>;
export function useAsyncEffect(asyncEffect: AsyncEffectCallback, deps?: DependencyList) {
    const effect: EffectCallback = useCallback(() => {
        asyncEffect();
        }, deps ?? []);
    useEffect(effect, [effect]);
}
