import Link from 'next/link'
import { useAuth } from '../contexts/Auth';
import { Auth } from 'aws-amplify';
import DropdownButton from './DropdownButton';
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
        <header className="w-full bg-white flex px-2">
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
                </ul>
            </nav>
            <nav className="self-center justify-self-end sm:order-2">
                <ul className="">
                    { !user ?
                    <div className="flex items-center p-2 mx-1">
                    <li>
                        <Link href="/profile" >
                            <DropdownButton />
                        </Link>
                    </li>
                    </div>
                    :
                    <div className="flex items-center p-2 mx-1">
                        <li>
                            <DropdownButton />
                        </li>
                        {/* <li>
                            <Button 
                                m={3}
                                onClick={signOutHandler} 
                                colorScheme="red" 
                                size="md" 
                                rightIcon={<FaSignOutAlt />} 
                            >Sign Out</Button>
                        </li> */}
                    </div>
                    }
                    </ul>
            </nav> 
        </header>

    )
};

export default Header;


