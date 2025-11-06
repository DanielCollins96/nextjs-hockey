import Link from "next/link";
import {UseAuth} from "../contexts/Auth";
import {Auth} from "aws-amplify";
import ProfileButton from "./ProfileButton";
import {FaUserCircle, FaSignOutAlt, FaBars, FaTimes} from "react-icons/fa";
import {useState, useEffect} from "react";
import DarkModeToggle from "./DarkModeToggle";

const Header = () => {
  const {user, setUser} = UseAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Close sidebar if screen size becomes sm or larger
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 640) {
        // Tailwind 'sm' breakpoint is 640px
        setSidebarOpen(false);
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <>
      <header className="w-full bg-gray-100 dark:bg-gray-800 flex justify-between ml-1 py-2">
        <Link href="/" className="self-center text-xl font-bold dark:text-white">
          <p className="text-xl m-2">NHL Stats Home &copy;</p>
        </Link>
        {/* Hamburger for mobile */}
        <button
          className="sm:hidden flex items-center px-3 py-2"
          onClick={() => setSidebarOpen(true)}
          aria-label="Open sidebar"
        >
          <FaBars size={24} />
        </button>
        {/* Desktop nav */}
        <nav className="self-center my-2 mr-2 sm:my-0 hidden sm:block">
          <ul className="flex">
            <li className="my-auto px-2">
              <Link href="/teams" className="text-xl dark:text-white hover:text-gray-600 dark:hover:text-gray-300">
                Teams
              </Link>
            </li>
            <li className="my-auto px-3 py-1">
              <Link href="/players" className="text-xl dark:text-white hover:text-gray-600 dark:hover:text-gray-300">
                Players
              </Link>
            </li>
            <li className="my-auto px-3 py-1">
              <Link href="/drafts" className="text-xl dark:text-white hover:text-gray-600 dark:hover:text-gray-300">
                Drafts
              </Link>
            </li>
            <li className="my-auto px-3 py-1">
              <DarkModeToggle />
            </li>
            {!user ? (
              <li>
                <Link href="/login" passHref legacyBehavior>
                  <button className="inline-flex justify-center w-full px-4 py-2 text-md font-bold text-white bg-black border border-gray-400 rounded-md bg-opacity-50 tracking-wider hover:bg-opacity-60 focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75">
                    Login
                    <FaUserCircle className="ml-2 my-auto" />
                  </button>
                </Link>
              </li>
            ) : (
              <li>
                <ProfileButton />
              </li>
            )}
          </ul>
        </nav>
      </header>
      {/* Sidebar for mobile */}
      <div
        className={`fixed inset-0 z-50 bg-black bg-opacity-40 transition-opacity ${
          sidebarOpen
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        } sm:hidden`}
        onClick={() => setSidebarOpen(false)}
      />
      <aside
        className={`fixed top-0 left-0 h-full w-64 bg-white dark:bg-gray-800 shadow-lg z-50 transform transition-transform duration-300 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } sm:hidden`}
      >
        <div className="flex justify-between items-center p-4 border-b">
          <span className="font-bold text-xl dark:text-white">Menu</span>
          <button
            onClick={() => setSidebarOpen(false)}
            aria-label="Close sidebar"
          >
            <FaTimes size={24} />
          </button>
        </div>
        <nav>
          <ul className="flex flex-col p-4 space-y-4">
            <li>
              <Link
                href="/teams"
                onClick={() => setSidebarOpen(false)}
                className="text-lg dark:text-white"
              >
                Teams
              </Link>
            </li>
            <li>
              <Link
                href="/players"
                onClick={() => setSidebarOpen(false)}
                className="text-lg dark:text-white"
              >
                Players
              </Link>
            </li>
            <li>
              <Link
                href="/drafts"
                onClick={() => setSidebarOpen(false)}
                className="text-lg dark:text-white"
              >
                Drafts
              </Link>
            </li>
            <li>
              <div className="py-2">
                <DarkModeToggle />
              </div>
            </li>
            {!user ? (
              <li>
                <Link href="/login" passHref legacyBehavior>
                  <button
                    className="inline-flex justify-center w-full px-4 py-2 text-md font-bold text-white bg-black border border-gray-400 rounded-md bg-opacity-50 tracking-wider hover:bg-opacity-60 focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75"
                    onClick={() => setSidebarOpen(false)}
                  >
                    Login
                    <FaUserCircle className="ml-2 my-auto" />
                  </button>
                </Link>
              </li>
            ) : (
              <li>
                <ProfileButton />
              </li>
            )}
          </ul>
        </nav>
      </aside>
    </>
  );
};

export default Header;
