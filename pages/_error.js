/**
 * Loaded by Next.js for thrown render/data errors. 404s from `notFound`
 * use pages/404.js instead.
 */

import * as Sentry from "@sentry/nextjs";
import NextErrorComponent from "next/error";
import ErrorView from "../components/ErrorView";

const CustomErrorComponent = ({ statusCode }) => {
  return <ErrorView statusCode={statusCode || 500} />;
};

CustomErrorComponent.getInitialProps = async (contextData) => {
  await Sentry.captureUnderscoreErrorException(contextData);
  return NextErrorComponent.getInitialProps(contextData);
};

export default CustomErrorComponent;
