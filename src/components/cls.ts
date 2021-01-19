type AcceptedTypes = string | null | undefined | { [key: string]: boolean }

function getClasses(type: AcceptedTypes): Array<string> {
    if (type === null) return []
    else if (type === undefined) return []
    else if (typeof type === 'string') return type.split(' ')
    else {
        return Object.entries(type)
            .filter(([key, value]) => value && key !== 'undefined')
            .map(([key, value]) => key)
    }
}

export default function cls(...args: Array<AcceptedTypes>): string {
    return args
        .flatMap((arg) => getClasses(arg))
        .join(' ');
}
