Array.prototype.limitedList = function(limit) {
    let index = []
    for (let i = 0; i < this.length; i+=limit) {
        index.push(this.slice(i, i + limit));
    }
    return arr;
}
