import {useState, useCallback} from "react";
import { MdExpandMore, MdExpandLess } from "react-icons/md";
import Link from 'next/link'


export default function TeamBox({team}) {
  const [active, setActive] = useState(false)

  return (
    <div>
      <div className={`overflow-hidden border border-black rounded bg-white p-2 m-2 ${active ? 'h-auto max-h-96': 'max-h-24'} transition-maxHeight duration-500 ease-in-out`}>
        <div className="flex justify-between items-center">
        <h2 className="text-xl text-left">
          <Link href={`/teams/${encodeURIComponent(team.id)}`}>
            <a>{team.name}</a>
          </Link>
        </h2>
        <div className="p-1" onClick={() => setActive(v => !v)}>
          {
            active ? <MdExpandLess size={24}/> : <MdExpandMore size={24}/>
          }
        </div>
        </div>
        <ul style={{ columns: 3 }}>
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
      </div>
    </div>
  );
}
