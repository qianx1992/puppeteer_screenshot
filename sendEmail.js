/**
 *
 * @Description 邮件发送
 * 调用方法:sendMail('amor_zhang@qq.com','这是测试邮件', 'Hi Amor,这是一封测试邮件');
 *
 */

var nodemailer = require('nodemailer')
var smtpTransport = require('nodemailer-smtp-transport');
/*var config = require('./config')*/
var email={
    service: 'QQ',
    user: '1328535229@qq.com',
    pass: 'jdnfadclxsxxbacj',
};

smtpTransport = nodemailer.createTransport(smtpTransport({
    service: email.service,
    auth: {
        user: email.user,
        pass: email.pass
    }
}));

/**
 * @param {String} recipient 收件人
 * @param {String} subject 发送的主题
 * @param {String} html 发送的html内容
 */
var sendEmail = function (recipient, subject, html) {

    smtpTransport.sendMail({

        from: email.user,
        to: recipient,
        subject: subject,
        html: html

    }, function (error, response) {
        if (error) {
            console.log(error);
        }
        console.log('发送成功')
    });
}

module.exports = sendEmail;