import {useCallback, useMemo, useState} from "react";
import {useImmer} from 'use-immer';
import {alert, confirm} from "../components/user-popup-inputs/user-popup-inputs";

export type File = { filepath: string; name: string; content: string; isFile: true; isDirectory: false; };
export type EditFile = File & { editContent: string; };
export type Directory = { name: string; isFile: false; isDirectory: true; children: UseFilesystem };
export type UseFilesystem = Array<File | Directory>;
export type UnparsedFilesystem = Array<{ filepath: string; content: string }>;

export function serializeFilesystem(root: Directory): UnparsedFilesystem {
    const files = [];
    const stack = [];
    stack.push(root);

    while (stack.length > 0) {
        const current: File | Directory = stack.pop()!!;
        if (current.isDirectory) {
            stack.push(...current.children);
        } else {
            files.push({
                filepath: current.filepath,
                content: current.content
            })
        }
    }

    return files;
}

function deserializeFilesystem(paths: UnparsedFilesystem): Directory {
    const root: Directory = {
        name: '_',
        isFile: false,
        isDirectory: true,
        children: []
    };

    paths.forEach((path) => {
        let workingRoot: Directory = root;
        const dirs = path.filepath.split('/');
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
            name: filename,
            filepath: path.filepath,
            content: path.content,
            isFile: true,
            isDirectory: false
        })
    });

    return root;
}

function followPath(filesystem: Directory, path: string) {
    const dirs = path.split('/');
    const filename: string = dirs.pop()!;

    let workingDirectory: Directory = filesystem;
    dirs.forEach((dir) => {
        workingDirectory = workingDirectory
            .children
            .find((wdir) => wdir.isDirectory && wdir.name === dir) as Directory;
    })
    const file = workingDirectory.children.find((f) => f.isFile && f.name === filename) as File;
    const fileindex = workingDirectory.children.findIndex((f) => f.isFile && f.name === filename);
    return {
        workingDirectory,
        file,
        filename,
        fileindex
    }
}

export interface Filesystem {
    tree: Directory;
    activeOpenFile: EditFile | undefined;
    openFiles: EditFile[];
    pristine: boolean;
    openFile(file: File): void;
    closeFile(file: File): void;
    updateFile(filepath: EditFile, content: string): void;
    saveFile(file: EditFile): UnparsedFilesystem;
    newFile(filepath: string, content?: string): void;
    deleteFile(filepath: string): void;
}

export function useFilesystem(data: UnparsedFilesystem): Filesystem {
    const [draft, updateDraft] = useImmer<Directory>(deserializeFilesystem(data));
    const [openFiles, updateOpenFiles] = useImmer<EditFile[]>([]);
    const [activeFilepath, setActiveFilepath] = useState<string | undefined>(undefined);

    const activeOpenFile = useMemo(() => {
        return openFiles.find((openFile) => openFile.filepath === activeFilepath);
    }, [openFiles, activeFilepath]);

    const pristine: boolean = useMemo(() => {
        return openFiles.every((openFile) => openFile.content === openFile.editContent);
    }, [openFiles]);

    const openFile = useCallback((file: File) => {
        updateOpenFiles((currentOpenFiles) => {
            const alreadyOpen = currentOpenFiles.find((openFile) => openFile.filepath === file.filepath);
            if (!alreadyOpen) {
                const editFile: EditFile = { ...file, editContent: file.content };
                currentOpenFiles.push(editFile);
                setActiveFilepath(editFile.filepath);
            } else {
                // Needs a copy since `alreadyOpen` is a immer-proxy
                setActiveFilepath(alreadyOpen.filepath);
            }
        });
    }, [updateOpenFiles, setActiveFilepath]);

    const closeFile = useCallback(async (file: File) => {
        const editFile = openFiles.find((openFile) => openFile.filepath === file.filepath);
        if (editFile === undefined) {
            await alert(`Cannot close a file that is not open: ${file.filepath}`);
            return;
        }
        const canClose: boolean = editFile.content === editFile.editContent || await confirm(`The file "${editFile.name}" has unsaved changes. Are you sure you want to close this file?`);
        if (canClose) {
            updateOpenFiles((currentOpenFiles) => {
                const fileIndex = currentOpenFiles.findIndex((openFile) => openFile.filepath === file.filepath);
                currentOpenFiles.splice(fileIndex, 1);
                if (currentOpenFiles.length > 0) {
                    const activeIndex = Math.min(fileIndex, currentOpenFiles.length -1);
                    setActiveFilepath(currentOpenFiles[activeIndex].filepath);
                } else {
                    setActiveFilepath(undefined)
                }
            });
        }
    }, [openFiles, updateOpenFiles, setActiveFilepath]);

    const updateFile = useCallback((file: EditFile, content: string) => updateOpenFiles((currentOpenFiles) => {
        const editFile = currentOpenFiles.find((openFile) => openFile.filepath === file.filepath);
        if (editFile) {
            editFile.editContent = content;
        }
    }), [updateOpenFiles]);

    const saveFile = useCallback((file: EditFile) => {
        const newContent = file.editContent;
        updateOpenFiles((currentOpenFiles) => {
            const editFile = currentOpenFiles.find((openFile) => openFile.filepath === file.filepath);
            if (editFile) {
                editFile.content = newContent;
                editFile.editContent = newContent;
            }
        });
        let out: UnparsedFilesystem;
        updateDraft((current) => {
            const { file: originalFile } = followPath(current, file.filepath);
            originalFile.content = newContent;
            out = serializeFilesystem(current);
        });
        return out!;
    }, [updateOpenFiles, updateDraft]);

    const newFile = useCallback((filepath: string, content?: string) => updateDraft((current) => {
        const { workingDirectory, filename } = followPath(current, filepath)
        const file: File = {
            filepath,
            name: filename,
            isFile: true,
            isDirectory: false,
            content: content ?? ''
        };
        workingDirectory.children.push(file);
    }), [updateDraft]);

    const deleteFile = useCallback((filepath: string) => updateDraft((current) => {
        const { workingDirectory, fileindex } = followPath(current, filepath)
        if (fileindex > -1) {
            workingDirectory.children.splice(fileindex, 1);
        }
    }), [updateDraft]);

    return useMemo(() => ({
        tree: draft,
        openFiles,
        closeFile,
        activeOpenFile,
        pristine,
        openFile,
        updateFile,
        saveFile,
        newFile,
        deleteFile
    }), [
        draft,
        openFiles,
        closeFile,
        activeOpenFile,
        pristine,
        openFile,
        updateFile,
        saveFile,
        newFile,
        deleteFile
    ]);
}
