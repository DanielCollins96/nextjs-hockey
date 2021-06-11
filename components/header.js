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
        <header className="w-full flex justify-between items-center">
            <p className="text-2xl m-2">Stats Fam &copy;</p>
            <nav className="flex">
                <ul className="flex w-full gap-x-4">
                    <li className="">
                        <Link href="/">
                            <a className="">Home</a>
                        </Link>
                    </li>
                    <li className="">
                        <Link href="/players">
                            <a className="">Players</a>
                        </Link>
                    </li>
                    <li>
                        <Link href="/teams">
                            <a className="">Teams</a>
                        </Link>
                    </li>
                    {/* <li>
                        <Link href="/chart">
                            <a className={s.link}>Chart Maker</a>
                        </Link>
                    </li> */}
                </ul>
            </nav>
            <nav>
                <ul className="">
                    { !user ?
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
                    :
                    <Button 
                    m={3}
                        onClick={signOutHandler} 
                        colorScheme="blue" 
                        size="md" 
                        rightIcon={<FaSignOutAlt />} 
                        
                        >Sign Out</Button>
                    }
                </ul>
            </nav> 
        </header>

    )
};

export default Header;


