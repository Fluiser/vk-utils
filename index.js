const fs = require("fs");
const superagent = require("superagent");
const exe = [];
require("./scr/prototypes.js");
const {cin, sleep} = require("./scr/help.js");
const cfg = require("./config.json")

for(let dir of fs.readdirSync("./functions"))
{
    exe.push(require("./functions/" + dir));
}

async function call(method, arg = {}, errorN) {
    return new Promise((resolve, reject) => {
       superagent.get("https://api.vk.com/method/" + method).query({
           access_token: cfg.token,
           v: "5.103",
           ...arg
       }).end(async (error, result) => {
           if(error) {
             console.log(error);
             if(errorN >= 3) reject(error);
             else { 
               console.log(error);
               console.log("Wait 5 seconds...");
               await sleep(5000);
               resolve(await call(method, arg, Number.isNaN(errorN) ? 1 : errorN + 1));
             }
           }
           else resolve( result.body.response || result.body);
       });
    });
}

(async() => {
    for(let i = 0; i < exe.length; i++)
    {
        console.log(`[${i+1}]-[${exe[i].name}]: ${exe[i].description}`);
    }
    let execution = await cin();
        execution = exe[execution-1] || exe.find(e => e.name === execution.toLowerCase());
    if(!execution) {
        console.log(`I can't find defined function...\nSorry.`);
        return;
    }
    
    
    //for(let key of Object.keys(cfg)) cfg[key] = await cin(`>${key}[default: ${cfg[key]}]: `);
    
    let oldToken = cfg.token;
    cfg.token = await cin(">token[If you used default token in (config.json) press enter]: ") ||  cfg.token;
    if(oldToken !== cfg.token && (await cin("Save update token? (default no) [Y/N]: ")).toLowerCase().startsWith("y")) fs.writeFileSync("./config.json", JSON.stringify(cfg, undefined, " "));
    let permissionUser = await call("apps.getScopes");
    let missing = [];

    if(permissionUser.error) {
        console.log(permissionUser.error);
        return;
    } else permissionUser = permissionUser.items.map(p => p.name);

    if((missing = execution.permission.filter(p => !permissionUser.includes(p))).length) {
        console.log(`You do not have permissions: ${missing.join(", ")}`);
        return;
    }

    execution.run(cfg, call);
})();
