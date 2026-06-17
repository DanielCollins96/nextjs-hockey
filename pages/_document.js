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
                    <link rel="icon" href="/favicon.ico" sizes="any" />
                    <link rel="icon" type="image/svg+xml" href="/images/ice-hockey-puck.svg" />
                    <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
                    {/* Preconnect to external domains for faster loading */}
                    <link rel="preconnect" href="https://assets.nhle.com" />
                    <link rel="dns-prefetch" href="https://assets.nhle.com" />
                </Head>
                <body className="bg-white dark:bg-gray-900 min-w-full overflow-x-hidden">
                    <Main />
                    <NextScript />
                </body>
            </Html>
        );
    }
}

export default Document;
