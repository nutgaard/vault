import {EffectCallback, useEffect} from "react";
import { AsyncEffectCallback, useAsyncEffect} from "./use-async-effect";

/* eslint-disable react-hooks/exhaustive-deps */
export function useOnMount(effect: EffectCallback) {
    useEffect(effect, []);
}

export function useAsyncOnMount(effect: AsyncEffectCallback) {
    useAsyncEffect(effect, []);
}
