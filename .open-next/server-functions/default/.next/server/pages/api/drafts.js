"use strict";(()=>{var t={};t.id=335,t.ids=[335],t.modules={145:t=>{t.exports=require("next/dist/compiled/next-server/pages-api.runtime.prod.js")},6249:(t,e)=>{Object.defineProperty(e,"l",{enumerable:!0,get:function(){return function t(e,s){return s in e?e[s]:"then"in e&&"function"==typeof e.then?e.then(e=>t(e,s)):"function"==typeof e&&"default"===s?e:void 0}}})},264:(t,e,s)=>{s.r(e),s.d(e,{config:()=>u,default:()=>l,routeModule:()=>d});var a={};s.r(a),s.d(a,{default:()=>p});var r=s(1802),n=s(7153),i=s(6249),o=s(5584);async function p(t,e){try{let t=await (0,o.Q6)();console.log(t),e.status(200).json(t)}catch(t){}}let l=(0,i.l)(a,"default"),u=(0,i.l)(a,"config"),d=new r.PagesAPIRouteModule({definition:{kind:n.x.PAGES_API,page:"/api/drafts",pathname:"/api/drafts",bundlePath:"",filename:""},userland:a})},4210:(t,e,s)=>{s.d(e,{Z:()=>r});let a=new(require("pg")).Pool({user:process.env.DB_USER,password:process.env.DB_PASS,host:process.env.DB_URL,port:process.env.DB_PORT,database:process.env.DB_NAME,max:30,idleTimeoutMillis:3e4,connectionTimeoutMillis:8e3});a.on("error",(t,e)=>{console.error("Unexpected error on idle client",t)});let r=a},5584:(t,e,s)=>{s.d(e,{Bg:()=>r,Q6:()=>p,RC:()=>i,Ug:()=>n,u3:()=>o});var a=s(4210);async function r(t){try{let e=`
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
        `,s=await a.Z.query(e,[t]);return s=s.rows}catch(t){console.log(t)}}async function n(t,e){try{let s=`SELECT ${("Goalie"!==e?['"season"','"league.name"','"team.id"','"team.name"','"stat.games"','"stat.goals"','"stat.pim"','"stat.plusMinus"','"stat.points"','"stat.assists"']:['"season"','"league.name"','"team.id"','"team.name"','"stat.games"','"stat.wins"','"stat.losses"','"stat.goals"','"stat.savePercentage"','"stat.goalAgainstAverage"','"stat.shutouts"','"stat.pim"','"stat.plusMinus"','"stat.points"','"stat.assists"']).join(", ")}
                 FROM staging1.player_stats_new ps
                 WHERE ps."person.id" = $1`;return(await a.Z.query(s,[t])).rows}catch(t){console.log(t)}}async function i(t){try{let e=`
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
        `,s=await a.Z.query(e,[t]);return s=s.rows}catch(t){console.log({tst_er:t})}}async function o(){try{let t=`
        SELECT DISTINCT id
        FROM staging1.player p
        WHERE active = true
        LIMIT 150
        `,e=await a.Z.query(t);return e=e.rows}catch(t){console.log({tst_er:t})}}async function p(){try{let t=`
        SELECT DISTINCT "draftYear"
        FROM staging1.drafts
        ORDER BY "draftYear" desc
        `,e=await a.Z.query(t);return e=e.rows}catch(t){console.log({tst_er:t})}}},7153:(t,e)=>{var s;Object.defineProperty(e,"x",{enumerable:!0,get:function(){return s}}),function(t){t.PAGES="PAGES",t.PAGES_API="PAGES_API",t.APP_PAGE="APP_PAGE",t.APP_ROUTE="APP_ROUTE"}(s||(s={}))},1802:(t,e,s)=>{t.exports=s(145)}};var e=require("../../webpack-api-runtime.js");e.C(t);var s=e(e.s=264);module.exports=s})();