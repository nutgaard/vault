import React from 'react';
import cls from './../cls';
import css from './button.module.css';

type HtmlProps = React.DetailedHTMLProps<React.ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement>
interface Props extends HtmlProps {
    flat: boolean;
    linkstyling: boolean;
}

function Button(props: Props) {
    const {flat, linkstyling, ...rest} = props;
    const classNames = cls(
        css.button,
        props.className,
        {
            [css.flat]: flat,
            [css.linkstyling]: linkstyling
        }
    );
    return (
        <button {...rest} className={classNames}/>
    )
}

Button.defaultProps = {
    flat: false,
    linkstyling: false
}

export default Button;
