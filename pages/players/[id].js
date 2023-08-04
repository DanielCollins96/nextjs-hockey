import { useMemo, useState } from 'react';
import Head from 'next/head'
import Link from 'next/link';
import { useQuery, useQueries } from 'react-query';
import { useRouter } from 'next/router';
import {getAllPlayerIds, getPlayer, getPlayerStats} from '../../lib/queries'
import ReactTable from '../../components/Table';
// https://statsapi.web.nhl.com/api/v1/people/8474056/stats/?stats=statsSingleSeason&season=20122013


const Players = ({playerId, stats, person, imageData}) => {

    const router = useRouter()
    const { id } = router.query

    // console.log({person})
    console.log({person:person['primaryPosition.code']})
    const position = person['primaryPosition.code'] || 'C';
    
    let playerStuff = position !== 'G' ? [
      {
        header: 'G',
        accessorFn: (d) => d["stat.goals"],
        // accessorKey: 'g',
        footer: ({ table }) => table.getFilteredRowModel().rows?.reduce((total, row) => total + row.getValue('G'), 0),
        cell: props => <p className="text-right">{props.getValue()}</p>
    },
   {
        header: 'A',
        accessorFn: (d) => d["stat.assists"],
        footer: ({ table }) => table.getFilteredRowModel().rows?.reduce((total, row) => total + row.getValue('A'), 0),
        cell: props => <p className="text-right">{props.getValue()}</p>
    },
      {
        header: 'P',
        accessorFn: (d) => d["stat.points"],
        footer: ({ table }) => table.getFilteredRowModel().rows?.reduce((total, row) => total + row.getValue('P'), 0),
        cell: props => <p className="text-right">{props.getValue()}</p>

    },
    {
        header: 'PIM',
        accessorFn: (d) => d["stat.pim"],
        footer: ({ table }) => table.getFilteredRowModel().rows?.reduce((total, row) => total + row.getValue('PIM'), 0),
        cell: props => <p className="text-right">{props.getValue()}</p>
    },
    {
        header: '+/-',
        accessorFn: (d) => d["stat.plusMinus"],
        footer: ({ table }) => table.getFilteredRowModel().rows?.reduce((total, row) => total + row.getValue('+/-'), 0),
        cell: props => <p className="text-right">{props.getValue()}</p>    },
    ] : [
      {
        header: 'W',
        accessorFn: (d) => d['stat.wins'],
        // footer: ({ table }) => table.getFilteredRowModel().rows?.filter((row) => row.getValue('gp') !== null && row.getValue('league').includes('NHL')).reduce((total, row) => total + row.getValue('w'), 0),

    },
    //   {
    //     header: 'L',
    //     accessorKey: 'l',
    //     footer: ({ table }) => table.getFilteredRowModel().rows?.filter((row) => row.getValue('gp') !== null && row.getValue('league').includes('NHL')).reduce((total, row) => total + row.getValue('l'), 0),

    // },
    //   {
    //     header: 'GAA',
    //     accessorKey: 'gaa',
    //     cell: props => props.getValue()?.toFixed(2) || null,
    //     footer: ({ table }) => { 
    //       const nhlGames = table.getFilteredRowModel().rows?.filter((row) => row.getValue('gp') !== null && row.getValue('league').includes('NHL'));
    //       let gp =  nhlGames.reduce((total, row) => total + row.getValue('gp'), 0)
    //       let totalGaa = nhlGames.reduce((total, row) => total + (row.getValue('gp') * row.getValue('gaa')), 0)
    //       let total = totalGaa / gp
    //       return total.toFixed(2) || null
    //     }
    //   },
    //   {
    //     header: 'SV%',
    //     accessorKey: 'svPct',
    //     cell: props => props.getValue()?.toFixed(3) || null,
    //     footer: ({ table }) => { 
    //       const nhlGames = table.getFilteredRowModel().rows?.filter((row) => row.getValue('gp') !== null && row.getValue('league').includes('NHL'));
    //       let gp =  nhlGames.reduce((total, row) => total + row.getValue('gp'), 0)
    //       let totalSvPct = nhlGames.reduce((total, row) => total + (row.getValue('gp') * row.getValue('svPct')), 0)
    //       let total = totalSvPct / gp
    //       return total.toFixed(3) || null
    //     }
    // },
    ]

    const columns = useMemo(
        () => [
             {
                 header: 'Season',
                 accessorKey: 'season',
             },
             {
                 header: 'Team',
                 accessorFn: (d) => d['team.name'],
                //  cell: (props) => props.getValue(),
                 cell: ({row}) => row.original['league.name'] == 'National Hockey League' ? (<Link href={`/teams/${row.original['team.id']}?season=${row.original.season}`} passHref ><a className=" hover:text-blue-700 visited:text-purple-800">{row.original['team.name']}</a></Link>) : (row.original['team.name'])
             },
            {
                 header: 'League',
                 accessorFn: (d) => d['league.name'].replace('National Hockey League', 'NHL'),
                //  cell: props => props,
                 footer: 'NHL',
             },
            {
                 header: 'GP',
                 accessorFn: (d) => d["stat.games"],
                 footer: ({ table }) => table.getFilteredRowModel().rows?.reduce((total, row) => total + row.getValue('GP'), 0),
             },
            ...playerStuff
        ],
        [position]
    )
    const data = useMemo(
        () => stats
    , [])

    return (
        <div className="flex flex-col sm:flex-row mt-2">
            <Head>
                <title>
                   {person?.fullName ? person.fullName : 'Player'} Hockey Stats and Profile | the-nhl.com
                </title>
                <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-2056923001767627"
     crossOrigin="anonymous"></script>
            </Head>
            <div className="flex flex-row sm:flex-col h-full justify-start items-center p-2 ml-2">
                <img src={imageData} alt="" />
                <div className="w-56 p-1 m-1">

                <p className="text-2xl font-bold">{person?.fullName}</p>
                <p>Birth Date: {person?.birthDate}</p>
                <p>Nationality: {person?.birthCountry}</p>
                <p>Position: {person?.primaryPosition?.name}</p>
                <p>Primary Number: {person?.primaryNumber}</p>
                <p>Age: {person?.currentAge}</p>
                </div>
            </div>
            <ReactTable columns={columns} data={stats} />
        </div>
    )
};

export async function getStaticPaths() {

    const ids = await getAllPlayerIds()
    let paths = ids?.map((res) => {
        return {
            params: {
                id: res.id
            }
        }
    })
    return {
        paths,
        fallback: true
    }
}

export async function getStaticProps({params}) {
    const { id } = params
    const stats = await getPlayerStats(id)
    const person = await getPlayer(id)
    let url = `http://nhl.bamcontent.com/images/headshots/current/168x168/${id}.jpg`
    let imageData = null
    try {
        const response = await fetch(url);
        const imageBuffer = await response.arrayBuffer();
        imageData = `data:image/jpeg;base64,${Buffer.from(imageBuffer).toString('base64')}`;
    } catch (error) {
        console.error('Error fetching image data:', error);
    }
    return {
        props: {
            playerId: params.id,
            stats,
            person: person[0],
            imageData
            }
}}

export default Players;