import {useState} from "react";
import {useForm} from "react-hook-form";
import Link from "next/link";
import {useRouter} from "next/router";
import {UseAuth} from "../contexts/Auth";
import {FaSpinner} from "react-icons/fa";

export default function LoginForm() {
  const router = useRouter();

  const [submitError, setSubmitError] = useState("");

  const {signIn, setUser} = UseAuth();

  const {register, handleSubmit, formState} = useForm();
  const {isSubmitting} = formState;

  const onSubmit = async (event) => {
    setSubmitError("");
    try {
      let user = await signIn(event);

      if (user.username) {
        // addToast('Logged In Successfully', { appearance: 'success', autoDismiss: true })
        setUser(user);
        router.push("/profile");
      } else {
        try {
          setSubmitError(user.message);
        } catch (e) {
          console.log(e);
        }
      }
    } catch (e) {
      console.log(e);
    }
  };

  return (
    <div className="w-full max-w-sm mx-auto mt-12">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 border border-gray-200 dark:border-gray-700 shadow-md rounded px-8 pt-6 pb-8 mb-4"
      >
        <p className="mt-3 mb-6 font-bold tracking-wide text-2xl">
          Sign in to your account
        </p>
        <div className="mb-4">
          <label
            htmlFor="email"
            className="block text-gray-800 dark:text-gray-200 text-sm font-bold mb-2"
          >
            Email
          </label>
          <input
            type="email"
            {...register("email")}
            className="shadow appearance-none border border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded w-full py-2 px-3 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <div className="mb-2">
          <label
            htmlFor="password"
            className="block text-gray-800 dark:text-gray-200 text-sm font-semibold mb-2"
          >
            Password
          </label>
          <input
            type="password"
            {...register("password")}
            className="shadow appearance-none border border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded w-full py-2 px-3 mb-1 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <div className="mb-3 text-xs">
          <p>
            Forgot your password?{" "}
            <Link
              href="/reset-password"
              className="font-bold text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
            >
              Reset Password
            </Link>
          </p>
        </div>
        <div className="mb-2 h-9">
          {submitError ? (
            <div
              className="bg-red-50 dark:bg-red-900 border text-sm border-red-400 dark:border-red-600 text-red-700 dark:text-red-200 px-3 py-2 rounded relative"
              role="alert"
            >
              <span className="block sm:inline">{submitError}</span>
            </div>
          ) : (
            <p className=""></p>
          )}
        </div>
        <div className="flex items-center justify-between">
          <button
            disabled={isSubmitting}
            className="uppercase w-24 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-400 text-white font-bold tracking-wide py-2 px-4 rounded focus:outline-none focus:shadow-outline disabled:opacity-20"
            type="submit"
          >
            {isSubmitting ? (
              <FaSpinner className="h-6 animate-spin m-auto" />
            ) : (
              "Sign in"
            )}
          </button>
          <div className="flex gap-1">
            <p className="text-sm">No Account?</p>
            <button className="inline-block align-baseline text-sm ">
              <Link
                href="/signup"
                className="font-bold text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
              >
                Create account
              </Link>
            </button>
          </div>
        </div>
      </form>
      <pre>
        {/* {Object.keys(errors).length > 0 && (
                <label>Errors: {JSON.stringify(errors, null, 2)}</label>
            )} */}
      </pre>
      {/* <p>{JSON.stringify(values, null, 2)}</p>
            <pre>{JSON.stringify(status, null, 2)}</pre> */}
    </div>
  );
}
