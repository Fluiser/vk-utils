const {cin, sleep} = require("../scr/help.js");

module.exports.name = "add-friends";
module.exports.description = "Adding friends.";
module.exports.permission = ["friends"];

module.exports.types = {};
module.exports.types.random = async(cfg,call) => {
	let length = await cin(">length: ");
	if(Number.isNaN(length=+length)) {
		console.log("It's not numbedr...");
		return module.exports.types.random(cfg, call);
	}
	//...
};

module.exports.types.default = () => console.log("Unknow type...");

module.exports.run = async(cfg,call) => {
	/*let type = await cin("Type: [random, request]: ");
	(module.exports.types[type.toLowerCase()] || module.exports.types.defalt)(cfg, call);
	*/ //Well, I think it's doesn't sense.

	let items = [];
	
	for(let res, offset = 0; res ? res.count >= 1000 : (res = await call("users.getFollowers", {offset, count: 1000})); offset += 1000)
	{
		items = items.concat(res.items);
	}

	let users = [];
	for(let req of items.limitedList(300))
	{
		users = users.concat( (await call("users.get", {user_ids: req.join(",")})).filter(user => !user.deactivated) );
		await sleep(400);
	}

	console.log(`Total length: ${users.length}`);

	for(let user of users)
	{
		console.log(`${user.first_name} ${user.last_name}[${user.id}]: ${await call("friends.add", {user_id: user.id})}`);
		await sleep(3000);
	}
};
