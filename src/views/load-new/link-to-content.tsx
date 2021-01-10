import React from "react";
import css from "./load-new.module.css";
import cls from "../../components/cls";
import Box from "../../components/box/box";
import {LoadNewContentSetterProps} from "./load-new";

function LinkToContent(props: LoadNewContentSetterProps) {
    return (
        <>
            <h2 className={css.header}>Link to file</h2>
            <input className={cls(css.input, 'block-s')} type="text"/>
        </>
    );
}

export default LinkToContent;
