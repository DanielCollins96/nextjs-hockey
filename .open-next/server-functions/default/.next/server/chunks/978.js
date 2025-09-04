"use strict";exports.id=978,exports.ids=[978],exports.modules={4351:(e,s,a)=>{a.a(e,async(e,t)=>{try{a.d(s,{Z:()=>i});var o=a(997),n=a(6869),l=a(6689),r=e([n]);function i({columns:e,data:s,sortKey:a="season"}){let[t,r]=(0,l.useState)([{id:a,desc:!0}]),i=(0,n.useReactTable)({columns:e,data:s,state:{sorting:t},onSortingChange:r,getCoreRowModel:(0,n.getCoreRowModel)(),getSortedRowModel:(0,n.getSortedRowModel)()});return(0,o.jsxs)("table",{className:"border border-black px-1 m-1 ",children:[o.jsx("thead",{children:i.getHeaderGroups().map(e=>o.jsx("tr",{children:e.headers.map(e=>o.jsx("th",{className:"px-1 whitespace-nowrap bg-white border border-blue-600",colSpan:e.colSpan,children:e.isPlaceholder?null:(0,o.jsxs)("div",{className:e.column.getCanSort()?"cursor-pointer select-none":"",onClick:e.column.getToggleSortingHandler(),children:[(0,n.flexRender)(e.column.columnDef.header,e.getContext()),o.jsx("span",{className:"text-sm",children:{asc:" \uD83D\uDD3C",desc:" \uD83D\uDD3D"}[e.column.getIsSorted()]??null})]})},e.id))},e.id))}),o.jsx("tbody",{className:"",children:i.getRowModel().rows?.map((e,s)=>{let a=e?.original["league.name"]=="National Hockey League";return o.jsx("tr",{className:"whitespace-nowrap "+(a?"bg-slate-200":""),children:e.getVisibleCells().map(e=>o.jsx("td",{className:"border-black border px-1 text-sm",children:n.flexRender(e.column.columnDef.cell,e.getContext())},e.id))},e.id)})}),o.jsx("tfoot",{children:i.getFooterGroups().map((e,s)=>o.jsx("tr",{className:"bg-slate-300 py-px text-center font-bold",children:e.headers.map(e=>(0,o.jsxs)("td",{colSpan:e.colSpan,className:"border-black",children:[e.isPlaceholder?null:(0,n.flexRender)(e.column.columnDef.footer,e.getContext())," "]},e.id))},e.id))})]})}n=(r.then?(await r)():r)[0],t()}catch(e){t(e)}})},7841:(e,s,a)=>{a.d(s,{Z:()=>o});let t=new(a(5900)).Pool({user:process.env.DB_USER,password:process.env.DB_PASS,host:process.env.DB_URL,port:process.env.DB_PORT,database:process.env.DB_NAME,max:30,idleTimeoutMillis:3e4,connectionTimeoutMillis:8e3});t.on("error",(e,s)=>{console.error("Unexpected error on idle client",e)});let o=t},5730:(e,s,a)=>{a.d(s,{KR:()=>p,LK:()=>i,P_:()=>d,Q6:()=>l,RC:()=>n,Ug:()=>o,eJ:()=>r,n8:()=>E,p4:()=>g,pL:()=>N,ti:()=>S});var t=a(7841);async function o(e,s){try{let a=`SELECT ${("Goalie"!==s?['"season"','"league.name"','"team.id"','"team.name"','"stat.games"','"stat.goals"','"stat.pim"','"stat.plusMinus"','"stat.points"','"stat.assists"']:['"season"','"league.name"','"team.id"','"team.name"','"stat.games"','"stat.wins"','"stat.losses"','"stat.goals"','"stat.savePercentage"','"stat.goalAgainstAverage"','"stat.shutouts"','"stat.pim"','"stat.plusMinus"','"stat.points"','"stat.assists"']).join(", ")}
                 FROM staging1.player_stats_new ps
                 WHERE ps."person.id" = $1`;return(await t.Z.query(a,[e])).rows}catch(e){console.log(e)}}async function n(e){try{let s=`
        SELECT p.id,"fullName",p."birthDate",p."birthCountry"
			 ,p."primaryPosition.name"
			 ,p."primaryNumber"
			 ,p."currentAge"
			 ,ARRAY_AGG(d."draftYear") AS draft_seasons,ARRAY_AGG(d."overallPickNumber") AS draft_position
        FROM staging1.player p
        LEFT JOIN staging1.drafts d 
        ON d."playerId" = p.id
        WHERE p.id = $1
        GROUP BY
            p.id,
            p."fullName",
            p."birthDate",
            p."birthCountry",
            p."primaryPosition.name",
            p."primaryNumber",
            p."currentAge";
        `,a=await t.Z.query(s,[e]);return a=a.rows}catch(e){console.log({tst_er:e})}}async function l(){try{let e=`
        SELECT DISTINCT "draftYear"
        FROM staging1.drafts
        ORDER BY "draftYear" desc
        `,s=await t.Z.query(e);return s=s.rows}catch(e){console.log({tst_er:e})}}async function r(e){try{let s=`
    select "playerId","overallPickNumber","pickInRound","roundNumber","playerName","position","amateurLeague","amateurClubName","triCode","birthPlace","draftedByTeamId"
    , SUM("stat.games") as games
    , SUM(ps."stat.goals") as goals
    , SUM(ps."stat.assists") as assists
    , SUM("stat.points") as points
    , SUM("stat.pim") as pim
    ,CASE
        WHEN MAX("season") IS NOT NULL THEN
        CONCAT(SUBSTRING(CAST(MAX("season") AS text), 1, 4), '-', SUBSTRING(CAST(MAX("season") AS text), 5))
        ELSE
        CAST(MAX("season") AS text)
    END AS last_season
    -- ,*
    from staging1.drafts d
    LEFT JOIN staging1.player_stats ps ON d."playerId" = ps."person.id" AND "league.id" = 133
    WHERE "draftYear" = $1
    GROUP BY "playerId","overallPickNumber","pickInRound","roundNumber","playerName","position","amateurLeague","amateurClubName","triCode","birthPlace","draftedByTeamId"
    ORDER BY "overallPickNumber" 

    `,a=await t.Z.query(s,[e]);return a=a.rows}catch(e){throw console.log({tst_er:e}),e}}async function i(){try{let e=`
        SELECT abbreviation, name, id
        FROM staging1.team
        ORDER BY name;
        `,s=await t.Z.query(e);return s=s.rows}catch(e){console.log({tst_er:e})}}async function E(){try{let e=`
        SELECT id
        FROM staging1.team
        `,s=await t.Z.query(e);return s=s.rows}catch(e){console.log({tst_er:e})}}async function g(e){try{let s=`
        SELECT "seasonId", "wins", "losses", "points"
        ,"goalsAgainstPerGame","goalsForPerGame", "regulationAndOtWins" as "row"
        , "pointPct", "winsInShootout"
        FROM Staging1.team_season
        WHERE "teamId" = $1
        ORDER BY "seasonId" desc 
        LIMIT 8
        `,a=await t.Z.query(s,[e]);return a=a.rows}catch(e){console.log({tst_er:e})}}async function p(e){try{let s=`
WITH combined_data AS (
  SELECT 
    t.id, 
    sk."playerId", 
    sk.season, 
    sk."triCode",
    CONCAT(sk."firstName", ' ', sk."lastName") AS "fullName",
    SUM(CASE WHEN sk."gameType" = 2 THEN sk."gamesPlayed" ELSE 0 END) AS "gamesPlayed",
    SUM(CASE WHEN sk."gameType" = 3 THEN sk."gamesPlayed" ELSE 0 END) AS "playoffGamesPlayed",
    SUM(CASE WHEN sk."gameType" = 2 THEN sk."goals" ELSE 0 END) AS "goals",
    SUM(CASE WHEN sk."gameType" = 3 THEN sk."goals" ELSE 0 END) AS "playoffGoals",
    SUM(CASE WHEN sk."gameType" = 2 THEN sk."assists" ELSE 0 END) AS "assists",
    SUM(CASE WHEN sk."gameType" = 3 THEN sk."assists" ELSE 0 END) AS "playoffAssists",
    SUM(CASE WHEN sk."gameType" = 2 THEN sk."points" ELSE 0 END) AS "points",
    SUM(CASE WHEN sk."gameType" = 3 THEN sk."points" ELSE 0 END) AS "playoffPoints",
    SUM(CASE WHEN sk."gameType" = 2 THEN sk."penaltyMinutes" ELSE 0 END) AS "penaltyMinutes",
    SUM(CASE WHEN sk."gameType" = 3 THEN sk."penaltyMinutes" ELSE 0 END) AS "playoffPenaltyMinutes",
    SUM(CASE WHEN sk."gameType" = 2 THEN sk."plusMinus" ELSE 0 END) AS "plusMinus",
    SUM(CASE WHEN sk."gameType" = 3 THEN sk."plusMinus" ELSE 0 END) AS "playoffPlusMinus",
    sk."positionCode"
  FROM newapi.skaters sk
  JOIN newapi.team t ON sk."triCode" = t."triCode"
  WHERE t.id = $1
  GROUP BY t.id, sk."playerId", sk.season, sk."triCode", sk."firstName", sk."lastName", sk."positionCode"
)
SELECT DISTINCT 
  id, 
  "playerId", 
  season, 
  "triCode", 
  "fullName", 
  "gamesPlayed", 
  "playoffGamesPlayed",
  "goals", 
  "playoffGoals",
  "assists", 
  "playoffAssists",
  "points",
  "playoffPoints",
  "penaltyMinutes", 
  "playoffPenaltyMinutes",
  "plusMinus", 
  "playoffPlusMinus",
  "positionCode"
FROM combined_data;
        `,a=await t.Z.query(s,[e]);return a=a.rows}catch(e){console.log(e)}}async function S(e){try{let s=`
    WITH combined_goalie_data AS (
  SELECT 
    t.id, 
    g."playerId", 
    g.season, 
    g."team", 
    CONCAT(g."firstName", ' ', g."lastName") AS "fullName",
    SUM(CASE WHEN g."gameType" = 2 THEN g."gamesPlayed" ELSE 0 END) AS "gamesPlayed",
    SUM(CASE WHEN g."gameType" = 3 THEN g."gamesPlayed" ELSE 0 END) AS "playoffGamesPlayed",
    SUM(CASE WHEN g."gameType" = 2 THEN g."goals" ELSE 0 END) AS "goals",
    SUM(CASE WHEN g."gameType" = 3 THEN g."goals" ELSE 0 END) AS "playoffGoals",
    SUM(CASE WHEN g."gameType" = 2 THEN g."assists" ELSE 0 END) AS "assists",
    SUM(CASE WHEN g."gameType" = 3 THEN g."assists" ELSE 0 END) AS "playoffAssists",
    SUM(CASE WHEN g."gameType" = 2 THEN g."points" ELSE 0 END) AS "points",
    SUM(CASE WHEN g."gameType" = 3 THEN g."points" ELSE 0 END) AS "playoffPoints",
    SUM(CASE WHEN g."gameType" = 2 THEN g."wins" ELSE 0 END) AS "wins",
    SUM(CASE WHEN g."gameType" = 3 THEN g."wins" ELSE 0 END) AS "playoffWins",
    SUM(CASE WHEN g."gameType" = 2 THEN g."losses" ELSE 0 END) AS "losses",
    SUM(CASE WHEN g."gameType" = 3 THEN g."losses" ELSE 0 END) AS "playoffLosses",
    AVG(CASE WHEN g."gameType" = 2 THEN g."goalsAgainstAverage" END) AS "goalsAgainstAverage",
    AVG(CASE WHEN g."gameType" = 3 THEN g."goalsAgainstAverage" END) AS "playoffGoalsAgainstAverage",
    AVG(CASE WHEN g."gameType" = 2 THEN g."savePercentage" END) AS "savePercentage",
    AVG(CASE WHEN g."gameType" = 3 THEN g."savePercentage" END) AS "playoffSavePercentage",
    SUM(CASE WHEN g."gameType" = 2 THEN g."penaltyMinutes" ELSE 0 END) AS "penaltyMinutes",
    SUM(CASE WHEN g."gameType" = 3 THEN g."penaltyMinutes" ELSE 0 END) AS "playoffPenaltyMinutes"
  FROM newapi.goalies g
  JOIN newapi.team t ON g."team" = t."triCode"
  WHERE t.id = $1
  GROUP BY t.id, g."playerId", g.season, g.team, g."firstName", g."lastName"
)
SELECT DISTINCT 
  id, 
  "playerId", 
  season, 
  "team", 
  "fullName", 
  "gamesPlayed", 
  "playoffGamesPlayed",
  "goals", 
  "playoffGoals",
  "assists", 
  "playoffAssists",
  "points",
  "playoffPoints",
  "wins", 
  "playoffWins",
  "losses", 
  "playoffLosses",
  "goalsAgainstAverage", 
  "playoffGoalsAgainstAverage",
  "savePercentage", 
  "playoffSavePercentage",
  "penaltyMinutes", 
  "playoffPenaltyMinutes"
FROM combined_goalie_data;
        `,a=await t.Z.query(s,[e]);return a=a.rows}catch(e){console.log({tst_er:e})}}async function d(e){try{let s=`
        SELECT season
        FROM staging1."team.gametypes"
        WHERE 3 = ANY("gameTypes")
        AND abbreviation = $1
        `,a=await t.Z.query(s,[e]);return a=a.rows.map(e=>e.season)}catch(e){console.log({tst_er:e})}}async function N(e=20222023){try{let s=`
        SELECT     ROW_NUMBER() OVER (ORDER BY ps."stat.points" DESC NULLS LAST, ps."stat.goals" DESC NULLS LAST) AS row_number,
        p."fullName", p.id, p."primaryPosition.code", ps."season", ps."team.name", ps."stat.goals", ps."stat.games",ps."stat.assists", ps."stat.points", ps."team.id"
        FROM staging1.player_stats_new ps
        INNER JOIN staging1.player p
        ON p.id = ps."person.id" AND ps.season = $1
        WHERE ps."league.id" = 133
        ORDER BY ps."stat.points" DESC NULLS LAST,ps."stat.goals" DESC NULLS LAST
        LIMIT 200
        `,a=await t.Z.query(s,[e]);return a=a.rows}catch(e){console.log({tst_er:e})}}},5949:(e,s,a)=>{a.r(s),a.d(s,{default:()=>r});var t=a(997);a(6689);var o=a(6859),n=a.n(o);a(4298);class l extends n(){static async getInitialProps(e){return{...await n().getInitialProps(e)}}render(){return(0,t.jsxs)(o.Html,{lang:"en",children:[t.jsx(o.Head,{children:t.jsx("link",{rel:"icon",sizes:"96x96",href:"/images/Hockey-Net.svg"})}),(0,t.jsxs)("body",{className:"bg-gray-100",children:[t.jsx(o.Main,{}),t.jsx(o.NextScript,{})]})]})}}let r=l}};