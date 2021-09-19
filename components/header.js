import Link from 'next/link'
import { useAuth } from '../contexts/Auth';
import { Auth } from 'aws-amplify';
import {Box, Flex, Heading, Text, Button, Input} from '@chakra-ui/react';

import { FaUserCircle, FaSignOutAlt } from "react-icons/fa";

const Header = () => {
    
    const { user, setUser } = useAuth();
    
    async function signOutHandler() {
        try {
            await Auth.signOut();
            setUser(null);
        } catch (error) {
            console.log('error signing out: ', error);
        }
    }

    return (
        <header className="w-full bg-white flex">
            <Link href="/">
            <a className="self-center text-xl font-bold">
                <p className="text-2xl m-2">NHL Stats Fam &copy;</p>
            </a>
            </Link>
            <nav className="self-center justify-self-center my-2 ml-2 mr-auto sm:my-0">
                <ul className="flex w-full gap-x-4">
                    <li>
                        <Link href="/teams">
                            <a className="text-xl">Teams</a>
                        </Link>
                    </li>
                    {/* <li>
                        <Link href="/chart">
                            <a className={s.link}>Chart Maker</a>
                        </Link>
                    </li> */}
                </ul>
            </nav>
            <nav className="self-center justify-self-end sm:order-2">
                <ul className="">
                    { !user ?
                    <li>
                        <Link href="/profile" >
                        {/* <button class="flex items-center justify-center rounded-md bg-black text-white" type="submit">Buy now</button> */}

                            <button 
                                className="bg-blue-400 flex items-center justify-center rounded-md m-3 p-3 font-bold"
                            >
                                Profile
                                <FaUserCircle className="ml-2"/>
                            </button>
                        </Link>
                    </li>
                    :
                    <button 
                        onClick={signOutHandler}
                        className="bg-blue-400 flex items-center justify-center rounded-md m-3 p-3 font-bold"
                        >
                        Sign Out
                        <FaSignOutAlt className="ml-2"/>
                    </button>
                    }
                </ul>
            </nav> 
        </header>

    )
};

export default Header;


