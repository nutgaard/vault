import {SetterOrUpdater} from "recoil";
import * as DB from "../../database";
import {listviewState, States} from "../../recoil/state";
import {alert, confirm, promptSecret} from '../../components/user-popup-inputs/user-popup-inputs';
import Encryption, {readBase64ToJson} from "../../encryption/encryption";
import {isLeft} from "fp-ts/Either";

const encryption = new Encryption();
export async function saveContent(name: string, base64Content: string, setState: SetterOrUpdater<States>) {
    const validation = readBase64ToJson(base64Content);
    if (isLeft(validation)) {
        await alert("Invalid content");
        return;
    }
    const data = validation.right;

    const password = await promptSecret("Password?");
    if (password === null) {
        return;
    }
    const correctPassword = await encryption.verifyPassword(password, data);
    if (!correctPassword) {
        await alert("Wrong password.");
        return;
    }

    const existingKeys = await DB.keys();
    const store = existingKeys.includes(name) ? await confirm(`Override content of ${name}?`) : true;

    if (store) {
        await DB.set(name, data);
        const keys = await DB.keys();
        setState(listviewState({files: keys}));
    }
}
