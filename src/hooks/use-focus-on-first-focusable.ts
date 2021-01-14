import {DependencyList, MutableRefObject, useCallback, useEffect, useRef} from "react";

export type JustOnceEffectCallback = (done: () => void) => void | (() => void | undefined);
export function useJustOnceEffect(effect: JustOnceEffectCallback, deps?: DependencyList) {
    const done = useRef(false);
    const setDone = useCallback(() => {
        done.current = true;
    }, [done]);
    useEffect(() => {
        if (!done.current) {
            return effect(setDone);
        }
    }, deps); // eslint-disable-line react-hooks/exhaustive-deps
}

export function focusOnFirstFocusable(element: HTMLElement | null) {
    const focusable = element
        ?.querySelector<HTMLElement>('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');

    if (focusable) {
        focusable.focus();
        return true;
    }
    return false;
}

export function useFocusOnFirstFocusable(container: MutableRefObject<HTMLElement | null>) {
    const element = container.current
    useJustOnceEffect((done) => {
        const focused = focusOnFirstFocusable(container.current);
        if (focused) {
            done();
        }
    }, [element]);
}
