import {atom} from "recoil";

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
export interface LoadnewState extends State {
    key: 'loadnew';
    files: string[];
}
export interface FileviewState extends State {
    key: 'fileview';
    files: string[];
    file: string;
}

export type States = InitState | ListviewState | LoadnewState | FileviewState;

export function initState(base: StateAlike<InitState>): InitState {
    return { key: 'init' }
}
export function listviewState(base: StateAlike<ListviewState>): ListviewState {
    return { key: 'listview', files: base.files };
}
export function loadnewState(base: StateAlike<LoadnewState>): LoadnewState {
    return { key: 'loadnew', files: base.files };
}
export function fileviewState(base: StateAlike<FileviewState>): FileviewState {
    return { key: 'fileview', files: base.files, file: base.file };
}

export default atom<States>({
    key: 'state',
    default: { key: 'init' }
})
