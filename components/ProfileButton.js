import { Menu } from '@headlessui/react'
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
                <Menu.Items className="absolute right-0 z-30 mt-2 w-40 origin-top-right overflow-hidden rounded-md border border-gray-200 bg-white py-1 text-sm shadow-lg dark:border-gray-700 dark:bg-gray-800">
                    <div className="flex flex-col">
                        <Menu.Item>
                            {({active}) => (
                                <Link href="/messages" className={`px-3 py-2 text-left text-gray-800 dark:text-gray-100 ${active ? 'bg-gray-100 dark:bg-gray-700' : ''}`} onClick={onNavigate}>
                                    Messages
                                </Link>
                            )}
                        </Menu.Item>
                        <Menu.Item>
                            {({active}) => (
                                <Link href="/profile" className={`px-3 py-2 text-left font-medium text-gray-900 dark:text-white ${active ? 'bg-gray-100 dark:bg-gray-700' : ''}`} onClick={onNavigate}>
                                    My Account
                                </Link>
                            )}
                        </Menu.Item>
                        <Menu.Item>
                            {({active}) => (
                                <button className={`px-3 py-2 text-left text-gray-800 dark:text-gray-100 ${active ? 'bg-gray-100 dark:bg-gray-700' : ''}`} onClick={() => logout()}>
                                    Logout
                                </button>
                            )}
                        </Menu.Item>
                    </div>
                </Menu.Items>
            </Menu>
        </div>)
    );
}
