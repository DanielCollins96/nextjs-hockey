import Link from "next/link";
import {UseAuth} from "../contexts/Auth";
import ProfileButton from "./ProfileButton";
import {FaUserCircle, FaBars, FaTimes} from "react-icons/fa";
import {useState, useEffect} from "react";
import DarkModeToggle from "./DarkModeToggle";
import GlobalSearch from "./GlobalSearch";

const Header = () => {
  const {user} = UseAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Close drawer if screen size becomes md or larger
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        // Tailwind 'md' breakpoint is 768px
        setSidebarOpen(false);
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <>
      <header className="relative z-40 w-full max-w-full bg-gray-100 px-2 py-2 shadow-sm dark:bg-gray-800 md:ml-40 md:w-[calc(100%-10rem)]">
        <div className="flex items-center justify-between gap-3">
          <Link
            href="/"
            className="block flex-shrink-0 self-center px-1 py-1 text-lg font-bold dark:text-white sm:px-2 sm:text-xl md:hidden"
          >
            <p>NHL Stats</p>
          </Link>
          <div className="ml-auto flex min-w-0 items-center gap-2">
            <GlobalSearch className="w-[min(34vw,14rem)] sm:w-[min(54vw,30rem)] md:w-[min(46vw,30rem)] lg:w-[min(38vw,30rem)]" />
            <div className="flex-shrink-0">
              <DarkModeToggle />
            </div>
            <div className="hidden flex-shrink-0 md:block">
              {!user ? (
                <Link href="/login" passHref legacyBehavior>
                  <button className="inline-flex justify-center w-full px-4 py-2 text-md font-bold text-white bg-black border border-gray-400 rounded-md bg-opacity-50 tracking-wider hover:bg-opacity-60 focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75">
                    Login
                    <FaUserCircle className="ml-2 my-auto" />
                  </button>
                </Link>
              ) : (
                <ProfileButton onNavigate={() => setSidebarOpen(false)} />
              )}
            </div>
            <button
              className="flex flex-shrink-0 items-center px-2 py-2 md:hidden"
              onClick={() => setSidebarOpen(true)}
              aria-label="Open sidebar"
            >
              <FaBars size={24} />
            </button>
          </div>
        </div>
      </header>
      {/* Sidebar */}
      <div
        className={`fixed inset-0 z-50 bg-black bg-opacity-40 transition-opacity md:hidden ${
          sidebarOpen
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        }`}
        onClick={() => setSidebarOpen(false)}
      />
      <aside
        className={`fixed left-0 top-0 z-50 h-full w-40 transform border-r border-gray-200 bg-white shadow-lg transition-transform duration-300 dark:border-gray-700 dark:bg-gray-800 md:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-[89px] min-h-[89px] items-center justify-between border-b px-4 dark:border-gray-700">
          <Link
            href="/"
            onClick={() => setSidebarOpen(false)}
            className="font-bold text-xl dark:text-white"
          >
            NHL Stats
          </Link>
          <button
            className="md:hidden"
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
                href="/seasons"
                onClick={() => setSidebarOpen(false)}
                className="text-lg dark:text-white"
              >
                Seasons
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
              <Link
                href="/games"
                onClick={() => setSidebarOpen(false)}
                className="text-lg dark:text-white"
              >
                Games
              </Link>
            </li>
            {!user ? (
              <li className="pt-2 md:hidden">
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
                <ProfileButton onNavigate={() => setSidebarOpen(false)} />
              </li>
            )}
          </ul>
        </nav>
      </aside>
    </>
  );
};

export default Header;
