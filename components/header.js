import Link from 'next/link'
import { UseAuth } from '../contexts/Auth';
import { Auth } from 'aws-amplify';
import ProfileButton from './ProfileButton'
import { FaUserCircle, FaSignOutAlt } from "react-icons/fa";

const Header = () => {
    
    const { user, setUser } = UseAuth();

    return (
        <header className="w-full bg-white flex justify-between ml-1 py-2">
            <Link href="/">
                <a className="self-center text-xl font-bold">
                    <p className="text-xl m-2">NHL Stats Home &copy;</p>
                </a>
            </Link>
            <nav className="self-center my-2 mr-2 sm:my-0">
                <ul className="flex">
                    <li className="my-auto px-2">
                        <Link href="/teams">
                            <a className="text-xl">Teams</a>
                        </Link>
                    </li>
                    {/* <li className="my-auto px-3 py-1">
                        <Link href="/players">
                            <a className="text-xl">Players</a>
                        </Link>
                    </li> */}
                    { !user ?
                    <li>
                        <Link href="/login" passHref>
                            <button 
                                className="inline-flex justify-center w-full px-4 py-2 text-md font-bold text-white bg-black border border-gray-400 rounded-md bg-opacity-50 tracking-wider hover:bg-opacity-60 focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75"
                            >
                                Login
                                <FaUserCircle className="ml-2 my-auto"/>
                            </button>
                        </Link>
                    </li>
                    :
                    <li>
                        <ProfileButton />
                    </li>
                    }
                </ul>
                </nav>
        </header>

    )
};

export default Header;


