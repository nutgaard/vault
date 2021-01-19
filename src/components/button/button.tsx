import React from 'react';
import cls from './../cls';
import css from './button.module.css';

type HtmlProps = React.DetailedHTMLProps<React.ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement>
interface Props extends HtmlProps {
    flat: boolean;
}

function Button(props: Props) {
    const { flat, ...rest} = props;
    return (
        <button { ...rest } className={cls(css.button, props.className, { [css.flat]: flat })} />
    )
}
Button.defaultProps = {
    flat: false
}

export default Button;
