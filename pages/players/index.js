import { useState, useEffect, useMemo } from 'react'
import { useQuery, useQueries } from 'react-query';
import TeamBox from '../../components/TeamBox'; 
import Link from 'next/link';

import ReactTable from '../../components/PaginatedTable';

export default function Players() {
    // Write a query with useQuery to fetch from api/players
    const [filteredPlayers, setFilteredPlayers] = useState([]);

    const fetchPlayers = async () => {
        const res = await fetch('/api/players');
        const resJson = await res.json();
        return resJson;
    }

    const { isLoading, isError, data } = useQuery('players', fetchPlayers);

    const columns = useMemo(
        () => [
             {
                 header: 'Rank',
                 accessorKey: 'row_number',
             },
                          {
                 header: 'Team',
                 accessorFn: (d) => d['team.name'],
                //  cell: (props) => props.getValue(),
                 cell: ({row}) =>(<Link href={`/teams/${row.original['team.id']}`} passHref ><a className=" hover:text-blue-700 visited:text-purple-800">{row.original['team.name']}</a></Link>)
             },
             {
                 header: 'Name',
                 accessorKey: 'fullName',
            cell: ({row}) => (<Link href={`/players/${row.original.id}`} passHref ><a className=" hover:text-blue-700 visited:text-purple-800">{row.original.fullName}</a></Link>)
             },
                   {
        header: "Pos.",
        accessorFn: (d) => d["primaryPosition.code"],
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
            {data ? <ReactTable columns={columns} data={data} sortKey='P'/> : <h3>Loading...</h3>} 
        </div>
    )
}
