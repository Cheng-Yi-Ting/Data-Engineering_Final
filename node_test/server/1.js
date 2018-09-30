//引用 nodemailer
var nodemailer = require('nodemailer');

//宣告發信物件
var transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
        user: "d02405035@ems.npu.edu.tw",
        pass: "kk950411"
    }
});


var my_list = ['d02405035@gmail.com', 'peterchengapple@yahoo.com.tw']
yahoo = 'https://tw.yahoo.com/'
var options = {
    //寄件者
    from: 'd02405035@ems.npu.edu.tw',
    //收件者
    to: my_list,
    //副本
    // cc: 'd02405035@gmail.com',
    // //密件副本
    // bcc: 'account4@gmail.com',
    //主旨
    subject: '這是 node.js 發送的測試信件', // Subject line
    //純文字
    text: 'Hello world2', // plaintext body
    //嵌入 html 的內文
    html: ' <h3>男女親到忘我「互吸大腿內側」　埋胸狂蹭…火辣實境節目爆紅！，還有 29 則最新報導</h3><hr><ul><li> <a href="https://star.ettoday.net/news/1192069">男女親到忘我「互吸大腿內側」　埋胸狂蹭…火辣實境節目爆紅！</a> </li>  <li><a href="https://www.ettoday.net/news/20180616/1191351.htm?utm_source=feedburner&utm_medium=email&utm_campaign=Feed%3A+ettoday%2Frealtime+%28ETtoday+%E6%96%B0%E8%81%9E%E9%9B%B2%29">一片面膜破千元還熱銷　台灣老藥廠憑什麼賣天價？</a>  </li>  </ul> <hr> <p style="color:Gray;" " font-family: \'EB Garamond\';">You are subscribed to email updates from newsletter . </p><p style="color:Gray;" "background-color:LightGray;" " font-family: \'EB Garamond\';">To stop receiving these emails, you may unsubscribe now.</p>',

};

//發送信件方法
transporter.sendMail(options, function (error, info) {
    if (error) {
        console.log(error);
    } else {
        console.log('訊息發送: ' + info.response);
    }
});