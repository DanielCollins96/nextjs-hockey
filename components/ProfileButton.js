import { Menu, Transition } from '@headlessui/react'
import Link from 'next/link'
import { UseAuth } from '../contexts/Auth';


import {BiChevronDown} from 'react-icons/bi'

export default function ProfileButton({ onNavigate, className = "" }) {

    const { logout } = UseAuth()
    return (
        (<div className={`relative ${className}`}>
            <Menu as="div" className="relative block text-left">
                <Menu.Button className="inline-flex w-full items-center justify-center gap-1 rounded-md border border-gray-400 bg-black bg-opacity-50 px-3 py-2 text-sm font-bold text-white hover:bg-opacity-60 focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75 sm:text-md">
                    <span className="min-w-0 truncate tracking-wide">Profile</span>
                    <BiChevronDown className="shrink-0 font-bold" size={22}/>
                </Menu.Button>
                <Menu.Items className="z-30 origin-top-right absolute right-0 divide-y divide-gray-100 p-2 bg-white w-28 mt-2 border border-black rounded">
                    <div className="flex flex-col gap-1 divide-y text-center">
                        <Menu.Item>
                            {({active}) => (
                                <Link href="/messages" className={`${active ? 'font-bold' : ''}`} onClick={onNavigate}>
                                    Messages
                                </Link>
                            )}
                        </Menu.Item>
                        <Menu.Item>
                            {({active}) => (
                                <Link href="/profile" className={`${active ? 'font-bold' : ''}`} onClick={onNavigate}>
                                    My Account
                                </Link>
                            )}
                        </Menu.Item>
                        <Menu.Item>
                            <button onClick={() => logout()}>Logout</button>
                        </Menu.Item>
                    </div>
                </Menu.Items>
            </Menu>
        </div>)
    );
}
