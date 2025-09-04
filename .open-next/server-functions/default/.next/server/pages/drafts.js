"use strict";(()=>{var e={};e.id=80,e.ids=[80,888,660],e.modules={1323:(e,s)=>{Object.defineProperty(s,"l",{enumerable:!0,get:function(){return function e(s,a){return a in s?s[a]:"then"in s&&"function"==typeof s.then?s.then(s=>e(s,a)):"function"==typeof s&&"default"===a?s:void 0}}})},7376:(e,s,a)=>{a.a(e,async(e,t)=>{try{a.r(s),a.d(s,{config:()=>y,default:()=>g,getServerSideProps:()=>u,getStaticPaths:()=>d,getStaticProps:()=>S,reportWebVitals:()=>c,routeModule:()=>P,unstable_getServerProps:()=>f,unstable_getServerSideProps:()=>T,unstable_getStaticParams:()=>A,unstable_getStaticPaths:()=>m,unstable_getStaticProps:()=>N});var r=a(7093),n=a(5244),o=a(1323),i=a(5949),l=a(3414),E=a(8443),p=e([l]);l=(p.then?(await p)():p)[0];let g=(0,o.l)(E,"default"),S=(0,o.l)(E,"getStaticProps"),d=(0,o.l)(E,"getStaticPaths"),u=(0,o.l)(E,"getServerSideProps"),y=(0,o.l)(E,"config"),c=(0,o.l)(E,"reportWebVitals"),N=(0,o.l)(E,"unstable_getStaticProps"),m=(0,o.l)(E,"unstable_getStaticPaths"),A=(0,o.l)(E,"unstable_getStaticParams"),f=(0,o.l)(E,"unstable_getServerProps"),T=(0,o.l)(E,"unstable_getServerSideProps"),P=new r.PagesRouteModule({definition:{kind:n.x.PAGES,page:"/drafts",pathname:"/drafts",bundlePath:"",filename:""},components:{App:l.default,Document:i.default},userland:E});t()}catch(e){t(e)}})},7841:(e,s,a)=>{a.d(s,{Z:()=>r});let t=new(a(5900)).Pool({user:process.env.DB_USER,password:process.env.DB_PASS,host:process.env.DB_URL,port:process.env.DB_PORT,database:process.env.DB_NAME,max:30,idleTimeoutMillis:3e4,connectionTimeoutMillis:8e3});t.on("error",(e,s)=>{console.error("Unexpected error on idle client",e)});let r=t},5730:(e,s,a)=>{a.d(s,{KR:()=>g,LK:()=>l,P_:()=>d,Q6:()=>o,RC:()=>n,Ug:()=>r,eJ:()=>i,n8:()=>E,p4:()=>p,pL:()=>u,ti:()=>S});var t=a(7841);async function r(e,s){try{let a=`SELECT ${("Goalie"!==s?['"season"','"league.name"','"team.id"','"team.name"','"stat.games"','"stat.goals"','"stat.pim"','"stat.plusMinus"','"stat.points"','"stat.assists"']:['"season"','"league.name"','"team.id"','"team.name"','"stat.games"','"stat.wins"','"stat.losses"','"stat.goals"','"stat.savePercentage"','"stat.goalAgainstAverage"','"stat.shutouts"','"stat.pim"','"stat.plusMinus"','"stat.points"','"stat.assists"']).join(", ")}
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
        `,a=await t.Z.query(s,[e]);return a=a.rows}catch(e){console.log({tst_er:e})}}async function o(){try{let e=`
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
        `,s=await t.Z.query(e);return s=s.rows}catch(e){console.log({tst_er:e})}}async function E(){try{let e=`
        SELECT id
        FROM staging1.team
        `,s=await t.Z.query(e);return s=s.rows}catch(e){console.log({tst_er:e})}}async function p(e){try{let s=`
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
        `,a=await t.Z.query(s,[e]);return a=a.rows.map(e=>e.season)}catch(e){console.log({tst_er:e})}}async function u(e=20222023){try{let s=`
        SELECT     ROW_NUMBER() OVER (ORDER BY ps."stat.points" DESC NULLS LAST, ps."stat.goals" DESC NULLS LAST) AS row_number,
        p."fullName", p.id, p."primaryPosition.code", ps."season", ps."team.name", ps."stat.goals", ps."stat.games",ps."stat.assists", ps."stat.points", ps."team.id"
        FROM staging1.player_stats_new ps
        INNER JOIN staging1.player p
        ON p.id = ps."person.id" AND ps.season = $1
        WHERE ps."league.id" = 133
        ORDER BY ps."stat.points" DESC NULLS LAST,ps."stat.goals" DESC NULLS LAST
        LIMIT 200
        `,a=await t.Z.query(s,[e]);return a=a.rows}catch(e){console.log({tst_er:e})}}},5949:(e,s,a)=>{a.r(s),a.d(s,{default:()=>i});var t=a(997);a(6689);var r=a(6859),n=a.n(r);a(4298);class o extends n(){static async getInitialProps(e){return{...await n().getInitialProps(e)}}render(){return(0,t.jsxs)(r.Html,{lang:"en",children:[t.jsx(r.Head,{children:t.jsx("link",{rel:"icon",sizes:"96x96",href:"/images/Hockey-Net.svg"})}),(0,t.jsxs)("body",{className:"bg-gray-100",children:[t.jsx(r.Main,{}),t.jsx(r.NextScript,{})]})]})}}let i=o},8443:(e,s,a)=>{a.r(s),a.d(s,{default:()=>l,getStaticProps:()=>E});var t=a(997);a(6689),a(1175);var r=a(1664),n=a.n(r);function o({drafts:e}){return(0,t.jsxs)("div",{className:"border-2",children:[t.jsx("div",{className:"p-1 bg-indigo-300 border-2",children:"NHL Amateur Drafts"}),t.jsx("div",{className:"flex flex-wrap max-w-3xl",children:e&&e.map((e,s)=>t.jsx(n(),{href:`/drafts/${e.draftYear}`,children:t.jsx("div",{className:"p-1 border mx-1",children:e.draftYear})},s))})]})}var i=a(5730);function l({draftYears:e}){return console.log(e),t.jsx("div",{className:"grid place-content-center",children:t.jsx(o,{drafts:e})})}async function E(){try{return{props:{draftYears:await (0,i.Q6)()||[]},revalidate:15552e3}}catch(e){return console.log("Database connection failed, returning empty draft years"),{props:{draftYears:[]},revalidate:60}}}},5244:(e,s)=>{var a;Object.defineProperty(s,"x",{enumerable:!0,get:function(){return a}}),function(e){e.PAGES="PAGES",e.PAGES_API="PAGES_API",e.APP_PAGE="APP_PAGE",e.APP_ROUTE="APP_ROUTE"}(a||(a={}))},5581:e=>{e.exports=require("aws-amplify")},2785:e=>{e.exports=require("next/dist/compiled/next-server/pages.runtime.prod.js")},968:e=>{e.exports=require("next/head")},5900:e=>{e.exports=require("pg")},6689:e=>{e.exports=require("react")},6405:e=>{e.exports=require("react-dom")},1175:e=>{e.exports=require("react-query")},5918:e=>{e.exports=require("react-query/devtools")},9717:e=>{e.exports=require("react-query/hydration")},997:e=>{e.exports=require("react/jsx-runtime")},5315:e=>{e.exports=require("path")},6201:e=>{e.exports=import("react-hot-toast")}};var s=require("../webpack-runtime.js");s.C(e);var a=e=>s(s.s=e),t=s.X(0,[139,856,859,414],()=>a(7376));module.exports=t})();