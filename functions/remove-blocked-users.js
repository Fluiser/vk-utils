const {cin, sleep} = require("../scr/help.js");

module.exports.name = "remove-users";
module.exports.description = "Remove blocked user of friends; Has flags: sort(flag): [full, f], [photo], [string, fname, lname]; Method(flag): [block, black, blocklist, blacklist]";
module.exports.permission = ["friends"];

const fullCheck 			= user => 	user.deactivated ||
										(user.first_name.match(/[^0-zА-я-\s]/) || user.last_name.match(/[^0-zА-я-\s]/)) ||
										user.photo_50 === 'https://vk.com/images/camera_50.png';
const photoCheck 			= user => 	user.deactivated || user.photo_50 === 'https://vk.com/images/camera_50.png';
const trashStringCheck 		= user => 	user.deactivated ||
										(user.first_name.match(/[^0-zА-я-\s]/) || user.last_name.match(/[^0-zА-я-\s]/));
const defaultCheck 			= user => 	user.deactivated;

const functionCheck = 	['full', 'f', '--full', '-full'].some(str => process.argv.includes(str)) ? fullCheck :
						['photo', '--photo', '-photo'].some(str => process.argv.includes(str)) ? photoCheck :
						['string', 'fname', 'lname', '-fname', '-lname'].some(str => process.argv.includes(str)) ? trashStringCheck :
						defaultCheck;
const functionDelete =  ['block', 'black', 'blocklist', 'blacklist', '-block', '-black', 'blocklist', 'blacklist'].some(str => process.argv.includes(str)) ?
						(user, call) => call("account.ban", {owner_id: user.id}) :
						(user, call) => call("friends.delete", {user_id: user.id});

// console.log(''+functionCheck, '\n', ''+functionDelete); //for test.

module.exports.run = async (cfg, call) => {
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
        let r = await call("users.get", {user_ids: items[i].join(","), fields: 'photo_50'});
        busers = busers.concat(r.filter(functionCheck));
        await sleep(2500);
    }

    console.log(`Total length blocked users: ${busers.length}`);

    for(let user of busers)
    {
        const result = await functionDelete(user, call);
        console.log(`${user.first_name} ${user.last_name}[${user.id}]:`, result.success || result.error && result.error.error_msg || result);
        await sleep(10500);
    }
};
