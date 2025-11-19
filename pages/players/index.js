import { useState, useMemo } from 'react'
import Link from 'next/link';
import { getPointLeadersBySeason } from '../../lib/queries';

import ReactTable from '../../components/PaginatedTable';

export default function Players({players}) {
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
    return (
        <div>
            {players ? <ReactTable columns={columns} data={players} sortKey='P' filterCol={['player_name']}/> : <h3>Error Retrieving Stats...</h3>} 
        </div>
    )
}

export async function getStaticProps() {
    const result = await getPointLeadersBySeason()
    return {
        props: {
            players: result
        }
    }
}