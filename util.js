var utils = function(){

};
utils.prototype.getNowFormatDate = function(isseperator) {
    let date = new Date();
    var seperator1 = "",seperator2 = "",seperator3 = "";
    if(isseperator){
        seperator1 = "-";
        seperator2 = ":";
        seperator3 = " ";
    }

    let currentdate = date.getFullYear() + seperator1 + (isZero(date.getMonth() + 1)) + seperator1 + isZero(date.getDate())
        + seperator3 + isZero(date.getHours()) + seperator2 + isZero(date.getMinutes())
        + seperator2 + isZero(date.getSeconds());
    return currentdate;
};
function isZero(a){
    return a >= 0 && a <= 9 ? "0" + a : a;
}
module.exports = new utils();