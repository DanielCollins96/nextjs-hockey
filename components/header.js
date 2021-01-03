import Link from 'next/link'
import s from './header.module.css'
const Header = () => {
    return (
        <div className={s.navbar}>
            <h2>Those stats fam</h2>
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
                </ul>
            </nav>
        </div>

    )
};

export default Header;


