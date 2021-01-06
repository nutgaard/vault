/**
 * compare two binary arrays for equality
 * @param {(ArrayBuffer|ArrayBufferView)} a
 * @param {(ArrayBuffer|ArrayBufferView)} b
 */

export type BufferType = ArrayBuffer | ArrayBufferView;
export type TypedBuffer = Int8Array | Int16Array | Int32Array | Uint8Array | Uint16Array | Uint32Array | Uint8ClampedArray | Float32Array | Float64Array
export function equals(a: BufferType, b: BufferType) {
    if (a instanceof ArrayBuffer) a = new Uint8Array(a, 0);
    if (b instanceof ArrayBuffer) b = new Uint8Array(b, 0);
    if (a.byteLength !== b.byteLength) return false;

    const aTyped = a as TypedBuffer;
    const bTyped = b as TypedBuffer;

    if (aligned32(aTyped) && aligned32(bTyped))
        return equal32(aTyped, bTyped);
    if (aligned16(aTyped) && aligned16(bTyped))
        return equal16(aTyped, bTyped);
    return equal8(aTyped, bTyped);
}

function equal8(a: TypedBuffer, b: TypedBuffer) {
    const ua = new Uint8Array(a.buffer, a.byteOffset, a.byteLength);
    const ub = new Uint8Array(b.buffer, b.byteOffset, b.byteLength);
    return compare(ua, ub);
}
function equal16(a: TypedBuffer, b: TypedBuffer) {
    const ua = new Uint16Array(a.buffer, a.byteOffset, a.byteLength / 2);
    const ub = new Uint16Array(b.buffer, b.byteOffset, b.byteLength / 2);
    return compare(ua, ub);
}
function equal32(a: TypedBuffer, b: TypedBuffer) {
    const ua = new Uint32Array(a.buffer, a.byteOffset, a.byteLength / 4);
    const ub = new Uint32Array(b.buffer, b.byteOffset, b.byteLength / 4);
    return compare(ua, ub);
}

function compare(a: TypedBuffer, b: TypedBuffer) {
    for (let i = a.length; -1 < i; i -= 1) {
        if ((a[i] !== b[i])) return false;
    }
    return true;
}

function aligned16(a: TypedBuffer) {
    return (a.byteOffset % 2 === 0) && (a.byteLength % 2 === 0);
}

function aligned32(a: TypedBuffer) {
    return (a.byteOffset % 4 === 0) && (a.byteLength % 4 === 0);
}
