import React from "react";
import {FieldState} from "@nutgaard/use-formstate";
import cls from "../../components/cls";
import css from "./load-new.module.css";

interface Props {
    field: Pick<FieldState, 'touched' | 'error'>;
    className?: string;
}

function ErrorMessage(props: Props) {
    const showError = props.field.touched && props.field.error !== undefined;
    const content = showError ? `* ${props.field.error}` : ' ';
    return (
        <span className={cls(css.errormessage, props.className)}>{content}</span>
    );
}

export default ErrorMessage;
