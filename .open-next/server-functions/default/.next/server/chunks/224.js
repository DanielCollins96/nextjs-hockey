try{!function(){var e="undefined"!=typeof window?window:"undefined"!=typeof global?global:"undefined"!=typeof globalThis?globalThis:"undefined"!=typeof self?self:{},s=(new e.Error).stack;s&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[s]="c1f11a5e-f9bd-4622-b130-02c35b6f2d95",e._sentryDebugIdIdentifier="sentry-dbid-c1f11a5e-f9bd-4622-b130-02c35b6f2d95")}()}catch(e){}"use strict";exports.id=224,exports.ids=[224],exports.modules={51197:(e,s,a)=>{a.r(s),a.d(s,{default:()=>y,getServerSideProps:()=>N,getStaticProps:()=>S});var t=a(20997);a(16689);var r=a(56859),i=a.n(r);a(4298);var o=a(58097);class n extends i(){static async getInitialProps(e){return{...await i().getInitialProps(e)}}render(){return(0,t.jsxs)(r.Html,{lang:"en",children:[(0,t.jsx)(r.Head,{children:(0,t.jsx)("link",{rel:"icon",sizes:"96x96",href:"/images/Hockey-Net.svg"})}),(0,t.jsxs)("body",{className:"bg-gray-100",children:[(0,t.jsx)(r.Main,{}),(0,t.jsx)(r.NextScript,{})]})]})}}var l=Object.freeze({__proto__:null,default:n});let p=l?l.default:void 0,E=p?p.getInitialProps:void 0,d=l?l.getStaticProps:void 0,g=l?l.getServerSideProps:void 0,m=Object.freeze({"/_app":o.wrapAppGetInitialPropsWithSentry,"/_document":o.wrapDocumentGetInitialPropsWithSentry,"/_error":o.wrapErrorGetInitialPropsWithSentry})["/_document"]||o.wrapGetInitialPropsWithSentry;p&&"function"==typeof E&&(p.getInitialProps=m(E));let S="function"==typeof d?o.wrapGetStaticPropsWithSentry(d,"/_document"):void 0,N="function"==typeof g?o.wrapGetServerSidePropsWithSentry(g,"/_document"):void 0,y=p?o.wrapPageComponentWithSentry(p):p},69584:(e,s,a)=>{a.d(s,{Z:()=>l});var t=a(20997),r=a(16689),i=a(83066),o=a(41664),n=a.n(o);function l({team:e}){let[s,a]=(0,r.useState)(!1);return t.jsx("div",{children:(0,t.jsxs)("div",{className:`relative overflow-hidden border border-black rounded bg-white m-1 ${s?"max-h-full":"max-h-32"} transition-maxHeight duration-500 ease-in-out`,children:[(0,t.jsxs)("div",{className:"flex justify-between items-center",children:[t.jsx("h2",{className:"text-xl text-left p-2",children:t.jsx(n(),{href:`/teams/${encodeURIComponent(e.team.id)}`,className:"flex  gap-3 ml-3 pr-3 hover:text-blue-700",children:e.team.name})}),t.jsx("div",{className:"grow cursor-pointer",onClick:()=>a(e=>!e),children:s?t.jsx(i.lRc,{className:"ml-auto",style:{transition:"transform .3s",transform:"rotate(-90deg)"},size:24}):t.jsx(i.lRc,{className:"ml-auto",style:{transition:"transform .3s",transform:"rotate(0deg)"},size:24})})]}),(0,t.jsxs)("ul",{className:"grid grid-cols-3 divide-x divide-y",children:[e?.roster?.forwards?.sort((e,s)=>e.firstName.default>s.firstName.default?1:-1).map(e=>t.jsx("li",{className:"odd:bg-slate-100 px-1 divide-x",children:t.jsxs(n(),{href:`/players/${encodeURIComponent(e.id)}`,className:"text-sm hover:text-blue-700 visited:text-purple-800",children:[t.jsx("b",{children:e.sweaterNumber?`${e.sweaterNumber} `:""}),e.firstName+" "+e.lastName]})},e?.id)),e?.roster?.defensemen?.sort((e,s)=>e.firstName.default>s.firstName.default?1:-1).map(e=>t.jsx("li",{className:"odd:bg-slate-100 px-1 divide-x",children:t.jsxs(n(),{href:`/players/${encodeURIComponent(e.id)}`,className:"text-sm hover:text-blue-700 visited:text-purple-800",children:[t.jsx("b",{children:e.sweaterNumber?`${e.sweaterNumber} `:""}),e.firstName+" "+e.lastName]})},e?.id)),e?.roster?.goalies?.sort((e,s)=>e.firstName.default>s.firstName.default?1:-1).map(e=>t.jsx("li",{className:"odd:bg-slate-100 px-1 divide-x",children:t.jsxs(n(),{href:`/players/${encodeURIComponent(e.id)}`,className:"text-sm hover:text-blue-700 visited:text-purple-800",children:[t.jsx("b",{children:e.sweaterNumber?`${e.sweaterNumber} `:""}),e.firstName+" "+e.lastName]})},e?.id))]}),t.jsx("div",{onClick:()=>a(e=>!e),className:`text-lg z-10 absolute bottom-0 text-center min-w-full	bg-white opacity-75 cursor-pointer ${s?"hidden":""}`,children:"..."})]})})}},10254:(e,s,a)=>{a.d(s,{Z:()=>r});let t=new(a(35900)).Pool({user:process.env.DB_USER,password:process.env.DB_PASS,host:process.env.DB_URL,port:process.env.DB_PORT,database:process.env.DB_NAME,max:30,idleTimeoutMillis:3e4,connectionTimeoutMillis:8e3});t.on("error",(e,s)=>{console.error("Unexpected error on idle client",e)});let r=t},32431:(e,s,a)=>{a.d(s,{KR:()=>d,LK:()=>l,P_:()=>m,Q6:()=>o,RC:()=>i,Ug:()=>r,eJ:()=>n,n8:()=>p,p4:()=>E,pL:()=>S,ti:()=>g});var t=a(10254);async function r(e,s){try{let a=`SELECT ${("Goalie"!==s?['"season"','"league.name"','"team.id"','"team.name"','"stat.games"','"stat.goals"','"stat.pim"','"stat.plusMinus"','"stat.points"','"stat.assists"']:['"season"','"league.name"','"team.id"','"team.name"','"stat.games"','"stat.wins"','"stat.losses"','"stat.goals"','"stat.savePercentage"','"stat.goalAgainstAverage"','"stat.shutouts"','"stat.pim"','"stat.plusMinus"','"stat.points"','"stat.assists"']).join(", ")}
                 FROM staging1.player_stats_new ps
                 WHERE ps."person.id" = $1`;return(await t.Z.query(a,[e])).rows}catch(e){console.log(e)}}async function i(e){try{let s=`
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
        `,a=await t.Z.query(s,[e]);return a=a.rows}catch(e){console.log({tst_er:e})}}async function o(){try{let e=`
        SELECT DISTINCT "draftYear"
        FROM staging1.drafts
        ORDER BY "draftYear" desc
        `,s=await t.Z.query(e);return s=s.rows}catch(e){console.log({tst_er:e})}}async function n(e){try{let s=`
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
        `,a=await t.Z.query(s,[e]);return a=a.rows}catch(e){console.log({tst_er:e})}}async function d(e){try{let s=`
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
        `,a=await t.Z.query(s,[e]);return a=a.rows}catch(e){console.log(e)}}async function g(e){try{let s=`
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
        `,a=await t.Z.query(s,[e]);return a=a.rows}catch(e){console.log({tst_er:e})}}async function m(e){try{let s=`
        SELECT season
        FROM staging1."team.gametypes"
        WHERE 3 = ANY("gameTypes")
        AND abbreviation = $1
        `,a=await t.Z.query(s,[e]);return a=a.rows.map(e=>e.season)}catch(e){console.log({tst_er:e})}}async function S(e=20222023){try{let s=`
        SELECT     ROW_NUMBER() OVER (ORDER BY ps."stat.points" DESC NULLS LAST, ps."stat.goals" DESC NULLS LAST) AS row_number,
        p."fullName", p.id, p."primaryPosition.code", ps."season", ps."team.name", ps."stat.goals", ps."stat.games",ps."stat.assists", ps."stat.points", ps."team.id"
        FROM staging1.player_stats_new ps
        INNER JOIN staging1.player p
        ON p.id = ps."person.id" AND ps.season = $1
        WHERE ps."league.id" = 133
        ORDER BY ps."stat.points" DESC NULLS LAST,ps."stat.goals" DESC NULLS LAST
        LIMIT 200
        `,a=await t.Z.query(s,[e]);return a=a.rows}catch(e){console.log({tst_er:e})}}}};
//# sourceMappingURL=224.js.map