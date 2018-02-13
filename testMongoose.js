//先包含进来
var MongoDB = require('./mongodb');

//查询一条数据
/*MongoDB.findOne('UrlParameters', {Md5: "70a61614d61ddab175e302af6f7cd54a"}, function (err, res) {
    console.log(res);
});*/

/*//查询多条数据
MongoDB.find('UrlParameters',{},"Md5 Parameter", function (err, res) {
    console.log(res);
});*/

MongoDB.save('UrlParameters',{Md5:"12121212",Parameter:"{profile:'qx'}"}, function (err, res) {
    console.log(res);
});
