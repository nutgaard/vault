import React from 'react';
import diagram from './vault-flow.png';
import css from './about.module.css';

interface Props {
    close: () => void;
}

function AboutContent(props: Props) {
    return (
        <section className={css.responsive_table}>
            <h2>Encryption</h2>
            <p>
                Your <code>password</code> and <code>content</code> goes in, and out comes a hot mess of garbage
                which only you can access (provided that the password is sufficiently secure).
                But how does it actually achieve that?
            </p>
            <p>
                First we generate a random 256-bit key (<code>K1</code>) using a random-number-generator (RNG),
                follow by a 128-bit <code>salt</code>.
                {' '}<code>K1</code> will be used to encrypt your content later on.
                {' '}<code>Salt</code> will be used to securely transform your <code>password</code> into <i>crypto keys</i>.
            </p>
            <p>
                Your <code>password</code> and <code>salt</code> is combined and passed through a <i>key derivation function </i>
                in order to generate 512 bits of random data.
                In this application we use <b>PBKDF2</b> with 100 000 iterations and <b>SHA-512</b> hashing for this purpose.
            </p>
            <p className="block-l">
                The 512 bits of data is then split into two 256-bit keys; <code>K2</code> and <code>K3</code>.
                {' '}<code>K2</code> is used as the key to encrypt <code>K1</code> using <b>AES-GCM</b>{' '}
                and a 256-bit random <code>IV</code> (initialization vector) yielding a value for <code>K1Encrypted</code>.
            </p>
            <table className="block-l">
                <caption>So far, we got the following random values generated;</caption>
                <thead>
                    <tr><th>Name</th><th>Private/Public</th><th>Description</th></tr>
                </thead>
                <tbody>
                    <tr>
                        <td>K1</td>
                        <td>Private</td>
                        <td>The encryption key used to encrypt the content, and must therefore be kept private.</td>
                    </tr>
                    <tr>
                        <td>K2</td>
                        <td>Private</td>
                        <td>The encryption key used to encrypt <code>K1</code>, and must therefore be kept private.</td>
                    </tr>
                    <tr>
                        <td>K3</td>
                        <td>Public</td>
                        <td>Used for password validation when trying to decrypt later on.</td>
                    </tr>
                    <tr>
                        <td>K1Encrypted</td>
                        <td>Public</td>
                        <td>Encrypted version of <code>K1</code>, can be public since <code>K2</code> is needed to decrypt it.</td>
                    </tr>
                    <tr>
                        <td>Salt</td>
                        <td>Public</td>
                        <td>Used for key-derivation, and is needed when decrypting later on.</td>
                    </tr>
                </tbody>
            </table>

            <p>
                Final step is to encrypt the <code>content</code>.
                This is done by using <code>K1</code> as the key and using <b>AES-GCM</b> and a 256-bit random <code>IV</code>.
                Finally giving us what we want; our <code>encrypted content</code>.
            </p>

            <h2>Decryption</h2>
            <p>
                Given the public values from the table above (<code>K3</code>, <code>K1Encrypted</code>, and <code>Salt</code>),
                a <code>password</code> and some <code>encrypted content</code>, we are able to decrypt the content if the password is correct.
            </p>
            <p>
                The provided <code>password</code> and the <code>salt</code> is combined in a similar way to when we are encrypting data,
                returning <code>K2</code> and <code>K3</code>.
                The generated value for <code>K3</code> is then compared with the provided public value for <code>K3</code>.
                If these does not match it means we have provided the wrong password, and the process halts.
            </p>

            <p>
                Given that the two <code>K3</code> values matched, we use <code>K2</code> to decrypt <code>K1Encrypted</code> yielding us <code>K1</code>.
                We now got all the values from the table above, including the <i>private ones</i>; <code>K1</code> and <code>K2</code>.
                Decryption can therefore be completed by using <code>K1</code> and decrypting the <code>encrypted content</code>.
            </p>

            <h2>Diagram</h2>
            <img src={diagram} alt="Diagram of how values flow" />
        </section>
    )
}

export default AboutContent;
