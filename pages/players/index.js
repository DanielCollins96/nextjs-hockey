import { useState, useMemo } from 'react'
import Link from 'next/link';
import { useRouter } from 'next/router';
import { MdOutlineChevronLeft, MdOutlineChevronRight } from 'react-icons/md';
import { getPointLeadersBySeason, getAvailableSeasons } from '../../lib/queries';

import ReactTable from '../../components/PaginatedTable';

export default function Players({players, season, availableSeasons}) {
    const router = useRouter();
    const [selectedSeason, setSelectedSeason] = useState(season);
    const [currentIndex, setCurrentIndex] = useState(availableSeasons.indexOf(season));
    // Write a query with useQuery to fetch from api/players
    const [filteredPlayers, setFilteredPlayers] = useState([]);
    const columns = useMemo(
        () => [
             {
                 header: 'Rk',
                 accessorKey: 'row_number',
                 cell: ({row}) => <div>{row.original.row_number}</div>
             },
                          {
                 header: 'Team',
                 accessorFn: (d) => d['team.name'],
                //  cell: (props) => props.getValue(),
                 cell: ({row}) =>(<Link
                     href={`/teams/${row.original['team.id']}`}
                     passHref
                     className=" hover:text-blue-700 visited:text-purple-800">{row.original['team.name']}</Link>)
             },
             {
                 header: 'Name',
                 accessorKey: 'player_name',
                cell: ({row}) => (<Link
                href={`/players/${row.original["playerId"]}`}
                passHref
                className=" hover:text-blue-700 visited:text-purple-800">{row.original.player_name}</Link>)
             },
            {
                header: "Pos.",
                accessorFn: (d) => d["position"],
            },
            {
                 header: 'GP',
                 accessorFn: (d) => d["stat.games"],
                 cell: props => <p className="text-right">{props.getValue()}</p>,
                //  footer: ({ table }) => {
                //    const filteredRows = table.getFilteredRowModel().rows?.filter((row) => 
                //         row.getValue('GP') !== null && row.getValue('League')?.includes('NHL')
                //     );

                //     return filteredRows.reduce((total, row) => total + row.getValue('GP'), 0)
                // },    
             },
                   {
        header: 'G',
        accessorFn: (d) => d["stat.goals"],
        // footer: ({ table }) => table.getFilteredRowModel().rows?.filter((row) => 
        //                 row.getValue('GP') !== null && row.getValue('League')?.includes('NHL')
        //             ).reduce((total, row) => total + row.getValue('G'), 0),
        cell: props => <p className="text-right">{props.getValue()}</p>
    },
   {
        header: 'A',
        accessorFn: (d) => d["stat.assists"],
        // footer: ({ table }) => table.getFilteredRowModel().rows?.filter((row) => 
        //                 row.getValue('GP') !== null && row.getValue('League')?.includes('NHL')
        //             ).reduce((total, row) => total + row.getValue('A'), 0),
        cell: props => <p className="text-right">{props.getValue()}</p>
    },
      {
        header: 'P',
        accessorFn: (d) => d["stat.points"],
        // footer: ({ table }) => table.getFilteredRowModel().rows?.filter((row) => 
        //                 row.getValue('GP') !== null && row.getValue('League')?.includes('NHL')
        //             ).reduce((total, row) => total + row.getValue('P'), 0),
        cell: props => <p className="text-right">{props.getValue()}</p>
    },
        ])

    const handleSeasonChange = (event) => {
        const newSeason = event.target.value;
        setSelectedSeason(newSeason);
        const newIndex = availableSeasons.indexOf(parseInt(newSeason));
        setCurrentIndex(newIndex);
        router.push(
            {
                pathname: router.pathname,
                query: { year: newSeason }
            },
            undefined,
            { shallow: false }
        );
    };

    const handlePreviousSeason = () => {
        if (currentIndex > 0) {
            const newIndex = currentIndex - 1;
            const newSeason = availableSeasons[newIndex];
            setCurrentIndex(newIndex);
            setSelectedSeason(newSeason);
            router.push(
                {
                    pathname: router.pathname,
                    query: { year: newSeason }
                },
                undefined,
                { shallow: false }
            );
        }
    };

    const handleNextSeason = () => {
        if (currentIndex < availableSeasons.length - 1) {
            const newIndex = currentIndex + 1;
            const newSeason = availableSeasons[newIndex];
            setCurrentIndex(newIndex);
            setSelectedSeason(newSeason);
            router.push(
                {
                    pathname: router.pathname,
                    query: { year: newSeason }
                },
                undefined,
                { shallow: false }
            );
        }
    };

    return (
        <div>
            <div className="border border-black dark:border-white p-1 rounded p-2 mb-4">
                <div className="flex items-center space-x-2">
                    <label className="px-1 dark:text-white font-medium" htmlFor="season">
                        Season:
                    </label>
                    <select
                        className="w-40 px-2 py-1 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={selectedSeason}
                        onChange={handleSeasonChange}
                    >
                        {availableSeasons &&
                            availableSeasons.map((szn) => (
                                <option key={szn} value={szn}>
                                    {String(szn).slice(0, 4)}-{String(szn).slice(4)}
                                </option>
                            ))}
                    </select>
                    <button
                        className="btn-blue m-1 btn-disabled"
                        onClick={handleNextSeason}
                        disabled={currentIndex >= availableSeasons.length - 1}
                    >
                        <MdOutlineChevronLeft size={28} />
                    </button>
                    <button
                        className="btn-blue m-1 btn-disabled"
                        onClick={handlePreviousSeason}
                        disabled={currentIndex <= 0}
                    >
                        <MdOutlineChevronRight size={28} />
                    </button>
                </div>
            </div>
            {players ? <ReactTable columns={columns} data={players} sortKey='P' filterCol={['player_name']}/> : <h3>Error Retrieving Stats...</h3>} 
        </div>
    )
}

export async function getServerSideProps(context) {
    const { year } = context.query;
    const season = year ? parseInt(year) : 20252026;
    
    const result = await getPointLeadersBySeason(season);
    const availableSeasons = await getAvailableSeasons();
    
    return {
        props: {
            players: result,
            season: season,
            availableSeasons: availableSeasons
        }
    }
}