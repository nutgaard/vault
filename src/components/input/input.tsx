import React from 'react';
import cls from './../cls';
import './input.css';

interface Props extends React.DetailedHTMLProps<React.InputHTMLAttributes<HTMLInputElement>, HTMLInputElement> {

}

function Input(props: Props) {
    return (
        <input { ...props } className={cls('input', props.className)}/>
    )
}

export default Input;
