module.exports.cin = (str) => {
    const readline = require('readline');
    return new Promise(resolve => {
       let rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
       });
       rl.question(str || "> ", data => {
           rl.close();
           resolve(data);
       })
    });
};

module.exports.sleep = ms => new Promise(r => setTimeout(r, ms));