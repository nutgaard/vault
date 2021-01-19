import React, {useMemo, useState} from 'react';
import cls from './../cls';
import css from './filetree.module.css';
import {ReactComponent as FileSvg} from './file.svg';
import {ReactComponent as FolderSvg} from './folder.svg';

interface Props {
    files: string[];
    selected: string | null;

    onSelect(file: string): void;
}

export type File = { filepath: string; name: string; isFile: true; isDirectory: false; };
export type Directory = { name: string; isFile: false; isDirectory: true; children: FileStructure };
export type FileStructure = Array<File | Directory>;

export function parsePaths(paths: string[]): Directory {
    const root: Directory = {
        name: '_',
        isFile: false,
        isDirectory: true,
        children: []
    };

    paths.forEach((path) => {
        let workingRoot: Directory = root;
        const dirs = path.split('/');
        const filename: string = dirs.pop()!;

        for (const dir of dirs) {
            const existingDir: Directory | undefined = workingRoot.children
                .find((child) => child.isDirectory && child.name === dir) as Directory | undefined;

            if (existingDir !== undefined) {
                workingRoot = existingDir;
            } else {
                const newDirectory: Directory = {
                    name: dir,
                    isDirectory: true,
                    isFile: false,
                    children: []
                };
                workingRoot.children.push(newDirectory);
                workingRoot = newDirectory;
            }
        }
        workingRoot.children.push({
            filepath: path,
            name: filename,
            isFile: true,
            isDirectory: false
        })
    });

    return root;
}

interface DirectoryViewProps {
    directory: Directory;
    showDirectory: boolean;
    selected: string | null;

    onFileSelected(file: string): void;
}

function fileStructureComparator(first: File | Directory, second: File | Directory): number {
    if (first.isFile && !second.isFile) {
        return -1;
    } else if (!first.isFile && second.isFile) {
        return 1;
    } else {
        return first.name.localeCompare(second.name);
    }
}

function DirectoryView(props: DirectoryViewProps) {
    const {directory, showDirectory, selected, onFileSelected} = props;

    const content = directory.children
        .sort(fileStructureComparator)
        .map((child, i) => {
            if (child.isDirectory) {
                return (
                    <DirectoryView
                        key={child.name}
                        directory={child}
                        showDirectory={true}
                        selected={selected}
                        onFileSelected={onFileSelected}
                    />
                );
            } else {
                return (
                    <button
                        key={child.filepath}
                        className={cls(css.file, child.filepath === selected ? css.file_selected : null)}
                        onClick={() => onFileSelected(child.filepath)}
                    >
                        <FileSvg height="16"/>
                        {child.name}
                    </button>
                );
            }
        });
    const [open, setOpen] = useState<boolean>(false);

    if (showDirectory) {
        return (
            <div className={css.directory_wrapper}>
                <button className={cls(css.directory, open ? css.directory_open : null)}
                        onClick={() => setOpen((prev) => !prev)}
                >
                    <FolderSvg height="16"/>
                    {directory.name}
                </button>
                <div className={cls(css.files_wrapper)}>
                    {open ? content : null}
                </div>
            </div>
        );
    }

    return (
        <>
            {content}
        </>
    );
}

function Filetree(props: Props) {
    const {files} = props;
    const filestructure = useMemo(() => parsePaths(files), [files])

    return (
        <div className={cls(css.wrapper)}>
            <DirectoryView directory={filestructure} showDirectory={false} selected={props.selected}
                           onFileSelected={props.onSelect}/>
        </div>
    )
}

export default Filetree;
