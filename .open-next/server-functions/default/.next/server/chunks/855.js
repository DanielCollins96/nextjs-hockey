try{!function(){var e="undefined"!=typeof window?window:"undefined"!=typeof global?global:"undefined"!=typeof globalThis?globalThis:"undefined"!=typeof self?self:{},s=(new e.Error).stack;s&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[s]="fc7d1dae-d433-45e1-a21b-e03fd60984d2",e._sentryDebugIdIdentifier="sentry-dbid-fc7d1dae-d433-45e1-a21b-e03fd60984d2")}()}catch(e){}"use strict";exports.id=855,exports.ids=[855],exports.modules={51197:(e,s,a)=>{a.r(s),a.d(s,{default:()=>m,getServerSideProps:()=>y,getStaticProps:()=>c});var t=a(20997);a(16689);var o=a(56859),n=a.n(o);a(4298);var r=a(58097);class i extends n(){static async getInitialProps(e){return{...await n().getInitialProps(e)}}render(){return(0,t.jsxs)(o.Html,{lang:"en",children:[(0,t.jsx)(o.Head,{children:(0,t.jsx)("link",{rel:"icon",sizes:"96x96",href:"/images/Hockey-Net.svg"})}),(0,t.jsxs)("body",{className:"bg-gray-100",children:[(0,t.jsx)(o.Main,{}),(0,t.jsx)(o.NextScript,{})]})]})}}var l=Object.freeze({__proto__:null,default:i});let p=l?l.default:void 0,E=p?p.getInitialProps:void 0,g=l?l.getStaticProps:void 0,d=l?l.getServerSideProps:void 0,S=Object.freeze({"/_app":r.wrapAppGetInitialPropsWithSentry,"/_document":r.wrapDocumentGetInitialPropsWithSentry,"/_error":r.wrapErrorGetInitialPropsWithSentry})["/_document"]||r.wrapGetInitialPropsWithSentry;p&&"function"==typeof E&&(p.getInitialProps=S(E));let c="function"==typeof g?r.wrapGetStaticPropsWithSentry(g,"/_document"):void 0,y="function"==typeof d?r.wrapGetServerSidePropsWithSentry(d,"/_document"):void 0,m=p?r.wrapPageComponentWithSentry(p):p},9915:(e,s,a)=>{a.a(e,async(e,t)=>{try{a.d(s,{Z:()=>l});var o=a(20997),n=a(46869),r=a(16689),i=e([n]);function l({columns:e,data:s,sortKey:a="season"}){let[t,i]=(0,r.useState)([{id:a,desc:!0}]),l=(0,n.useReactTable)({columns:e,data:s,state:{sorting:t},onSortingChange:i,getCoreRowModel:(0,n.getCoreRowModel)(),getSortedRowModel:(0,n.getSortedRowModel)()});return(0,o.jsxs)("table",{className:"border border-black px-1 m-1 ",children:[o.jsx("thead",{children:l.getHeaderGroups().map(e=>o.jsx("tr",{children:e.headers.map(e=>o.jsx("th",{className:"px-1 whitespace-nowrap bg-white border border-blue-600",colSpan:e.colSpan,children:e.isPlaceholder?null:(0,o.jsxs)("div",{className:e.column.getCanSort()?"cursor-pointer select-none":"",onClick:e.column.getToggleSortingHandler(),children:[(0,n.flexRender)(e.column.columnDef.header,e.getContext()),o.jsx("span",{className:"text-sm",children:{asc:" \uD83D\uDD3C",desc:" \uD83D\uDD3D"}[e.column.getIsSorted()]??null})]})},e.id))},e.id))}),o.jsx("tbody",{className:"",children:l.getRowModel().rows?.map((e,s)=>{let a=e?.original["league.name"]=="National Hockey League";return o.jsx("tr",{className:"whitespace-nowrap "+(a?"bg-slate-200":""),children:e.getVisibleCells().map(e=>o.jsx("td",{className:"border-black border px-1 text-sm",children:n.flexRender(e.column.columnDef.cell,e.getContext())},e.id))},e.id)})}),o.jsx("tfoot",{children:l.getFooterGroups().map((e,s)=>o.jsx("tr",{className:"bg-slate-300 py-px text-center font-bold",children:e.headers.map(e=>(0,o.jsxs)("td",{colSpan:e.colSpan,className:"border-black",children:[e.isPlaceholder?null:(0,n.flexRender)(e.column.columnDef.footer,e.getContext())," "]},e.id))},e.id))})]})}n=(i.then?(await i)():i)[0],t()}catch(e){t(e)}})},10254:(e,s,a)=>{a.d(s,{Z:()=>o});let t=new(a(35900)).Pool({user:process.env.DB_USER,password:process.env.DB_PASS,host:process.env.DB_URL,port:process.env.DB_PORT,database:process.env.DB_NAME,max:30,idleTimeoutMillis:3e4,connectionTimeoutMillis:8e3});t.on("error",(e,s)=>{console.error("Unexpected error on idle client",e)});let o=t},32431:(e,s,a)=>{a.d(s,{KR:()=>g,LK:()=>l,P_:()=>S,Q6:()=>r,RC:()=>n,Ug:()=>o,eJ:()=>i,n8:()=>p,p4:()=>E,pL:()=>c,ti:()=>d});var t=a(10254);async function o(e,s){try{let a=`SELECT ${("Goalie"!==s?['"season"','"league.name"','"team.id"','"team.name"','"stat.games"','"stat.goals"','"stat.pim"','"stat.plusMinus"','"stat.points"','"stat.assists"']:['"season"','"league.name"','"team.id"','"team.name"','"stat.games"','"stat.wins"','"stat.losses"','"stat.goals"','"stat.savePercentage"','"stat.goalAgainstAverage"','"stat.shutouts"','"stat.pim"','"stat.plusMinus"','"stat.points"','"stat.assists"']).join(", ")}
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
        `,a=await t.Z.query(s,[e]);return a=a.rows}catch(e){console.log({tst_er:e})}}async function r(){try{let e=`
        SELECT DISTINCT "draftYear"
        FROM staging1.drafts
        ORDER BY "draftYear" desc
        `,s=await t.Z.query(e);return s=s.rows}catch(e){console.log({tst_er:e})}}async function i(e){try{let s=`
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

    `,a=await t.Z.query(s,[e]);return a=a.rows}catch(e){throw console.log({tst_er:e}),e}}async function l(){try{let e=`
        SELECT abbreviation, name, id
        FROM staging1.team
        ORDER BY name;
        `,s=await t.Z.query(e);return s=s.rows}catch(e){console.log({tst_er:e})}}async function p(){try{let e=`
        SELECT id
        FROM staging1.team
        `,s=await t.Z.query(e);return s=s.rows}catch(e){console.log({tst_er:e})}}async function E(e){try{let s=`
        SELECT "seasonId", "wins", "losses", "points"
        ,"goalsAgainstPerGame","goalsForPerGame", "regulationAndOtWins" as "row"
        , "pointPct", "winsInShootout"
        FROM Staging1.team_season
        WHERE "teamId" = $1
        ORDER BY "seasonId" desc 
        LIMIT 8
        `,a=await t.Z.query(s,[e]);return a=a.rows}catch(e){console.log({tst_er:e})}}async function g(e){try{let s=`
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
        `,a=await t.Z.query(s,[e]);return a=a.rows}catch(e){console.log(e)}}async function d(e){try{let s=`
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
        `,a=await t.Z.query(s,[e]);return a=a.rows}catch(e){console.log({tst_er:e})}}async function S(e){try{let s=`
        SELECT season
        FROM staging1."team.gametypes"
        WHERE 3 = ANY("gameTypes")
        AND abbreviation = $1
        `,a=await t.Z.query(s,[e]);return a=a.rows.map(e=>e.season)}catch(e){console.log({tst_er:e})}}async function c(e=20222023){try{let s=`
        SELECT     ROW_NUMBER() OVER (ORDER BY ps."stat.points" DESC NULLS LAST, ps."stat.goals" DESC NULLS LAST) AS row_number,
        p."fullName", p.id, p."primaryPosition.code", ps."season", ps."team.name", ps."stat.goals", ps."stat.games",ps."stat.assists", ps."stat.points", ps."team.id"
        FROM staging1.player_stats_new ps
        INNER JOIN staging1.player p
        ON p.id = ps."person.id" AND ps.season = $1
        WHERE ps."league.id" = 133
        ORDER BY ps."stat.points" DESC NULLS LAST,ps."stat.goals" DESC NULLS LAST
        LIMIT 200
        `,a=await t.Z.query(s,[e]);return a=a.rows}catch(e){console.log({tst_er:e})}}}};
//# sourceMappingURL=855.js.map