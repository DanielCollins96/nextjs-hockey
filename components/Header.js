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
                    <li>
                        <Link href="/create-post">
                            <a className="text-xl">Create Post</a>
                        </Link>
                    </li>
                </ul>
            </nav>
            <nav className="self-center justify-self-end sm:order-2">
                <ul className="">
                    { !user ?
                    <div>
                    <li>
                        <Link href="/profile" >
                            <Button 
                                m={3}
                                component="a" 
                                colorScheme="blue" 
                                size="md" 
                                rightIcon={<FaUserCircle />}
                                >
                                Profile
                            </Button>
                        </Link>
                    </li>
                    </div>
                    :
                    <div className="flex bg-blue-900 items-center">
                        <li>
                            <DropdownButton />
                        </li>
                        <li>
                            <Button 
                                m={3}
                                onClick={signOutHandler} 
                                colorScheme="red" 
                                size="md" 
                                rightIcon={<FaSignOutAlt />} 
                            >Sign Out</Button>
                        </li>
                    </div>
                    }
                    </ul>
            </nav> 
        </header>

    )
};

export default Header;


