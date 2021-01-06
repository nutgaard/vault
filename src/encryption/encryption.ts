import * as ArrayBufferUtils from './arraybuffer-utils';
import {TypedBuffer} from "./arraybuffer-utils";

function getRandomBits(bits: number): TypedBuffer {
    const data = new Uint8Array(bits / 8);
    crypto.getRandomValues(data);
    return data;
}

async function createPasswordKey(password: string, keyUsages: KeyUsage[]): Promise<CryptoKey> {
    const encoder = new TextEncoder();
    return crypto.subtle.importKey(
        'raw',
        encoder.encode(password),
        'PBKDF2',
        false,
        keyUsages
    )
}

async function generateKey(password: string, salt: TypedBuffer, iterations: number = 100_000): Promise<ArrayBuffer> {
    const passwordkey = await createPasswordKey(password, ['deriveBits']);
    return crypto.subtle.deriveBits(
        {
            name: 'PBKDF2',
            salt: salt,
            iterations: iterations,
            hash: 'SHA-512'
        },
        passwordkey,
        512
    );
}

async function splitKey(key: ArrayBuffer): Promise<[CryptoKey, CryptoKey]> {
    const firstHalf = key.slice(0, 32);
    const secondHalf = key.slice(32);

    return Promise.all([
        convertToKey(firstHalf, ['encrypt', 'decrypt']),
        convertToKey(secondHalf, ['decrypt'])
    ]);
}

async function convertToKey(data: ArrayBuffer, keyUsages: KeyUsage[]) {
    return crypto.subtle.importKey(
        'raw',
        data,
        { name: 'AES-GCM', length: 256 },
        true,
        keyUsages
    )
}
interface EncryptedData {
    iv: TypedBuffer;
    data: ArrayBuffer;
}
interface EncodedEncryptedData {
    iv: string;
    data: string;
}
async function encrypt(data: ArrayBuffer, key: CryptoKey): Promise<EncryptedData> {
    const iv = getRandomBits(256);
    const encrypted = await crypto.subtle.encrypt(
        {
            name: 'AES-GCM',
            iv: iv
        },
        key,
        data
    );
    return { iv, data: encrypted };
}

async function decrypt(encryptedData: EncryptedData, key: CryptoKey): Promise<ArrayBuffer> {
    return crypto.subtle.decrypt(
        {
            name: 'AES-GCM',
            iv: encryptedData.iv
        },
        key,
        encryptedData.data
    )
}

async function init(password: string) {
    const k1 = await convertToKey(getRandomBits(256), ['encrypt', 'decrypt']);
    return initWithK1(password, k1);
}
interface EncryptionConfig {
    public: EncryptionConfigPublic;
    private: EncryptionConfigPrivate;
}
interface EncryptionConfigPublic {
    salt: TypedBuffer;
    encryptedK1: EncryptedData;
    k3: CryptoKey;
}
interface EncryptionConfigPrivate {
    k1: CryptoKey;
    k2: CryptoKey;
}
interface EncodedEncryptionConfigPublic {
    salt: string;
    encryptedK1: EncodedEncryptedData;
    k3: string;
}
export interface EncodedEncryptedContent extends EncodedEncryptionConfigPublic {
    data: EncodedEncryptedData;
}
async function initWithK1(password: string, k1: CryptoKey): Promise<EncryptionConfig> {
    const salt = getRandomBits(128);
    const [k2, k3] = await generateKey(password, salt).then(splitKey);
    const encryptedK1 = await crypto.subtle.exportKey('raw', k1)
        .then((key) => encrypt(key, k2));

    return {
        public: {
            salt,
            encryptedK1,
            k3
        },
        private: {
            k1,
            k2
        }
    };
}

async function load(password: string, publicConfig: EncryptionConfigPublic): Promise<EncryptionConfig> {
    const { salt, encryptedK1, k3: expectedK3 } = publicConfig;
    console.log('loading');
    const [k2, k3] = await generateKey(password, salt).then(splitKey);
    console.log('loaded', k2, k3);

    const k3Exported = await crypto.subtle.exportKey('raw', k3);
    const expectedK3Exported = await crypto.subtle.exportKey('raw', expectedK3);

    if (!ArrayBufferUtils.equals(k3Exported, expectedK3Exported)) {
        throw new Error(`Invalid password or data`);
    }

    const k1Raw = await decrypt(encryptedK1, k2);
    const k1 = await convertToKey(k1Raw, ['encrypt', 'decrypt']);

    return {
        public: {
            salt,
            encryptedK1,
            k3
        },
        private: {
            k1,
            k2
        }
    };
}

function base64EncodeEncrypted(encryptedData: EncryptedData): EncodedEncryptedData {
    const iv = Buffer.from(encryptedData.iv).toString('base64');
    const data = Buffer.from(encryptedData.data).toString('base64');
    return { iv, data };
}
async function base64EncodePublic(config: EncryptionConfigPublic): Promise<EncodedEncryptionConfigPublic> {
    const salt = Buffer.from(config.salt).toString('base64');
    const exportedK3 = await crypto.subtle.exportKey('raw', config.k3);
    const k3 = Buffer.from(exportedK3).toString('base64')

    return {
        salt,
        encryptedK1: base64EncodeEncrypted(config.encryptedK1),
        k3
    };
}

function base64DecodeEncrypted(encryptedData: EncodedEncryptedData): EncryptedData {
    const iv = new Uint8Array(Buffer.from(encryptedData.iv, 'base64'));
    const data = Buffer.from(encryptedData.data, 'base64');
    return { iv, data };
}
async function base64DecodePublic(json: EncodedEncryptionConfigPublic): Promise<EncryptionConfigPublic> {
    const salt = new Uint8Array(Buffer.from(json.salt, 'base64'));
    const importedK3 = Buffer.from(json.k3, 'base64');
    const k3 = await crypto.subtle.importKey(
        'raw',
        importedK3,
        { name: 'AES-GCM', length: 256 },
        true,
        ['decrypt']
    );

    return {
        salt,
        encryptedK1: base64DecodeEncrypted(json.encryptedK1),
        k3
    };
}

function appendData(config: EncodedEncryptionConfigPublic, data: EncodedEncryptedData): EncodedEncryptedContent {
    return {
        ...config,
        data
    }
}

export default class Encryption {
    async encrypt(password: string, data: string): Promise<EncodedEncryptedContent> {
        const encoder = new TextEncoder();
        const config = await init(password);
        const encryptedData = await encrypt(encoder.encode(data), config.private.k1);

        const output = await base64EncodePublic(config.public);
        return appendData(output, base64EncodeEncrypted(encryptedData))
    }

    async decrypt(password: string, data: EncodedEncryptedContent): Promise<string> {
        const decoder = new TextDecoder();
        const decodedConfig = await base64DecodePublic(data);
        const config = await load(password, decodedConfig);
        const decrypted = await decrypt(base64DecodeEncrypted(data.data), config.private.k1);
        return decoder.decode(decrypted);
    }

    async changePassword(oldPassword: string, newPassword: string, data: EncodedEncryptedContent): Promise<EncodedEncryptedContent> {
        const decodedConfig = await base64DecodePublic(data);
        const config = await load(oldPassword, decodedConfig);
        const newConfig = await initWithK1(newPassword, config.private.k1);
        const output = await base64EncodePublic(newConfig.public);
        return appendData(output, data.data)
    }
}
