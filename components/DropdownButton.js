import { useState } from 'react'
import Link from 'next/link'
import { Auth, Typography, Button } from "@supabase/ui";
import { supabase } from '../api'
import { useAuth } from '../contexts/Auth';
import { FaUserCircle, FaSignOutAlt } from "react-icons/fa";


const DropdownButton = () => {
    const [open, setOpen] = useState(false)
    const { user } = Auth.useUser();

    const toggleOpen = () => {
        setOpen(!open)
    }

    if(!user) {
        return (
            <div>
                <Link>
                    <button type="button" class="inline-flex justify-center w-full rounded-md border border-gray-300 shadow-sm px-6 py-2 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-100 focus:ring-indigo-500" id="menu-button" aria-expanded="true" aria-haspopup="true">
                </Link>
            Login
            </button>
        </div>
        )
    }

    return (
            <div onClick={toggleOpen} class="relative inline-block text-left">
                <div>
                    <button type="button" class="inline-flex justify-center w-full rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-100 focus:ring-indigo-500" id="menu-button" aria-expanded="true" aria-haspopup="true">
                    My Account
                    {/* <!-- Heroicon name: solid/chevron-down --> */}
                    <svg class="-mr-1 ml-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                        <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd" />
                    </svg>
                    </button>
                </div>
                {/* <!--
                    Dropdown menu, show/hide based on menu state.

                    Entering: "transition ease-out duration-100"
                    From: "transform opacity-0 scale-95"
                    To: "transform opacity-100 scale-100"
                    Leaving: "transition ease-in duration-75"
                    From: "transform opacity-100 scale-100"
                    To: "transform opacity-0 scale-95"
                --> */}
                <div class={`z-40 origin-top-right absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none ${open ? '': 'hidden'}`} role="menu" aria-orientation="vertical" aria-labelledby="menu-button" tabindex="-1">
                <div class="py-1" role="none">
                    <Link href="/settings">
                        <a class="text-gray-700 block px-4 py-2 text-sm active:bg-gray-100 active:text-gray-900" role="menuitem" tabindex="-1" id="menu-item-0">Account Settings</a>
                    </Link>
                    <Link href="">
                        <a class="text-gray-700 block px-4 py-2 text-sm active:bg-gray-100 active:text-gray-900" role="menuitem" tabindex="-1" id="menu-item-1">Support</a>
                    </Link>
                <form method="POST" action="#" role="none">
                    <button type="submit" 
                        class="text-gray-700 block w-full text-left px-4 py-2 text-sm" 
                        role="menuitem" tabindex="-1" id="menu-item-3"
                        onClick={() => props.supabaseClient.auth.signOut()}>
                        Sign Out
                    </button>
                </form>
                </div>
            </div>
</div>
    )
};
export default DropdownButton;