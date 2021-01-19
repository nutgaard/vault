import React, {useRef} from "react";
import css from "./load-new.module.css";
import state, {loadnewState, LoadnewState, StateAlike} from "../../recoil/state";
import {useSetRecoilState} from "recoil";
import Button from "../../components/button/button";
import Box from "../../components/box/box";
import TextInput from '../../components/textinput/textinput';
import {useFocusOnFirstFocusable} from "../../hooks/use-focus-on-first-focusable";
import createFormHook from "@nutgaard/use-formstate";
import {memoize} from "../../utils";
import {saveContent} from "./utils";
import Textinput from "../../components/textinput/textinput";
import ErrorMessage from "./error-message";
import {alert} from "../../components/user-popup-inputs/user-popup-inputs";

interface Props {
    state: StateAlike<LoadnewState>;
}

type FormData = { name: string; link: string; };
const useFormValidation = createFormHook<FormData>({
    name: (value: string) => {
        return value.length > 0 ? undefined : 'Name is required'
    },
    link: memoize((value: string) => {
        if (value.length === 0) {
            return "Link is required";
        }

        try {
            const url = new URL(value);
            if (url.protocol === 'http:') {
                return 'Insecure protocol, use https.';
            } else if (url.protocol !== 'https:') {
                return `Unknown protocol: ${url.protocol}`;
            } else {
                return undefined;
            }
        } catch (e) {
            return 'Invalid URL'
        }
    })
});

function LinkToContent(props: Props) {
    const container = useRef<HTMLFormElement>(null)
    useFocusOnFirstFocusable(container);
    const setState = useSetRecoilState(state);
    const validation = useFormValidation({name: "", link: ""});

    const backHandler = () => {
        setState(loadnewState(props.state))
    };
    const submitHandler = async (form: FormData) => {
        const response = await fetch(form.link);
        if (response.status !== 200) {
            await alert(`File download failed: ${response.status} ${response.statusText}`)
            return;
        }
        const data = await response.text();
        return saveContent(form.name, data, setState)
    };

    const header: React.ReactNode = "Link to file";
    const footer: React.ReactNode = (
        <>
            <Button type="button" onClick={backHandler}>Back</Button>
            <Button disabled={!validation.valid}>Load content</Button>
        </>
    );

    return (
        <form ref={container} onSubmit={validation.onSubmit(submitHandler)}>
            <Box contentClass={css.content} header={header} footer={footer}>
                <Textinput
                    placeholder="Name"
                    {...validation.fields.name.input}
                />
                <ErrorMessage className="block-s" field={validation.fields.name} />

                <TextInput
                    placeholder="Link"
                    {...validation.fields.link.input}
                />
                <ErrorMessage className="block-s" field={validation.fields.link} />
            </Box>
        </form>
    );
}

export default LinkToContent;
