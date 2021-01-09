import Link from 'next/link'
import s from './header.module.css'
const Header = () => {
    return (
        <div className={s.navbar}>
            <div className={s.flex}>

            <h2 className={s.logo}>Those stats fam &copy;</h2>
            <nav>
                <ul className={s.list}>
                    <Link href="/">
                        <a className={s.link}>Home</a>
                    </Link>
                    <Link href="/players">
                        <a className={s.link}>Players</a>
                    </Link>
                    <Link href="/teams">
                        <a className={s.link}>Teams</a>
                    </Link>
                    <Link href="/chart">
                        <a className={s.link}>Chart Maker</a>
                    </Link>
                </ul>
            </nav>
            </div>
            <nav>
                <ul>
                    <Link href="/login">
                        <a className={s.link}>Login</a>
                    </Link>
                    <Link href="/signup">
                        <a className={s.link}>Sign-Up</a>
                    </Link>
                </ul>
            </nav>
        </div>

    )
};

export default Header;


