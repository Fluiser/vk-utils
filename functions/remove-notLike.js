const {cin, sleep, UDSelect} = require("../scr/help.js");

module.exports.name = "remove-notLike";
module.exports.description = "Удаляет или блокирует пользователей, которые не ставят \"нравится\". Перед использованием допилить напильником.";
module.exports.permission = ["friends"];

const MAX_POSTS = 100;
const whiteList = [

];

const doWithUser = [
    {
        text: 'block',
        value: (user_id, call) => call("account.ban", {owner_id: user_id})
    },
    {
        text: 'delete',
        value: (user_id, call) => call("friends.delete", {user_id})
    },
    {
        text: 'ignore',
        value: () => 'ignored'
    }
];

async function friendsGet(call) {
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
    const [author] = await call('users.get');
    const posts = new Set();
    {
        let lengthCollection = Infinity;
        console.log('\n------------ INIT POSTS ---------\n');
        for(let i = 0; i <= MAX_POSTS && i < lengthCollection;)
        {
            console.log("Collected posts index ", i);
            const data = await call('wall.get', {offset: i, count: 100});
            lengthCollection = data.count;
            for(const item of data.items)
            {
                if(posts.size >= MAX_POSTS) break;
                posts.add(item);
            }
            i += data.items.length;
            await sleep(5000);
        }
        console.log(`Length collection posts ${lengthCollection} | ${posts.size}`);
    }

    let items = await friendsGet(call);
    const users = new Map();
    items = items.limitedList(300);
    
    console.log('-------------\nINIT FRIENDS\n------------');

    for(let i = 0, j = 0; i < items.length; ++i)
    {
        console.log(`[received: ${i+1}]/[total: ${items.length}]`)
        let r = await call("users.get", {user_ids: items[i].join(","), fields: 'photo_50'});
        for(const element of r)
            users.set(element.id, element);
        await sleep(2500);
    }

    //@remove whitelist

    for(const wi of whiteList)
    {
        users.delete(wi);
    }

    //

    console.log('\n-------------INIT LIKES ON EVERY POST-------------\n');
    {
        function collect(items) {
            for(const user_id of items)
            {
                const user = users.get(user_id);
                if(user)
                    if(typeof user.likesCount === 'undefined') user.likesCount = 1;
                    else ++user.likesCount;
                // else {
                // 	users.set(user_id, {likesCount: 1, id: user_id, anon: true});
                // }
            }
        }
        for(const post of posts)
        {
            console.log(`Collecting likes on ${post.id}`);
            for(let i = 0; i < post.likes.count;)
            {
                await sleep(3500);
                const data = await call('likes.getList', {
                    type: 'post',
                    owner_id: author.id, 
                    item_id: post.id, 
                    filter: 'likes',
                    friends_only: 1,
                    count: 100,
                    offset: i
                });
                i += data.count;
                collect(data.items);
            }
        }
        console.log('\n---------- END INIT LIKES ---------\n');
    }

    // console.log('--------- BLOCKED USERS -----------');
    // const functionBlockUsers = await UDSelect(doWithUser);
    // console.log('-------- WRONT PHOTO USERS --------');
    // const functionPhotoUsers = await UDSelect(doWithUser);
    // console.log('--------- WHO DONT LIKE -----------');
    // const functionNotLikeUsers = await UDSelect(doWithUser);
    const count = +(await cin('[count for do]: '));

    const liked = [];
    const normalNotLiked = [];
    const notLiked = [];
    for(const value of users.values())
    {
        if(value.likesCount){ if(value.deactivated) liked.push(value); else normalNotLiked.push(value); }
        else if(value.deactivated) notLiked.push(value);
    }

    console.log(notLiked.length, ' will be blocked');

    for(const user of notLiked)
    {
        const result = await doWithUser[0].value(user.id, call);
        await sleep(5500);
        console.log(`${user.first_name} ${user.last_name} [${user.id}] - ${result.success || result.error && result.error.error_msg || result}`);
    }

    console.log(liked.length, ' normal');
    for(const user of liked)
    {
        const result = await doWithUser[1].value(user.id, call);
        await sleep(5500);
        console.log(`${user.first_name} ${user.last_name} [${user.id}] - ${result.success || result.error && result.error.error_msg || result}`)
    }

    for(let i = 0; i < count; ++i)
    {
        const user = normalNotLiked[i];
        const result = await doWithUser[0].value(user.id, call);
        console.log(`${user.first_name} ${user.last_name} [${user.id}] - ${result.success || result.error && result.error.error_msg || result}`)
        await sleep(5500);
    }

    // for(const user of [...users.values()].sort((a,b) =>  (b.likesCount ||0) - (a.likesCount||0) ))
    // {
    //     // let text;
    //     // if(user.deactivated)
    //     // { // забанен
    //     //     const result = await functionBlockUsers(user.id, call);
    //     //     text = `deactivated (${result.success || result.error && result.error.error_msg || result})`;
    //     // }
    //     // if(!somethingDo && user.photo_50 === 'https://vk.com/images/camera_50.png')
    //     // { // фото мусор
    //     //     const result = await functionPhotoUsers(user.id, call);
    //     //     text = `bad photo (${result.success || result.error && result.error.error_msg || result})`;
    //     // }
    //     // if(!somethingDo && !user.likesCount && completedCount < count)
    //     // { // Не лайкает
    //     //     const result = await functionNotLikeUsers(user.id, call);
    //     //     ++completedCount;
    //     //     text = `not liked (${result.success || result.error && result.error.error_msg || result})`;
    //     // }
    //     // console.log(`${user.first_name} ${user.last_name} [${user.id}] - ${text ? text.red : 'skip'.green}`);
    //     // if(somethingDo)
    //     //     await sleep(3500);
    //     fileLog.write(`${user.anon ? user.id : `${user.first_name} ${user.last_name} [${user.id}]`} - ${user.likesCount||0} лайков\n`);
    // }

    console.log(`Total length friends: ${users.length}`);
};
