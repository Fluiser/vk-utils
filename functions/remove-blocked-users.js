const {cin, sleep} = require("../scr/help.js");

module.exports.name = "remove-users";
module.exports.description = "Remove blocked user of friends";
module.exports.permission = ["friends"];
module.exports.run = async (cfg, call) => {
    let token = await cin(">token[If you used default token in (config.json) press enter]: ") ||  cfg.token;
    let user = await call("users.get");
    if(user.error) {
        console.log(user);
        return;
    }
    [user] = user;

    let {items} = await call("friends.get", {count: 10000});
    items = items.limitedList(300);
    let busers = [];

    for(let i = 0; i < items.length; ++i)
    {
        console.log(`[received: ${i+1}]/[total: ${items.length}]`)
        let r = await call("users.get", {user_ids: items[i].join(",")});
        busers = busers.concat(r.filter(user => user.deactivated));
        await sleep(300);
    }

    console.log(`Total length blocked users: ${busers.length}`);

    for(let user of busers)
    {
        console.log(`${user.first_name} ${user.last_name}: ${(await call("friends.delete", {user_id: user.id})).success || "ERR"}`);
        await sleep(2200);
    }
};
