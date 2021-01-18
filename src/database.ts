import * as DB from 'idb-keyval';
import {Store} from 'idb-keyval';
import {EncodedEncryptedContent} from "./encryption/domain";

const store = new Store("vault", "vault");

export function get(key: string): Promise<EncodedEncryptedContent> {
    return DB.get(key, store);
}

export function set(key: string, value: EncodedEncryptedContent): Promise<void> {
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

export async function list(): Promise<Array<[string, EncodedEncryptedContent]>> {
    const storedKeys = await keys();
    return await Promise.all(
        storedKeys
            .map((key) =>
                get(key)
                    .then((data) => [key, data] as [string, EncodedEncryptedContent])
            )
    );
}
