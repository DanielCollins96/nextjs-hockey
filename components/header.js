import Link from 'next/link'
import { useAuth } from '../contexts/Auth';
import s from './header.module.css'
import { Auth } from 'aws-amplify';
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
        <div className={s.navbar}>
            <div className={s.navbar}>
            <h2 className={s.logo}>Those stats fam &copy;</h2>
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
            </div>

            <nav>
                <ul className={s.list}>
                    { !user ?
                    <li className={s.list__item, s.signup}>
                        <Link href="/profile" >
                            <a>Profile <FaUserCircle /></a>
                        </Link>
                    </li>
                    :
                    <button className={s.signup} onClick={signOutHandler}>Sign Out  <FaSignOutAlt /></button>
                    }
                </ul>
            </nav> 
        </div>

    )
};

export default Header;


