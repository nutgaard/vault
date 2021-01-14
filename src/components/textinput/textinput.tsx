import React from 'react';
import cls from './../cls';
import css from './textinput.module.css';

type HtmlProps = React.DetailedHTMLProps<React.InputHTMLAttributes<HTMLInputElement>, HTMLInputElement>
interface Props extends HtmlProps {
}

function Textinput(props: Props) {
    return (
        <input
            type="text"
            autoComplete="off"
            {...props}
            className={cls(css.input, props.className)}
        />
    )
}

export default Textinput;
