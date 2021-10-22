import { Menu, Transition } from '@headlessui/react'
import Link from 'next/link'
import { useAuth } from '../contexts/Auth';


import {BsChevronDown} from 'react-icons/bs'

export default function ProfileButton() {

    const { logout } = useAuth()
    return (
        <div className="text-right relative">
        <Menu as="div" className="relative inline-block text-left">
            <Menu.Button className="inline-flex justify-center w-full px-4 py-2 text-sm font-bold text-white bg-black border border-gray-400 rounded-md bg-opacity-50 hover:bg-opacity-60 focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75">
                <span className="m-auto tracking-wide">Profile</span>
                <BsChevronDown className="my-auto ml-1" size={18}/>
            </Menu.Button>
            <Menu.Items className="z-30 origin-top-right absolute divide-y divide-gray-100 p-2 bg-white w-28 mt-2 border border-black rounded">
                <div className="flex flex-col divide-y text-center">
                    <Menu.Item>
                        {({active}) => (
                            <Link href="/messages">
                                <a>Messages</a>
                            </Link>
                        )}
                    </Menu.Item>
                    <Menu.Item>
                        {({active}) => (
                            <Link href="/profile">
                                <a>My Account</a>
                            </Link>
                        )}
                    </Menu.Item>
                    <Menu.Item>
                        <button onClick={() => logout()}>Logout</button>
                    </Menu.Item>
                </div>
            </Menu.Items>
        </Menu>
        </div>
    )
}