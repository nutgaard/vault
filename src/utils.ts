export function memoize<R, T extends (...args: any[]) => R>(fn: T): T {
    let previousArgskey: string | undefined = undefined;
    let value: R | undefined = undefined;

    const proxy = (...args: any[]) => {
        const argskey = args.join();
        if (argskey !== previousArgskey) {
            previousArgskey = argskey;
            value = fn(...args)
        }
        return value;
    }

    return proxy as T;
}
