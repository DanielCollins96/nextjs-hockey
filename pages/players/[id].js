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

    const position = person && person['primaryPosition.code'] ? person['primaryPosition.code'] : 'C';

    let playerStuff = position !== 'G' ? [
      {
        header: 'G',
        accessorFn: (d) => d["stat.goals"],
        footer: ({ table }) => table.getFilteredRowModel().rows?.filter((row) => 
                        row.getValue('GP') !== null && row.getValue('Lge')?.includes('NHL')
                    ).reduce((total, row) => total + row.getValue('G'), 0),
        cell: props => <p className="text-right">{props.getValue()}</p>
    },
   {
        header: 'A',
        accessorFn: (d) => d["stat.assists"],
        footer: ({ table }) => table.getFilteredRowModel().rows?.filter((row) => 
                        row.getValue('GP') !== null && row.getValue('Lge')?.includes('NHL')
                    ).reduce((total, row) => total + row.getValue('A'), 0),
        cell: props => <p className="text-right">{props.getValue()}</p>
    },
      {
        header: 'P',
        accessorFn: (d) => d["stat.points"],
        footer: ({ table }) => table.getFilteredRowModel().rows?.filter((row) => 
                        row.getValue('GP') !== null && row.getValue('Lge')?.includes('NHL')
                    ).reduce((total, row) => total + row.getValue('P'), 0),
        cell: props => <p className="text-right">{props.getValue()}</p>
    },
    {
        header: 'PIM',
        accessorFn: (d) => d["stat.pim"],
        footer: ({ table }) => table.getFilteredRowModel().rows?.filter((row) => 
                        row.getValue('GP') !== null && row.getValue('Lge')?.includes('NHL')
                    ).reduce((total, row) => total + row.getValue('PIM'), 0),
        cell: props => <p className="text-right">{props.getValue()}</p>
    },
    {
        header: '+/-',
        accessorFn: (d) => d["stat.plusMinus"],
        footer: ({ table }) => table.getFilteredRowModel().rows?.filter((row) => 
                        row.getValue('GP') !== null && row.getValue('Lge')?.includes('NHL')
                    ).reduce((total, row) => total + row.getValue('+/-'), 0),
        cell: props => <p className="text-right">{props.getValue()}</p>    },
    ] : [
      {
        header: 'W',
        accessorFn: (d) => d['stat.wins'],
        footer: ({ table }) => table.getFilteredRowModel().rows?.filter((row) => 
                        row.getValue('GP') !== null && row.getValue('Lge')?.includes('NHL')
                    ).reduce((total, row) => total + row.getValue('W'), 0),
    },
      {
        header: 'L',
        accessorFn: (d) => d['stat.losses'],
        footer: ({ table }) => table.getFilteredRowModel().rows?.filter((row) => 
                        row.getValue('GP') !== null && row.getValue('Lge')?.includes('NHL')
                    ).reduce((total, row) => total + row.getValue('L'), 0),
    },
      {
        header: 'GAA',
        accessorFn: (d) => d['stat.goalAgainstAverage'],
        cell: props => props.getValue()?.toFixed(2) || null,
        footer: ({ table }) => { 
          const nhlGames = table.getFilteredRowModel().rows?.filter((row) => 
                        row.getValue('GP') !== null && row.getValue('Lge')?.includes('NHL')
                    )
          let gp =  nhlGames.reduce((total, row) => total + row.getValue('GP'), 0)
          let totalGaa = nhlGames.reduce((total, row) => total + (row.getValue('GP') * row.getValue('GAA')), 0)
          let total = totalGaa / gp
          return total.toFixed(2) || null
        }
      },
      {
        header: 'SV%',
        accessorFn: (d) => d['stat.savePercentage'],
        cell: props => props.getValue()?.toFixed(3) || null,
        footer: ({ table }) => { 
          const nhlGames = table.getFilteredRowModel().rows?.filter((row) => 
                        row.getValue('GP') !== null && row.getValue('Lge')?.includes('NHL')
                    )
          let gp =  nhlGames.reduce((total, row) => total + row.getValue('GP'), 0)
          let totalSvPct = nhlGames.reduce((total, row) => total + (row.getValue('GP') * row.getValue('SV%')), 0)
          let total = totalSvPct / gp
          return total.toFixed(3) || null
        }
    },
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
                 header: 'Lge',
                 accessorFn: (d) => d['league.name'].replace('National Hockey League', 'NHL'),
                //  cell: props => props,
                 footer: 'NHL',
             },
            {
                 header: 'GP',
                 accessorFn: (d) => d["stat.games"],
                 cell: props => <p className="text-right">{props.getValue()}</p>,
                 footer: ({ table }) => {
                   const filteredRows = table.getFilteredRowModel().rows?.filter((row) => 
                        row.getValue('GP') !== null && row.getValue('Lge')?.includes('NHL')
                    );

                    return filteredRows.reduce((total, row) => total + row.getValue('GP'), 0)
                },    
             },
            ...playerStuff
        ],
        [position]
    )
    const data = useMemo(
        () => stats
    , [])

    if (!person) {
        return <p className='text-lg font-bold text-center'>Player Not Found... Return {' '}
    <Link href="/">
      <a className='text-blue-600 hover:text-blue-800'>Home</a>
    </Link>
        </p>
    }
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
                <div className='border'>
                    <p>Drafted: {person?.draft_seasons ? person?.draft_seasons : 'Undrafted'}</p>
                    <p>Position: {person?.draft_position ? '#' + person?.draft_position : 'N/A'}</p>
                </div>
            </div>
            {stats ? <ReactTable columns={columns} data={stats} /> : <h3>Loading...</h3>} 
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
    let person = null
    try {
        person = await getPlayer(id)
        if (person.length == 0) {
            return {
            props: {
                playerId: params.id,
                stats: null,
                person: null,
                }
            }
        }
    } catch (error) {
        console.log(error);
    }
    const stats = await getPlayerStats(id)
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
            person: person ? person[0] : null,
            imageData
            },
            revalidate: 43200
}}

export default Players;