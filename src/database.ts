import * as DB from 'idb-keyval';
import { Store } from "idb-keyval";

const store = new Store("vault", "vault");

export function get<TYPE>(key: IDBValidKey): Promise<TYPE> {
    return DB.get<TYPE>(key, store);
}
export function set(key: IDBValidKey, value: any): Promise<void> {
    return DB.set(key, value, store);
}
export function del(key: IDBValidKey): Promise<void> {
    return DB.del(key, store);
}
export function clear(): Promise<void> {
    return DB.clear(store);
}
export function keys(): Promise<IDBValidKey[]> {
    return DB.keys(store);
}
