import {useState, useCallback} from "react";
import { MdExpandMore, MdExpandLess, MdOutlineChevronLeft, MdAccessibility } from "react-icons/md";
import Link from 'next/link'

export default function TeamBox({team}) {
  const [active, setActive] = useState(false)

  const PlayerListItem = ({ person }) => (
    <li key={person?.id} className="odd:bg-slate-100 dark:odd:bg-gray-700 dark:even:bg-gray-800 px-1 divide-x dark:divide-gray-600">
      <Link
        href={`/players/${encodeURIComponent(person.id)}`}
        className="text-sm hover:text-blue-700 dark:text-gray-200 dark:hover:text-blue-400 visited:text-purple-800 dark:visited:text-purple-400">
        <b>{person.sweaterNumber ? `${person.sweaterNumber} ` : ""}</b>
        {person.firstName + " " + person.lastName}
      </Link>
    </li>
  );

  return (
    <div>
      <div className={`relative overflow-hidden border border-black dark:border-gray-600 rounded bg-white dark:bg-gray-800 m-1 ${active ? 'max-h-full': 'max-h-32'} transition-maxHeight duration-500 ease-in-out`}>
        <div className="flex justify-between items-center">
          <h2 className="text-xl text-left p-2">
            <Link
              href={`/teams/${encodeURIComponent(team.team.id)}`}
              className="flex gap-3 ml-3 pr-3 hover:text-blue-700 dark:text-white dark:hover:text-blue-400">
              {team.team.name}
            </Link>
          </h2>
          <div className="grow cursor-pointer" onClick={() => setActive(v => !v)}>
            {
              active ? 
                <MdOutlineChevronLeft className="ml-auto dark:text-white" style={{"transition": "transform .3s","transform": "rotate(-90deg)"}} size={24}/> : 
                <MdOutlineChevronLeft className="ml-auto dark:text-white" style={{"transition": "transform .3s","transform": "rotate(0deg)"}} size={24}/>
            }
          </div>
        </div>
        <ul className="grid grid-cols-3 divide-x divide-y dark:divide-gray-600">
          {
            team?.roster?.forwards?.map((person) => (
              <PlayerListItem key={person.id} person={person} />
            ))
          }
          {
            team?.roster?.defensemen?.map((person) => (
              <PlayerListItem key={person.id} person={person} />
            ))
          }
          {
            team?.roster?.goalies?.map((person) => (
              <PlayerListItem key={person.id} person={person} />
            ))
          }
        </ul>
        <div 
          onClick={() => setActive(v => !v)} 
          className={`text-lg z-10 absolute bottom-0 text-center min-w-full bg-white dark:bg-gray-800 opacity-75 cursor-pointer dark:text-white ${active ? "hidden" : ""}`}
        >
          ...
        </div>
      </div>
    </div>
  );
}
