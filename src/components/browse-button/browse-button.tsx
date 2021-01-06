import React from 'react';
import cls from './../cls';
import './browse-button.css';

interface Props extends React.DetailedHTMLProps<React.ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement> {

}

function BrowseButton(props: Props) {
    return (
        <button { ...props } className={cls('browse-button', props.className)}/>
    )
}

export default BrowseButton;
