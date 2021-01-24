import React, {useCallback, useState} from 'react';
import css from './about.module.css';
import Button from "../button/button";
import Modal from '../modal/modal';
import AboutContent from "./about-content";

type HtmlProps = React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>;
interface Props extends HtmlProps {
    message: string;
}

function About(props: Props) {
    const [isOpen, setIsOpen] = useState<boolean>(false);
    const open = useCallback(() => setIsOpen(true), [setIsOpen]);
    const close = useCallback(() => setIsOpen(false), [setIsOpen]);

    return (
        <section>
            <Button linkstyling className={css.open_link} onClick={open}>
                {props.message}
            </Button>
            <Modal isOpen={isOpen} onRequestClose={close} className={css.modal}>
                <AboutContent close={close} />
            </Modal>
        </section>
    )
}

About.defaultProps = {
    message: 'How does it work?'
}

export default About;
