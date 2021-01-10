import React from 'react';
import cls from './../cls';
import css from './button.module.css';

type HtmlProps = React.DetailedHTMLProps<React.ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement>
interface Props extends HtmlProps {

}

function Button(props: Props) {
    return (
        <button { ...props } className={cls(css.button, props.className)} />
    )
}

export default Button;
