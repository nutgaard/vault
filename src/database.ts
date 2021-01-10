import * as DB from 'idb-keyval';
import { Store } from "idb-keyval";

const store = new Store("vault", "vault");

export function get<TYPE>(key: string): Promise<TYPE> {
    return DB.get<TYPE>(key, store);
}
export function set(key: string, value: any): Promise<void> {
    return DB.set(key, value, store);
}
export function del(key: string): Promise<void> {
    return DB.del(key, store);
}
export function clear(): Promise<void> {
    return DB.clear(store);
}
export function keys(): Promise<string[]> {
    return DB.keys(store) as Promise<string[]>;
}
