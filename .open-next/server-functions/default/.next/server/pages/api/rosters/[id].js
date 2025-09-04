"use strict";(()=>{var e={};e.id=838,e.ids=[838],e.modules={145:e=>{e.exports=require("next/dist/compiled/next-server/pages-api.runtime.prod.js")},6249:(e,t)=>{Object.defineProperty(t,"l",{enumerable:!0,get:function(){return function e(t,s){return s in t?t[s]:"then"in t&&"function"==typeof t.then?t.then(t=>e(t,s)):"function"==typeof t&&"default"===s?t:void 0}}})},2329:(e,t,s)=>{s.r(t),s.d(t,{config:()=>u,default:()=>l,routeModule:()=>c});var a={};s.r(a),s.d(a,{default:()=>p});var r=s(1802),n=s(7153),i=s(6249);s(4210);var o=s(5584);let p=async(e,t)=>{try{let{id:r}=e.query,n=(await (0,o.Bg)(r)).reduce((e,t)=>((e[t.season.slice(0,4)+"-"+t.season.slice(6)]=e[t.season.slice(0,4)+"-"+t.season.slice(6)]||[]).push(t),e),{});if(n)var s=Object.keys(n),a=n[s[0]][0]["team.name"];t.status(200).json({name:a,rosters:n,seasons:s})}catch(e){console.log({roster_error:e}),t.status(500).send({success:!1})}},l=(0,i.l)(a,"default"),u=(0,i.l)(a,"config"),c=new r.PagesAPIRouteModule({definition:{kind:n.x.PAGES_API,page:"/api/rosters/[id]",pathname:"/api/rosters/[id]",bundlePath:"",filename:""},userland:a})},4210:(e,t,s)=>{s.d(t,{Z:()=>r});let a=new(require("pg")).Pool({user:process.env.DB_USER,password:process.env.DB_PASS,host:process.env.DB_URL,port:process.env.DB_PORT,database:process.env.DB_NAME,max:30,idleTimeoutMillis:3e4,connectionTimeoutMillis:8e3});a.on("error",(e,t)=>{console.error("Unexpected error on idle client",e)});let r=a},5584:(e,t,s)=>{s.d(t,{Bg:()=>r,Q6:()=>p,RC:()=>i,Ug:()=>n,u3:()=>o});var a=s(4210);async function r(e){try{let t=`
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
        `,s=await a.Z.query(t,[e]);return s=s.rows}catch(e){console.log(e)}}async function n(e,t){try{let s=`SELECT ${("Goalie"!==t?['"season"','"league.name"','"team.id"','"team.name"','"stat.games"','"stat.goals"','"stat.pim"','"stat.plusMinus"','"stat.points"','"stat.assists"']:['"season"','"league.name"','"team.id"','"team.name"','"stat.games"','"stat.wins"','"stat.losses"','"stat.goals"','"stat.savePercentage"','"stat.goalAgainstAverage"','"stat.shutouts"','"stat.pim"','"stat.plusMinus"','"stat.points"','"stat.assists"']).join(", ")}
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
        `,t=await a.Z.query(e);return t=t.rows}catch(e){console.log({tst_er:e})}}},7153:(e,t)=>{var s;Object.defineProperty(t,"x",{enumerable:!0,get:function(){return s}}),function(e){e.PAGES="PAGES",e.PAGES_API="PAGES_API",e.APP_PAGE="APP_PAGE",e.APP_ROUTE="APP_ROUTE"}(s||(s={}))},1802:(e,t,s)=>{e.exports=s(145)}};var t=require("../../../webpack-api-runtime.js");t.C(e);var s=t(t.s=2329);module.exports=s})();