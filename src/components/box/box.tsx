import React from 'react';
import cls from './../cls';
import css from './box.module.css';

type HtmlProps = React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>;
interface Props extends HtmlProps {
    contentClass?: string;
    header: React.ReactNode;
    footer?: React.ReactNode;
}

function Box(props: Props) {
    const { contentClass, header, footer, ...rest } = props;

    return (
        <section { ...rest } className={cls(css.box, props.className)}>
            <h1 className={css.header}>{header}</h1>
            <div className={cls(css.content, contentClass)}>{props.children}</div>
            {props.footer && <div className={css.footer}>{footer}</div> }
        </section>
    )
}

export default Box;
