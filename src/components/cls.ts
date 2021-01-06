export default function cls(...args: Array<string | null | undefined>): string {
    return args
        .filter((arg) => arg)
        .flatMap((arg) => arg!.split(' '))
        .join(' ');
}
