import {useState, useCallback} from "react";
import { MdExpandMore, MdExpandLess } from "react-icons/md";
import Link from 'next/link'
// import Image from 'next/image'



export default function TeamBox({team}) {
  const [active, setActive] = useState(false)

  return (
    <div>
      <div className={`relative overflow-hidden border border-black rounded bg-white  m-2 ${active ? 'h-auto max-h-full': 'max-h-32'} transition-maxHeight duration-500 ease-in-out`}>
        <div className="flex justify-between items-center">
        <h2 className="text-xl text-left p-2">
          <div className="flex">
          <img src={`https://www-league.nhlstatic.com/images/logos/teams-current-primary-light/${team.id}.svg`} alt="" width="40" height="26" />
          <Link href={`/teams/${encodeURIComponent(team.id)}`} >
            <a className="ml-3 pr-3">{team.name}</a>
          </Link>
          </div>
        </h2>
        <div className="pl-20 pr-2" onClick={() => setActive(v => !v)}>
          {
            active ? <MdExpandLess size={24}/> : <MdExpandMore size={24}/>
          }
        </div>
        </div>
        <ul style={{ columns: 3 }} className="p-1" >
          {team.roster?.roster
            .sort((playerA, playerB) => {
              return playerA.person.fullName > playerB.person.fullName ? 1 : -1;
            })
            .map((person) => {
              return (
                <li key={person.person?.id}>
                  {/* <p>{person.person.fullName}</p> */}
                  <Link
                    href={`/players/${encodeURIComponent(person.person?.id)}`}
                  >
                    <a className="text-sm">{person.person?.fullName}</a>
                  </Link>
                </li>
              );
            })}
        </ul>
        <div onClick={() => setActive(v => !v)} className={`text-lg z-10 absolute bottom-0 text-center min-w-full	bg-white opacity-75 ${active ? "hidden" : ""}`}>...</div>
      </div>
    </div>
  );
}
