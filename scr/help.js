/**
 * 
 * @param {String} data 
 * @returns Promise<string>
 */
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

/**
 * 
 * @param {String[] | {text: string, value: unknown}} data 
 * @returns Promise<string>
 */
module.exports.UDSelect = async (data, text) => {
    if(typeof data[0] === 'object') {
        for(let i = 0; i < data.length; ++i)
            console.log(`[${i+1}] ${data[i].text}`);
        let index = await module.exports.cin(text);
        let value = data[index-1];
        while(!(value = data[index-1]))
        {
            console.log('\nWrong answer.\n');
            index = await module.exports.cin(text);
            value = data[index-1];
        }
        return value.value;
    } else {
        for(let i = 0; i < data.length; ++i)
            console.log(`[${i+1}] ${data[i] = data[i].toLowerCase()}`);
        let index = await module.exports.cin(text).then(str => str.toLowerCase());
        const check = () => Number.isNaN(+index) ? data.find(e => e === index) : index >= data.length ? undefined : data[+index];
        let value;
        while(!(value = check()))
        {
            console.log(value, `'${index}'`, data, '\nWrong answer.\n');
            index = await module.exports.cin(text);
            check();
        }
        return value;
    }
}

//@colors
String.prototype.__defineGetter__('red', function(){
    return `\x1B[31m${this}\x1B[39m`;
});
String.prototype.__defineGetter__('green', function() {
    return `\x1B[32m${this}\x1B[39m`;
});
