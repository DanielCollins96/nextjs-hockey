import { Menu, Transition } from '@headlessui/react'
import Link from 'next/link'
import { UseAuth } from '../contexts/Auth';


import {BiChevronDown} from 'react-icons/bi'

export default function ProfileButton() {

    const { logout } = UseAuth()
    return (
        <div className="text-right relative">
        <Menu as="div" className="relative inline-block text-left">
            <Menu.Button className="inline-flex justify-center w-full px-4 py-2 text-md font-bold text-white bg-black border border-gray-400 rounded-md bg-opacity-50 hover:bg-opacity-60 focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75">
                <span className="m-auto tracking-wide">Profile</span>
                <BiChevronDown className="my-auto ml-1 font-bold" size={26}/>
            </Menu.Button>
            <Menu.Items className="z-30 origin-top-right absolute divide-y divide-gray-100 p-2 bg-white w-28 mt-2 border border-black rounded">
                <div className="flex flex-col gap-1 divide-y text-center">
                    <Menu.Item>
                        {({active}) => (
                            <Link href="/messages">
                                <a className={`${active ? 'font-bold' : ''}`}>Messages</a>
                            </Link>
                        )}
                    </Menu.Item>
                    <Menu.Item>
                        {({active}) => (
                            <Link href="/profile">
                                <a className={`${active ? 'font-bold' : ''}`}>My Account</a>
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