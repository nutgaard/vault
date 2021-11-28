import {atom} from "recoil";
import {EncodedEncryptedContent} from "../encryption/domain";

export interface State {
    key: string;
}
export type StateAlike<T extends State> = Omit<T, 'key'>;

export interface InitState extends State {
    key: 'init';
}

export interface ListviewState extends State {
    key: 'listview';
    files: string[];
}

export interface PromptPasswordState extends State {
    key: 'promptpassword';
    files: string[];
}

export interface LoadnewState extends State {
    key: 'loadnew';
    files: string[];
}

export interface LoadnewStateCopyPaste extends State {
    key: 'loadnew_copypaste';
    files: string[];
}
export interface LoadnewStateUploadFile extends State {
    key: 'loadnew_uploadfile';
    files: string[];
}
export interface LoadnewStateLinkToFile extends State {
    key: 'loadnew_linktofile';
    files: string[];
}

export interface FileviewState extends State {
    key: 'fileview';
    files: string[];
    file: string;
    passwordVerifier: (password: string) => Promise<boolean>;
    content: Array<{ filepath: string; content: string; }>;
}

export interface LoadingFileviewState extends State {
    key: 'fileview_loading';
    files: string[];
    file: string;
    passwordVerifier: (password: string) => Promise<boolean>;
    content: Array<{ filepath: string; content: string; }>;
}

export interface LockingFileviewState extends State {
    key: 'fileview_locking';
    files: string[];
    file: string;
    content: Array<{ filepath: string; content: string; }>;
}

export type States = InitState | ListviewState | PromptPasswordState | LoadnewState | LoadnewStateCopyPaste |LoadnewStateLinkToFile | LoadnewStateUploadFile | LoadingFileviewState | FileviewState | LockingFileviewState;

export function initState(base: StateAlike<InitState>): InitState {
    return { key: 'init' }
}
export function listviewState(base: StateAlike<ListviewState>): ListviewState {
    return { key: 'listview', files: base.files };
}
export function promptPasswordState(base: StateAlike<PromptPasswordState>): PromptPasswordState {
    return { key: 'promptpassword', files: base.files };
}
export function loadnewState(base: StateAlike<LoadnewState>): LoadnewState {
    return { key: 'loadnew', files: base.files };
}
export function loadnewCopyPasteState(base: StateAlike<LoadnewStateCopyPaste>): LoadnewStateCopyPaste {
    return { key: 'loadnew_copypaste', files: base.files };
}
export function loadnewUploadFileState(base: StateAlike<LoadnewStateUploadFile>): LoadnewStateUploadFile {
    return { key: 'loadnew_uploadfile', files: base.files };
}
export function loadnewLinkToFileState(base: StateAlike<LoadnewStateLinkToFile>): LoadnewStateLinkToFile {
    return { key: 'loadnew_linktofile', files: base.files };
}
export function fileviewState(base: StateAlike<FileviewState>): FileviewState {
    return { key: 'fileview', files: base.files, file: base.file, content: base.content, passwordVerifier: base.passwordVerifier };
}
export function loadingFileviewState(base: StateAlike<LoadingFileviewState>): LoadingFileviewState {
    return { key: 'fileview_loading', files: base.files, file: base.file, content: base.content, passwordVerifier: base.passwordVerifier };
}
export function lockingFileviewState(base: StateAlike<LockingFileviewState>): LockingFileviewState {
    return { key: 'fileview_locking', files: base.files, file: base.file, content: base.content };
}

export function isFileviewAlike(base: States): base is FileviewState | LoadingFileviewState  {
    return base.key.startsWith('fileview');
}

export default atom<States>({
    key: 'state',
    default: { key: 'init' }
})
