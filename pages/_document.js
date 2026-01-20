import React from 'react';
import NextDocument, {Html, Head, Main, NextScript} from 'next/document';
import Script from 'next/script'

class Document extends NextDocument {
    static async getInitialProps(ctx) {
        const initialProps = await NextDocument.getInitialProps(ctx);
        return {...initialProps};
    }

    render() {
        return (
            <Html lang="en">
                <Head>
                    <meta charSet="utf-8" />
                    <meta name="google-site-verification" content="VUUqOnHAWuSsJzbTMxRJ1c8VvzljEFObxWmd0CWkdPA" />
                    <link rel="icon" sizes="96x96" href="/images/Hockey-Net.svg" />
                    {/* Preconnect to external domains for faster loading */}
                    <link rel="preconnect" href="https://assets.nhle.com" />
                    <link rel="dns-prefetch" href="https://assets.nhle.com" />
                </Head>
                <body className="bg-white dark:bg-gray-900 min-w-fit">
                    <Main />
                    <NextScript />
                </body>
            </Html>
        );
    }
}

export default Document;