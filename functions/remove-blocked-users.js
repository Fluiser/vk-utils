const {cin, sleep} = require("../scr/help.js");

module.exports.name = "remove-users";
module.exports.description = "Remove blocked user of friends; Has flags: sort(flag): [full, f], [photo], [string, fname, lname]; Method(flag): [block, black, blocklist, blacklist]";
module.exports.permission = ["friends"];

const photoCheck 			= user => 	user.deactivated || ['pp.userapi.com/60tZWMo4SmwcploUVl9XEt8ufnTTvDUmQ6Bj1g/mmv1pcj63C4.png', 'vk.com/images/camera_50.png'].some(url => user.photo_50.includes(url));
const trashStringCheck 		= user => 	user.deactivated ||
										(user.first_name.match(/[^0-zА-я-\s]/) || user.last_name.match(/[^0-zА-я-\s]/));
const defaultCheck 			= user => 	user.deactivated;
const fullCheck             = user =>   photoCheck(user) || trashStringCheck(user);

const functionCheck = 	['full', 'f', '--full', '-full'].some(str => process.argv.includes(str)) ? fullCheck :
						['photo', '--photo', '-photo'].some(str => process.argv.includes(str)) ? photoCheck :
						['string', 'fname', 'lname', '-fname', '-lname'].some(str => process.argv.includes(str)) ? trashStringCheck :
						defaultCheck;
const functionDelete =  ['block', 'black', 'blocklist', 'blacklist', '-block', '-black', 'blocklist', 'blacklist'].some(str => process.argv.includes(str)) ?
						(user, call) => call("account.ban", {owner_id: user.id}) :
						(user, call) => call("friends.delete", {user_id: user.id});

// console.log(''+functionCheck, '\n', ''+functionDelete); //for test.

async function usersGet(call) {
    let info = await call("friends.get", {count: 10000});
    const totalFriends = info.count;
    let items = info.items;

    for(let i = 1; i < Math.ceil(totalFriends/2500); ++i)
    {
        console.log(`${i*2500}/${totalFriends}`);
        await sleep(2000);
        const nextitems = await call("friends.get", {count: 2500, offset: i*2500});
        items = items.concat(nextitems.items);
    }

    return items;
}

module.exports.run = async (cfg, call) => {
    // let user = await call("users.get");
    // if(user.error) {
    //     console.log(user);
    //     return;
    // }
    // [user] = user;

    let items = await usersGet(call);
    items = items.limitedList(300);

    let busers = [];
    // console.log(items.map(i => i.length),items.map(i => i.length).reduce((a,b) => a+b));
    // return;

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
