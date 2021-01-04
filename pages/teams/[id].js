import { useQuery, useQueries } from 'react-query';
import { letterFrequency } from '@visx/mock-data';
import { Group } from '@visx/group';
import { Bar } from '@visx/shape';
import { scaleLinear, scaleBand } from '@visx/scale';
import s from './team.module.css';

export default function TeamPage({id}) {
    const testData = letterFrequency;
    const width = 500;
    const height = 500;
    const margin = { top: 20, bottom: 20, left: 20, right: 20 };

    const xMax = width - margin.left - margin.right;
    const yMax = height - margin.top - margin.bottom;

    const x = d => d.letter;
    const y = d => +d.frequency * 100;

    const xScale = scaleBand({
        range: [0, xMax],
        round: true,
        domain: testData.map(x),
        padding: 0.4,
    });
    const yScale = scaleLinear({
        range: [yMax, 0],
        round: true,
        domain: [0, Math.max(...testData.map(y))],
    });

    const compose = (scale, accessor) => dataVal => scale(accessor(dataVal));
    const xPoint = compose(xScale, x);
    const yPoint = compose(yScale, y);
    
    const result = 
    useQueries
    ([
        { 
            queryKey: 'fetchTeam', 
            queryFn: async () => {
                const res = await fetch(`https://statsapi.web.nhl.com/api/v1/teams/${id}`);
                const teamRes = await res.json()
                return teamRes.teams
            }
        },
        { 
            queryKey: 'fetchYearlyStats', 
            queryFn: async () => {
                const res = await fetch(`https://statsapi.web.nhl.com/api/v1/teams/${id}?expand=team.stats&`);
                const seasonStats = await res.json()
                return seasonStats.teams
            },
            {
                enabled: team_data,
            }
        },
    ])
    const { 
        [0]: { data: team_data, isLoading: team_loading, isError: isTErr, error:  tErr}, 
        [1]: {data: season_data, isLoading: season_loading, isError: isSErr, error: sErr}, 
    } = result
    // const { isLoading, isError, data, error } = response
    // console.log(id)
    console.log(season_data)
    // if (season_loading || team_loading) {
    //     return <span>Loading...</span>
    //   }
    
    // if (isSErr || isTErr) {
    //     return <span>Error: </span>
    // }
    return (
        <div>
        {!isTErr && !!team_data ? 
        <div>
        <h3>{team_data[0].name}</h3>
        <p>{team_data[0].firstYearOfPlay}</p>
        <p>{team_data[0].officialSiteUrl}</p>
        </div>
        :
        <p>Data Not Found</p>}
        {/* <p>{JSON.stringify(team_data)}</p> */}
        
        <svg width={width} height={height}>
        {testData.map((d, i) => {
            const barHeight = yMax - yPoint(d);
            return (
            <Group key={`bar-${i}`}>
                <Bar
                x={xPoint(d)}
                y={yMax - barHeight}
                height={barHeight}
                width={xScale.bandwidth()}
                fill="#fc2e1c"
                />
            </Group>
            );
        })}
        </svg>

        </div>
    )
};

export async function getServerSideProps({params}) {
    console.log(params)
    return {
        props: params
    }
}