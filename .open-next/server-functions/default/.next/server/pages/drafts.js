try{!function(){var e="undefined"!=typeof window?window:"undefined"!=typeof global?global:"undefined"!=typeof globalThis?globalThis:"undefined"!=typeof self?self:{},t=(new e.Error).stack;t&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[t]="5d20385f-4168-4765-8c21-741e20c3b99e",e._sentryDebugIdIdentifier="sentry-dbid-5d20385f-4168-4765-8c21-741e20c3b99e")}()}catch(e){}"use strict";(()=>{var e={};e.id=80,e.ids=[80,888,660],e.modules={51197:(e,t,a)=>{a.r(t),a.d(t,{default:()=>c,getServerSideProps:()=>y,getStaticProps:()=>u});var s=a(20997);a(16689);var r=a(56859),o=a.n(r);a(4298);var n=a(58097);class i extends o(){static async getInitialProps(e){return{...await o().getInitialProps(e)}}render(){return(0,s.jsxs)(r.Html,{lang:"en",children:[(0,s.jsx)(r.Head,{children:(0,s.jsx)("link",{rel:"icon",sizes:"96x96",href:"/images/Hockey-Net.svg"})}),(0,s.jsxs)("body",{className:"bg-gray-100",children:[(0,s.jsx)(r.Main,{}),(0,s.jsx)(r.NextScript,{})]})]})}}var l=Object.freeze({__proto__:null,default:i});let p=l?l.default:void 0,E=p?p.getInitialProps:void 0,g=l?l.getStaticProps:void 0,S=l?l.getServerSideProps:void 0,d=Object.freeze({"/_app":n.wrapAppGetInitialPropsWithSentry,"/_document":n.wrapDocumentGetInitialPropsWithSentry,"/_error":n.wrapErrorGetInitialPropsWithSentry})["/_document"]||n.wrapGetInitialPropsWithSentry;p&&"function"==typeof E&&(p.getInitialProps=d(E));let u="function"==typeof g?n.wrapGetStaticPropsWithSentry(g,"/_document"):void 0,y="function"==typeof S?n.wrapGetServerSidePropsWithSentry(S,"/_document"):void 0,c=p?n.wrapPageComponentWithSentry(p):p},33567:(e,t,a)=>{a.r(t),a.d(t,{default:()=>f,getServerSideProps:()=>c,getStaticProps:()=>y});var s=a(20997);a(16689),a(61175);var r=a(41664),o=a.n(r);function n({drafts:e}){return(0,s.jsxs)("div",{className:"border-2",children:[s.jsx("div",{className:"p-1 bg-indigo-300 border-2",children:"NHL Amateur Drafts"}),s.jsx("div",{className:"flex flex-wrap max-w-3xl",children:e&&e.map((e,t)=>s.jsx(o(),{href:`/drafts/${e.draftYear}`,children:s.jsx("div",{className:"p-1 border mx-1",children:e.draftYear})},t))})]})}var i=a(32431),l=a(58097),p=Object.freeze({__proto__:null,default:function({draftYears:e}){return console.log(e),(0,s.jsx)("div",{className:"grid place-content-center",children:(0,s.jsx)(n,{drafts:e})})},getStaticProps:async function(){try{return{props:{draftYears:await (0,i.Q6)()||[]},revalidate:15552e3}}catch(e){return console.log("Database connection failed, returning empty draft years"),{props:{draftYears:[]},revalidate:60}}}});let E=p?p.default:void 0,g=E?E.getInitialProps:void 0,S=p?p.getStaticProps:void 0,d=p?p.getServerSideProps:void 0,u=Object.freeze({"/_app":l.wrapAppGetInitialPropsWithSentry,"/_document":l.wrapDocumentGetInitialPropsWithSentry,"/_error":l.wrapErrorGetInitialPropsWithSentry})["/drafts"]||l.wrapGetInitialPropsWithSentry;E&&"function"==typeof g&&(E.getInitialProps=u(g));let y="function"==typeof S?l.wrapGetStaticPropsWithSentry(S,"/drafts"):void 0,c="function"==typeof d?l.wrapGetServerSidePropsWithSentry(d,"/drafts"):void 0,f=E?l.wrapPageComponentWithSentry(E):E},1323:(e,t)=>{Object.defineProperty(t,"l",{enumerable:!0,get:function(){return function e(t,a){return a in t?t[a]:"then"in t&&"function"==typeof t.then?t.then(t=>e(t,a)):"function"==typeof t&&"default"===a?t:void 0}}})},17376:(e,t,a)=>{a.a(e,async(e,s)=>{try{a.r(t),a.d(t,{config:()=>y,default:()=>g,getServerSideProps:()=>u,getStaticPaths:()=>d,getStaticProps:()=>S,reportWebVitals:()=>c,routeModule:()=>T,unstable_getServerProps:()=>A,unstable_getServerSideProps:()=>P,unstable_getStaticParams:()=>N,unstable_getStaticPaths:()=>m,unstable_getStaticProps:()=>f});var r=a(87093),o=a(35244),n=a(1323),i=a(51197),l=a(64752),p=a(33567),E=e([l]);l=(E.then?(await E)():E)[0];let g=(0,n.l)(p,"default"),S=(0,n.l)(p,"getStaticProps"),d=(0,n.l)(p,"getStaticPaths"),u=(0,n.l)(p,"getServerSideProps"),y=(0,n.l)(p,"config"),c=(0,n.l)(p,"reportWebVitals"),f=(0,n.l)(p,"unstable_getStaticProps"),m=(0,n.l)(p,"unstable_getStaticPaths"),N=(0,n.l)(p,"unstable_getStaticParams"),A=(0,n.l)(p,"unstable_getServerProps"),P=(0,n.l)(p,"unstable_getServerSideProps"),T=new r.PagesRouteModule({definition:{kind:o.x.PAGES,page:"/drafts",pathname:"/drafts",bundlePath:"",filename:""},components:{App:l.default,Document:i.default},userland:p});s()}catch(e){s(e)}})},10254:(e,t,a)=>{a.d(t,{Z:()=>r});let s=new(a(35900)).Pool({user:process.env.DB_USER,password:process.env.DB_PASS,host:process.env.DB_URL,port:process.env.DB_PORT,database:process.env.DB_NAME,max:30,idleTimeoutMillis:3e4,connectionTimeoutMillis:8e3});s.on("error",(e,t)=>{console.error("Unexpected error on idle client",e)});let r=s},32431:(e,t,a)=>{a.d(t,{KR:()=>g,LK:()=>l,P_:()=>d,Q6:()=>n,RC:()=>o,Ug:()=>r,eJ:()=>i,n8:()=>p,p4:()=>E,pL:()=>u,ti:()=>S});var s=a(10254);async function r(e,t){try{let a=`SELECT ${("Goalie"!==t?['"season"','"league.name"','"team.id"','"team.name"','"stat.games"','"stat.goals"','"stat.pim"','"stat.plusMinus"','"stat.points"','"stat.assists"']:['"season"','"league.name"','"team.id"','"team.name"','"stat.games"','"stat.wins"','"stat.losses"','"stat.goals"','"stat.savePercentage"','"stat.goalAgainstAverage"','"stat.shutouts"','"stat.pim"','"stat.plusMinus"','"stat.points"','"stat.assists"']).join(", ")}
                 FROM staging1.player_stats_new ps
                 WHERE ps."person.id" = $1`;return(await s.Z.query(a,[e])).rows}catch(e){console.log(e)}}async function o(e){try{let t=`
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
        `,a=await s.Z.query(t,[e]);return a=a.rows}catch(e){console.log({tst_er:e})}}async function n(){try{let e=`
        SELECT DISTINCT "draftYear"
        FROM staging1.drafts
        ORDER BY "draftYear" desc
        `,t=await s.Z.query(e);return t=t.rows}catch(e){console.log({tst_er:e})}}async function i(e){try{let t=`
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

    `,a=await s.Z.query(t,[e]);return a=a.rows}catch(e){throw console.log({tst_er:e}),e}}async function l(){try{let e=`
        SELECT abbreviation, name, id
        FROM staging1.team
        ORDER BY name;
        `,t=await s.Z.query(e);return t=t.rows}catch(e){console.log({tst_er:e})}}async function p(){try{let e=`
        SELECT id
        FROM staging1.team
        `,t=await s.Z.query(e);return t=t.rows}catch(e){console.log({tst_er:e})}}async function E(e){try{let t=`
        SELECT "seasonId", "wins", "losses", "points"
        ,"goalsAgainstPerGame","goalsForPerGame", "regulationAndOtWins" as "row"
        , "pointPct", "winsInShootout"
        FROM Staging1.team_season
        WHERE "teamId" = $1
        ORDER BY "seasonId" desc 
        LIMIT 8
        `,a=await s.Z.query(t,[e]);return a=a.rows}catch(e){console.log({tst_er:e})}}async function g(e){try{let t=`
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
        `,a=await s.Z.query(t,[e]);return a=a.rows}catch(e){console.log(e)}}async function S(e){try{let t=`
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
        `,a=await s.Z.query(t,[e]);return a=a.rows}catch(e){console.log({tst_er:e})}}async function d(e){try{let t=`
        SELECT season
        FROM staging1."team.gametypes"
        WHERE 3 = ANY("gameTypes")
        AND abbreviation = $1
        `,a=await s.Z.query(t,[e]);return a=a.rows.map(e=>e.season)}catch(e){console.log({tst_er:e})}}async function u(e=20222023){try{let t=`
        SELECT     ROW_NUMBER() OVER (ORDER BY ps."stat.points" DESC NULLS LAST, ps."stat.goals" DESC NULLS LAST) AS row_number,
        p."fullName", p.id, p."primaryPosition.code", ps."season", ps."team.name", ps."stat.goals", ps."stat.games",ps."stat.assists", ps."stat.points", ps."team.id"
        FROM staging1.player_stats_new ps
        INNER JOIN staging1.player p
        ON p.id = ps."person.id" AND ps.season = $1
        WHERE ps."league.id" = 133
        ORDER BY ps."stat.points" DESC NULLS LAST,ps."stat.goals" DESC NULLS LAST
        LIMIT 200
        `,a=await s.Z.query(t,[e]);return a=a.rows}catch(e){console.log({tst_er:e})}}},35244:(e,t)=>{var a;Object.defineProperty(t,"x",{enumerable:!0,get:function(){return a}}),function(e){e.PAGES="PAGES",e.PAGES_API="PAGES_API",e.APP_PAGE="APP_PAGE",e.APP_ROUTE="APP_ROUTE"}(a||(a={}))},58097:e=>{e.exports=require("@sentry/nextjs")},65581:e=>{e.exports=require("aws-amplify")},62785:e=>{e.exports=require("next/dist/compiled/next-server/pages.runtime.prod.js")},40968:e=>{e.exports=require("next/head")},35900:e=>{e.exports=require("pg")},16689:e=>{e.exports=require("react")},66405:e=>{e.exports=require("react-dom")},61175:e=>{e.exports=require("react-query")},65918:e=>{e.exports=require("react-query/devtools")},39717:e=>{e.exports=require("react-query/hydration")},20997:e=>{e.exports=require("react/jsx-runtime")},55315:e=>{e.exports=require("path")},86201:e=>{e.exports=import("react-hot-toast")}};var t=require("../webpack-runtime.js");t.C(e);var a=e=>t(t.s=e),s=t.X(0,[213,977,859,752],()=>a(17376));module.exports=s})();
//# sourceMappingURL=drafts.js.map