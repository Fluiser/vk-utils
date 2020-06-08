Array.prototype.limitedList = function(limit) {
    let index = [];
    for(let i = 0, indexLimit = 0;indexLimit < this.length; ++indexLimit)
    {
        if(!index[i]) index[i] = [];
        if(index[i].length+1 > limit) ++i;
        if(!index[i]) index[i] = [];

        index[i].push(this[indexLimit]);
    }
    return index;
}
