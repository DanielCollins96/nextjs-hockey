import Link from 'next/link'
import { useAuth } from '../contexts/Auth';
import s from './header.module.css'
import { Auth } from 'aws-amplify';
import {Box, Flex, Heading, Text, Button} from '@chakra-ui/react';

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
        <Box as="header" width="full" height="4rem">
            <Flex size="100%" align="center" justify="space-between">
                <Flex size="100%" align="center">
                    <Text fontSize="2xl" className={s.logo}>Those stats fam &copy;</Text>
                    <nav>
                        <ul className={s.list}>
                            <li className={s.list__item}>
                                <Link href="/">
                                    <a className={s.link}>Home</a>
                                </Link>
                            </li>
                            <li className={s.list__item}>
                                <Link href="/players">
                                    <a className={s.link}>Players</a>
                                </Link>
                            </li>
                            <li>
                                <Link href="/teams">
                                    <a className={s.link}>Teams</a>
                                </Link>
                            </li>
                            <li>
                                <Link href="/chart">
                                    <a className={s.link}>Chart Maker</a>
                                </Link>
                            </li>
                        </ul>
                    </nav>
                </Flex>
            <nav>
                <ul className={s.list}>
                    { !user ?
                    <li className={s.signup}>
                        <Link href="/profile" >
                            <Button component="a">
                                Profile{" "}
                                <FaUserCircle />
                            </Button>
                        </Link>
                    </li>
                    :
                    <Button className={s.signup} onClick={signOutHandler}>Sign Out {" "} <FaSignOutAlt /></Button>
                    }
                </ul>
            </nav> 
            </Flex>

        </Box>

    )
};

export default Header;


