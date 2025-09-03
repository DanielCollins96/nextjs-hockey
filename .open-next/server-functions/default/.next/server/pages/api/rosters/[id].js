try{!function(){var e="undefined"!=typeof window?window:"undefined"!=typeof global?global:"undefined"!=typeof globalThis?globalThis:"undefined"!=typeof self?self:{},t=(new e.Error).stack;t&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[t]="a93d8075-0883-48ca-b67b-a2a5800a7afe",e._sentryDebugIdIdentifier="sentry-dbid-a93d8075-0883-48ca-b67b-a2a5800a7afe")}()}catch(e){}"use strict";(()=>{var e={};e.id=838,e.ids=[838],e.modules={58097:e=>{e.exports=require("@sentry/nextjs")},20145:e=>{e.exports=require("next/dist/compiled/next-server/pages-api.runtime.prod.js")},56249:(e,t)=>{Object.defineProperty(t,"l",{enumerable:!0,get:function(){return function e(t,s){return s in t?t[s]:"then"in t&&"function"==typeof t.then?t.then(t=>e(t,s)):"function"==typeof t&&"default"===s?t:void 0}}})},88746:(e,t,s)=>{let a;s.r(t),s.d(t,{config:()=>m,default:()=>y,routeModule:()=>E});var n={};s.r(n),s.d(n,{config:()=>c,default:()=>g});var r=s(71802),i=s(47153),o=s(56249);s(43333);var p=s(18360),l=s(58097),d=Object.freeze({__proto__:null,default:async(e,t)=>{try{let{id:n}=e.query,r=(await (0,p.Bg)(n)).reduce((e,t)=>((e[t.season.slice(0,4)+"-"+t.season.slice(6)]=e[t.season.slice(0,4)+"-"+t.season.slice(6)]||[]).push(t),e),{});if(r)var s=Object.keys(r),a=r[s[0]][0]["team.name"];t.status(200).json({name:a,rosters:r,seasons:s})}catch(e){console.log({roster_error:e}),t.status(500).send({success:!1})}}});"default"in d&&"function"==typeof d.default?a=d.default:"function"==typeof d&&(a=d);let u=d.config||{},c={...u,api:{...u.api,externalResolver:!0}},f=a;f&&(f=l.wrapApiHandlerWithSentry(f,"/api/rosters/[id]"));let g=f,y=(0,o.l)(n,"default"),m=(0,o.l)(n,"config"),E=new r.PagesAPIRouteModule({definition:{kind:i.x.PAGES_API,page:"/api/rosters/[id]",pathname:"/api/rosters/[id]",bundlePath:"",filename:""},userland:n})},43333:(e,t,s)=>{s.d(t,{Z:()=>n});let a=new(require("pg")).Pool({user:process.env.DB_USER,password:process.env.DB_PASS,host:process.env.DB_URL,port:process.env.DB_PORT,database:process.env.DB_NAME,max:30,idleTimeoutMillis:3e4,connectionTimeoutMillis:8e3});a.on("error",(e,t)=>{console.error("Unexpected error on idle client",e)});let n=a},18360:(e,t,s)=>{s.d(t,{Bg:()=>n,Q6:()=>p,RC:()=>i,Ug:()=>r,u3:()=>o});var a=s(43333);async function n(e){try{let t=`
        SELECT p."fullName", p.id, p."primaryPosition.code", f."seasonId", ps."team.name",ps.season, p."fullName",
        ps."stat.games",ps."stat.goals",ps."stat.assists",ps."stat.points", ps."stat.pim", ps."stat.plusMinus"
        FROM staging1.team t
        inner JOIN staging1.franchise f
        ON t.id = f."teamId"
        AND "gameTypeId" = 2
        INNER JOIN staging1.player_stats ps
        ON f."seasonId" = ps."season"
        AND f."teamId" = ps."team.id"
        LEFT JOIN staging1.player p
        ON p.id = ps."person.id"
        WHERE t.id = $1
        AND p.id is not null
        ORDER BY "seasonId" desc
        -- LIMIT 1
        `,s=await a.Z.query(t,[e]);return s=s.rows}catch(e){console.log(e)}}async function r(e,t){try{let s=`SELECT ${("Goalie"!==t?['"season"','"league.name"','"team.id"','"team.name"','"stat.games"','"stat.goals"','"stat.pim"','"stat.plusMinus"','"stat.points"','"stat.assists"']:['"season"','"league.name"','"team.id"','"team.name"','"stat.games"','"stat.wins"','"stat.losses"','"stat.goals"','"stat.savePercentage"','"stat.goalAgainstAverage"','"stat.shutouts"','"stat.pim"','"stat.plusMinus"','"stat.points"','"stat.assists"']).join(", ")}
                 FROM staging1.player_stats_new ps
                 WHERE ps."person.id" = $1`;return(await a.Z.query(s,[e])).rows}catch(e){console.log(e)}}async function i(e){try{let t=`
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
        `,s=await a.Z.query(t,[e]);return s=s.rows}catch(e){console.log({tst_er:e})}}async function o(){try{let e=`
        SELECT DISTINCT id
        FROM staging1.player p
        WHERE active = true
        LIMIT 150
        `,t=await a.Z.query(e);return t=t.rows}catch(e){console.log({tst_er:e})}}async function p(){try{let e=`
        SELECT DISTINCT "draftYear"
        FROM staging1.drafts
        ORDER BY "draftYear" desc
        `,t=await a.Z.query(e);return t=t.rows}catch(e){console.log({tst_er:e})}}},47153:(e,t)=>{var s;Object.defineProperty(t,"x",{enumerable:!0,get:function(){return s}}),function(e){e.PAGES="PAGES",e.PAGES_API="PAGES_API",e.APP_PAGE="APP_PAGE",e.APP_ROUTE="APP_ROUTE"}(s||(s={}))},71802:(e,t,s)=>{e.exports=s(20145)}};var t=require("../../../webpack-api-runtime.js");t.C(e);var s=t(t.s=88746);module.exports=s})();
//# sourceMappingURL=[id].js.map