import * as t from "io-ts";

/* eslint-disable @typescript-eslint/no-redeclare */
export const EncodedEncryptedData = t.interface({
    iv: t.string,
    data: t.string
});
export type EncodedEncryptedData = t.TypeOf<typeof EncodedEncryptedData>;

export const EncodedEncryptionConfigPublic = t.interface({
    salt: t.string,
    encryptedK1: EncodedEncryptedData,
    k3: t.string
});
export type EncodedEncryptionConfigPublic = t.TypeOf<typeof EncodedEncryptionConfigPublic>;

export const EncodedEncryptedContent = t.intersection([
    EncodedEncryptionConfigPublic,
    t.interface({
        data: EncodedEncryptedData
    })
]);
export type EncodedEncryptedContent = t.TypeOf<typeof EncodedEncryptedContent>;
