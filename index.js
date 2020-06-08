const fs = require("fs");
const superagent = require("superagent");
const exe = [];
require("./scr/prototypes.js");
const {cin} = require("./scr/help.js");
const cfg = require("./config.json")

for(let dir of fs.readdirSync("./functions"))
{
    exe.push(require("./functions/" + dir));
}

async function call(method, arg = {}) {
    return new Promise(resolve => {
       superagent.get("https://api.vk.com/method/" + method).query({
           access_token: cfg.token,
           v: "5.103",
           ...arg
       }).end((error, result) => {
           resolve( result.body.response || result.body);
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
    execution.run(cfg, call);
})();