"use strict";(()=>{var e={};e.id=834,e.ids=[834,888,660],e.modules={1323:(e,a)=>{Object.defineProperty(a,"l",{enumerable:!0,get:function(){return function e(a,s){return s in a?a[s]:"then"in a&&"function"==typeof a.then?a.then(a=>e(a,s)):"function"==typeof a&&"default"===s?a:void 0}}})},2248:(e,a,s)=>{s.a(e,async(e,t)=>{try{s.r(a),s.d(a,{config:()=>m,default:()=>d,getServerSideProps:()=>E,getStaticPaths:()=>u,getStaticProps:()=>c,reportWebVitals:()=>S,routeModule:()=>P,unstable_getServerProps:()=>A,unstable_getServerSideProps:()=>h,unstable_getStaticParams:()=>f,unstable_getStaticPaths:()=>y,unstable_getStaticProps:()=>N});var r=s(7093),n=s(5244),o=s(1323),l=s(5949),i=s(3414),g=s(8759),p=e([i,g]);[i,g]=p.then?(await p)():p;let d=(0,o.l)(g,"default"),c=(0,o.l)(g,"getStaticProps"),u=(0,o.l)(g,"getStaticPaths"),E=(0,o.l)(g,"getServerSideProps"),m=(0,o.l)(g,"config"),S=(0,o.l)(g,"reportWebVitals"),N=(0,o.l)(g,"unstable_getStaticProps"),y=(0,o.l)(g,"unstable_getStaticPaths"),f=(0,o.l)(g,"unstable_getStaticParams"),A=(0,o.l)(g,"unstable_getServerProps"),h=(0,o.l)(g,"unstable_getServerSideProps"),P=new r.PagesRouteModule({definition:{kind:n.x.PAGES,page:"/players",pathname:"/players",bundlePath:"",filename:""},components:{App:i.default,Document:l.default},userland:g});t()}catch(e){t(e)}})},5815:(e,a,s)=>{s.d(a,{Z:()=>r});var t=s(997);function r({column:e,table:a}){let s=a.getPreFilteredRowModel().flatRows[0]?.getValue(e.id),r=e.getFilterValue();return"number"==typeof s?(0,t.jsxs)("div",{className:"flex space-x-2",children:[t.jsx("input",{type:"number",value:r?.[0]??"",onChange:a=>e.setFilterValue(e=>[a.target.value,e?.[1]]),placeholder:"Min",className:"w-24 border shadow rounded"}),t.jsx("input",{type:"number",value:r?.[1]??"",onChange:a=>e.setFilterValue(e=>[e?.[0],a.target.value]),placeholder:"Max",className:"w-24 border shadow rounded"})]}):t.jsx("input",{type:"text",value:r??"",onChange:a=>e.setFilterValue(a.target.value),placeholder:"Search...",className:"w-36 border shadow rounded"})}},630:(e,a,s)=>{s.a(e,async(e,t)=>{try{s.d(a,{Z:()=>g});var r=s(997),n=s(6869),o=s(6689),l=s(5815),i=e([n]);function g({columns:e,data:a,sortKey:s="season",filterCol:t=["fullName"],pageSize:i=25}){let[g,p]=(0,o.useState)([{id:s,desc:!0}]),[d,c]=(0,o.useState)({pageIndex:0,pageSize:i}),u=(0,n.useReactTable)({columns:e,data:a,state:{sorting:g,pagination:d},onPaginationChange:c,onSortingChange:p,getCoreRowModel:(0,n.getCoreRowModel)(),getSortedRowModel:(0,n.getSortedRowModel)(),getPaginationRowModel:(0,n.getPaginationRowModel)(),getFilteredRowModel:(0,n.getFilteredRowModel)()});return(0,r.jsxs)(r.Fragment,{children:[(0,r.jsxs)("table",{className:"border border-black p-2 m-1 max-w-xl",children:[r.jsx("thead",{children:u.getHeaderGroups().map(e=>r.jsx("tr",{children:e.headers.map(e=>(0,r.jsxs)("th",{className:"",colSpan:e.colSpan,children:[e.isPlaceholder?null:(0,r.jsxs)("div",{className:e.column.getCanSort()?"cursor-pointer select-none":"",onClick:e.column.getToggleSortingHandler(),children:[(0,n.flexRender)(e.column.columnDef.header,e.getContext()),r.jsx("span",{className:"text-sm",children:{asc:" \uD83D\uDD3C",desc:" \uD83D\uDD3D"}[e.column.getIsSorted()]??null})]}),t&&t.includes(e.column.id)&&r.jsx("div",{children:r.jsx(l.Z,{column:e.column,table:u})})]},e.id))},e.id))}),r.jsx("tbody",{className:"",children:u.getRowModel().rows?.map((e,a)=>{let s=e?.original["league.name"]=="National Hockey League";return r.jsx("tr",{className:s?"bg-slate-200":"",children:e.getVisibleCells().map(e=>r.jsx("td",{className:"border-black border px-1 text-sm",children:n.flexRender(e.column.columnDef.cell,e.getContext())},e.id))},e.id)})}),r.jsx("tfoot",{children:u.getFooterGroups().map((e,a)=>r.jsx("tr",{className:"bg-slate-300 py-px text-center font-bold",children:e.headers.map(e=>(0,r.jsxs)("td",{colSpan:e.colSpan,className:"border-black px-1",children:[e.isPlaceholder?null:(0,n.flexRender)(e.column.columnDef.footer,e.getContext())," "]},e.id))},e.id))})]}),(0,r.jsxs)("div",{className:"flex items-center gap-2",children:[r.jsx("button",{className:"border rounded ",onClick:()=>u.setPageIndex(0),disabled:!u.getCanPreviousPage(),children:"<<"}),r.jsx("button",{className:"border rounded ",onClick:()=>u.previousPage(),disabled:!u.getCanPreviousPage(),children:"<"}),r.jsx("button",{className:"border rounded ",onClick:()=>u.nextPage(),disabled:!u.getCanNextPage(),children:">"}),r.jsx("button",{className:"border rounded ",onClick:()=>u.setPageIndex(u.getPageCount()-1),disabled:!u.getCanNextPage(),children:">>"}),(0,r.jsxs)("span",{className:"flex items-center gap-1",children:[r.jsx("div",{children:"Page"}),(0,r.jsxs)("strong",{children:[u.getState().pagination.pageIndex+1," of"," ",u.getPageCount()]})]})]})]})}n=(i.then?(await i)():i)[0],t()}catch(e){t(e)}})},7841:(e,a,s)=>{s.d(a,{Z:()=>r});let t=new(s(5900)).Pool({user:process.env.DB_USER,password:process.env.DB_PASS,host:process.env.DB_URL,port:process.env.DB_PORT,database:process.env.DB_NAME,max:30,idleTimeoutMillis:3e4,connectionTimeoutMillis:8e3});t.on("error",(e,a)=>{console.error("Unexpected error on idle client",e)});let r=t},5730:(e,a,s)=>{s.d(a,{KR:()=>d,LK:()=>i,P_:()=>u,Q6:()=>o,RC:()=>n,Ug:()=>r,eJ:()=>l,n8:()=>g,p4:()=>p,pL:()=>E,ti:()=>c});var t=s(7841);async function r(e,a){try{let s=`SELECT ${("Goalie"!==a?['"season"','"league.name"','"team.id"','"team.name"','"stat.games"','"stat.goals"','"stat.pim"','"stat.plusMinus"','"stat.points"','"stat.assists"']:['"season"','"league.name"','"team.id"','"team.name"','"stat.games"','"stat.wins"','"stat.losses"','"stat.goals"','"stat.savePercentage"','"stat.goalAgainstAverage"','"stat.shutouts"','"stat.pim"','"stat.plusMinus"','"stat.points"','"stat.assists"']).join(", ")}
                 FROM staging1.player_stats_new ps
                 WHERE ps."person.id" = $1`;return(await t.Z.query(s,[e])).rows}catch(e){console.log(e)}}async function n(e){try{let a=`
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
        `,s=await t.Z.query(a,[e]);return s=s.rows}catch(e){console.log({tst_er:e})}}async function o(){try{let e=`
        SELECT DISTINCT "draftYear"
        FROM staging1.drafts
        ORDER BY "draftYear" desc
        `,a=await t.Z.query(e);return a=a.rows}catch(e){console.log({tst_er:e})}}async function l(e){try{let a=`
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

    `,s=await t.Z.query(a,[e]);return s=s.rows}catch(e){throw console.log({tst_er:e}),e}}async function i(){try{let e=`
        SELECT abbreviation, name, id
        FROM staging1.team
        ORDER BY name;
        `,a=await t.Z.query(e);return a=a.rows}catch(e){console.log({tst_er:e})}}async function g(){try{let e=`
        SELECT id
        FROM staging1.team
        `,a=await t.Z.query(e);return a=a.rows}catch(e){console.log({tst_er:e})}}async function p(e){try{let a=`
        SELECT "seasonId", "wins", "losses", "points"
        ,"goalsAgainstPerGame","goalsForPerGame", "regulationAndOtWins" as "row"
        , "pointPct", "winsInShootout"
        FROM Staging1.team_season
        WHERE "teamId" = $1
        ORDER BY "seasonId" desc 
        LIMIT 8
        `,s=await t.Z.query(a,[e]);return s=s.rows}catch(e){console.log({tst_er:e})}}async function d(e){try{let a=`
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
        `,s=await t.Z.query(a,[e]);return s=s.rows}catch(e){console.log(e)}}async function c(e){try{let a=`
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
        `,s=await t.Z.query(a,[e]);return s=s.rows}catch(e){console.log({tst_er:e})}}async function u(e){try{let a=`
        SELECT season
        FROM staging1."team.gametypes"
        WHERE 3 = ANY("gameTypes")
        AND abbreviation = $1
        `,s=await t.Z.query(a,[e]);return s=s.rows.map(e=>e.season)}catch(e){console.log({tst_er:e})}}async function E(e=20222023){try{let a=`
        SELECT     ROW_NUMBER() OVER (ORDER BY ps."stat.points" DESC NULLS LAST, ps."stat.goals" DESC NULLS LAST) AS row_number,
        p."fullName", p.id, p."primaryPosition.code", ps."season", ps."team.name", ps."stat.goals", ps."stat.games",ps."stat.assists", ps."stat.points", ps."team.id"
        FROM staging1.player_stats_new ps
        INNER JOIN staging1.player p
        ON p.id = ps."person.id" AND ps.season = $1
        WHERE ps."league.id" = 133
        ORDER BY ps."stat.points" DESC NULLS LAST,ps."stat.goals" DESC NULLS LAST
        LIMIT 200
        `,s=await t.Z.query(a,[e]);return s=s.rows}catch(e){console.log({tst_er:e})}}},5949:(e,a,s)=>{s.r(a),s.d(a,{default:()=>l});var t=s(997);s(6689);var r=s(6859),n=s.n(r);s(4298);class o extends n(){static async getInitialProps(e){return{...await n().getInitialProps(e)}}render(){return(0,t.jsxs)(r.Html,{lang:"en",children:[t.jsx(r.Head,{children:t.jsx("link",{rel:"icon",sizes:"96x96",href:"/images/Hockey-Net.svg"})}),(0,t.jsxs)("body",{className:"bg-gray-100",children:[t.jsx(r.Main,{}),t.jsx(r.NextScript,{})]})]})}}let l=o},8759:(e,a,s)=>{s.a(e,async(e,t)=>{try{s.r(a),s.d(a,{default:()=>d,getStaticProps:()=>c});var r=s(997),n=s(6689),o=s(1664),l=s.n(o),i=s(5730),g=s(630),p=e([g]);function d({players:e}){let[a,s]=(0,n.useState)([]),t=(0,n.useMemo)(()=>[{header:"Rk",accessorKey:"row_number",cell:({row:e})=>r.jsx("div",{children:e.original.row_number})},{header:"Team",accessorFn:e=>e["team.name"],cell:({row:e})=>r.jsx(l(),{href:`/teams/${e.original["team.id"]}`,passHref:!0,className:" hover:text-blue-700 visited:text-purple-800",children:e.original["team.name"]})},{header:"Name",accessorKey:"fullName",cell:({row:e})=>r.jsx(l(),{href:`/players/${e.original.id}`,passHref:!0,className:" hover:text-blue-700 visited:text-purple-800",children:e.original.fullName})},{header:"Pos.",accessorFn:e=>e["primaryPosition.code"]},{header:"GP",accessorFn:e=>e["stat.games"],cell:e=>r.jsx("p",{className:"text-right",children:e.getValue()})},{header:"G",accessorFn:e=>e["stat.goals"],cell:e=>r.jsx("p",{className:"text-right",children:e.getValue()})},{header:"A",accessorFn:e=>e["stat.assists"],cell:e=>r.jsx("p",{className:"text-right",children:e.getValue()})},{header:"P",accessorFn:e=>e["stat.points"],cell:e=>r.jsx("p",{className:"text-right",children:e.getValue()})}]);return r.jsx("div",{children:e?r.jsx(g.Z,{columns:t,data:e,sortKey:"P"}):r.jsx("h3",{children:"Error Retrieving Stats..."})})}async function c(){try{return{props:{players:await (0,i.pL)()||null}}}catch(e){return console.log("Database connection failed, returning null players"),{props:{players:null},revalidate:60}}}g=(p.then?(await p)():p)[0],t()}catch(e){t(e)}})},5244:(e,a)=>{var s;Object.defineProperty(a,"x",{enumerable:!0,get:function(){return s}}),function(e){e.PAGES="PAGES",e.PAGES_API="PAGES_API",e.APP_PAGE="APP_PAGE",e.APP_ROUTE="APP_ROUTE"}(s||(s={}))},5581:e=>{e.exports=require("aws-amplify")},2785:e=>{e.exports=require("next/dist/compiled/next-server/pages.runtime.prod.js")},968:e=>{e.exports=require("next/head")},5900:e=>{e.exports=require("pg")},6689:e=>{e.exports=require("react")},6405:e=>{e.exports=require("react-dom")},1175:e=>{e.exports=require("react-query")},5918:e=>{e.exports=require("react-query/devtools")},9717:e=>{e.exports=require("react-query/hydration")},997:e=>{e.exports=require("react/jsx-runtime")},5315:e=>{e.exports=require("path")},6869:e=>{e.exports=import("@tanstack/react-table")},6201:e=>{e.exports=import("react-hot-toast")}};var a=require("../webpack-runtime.js");a.C(e);var s=e=>a(a.s=e),t=a.X(0,[139,856,859,414],()=>s(2248));module.exports=t})();