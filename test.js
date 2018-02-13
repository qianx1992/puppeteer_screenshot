/*var MongoDB = require('./mongodb');
var screenshot =require('./screenfn');
MongoDB.find('task',{"isOpen":true}, function (err, res) {
    console.log(res);
});
process.exitCode = 0;*/
var sendMail =require('./sendEmail.js');

sendMail('qianxing@gridsum.com','这是测试邮件', 'Hi Amor,这是一封测试邮件');