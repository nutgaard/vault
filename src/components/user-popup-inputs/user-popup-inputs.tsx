import React, {createElement, useState} from 'react';
import {render, unmountComponentAtNode} from 'react-dom';
import Modal from '../modal/modal';
import Button from "../button/button";
import TextInput from '../textinput/textinput';
import css from './user-popup-inputs.module.css';
import {focusOnFirstFocusable} from "../../hooks/use-focus-on-first-focusable";

type PopupComponentProps<RESULT, PROPS> = { close(result: RESULT): void; } & PROPS;
type PopupComponent<RESULT, PROPS> = React.ComponentType<PopupComponentProps<RESULT, PROPS>>

function renderPopup<RESULT, PROPS>(componentType: PopupComponent<RESULT, PROPS>, props: PROPS): Promise<RESULT> {
    return new Promise((resolve) => {
        const tmp = document.createElement('div');
        document.body.appendChild(tmp);

        const close: (result: RESULT) => void = (result: RESULT) => {
            unmountComponentAtNode(tmp);
            document.body.removeChild(tmp);
            resolve(result);
        }
        const component = createElement(componentType, {...props, close});

        render(component, tmp);
    });
}

type AlertProps = { message: string };

function Alert(props: PopupComponentProps<void, AlertProps>) {
    return (
        <Modal className={css.modal} isOpen={true} contentRef={el => focusOnFirstFocusable(el)}>
            <p>{props.message}</p>
            <Button onClick={() => props.close()}>OK</Button>
        </Modal>
    );
}

type ConfirmProps = { message: string };

function Confirm(props: PopupComponentProps<boolean, ConfirmProps>) {
    return (
        <Modal className={css.modal} isOpen={true} contentRef={el => focusOnFirstFocusable(el)}>
            <p>{props.message}</p>
            <Button onClick={() => props.close(true)}>OK</Button>
            <Button flat onClick={() => props.close(false)}>Cancel</Button>
        </Modal>
    );
}

type PromptProps = { message: string; secret: boolean; };

function Prompt(props: PopupComponentProps<string | null, PromptProps>) {
    const [value, setValue] = useState("")
    return (
        <Modal className={css.modal} isOpen={true} contentRef={el => focusOnFirstFocusable(el)}>
            <form>
                <p>{props.message}</p>
                <TextInput
                    type={props.secret ? 'password' : 'text'}
                    className="block-m"
                    value={value}
                    onChange={(event) => setValue(event.target.value)}
                />
                <Button onClick={() => props.close(value)}>OK</Button>
                <Button type="button" flat onClick={() => props.close(null)}>Cancel</Button>
            </form>
        </Modal>
    );
}


export function alert(message: string): Promise<void> {
    return renderPopup(Alert, {message});
}

export function confirm(message: string): Promise<boolean> {
    return renderPopup(Confirm, {message});
}

export function prompt(message: string): Promise<string | null> {
    return renderPopup(Prompt, {message, secret: false});
}

export function promptSecret(message: string): Promise<string | null> {
    return renderPopup(Prompt, {message, secret: true});
}
