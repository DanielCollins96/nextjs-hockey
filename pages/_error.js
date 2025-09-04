import NextErrorComponent from 'next/error';

const CustomErrorComponent = props => {
  return <NextErrorComponent statusCode={props.statusCode} />;
};

CustomErrorComponent.getInitialProps = async contextData => {
  // Just use basic logging for Cloudflare - no Sentry
  console.error('Error occurred:', contextData.err || `Status ${contextData.res?.statusCode}`);
  return NextErrorComponent.getInitialProps(contextData);
};

export default CustomErrorComponent;
