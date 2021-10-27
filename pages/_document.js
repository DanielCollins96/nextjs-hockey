import React from 'react';
import NextDocument, {Html, Head, Main, NextScript} from 'next/document';


class Document extends NextDocument {
    static async getInitialProps(ctx) {
        const initialProps = await NextDocument.getInitialProps(ctx);
        return {...initialProps};
    }

    render() {
        return (
            <Html lang="en">
                <Head>
                    <link rel="icon" sizes="96x96" href="/favicons/favicon.ico" />
                </Head>
                <body className="bg-gray-100">
                    <Main />
                    <NextScript />
                </body>
            </Html>
        );
    }
}

export default Document;