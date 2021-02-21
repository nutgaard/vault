import React, {useState} from 'react';
import cls from './../cls';
import css from './filetree.module.css';
import {ReactComponent as FileSvg} from './file.svg';
import {ReactComponent as FolderSvg} from './folder.svg';
import {File, Directory, Filesystem} from "../../hooks/use-filesystem";

interface Props {
    filesystem: Filesystem;
}

interface DirectoryViewProps {
    directory: Directory;
    showDirectory: boolean;

    onFileSelected(file: File): void;
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
    const {
        directory,
        showDirectory,
        onFileSelected
    } = props;
    const content = [...directory.children]
        .sort(fileStructureComparator)
        .map((child, i) => {
            if (child.isDirectory) {
                return (
                    <DirectoryView
                        key={child.name}
                        directory={child}
                        showDirectory={true}
                        onFileSelected={onFileSelected}
                    />
                );
            } else {
                return (
                    <button
                        key={child.filepath}
                        className={css.file}
                        onClick={() => onFileSelected(child)}
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
        return (
        <div className={cls(css.wrapper)}>
            <DirectoryView
                directory={props.filesystem.tree}
                showDirectory={false}
                onFileSelected={props.filesystem.openFile}/>
        </div>
    )
}

export default Filetree;
