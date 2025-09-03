try{!function(){var e="undefined"!=typeof window?window:"undefined"!=typeof global?global:"undefined"!=typeof globalThis?globalThis:"undefined"!=typeof self?self:{},t=(new e.Error).stack;t&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[t]="efe20fb5-af77-4daa-9a70-affc553d10d3",e._sentryDebugIdIdentifier="sentry-dbid-efe20fb5-af77-4daa-9a70-affc553d10d3")}()}catch(e){}"use strict";(()=>{var e={};e.id=874,e.ids=[874],e.modules={58097:e=>{e.exports=require("@sentry/nextjs")},20145:e=>{e.exports=require("next/dist/compiled/next-server/pages-api.runtime.prod.js")},56249:(e,t)=>{Object.defineProperty(t,"l",{enumerable:!0,get:function(){return function e(t,a){return a in t?t[a]:"then"in t&&"function"==typeof t.then?t.then(t=>e(t,a)):"function"==typeof t&&"default"===a?t:void 0}}})},89989:(e,t,a)=>{let s;a.r(t),a.d(t,{config:()=>m,default:()=>y,routeModule:()=>E});var n={};a.r(n),a.d(n,{config:()=>f,default:()=>g});var r=a(71802),i=a(47153),o=a(56249);a(43333);var p=a(18360),l=a(58097),d=Object.freeze({__proto__:null,default:async function(e,t){try{let e=await (0,p.u3)();t.status(200).json(e)}catch(e){t.status(500).json({message:e.message})}}});"default"in d&&"function"==typeof d.default?s=d.default:"function"==typeof d&&(s=d);let u=d.config||{},f={...u,api:{...u.api,externalResolver:!0}},c=s;c&&(c=l.wrapApiHandlerWithSentry(c,"/api/players_delete"));let g=c,y=(0,o.l)(n,"default"),m=(0,o.l)(n,"config"),E=new r.PagesAPIRouteModule({definition:{kind:i.x.PAGES_API,page:"/api/players_delete",pathname:"/api/players_delete",bundlePath:"",filename:""},userland:n})},43333:(e,t,a)=>{a.d(t,{Z:()=>n});let s=new(require("pg")).Pool({user:process.env.DB_USER,password:process.env.DB_PASS,host:process.env.DB_URL,port:process.env.DB_PORT,database:process.env.DB_NAME,max:30,idleTimeoutMillis:3e4,connectionTimeoutMillis:8e3});s.on("error",(e,t)=>{console.error("Unexpected error on idle client",e)});let n=s},18360:(e,t,a)=>{a.d(t,{Bg:()=>n,Q6:()=>p,RC:()=>i,Ug:()=>r,u3:()=>o});var s=a(43333);async function n(e){try{let t=`
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
        `,a=await s.Z.query(t,[e]);return a=a.rows}catch(e){console.log(e)}}async function r(e,t){try{let a=`SELECT ${("Goalie"!==t?['"season"','"league.name"','"team.id"','"team.name"','"stat.games"','"stat.goals"','"stat.pim"','"stat.plusMinus"','"stat.points"','"stat.assists"']:['"season"','"league.name"','"team.id"','"team.name"','"stat.games"','"stat.wins"','"stat.losses"','"stat.goals"','"stat.savePercentage"','"stat.goalAgainstAverage"','"stat.shutouts"','"stat.pim"','"stat.plusMinus"','"stat.points"','"stat.assists"']).join(", ")}
                 FROM staging1.player_stats_new ps
                 WHERE ps."person.id" = $1`;return(await s.Z.query(a,[e])).rows}catch(e){console.log(e)}}async function i(e){try{let t=`
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
        `,a=await s.Z.query(t,[e]);return a=a.rows}catch(e){console.log({tst_er:e})}}async function o(){try{let e=`
        SELECT DISTINCT id
        FROM staging1.player p
        WHERE active = true
        LIMIT 150
        `,t=await s.Z.query(e);return t=t.rows}catch(e){console.log({tst_er:e})}}async function p(){try{let e=`
        SELECT DISTINCT "draftYear"
        FROM staging1.drafts
        ORDER BY "draftYear" desc
        `,t=await s.Z.query(e);return t=t.rows}catch(e){console.log({tst_er:e})}}},47153:(e,t)=>{var a;Object.defineProperty(t,"x",{enumerable:!0,get:function(){return a}}),function(e){e.PAGES="PAGES",e.PAGES_API="PAGES_API",e.APP_PAGE="APP_PAGE",e.APP_ROUTE="APP_ROUTE"}(a||(a={}))},71802:(e,t,a)=>{e.exports=a(20145)}};var t=require("../../webpack-api-runtime.js");t.C(e);var a=t(t.s=89989);module.exports=a})();
//# sourceMappingURL=players_delete.js.map