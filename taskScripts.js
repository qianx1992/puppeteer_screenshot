var MongoDB = require('./mongodb');
var screenshot = require('./screenfn');

MongoDB.find('task',{"isOpen":true}, function (err, res) {
   var list= [];
    if(res.length > 0){
       list= res.filter(function(item){
           return new Date().getTime() >= new Date(item.lastRunTime).getTime()+ Number(item.timeInterval);
       });
        /*screenshot([list[0]]);*/
        screenshot(list).then(function(resultList){
            if(!resultList || resultList.length == 0){
                return;
            }
            for(var i=0; i<resultList.length;i++){

                MongoDB.writeFile(resultList[i].fileName);
                console.dir(resultList[i].screenshotImages);
                MongoDB.update( "task",{"_id":resultList[i]._id },
                    { "lastRunTime" : resultList[i].lastRunTime,
                    "screenshotImages":resultList[i].screenshotImages},function(err,response){

                });
            }

        });
    }
});
