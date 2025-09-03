try{!function(){var e="undefined"!=typeof window?window:"undefined"!=typeof global?global:"undefined"!=typeof globalThis?globalThis:"undefined"!=typeof self?self:{},t=(new e.Error).stack;t&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[t]="4765e7f1-2e0a-4d15-8591-3dfb382d77eb",e._sentryDebugIdIdentifier="sentry-dbid-4765e7f1-2e0a-4d15-8591-3dfb382d77eb")}()}catch(e){}"use strict";(()=>{var e={};e.id=834,e.ids=[834,888,660],e.modules={51197:(e,t,a)=>{a.r(t),a.d(t,{default:()=>m,getServerSideProps:()=>S,getStaticProps:()=>E});var s=a(20997);a(16689);var r=a(56859),o=a.n(r);a(4298);var n=a(58097);class i extends o(){static async getInitialProps(e){return{...await o().getInitialProps(e)}}render(){return(0,s.jsxs)(r.Html,{lang:"en",children:[(0,s.jsx)(r.Head,{children:(0,s.jsx)("link",{rel:"icon",sizes:"96x96",href:"/images/Hockey-Net.svg"})}),(0,s.jsxs)("body",{className:"bg-gray-100",children:[(0,s.jsx)(r.Main,{}),(0,s.jsx)(r.NextScript,{})]})]})}}var l=Object.freeze({__proto__:null,default:i});let p=l?l.default:void 0,d=p?p.getInitialProps:void 0,g=l?l.getStaticProps:void 0,c=l?l.getServerSideProps:void 0,u=Object.freeze({"/_app":n.wrapAppGetInitialPropsWithSentry,"/_document":n.wrapDocumentGetInitialPropsWithSentry,"/_error":n.wrapErrorGetInitialPropsWithSentry})["/_document"]||n.wrapGetInitialPropsWithSentry;p&&"function"==typeof d&&(p.getInitialProps=u(d));let E="function"==typeof g?n.wrapGetStaticPropsWithSentry(g,"/_document"):void 0,S="function"==typeof c?n.wrapGetServerSidePropsWithSentry(c,"/_document"):void 0,m=p?n.wrapPageComponentWithSentry(p):p},25152:(e,t,a)=>{a.a(e,async(e,s)=>{try{a.r(t),a.d(t,{default:()=>P,getServerSideProps:()=>A,getStaticProps:()=>f});var r=a(20997),o=a(16689),n=a(41664),i=a.n(n),l=a(32431),p=a(12814),d=a(58097),g=e([p]);async function c(){try{return{props:{players:await (0,l.pL)()||null}}}catch(e){return console.log("Database connection failed, returning null players"),{props:{players:null},revalidate:60}}}p=(g.then?(await g)():g)[0];var u=Object.freeze({__proto__:null,default:function({players:e}){let[t,a]=(0,o.useState)([]),s=(0,o.useMemo)(()=>[{header:"Rk",accessorKey:"row_number",cell:({row:e})=>(0,r.jsx)("div",{children:e.original.row_number})},{header:"Team",accessorFn:e=>e["team.name"],cell:({row:e})=>(0,r.jsx)(i(),{href:`/teams/${e.original["team.id"]}`,passHref:!0,className:" hover:text-blue-700 visited:text-purple-800",children:e.original["team.name"]})},{header:"Name",accessorKey:"fullName",cell:({row:e})=>(0,r.jsx)(i(),{href:`/players/${e.original.id}`,passHref:!0,className:" hover:text-blue-700 visited:text-purple-800",children:e.original.fullName})},{header:"Pos.",accessorFn:e=>e["primaryPosition.code"]},{header:"GP",accessorFn:e=>e["stat.games"],cell:e=>(0,r.jsx)("p",{className:"text-right",children:e.getValue()})},{header:"G",accessorFn:e=>e["stat.goals"],cell:e=>(0,r.jsx)("p",{className:"text-right",children:e.getValue()})},{header:"A",accessorFn:e=>e["stat.assists"],cell:e=>(0,r.jsx)("p",{className:"text-right",children:e.getValue()})},{header:"P",accessorFn:e=>e["stat.points"],cell:e=>(0,r.jsx)("p",{className:"text-right",children:e.getValue()})}]);return(0,r.jsx)("div",{children:e?(0,r.jsx)(p.Z,{columns:s,data:e,sortKey:"P"}):(0,r.jsx)("h3",{children:"Error Retrieving Stats..."})})},getStaticProps:c});let E=u?u.default:void 0,S=E?E.getInitialProps:void 0,m=u?u.getStaticProps:void 0,y=u?u.getServerSideProps:void 0,N=Object.freeze({"/_app":d.wrapAppGetInitialPropsWithSentry,"/_document":d.wrapDocumentGetInitialPropsWithSentry,"/_error":d.wrapErrorGetInitialPropsWithSentry})["/players"]||d.wrapGetInitialPropsWithSentry;E&&"function"==typeof S&&(E.getInitialProps=N(S));let f="function"==typeof m?d.wrapGetStaticPropsWithSentry(m,"/players"):void 0,A="function"==typeof y?d.wrapGetServerSidePropsWithSentry(y,"/players"):void 0,P=E?d.wrapPageComponentWithSentry(E):E;s()}catch(e){s(e)}})},1323:(e,t)=>{Object.defineProperty(t,"l",{enumerable:!0,get:function(){return function e(t,a){return a in t?t[a]:"then"in t&&"function"==typeof t.then?t.then(t=>e(t,a)):"function"==typeof t&&"default"===a?t:void 0}}})},62248:(e,t,a)=>{a.a(e,async(e,s)=>{try{a.r(t),a.d(t,{config:()=>S,default:()=>g,getServerSideProps:()=>E,getStaticPaths:()=>u,getStaticProps:()=>c,reportWebVitals:()=>m,routeModule:()=>h,unstable_getServerProps:()=>A,unstable_getServerSideProps:()=>P,unstable_getStaticParams:()=>f,unstable_getStaticPaths:()=>N,unstable_getStaticProps:()=>y});var r=a(87093),o=a(35244),n=a(1323),i=a(51197),l=a(64752),p=a(25152),d=e([l,p]);[l,p]=d.then?(await d)():d;let g=(0,n.l)(p,"default"),c=(0,n.l)(p,"getStaticProps"),u=(0,n.l)(p,"getStaticPaths"),E=(0,n.l)(p,"getServerSideProps"),S=(0,n.l)(p,"config"),m=(0,n.l)(p,"reportWebVitals"),y=(0,n.l)(p,"unstable_getStaticProps"),N=(0,n.l)(p,"unstable_getStaticPaths"),f=(0,n.l)(p,"unstable_getStaticParams"),A=(0,n.l)(p,"unstable_getServerProps"),P=(0,n.l)(p,"unstable_getServerSideProps"),h=new r.PagesRouteModule({definition:{kind:o.x.PAGES,page:"/players",pathname:"/players",bundlePath:"",filename:""},components:{App:l.default,Document:i.default},userland:p});s()}catch(e){s(e)}})},88636:(e,t,a)=>{a.d(t,{Z:()=>r});var s=a(20997);function r({column:e,table:t}){let a=t.getPreFilteredRowModel().flatRows[0]?.getValue(e.id),r=e.getFilterValue();return"number"==typeof a?(0,s.jsxs)("div",{className:"flex space-x-2",children:[s.jsx("input",{type:"number",value:r?.[0]??"",onChange:t=>e.setFilterValue(e=>[t.target.value,e?.[1]]),placeholder:"Min",className:"w-24 border shadow rounded"}),s.jsx("input",{type:"number",value:r?.[1]??"",onChange:t=>e.setFilterValue(e=>[e?.[0],t.target.value]),placeholder:"Max",className:"w-24 border shadow rounded"})]}):s.jsx("input",{type:"text",value:r??"",onChange:t=>e.setFilterValue(t.target.value),placeholder:"Search...",className:"w-36 border shadow rounded"})}},12814:(e,t,a)=>{a.a(e,async(e,s)=>{try{a.d(t,{Z:()=>p});var r=a(20997),o=a(46869),n=a(16689),i=a(88636),l=e([o]);function p({columns:e,data:t,sortKey:a="season",filterCol:s=["fullName"],pageSize:l=25}){let[p,d]=(0,n.useState)([{id:a,desc:!0}]),[g,c]=(0,n.useState)({pageIndex:0,pageSize:l}),u=(0,o.useReactTable)({columns:e,data:t,state:{sorting:p,pagination:g},onPaginationChange:c,onSortingChange:d,getCoreRowModel:(0,o.getCoreRowModel)(),getSortedRowModel:(0,o.getSortedRowModel)(),getPaginationRowModel:(0,o.getPaginationRowModel)(),getFilteredRowModel:(0,o.getFilteredRowModel)()});return(0,r.jsxs)(r.Fragment,{children:[(0,r.jsxs)("table",{className:"border border-black p-2 m-1 max-w-xl",children:[r.jsx("thead",{children:u.getHeaderGroups().map(e=>r.jsx("tr",{children:e.headers.map(e=>(0,r.jsxs)("th",{className:"",colSpan:e.colSpan,children:[e.isPlaceholder?null:(0,r.jsxs)("div",{className:e.column.getCanSort()?"cursor-pointer select-none":"",onClick:e.column.getToggleSortingHandler(),children:[(0,o.flexRender)(e.column.columnDef.header,e.getContext()),r.jsx("span",{className:"text-sm",children:{asc:" \uD83D\uDD3C",desc:" \uD83D\uDD3D"}[e.column.getIsSorted()]??null})]}),s&&s.includes(e.column.id)&&r.jsx("div",{children:r.jsx(i.Z,{column:e.column,table:u})})]},e.id))},e.id))}),r.jsx("tbody",{className:"",children:u.getRowModel().rows?.map((e,t)=>{let a=e?.original["league.name"]=="National Hockey League";return r.jsx("tr",{className:a?"bg-slate-200":"",children:e.getVisibleCells().map(e=>r.jsx("td",{className:"border-black border px-1 text-sm",children:o.flexRender(e.column.columnDef.cell,e.getContext())},e.id))},e.id)})}),r.jsx("tfoot",{children:u.getFooterGroups().map((e,t)=>r.jsx("tr",{className:"bg-slate-300 py-px text-center font-bold",children:e.headers.map(e=>(0,r.jsxs)("td",{colSpan:e.colSpan,className:"border-black px-1",children:[e.isPlaceholder?null:(0,o.flexRender)(e.column.columnDef.footer,e.getContext())," "]},e.id))},e.id))})]}),(0,r.jsxs)("div",{className:"flex items-center gap-2",children:[r.jsx("button",{className:"border rounded ",onClick:()=>u.setPageIndex(0),disabled:!u.getCanPreviousPage(),children:"<<"}),r.jsx("button",{className:"border rounded ",onClick:()=>u.previousPage(),disabled:!u.getCanPreviousPage(),children:"<"}),r.jsx("button",{className:"border rounded ",onClick:()=>u.nextPage(),disabled:!u.getCanNextPage(),children:">"}),r.jsx("button",{className:"border rounded ",onClick:()=>u.setPageIndex(u.getPageCount()-1),disabled:!u.getCanNextPage(),children:">>"}),(0,r.jsxs)("span",{className:"flex items-center gap-1",children:[r.jsx("div",{children:"Page"}),(0,r.jsxs)("strong",{children:[u.getState().pagination.pageIndex+1," of"," ",u.getPageCount()]})]})]})]})}o=(l.then?(await l)():l)[0],s()}catch(e){s(e)}})},10254:(e,t,a)=>{a.d(t,{Z:()=>r});let s=new(a(35900)).Pool({user:process.env.DB_USER,password:process.env.DB_PASS,host:process.env.DB_URL,port:process.env.DB_PORT,database:process.env.DB_NAME,max:30,idleTimeoutMillis:3e4,connectionTimeoutMillis:8e3});s.on("error",(e,t)=>{console.error("Unexpected error on idle client",e)});let r=s},32431:(e,t,a)=>{a.d(t,{KR:()=>g,LK:()=>l,P_:()=>u,Q6:()=>n,RC:()=>o,Ug:()=>r,eJ:()=>i,n8:()=>p,p4:()=>d,pL:()=>E,ti:()=>c});var s=a(10254);async function r(e,t){try{let a=`SELECT ${("Goalie"!==t?['"season"','"league.name"','"team.id"','"team.name"','"stat.games"','"stat.goals"','"stat.pim"','"stat.plusMinus"','"stat.points"','"stat.assists"']:['"season"','"league.name"','"team.id"','"team.name"','"stat.games"','"stat.wins"','"stat.losses"','"stat.goals"','"stat.savePercentage"','"stat.goalAgainstAverage"','"stat.shutouts"','"stat.pim"','"stat.plusMinus"','"stat.points"','"stat.assists"']).join(", ")}
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
        `,t=await s.Z.query(e);return t=t.rows}catch(e){console.log({tst_er:e})}}async function d(e){try{let t=`
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
        `,a=await s.Z.query(t,[e]);return a=a.rows}catch(e){console.log(e)}}async function c(e){try{let t=`
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
        `,a=await s.Z.query(t,[e]);return a=a.rows}catch(e){console.log({tst_er:e})}}async function u(e){try{let t=`
        SELECT season
        FROM staging1."team.gametypes"
        WHERE 3 = ANY("gameTypes")
        AND abbreviation = $1
        `,a=await s.Z.query(t,[e]);return a=a.rows.map(e=>e.season)}catch(e){console.log({tst_er:e})}}async function E(e=20222023){try{let t=`
        SELECT     ROW_NUMBER() OVER (ORDER BY ps."stat.points" DESC NULLS LAST, ps."stat.goals" DESC NULLS LAST) AS row_number,
        p."fullName", p.id, p."primaryPosition.code", ps."season", ps."team.name", ps."stat.goals", ps."stat.games",ps."stat.assists", ps."stat.points", ps."team.id"
        FROM staging1.player_stats_new ps
        INNER JOIN staging1.player p
        ON p.id = ps."person.id" AND ps.season = $1
        WHERE ps."league.id" = 133
        ORDER BY ps."stat.points" DESC NULLS LAST,ps."stat.goals" DESC NULLS LAST
        LIMIT 200
        `,a=await s.Z.query(t,[e]);return a=a.rows}catch(e){console.log({tst_er:e})}}},35244:(e,t)=>{var a;Object.defineProperty(t,"x",{enumerable:!0,get:function(){return a}}),function(e){e.PAGES="PAGES",e.PAGES_API="PAGES_API",e.APP_PAGE="APP_PAGE",e.APP_ROUTE="APP_ROUTE"}(a||(a={}))},58097:e=>{e.exports=require("@sentry/nextjs")},65581:e=>{e.exports=require("aws-amplify")},62785:e=>{e.exports=require("next/dist/compiled/next-server/pages.runtime.prod.js")},40968:e=>{e.exports=require("next/head")},35900:e=>{e.exports=require("pg")},16689:e=>{e.exports=require("react")},66405:e=>{e.exports=require("react-dom")},61175:e=>{e.exports=require("react-query")},65918:e=>{e.exports=require("react-query/devtools")},39717:e=>{e.exports=require("react-query/hydration")},20997:e=>{e.exports=require("react/jsx-runtime")},55315:e=>{e.exports=require("path")},46869:e=>{e.exports=import("@tanstack/react-table")},86201:e=>{e.exports=import("react-hot-toast")}};var t=require("../webpack-runtime.js");t.C(e);var a=e=>t(t.s=e),s=t.X(0,[213,977,859,752],()=>a(62248));module.exports=s})();
//# sourceMappingURL=players.js.map