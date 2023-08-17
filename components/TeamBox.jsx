import {useState, useCallback} from "react";
import { MdExpandMore, MdExpandLess, MdOutlineChevronLeft, MdAccessibility } from "react-icons/md";
import Link from 'next/link'
// import Image from 'next/image'



export default function TeamBox({team}) {
  const [active, setActive] = useState(false)

  return (
    <div>
      <div className={`relative overflow-hidden border border-black rounded bg-white m-1 ${active ? 'max-h-full': 'max-h-32'} transition-maxHeight duration-500 ease-in-out`}>
        <div className="flex justify-between items-center">
        <h2 className="text-xl text-left p-2">
          {/* <div className="flex"> */}
          <Link href={`/teams/${encodeURIComponent(team.id)}`} >
            <a className="flex  gap-3 ml-3 pr-3 hover:text-blue-700">
          <img src={`https://www-league.nhlstatic.com/images/logos/teams-current-primary-light/${team.id}.svg`} alt="" width="40" height="26" />
            {team.name}</a>
          </Link>
          {/* </div> */}
        </h2>
        <div className="pl-8 sm:pl-16 pr-2 cursor-pointer" onClick={() => setActive(v => !v)}>
          {
            active ? <MdOutlineChevronLeft style={{"transition": "transform .3s","transform": "rotate(-90deg)"}}  size={24}/> : <MdOutlineChevronLeft style={{"transition": "transform .3s","transform": "rotate(0deg)"}} size={24}/>
          }
        </div>
        </div>
        <ul  className="grid grid-cols-3 divide-x divide-y" >
          {team.roster?.roster
            .sort((playerA, playerB) => {
              return playerA.person.fullName > playerB.person.fullName ? 1 : -1;
            })
            .map((person) => {
              return (
                <li key={person.person?.id} className="odd:bg-slate-100 px-1 divide-x">
                  {/* <p>{person.person.fullName}</p> */}
                  <Link
                    href={`/players/${encodeURIComponent(person.person?.id)}`}
                  >
                    <a className="text-sm hover:text-blue-700 visited:text-purple-800">{person.person?.fullName}</a>
                  </Link>
                </li>
              );
            })}
        </ul>
        <div onClick={() => setActive(v => !v)} className={`text-lg z-10 absolute bottom-0 text-center min-w-full	bg-white opacity-75 cursor-pointer ${active ? "hidden" : ""}`}>...</div>
      </div>
    </div>
  );
}
