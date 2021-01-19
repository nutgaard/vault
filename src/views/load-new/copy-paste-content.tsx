import React, {useRef} from "react";
import createFormHook from '@nutgaard/use-formstate';
import css from "./load-new.module.css";
import {readBase64ToJson} from "../../encryption/encryption";
import {isRight} from "fp-ts/Either";
import state, {loadnewState, LoadnewState, StateAlike} from "../../recoil/state";
import Box from "../../components/box/box";
import Button from "../../components/button/button";
import {useSetRecoilState} from "recoil";
import {memoize} from "../../utils";
import {saveContent} from "./utils";
import {useFocusOnFirstFocusable} from "../../hooks/use-focus-on-first-focusable";
import Textinput from "../../components/textinput/textinput";
import ErrorMessage from "./error-message";

interface Props {
    state: StateAlike<LoadnewState>;
}

type FormData = { name: string; data: string; };
const useFormValidation = createFormHook<FormData>({
    name: (value: string) => {
        return value.length > 0 ? undefined : 'Name is required'
    },
    data: memoize((value: string) => {
        if (value.length === 0) {
            return "Content is required"
        }
        const validation = readBase64ToJson(value);
        return isRight(validation) ? undefined : "Invalid content";
    })
});

function CopyPasteContent(props: Props) {
    const container = useRef<HTMLFormElement>(null)
    useFocusOnFirstFocusable(container);
    const setState = useSetRecoilState(state);
    const validation = useFormValidation({name: "", data: ""});

    const backHandler = () => {
        setState(loadnewState(props.state))
    };
    const submitHandler = (form: FormData) => saveContent(form.name, form.data, setState);

    const header: React.ReactNode = "Copy/Paste content";
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
                    type="text"
                    placeholder="Name"
                    {...validation.fields.name.input}
                />
                <ErrorMessage className="block-s" field={validation.fields.name} />

                <textarea
                    className={css.textarea}
                    placeholder="Base64 content"
                    rows={5}
                    autoComplete="off"
                    {...validation.fields.data.input}
                />
                <ErrorMessage field={validation.fields.data} />
            </Box>
        </form>
    );
}

export default CopyPasteContent;
