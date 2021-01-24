import React from 'react';
import Modal from 'react-modal';
import css from './modal.module.css';
import cls from "../cls";

export function setAppElement(element: string | HTMLElement) {
    Modal.setAppElement(element)
}

interface ModalWrapperProps extends Omit<Modal.Props, 'className' | 'overlayClassName'> {
    children: React.ReactNode;
    className?: string;
    overlayClassName?: string;
}

function ModalWrapper(props: ModalWrapperProps) {
    const { className, overlayClassName, ...rest } = props;
    return (
        <Modal
            className={cls(css.modal, className)}
            overlayClassName={cls(css.overlay, overlayClassName)}
            {...rest}
        />
    );
}

export default ModalWrapper;
