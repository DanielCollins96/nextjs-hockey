import React from 'react';
import NextDocument, {Html, Head, Main, NextScript} from 'next/document';
import { extendTheme, ColorModeScript } from "@chakra-ui/react"

const config = {
  initialColorMode: "light",
  useSystemColorMode: false,
}

const theme = extendTheme({ config })

class Document extends NextDocument {
    static async getInitialProps(ctx) {
        const initialProps = await NextDocument.getInitialProps(ctx);
        return {...initialProps};
    }

    render() {
        return (
            <Html>
                <Head>
                    <meta name="viewport" content="width=device-width, initial-scale=1" />
                    <meta title="Hockey Stats" />
                    <link rel="icon" sizes="96x96" href="/favicons/favicon.ico" />
                    <meta name="theme-color" content="#319795"></meta>
                </Head>
                <body className="bg-gray-100">
                    <ColorModeScript initialColorMode={theme.config.initialColorMode} />
                    <Main />
                    <NextScript />
                </body>
            </Html>
        );
    }
}

export default Document;