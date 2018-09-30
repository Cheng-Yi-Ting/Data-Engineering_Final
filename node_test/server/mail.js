const fs = require('fs')
const path = require('path')
const readline = require('readline');
var LineReaderSync = require("line-reader-sync")
var async = require('async');
const MongoClient = require('mongodb').MongoClient;
var moment = require('moment') //時間
var moment = require('moment-timezone') //時區
//引用 nodemailer
var nodemailer = require('nodemailer');

var date = moment().tz('Asia/Taipei').format('YYYY-MM-DD');

//宣告發信物件
var transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
        user: "d02405035@ems.npu.edu.tw",
        pass: "kk950411"
    }
});



var news = []
var contents = ''
var email = ''
var category = ''
var emaiList = []
// var emaiList = [{ email: '123@gmail.com', category: '社會新聞' },
// { email: '12sds3@gmail.com', category: '社會新聞' },
// { email: '12dsdsdsds3@gmsdsail.com', category: '全部新聞' }]






// 將emailList.txt的使用者資訊存到list
async function parseFile(filePath) {


    lrs = new LineReaderSync(filePath)
    // 將讀取資料流導入 Readline 進行處理 
    while (true) {
        line = lrs.readline()
        if (line === null) {
            // console.log("EOF");
            break;
        }

        if (line.indexOf("@email:") == 0) {

            for (i = 7; i < line.length; i++) {
                if (line[i] != ' ' && line[i] != '\n') {
                    email += line[i]
                }

            }
        }
        if (line.indexOf("@category:") == 0) {
            for (i = 10; i < line.length; i++) {
                if (line[i] != ' ' && line[i] != '\n') {
                    category += line[i]
                }
            }
        }
        if (email != "" && category != "") {
            // email = email.trim()

            user = {
                'email': email,
                "category": category,
            }
            // emaiList.push(user)
            if (category == '全部新聞') {
                await searchAll(email)

            }
            else {
                await search(email, category)
            }
            // console.log(user)
            // console.log(category)
            email = ''
            category = ''


        }
    }
    // }
}


async function searchAll(email) {
    console.log("searchAll")
    var date = moment().tz('Asia/Taipei').format('YYYY-MM-DD');

    return new Promise((resolve, reject) => {
        MongoClient.connect("mongodb://localhost:27017/mymondb", function (err, db) {
            if (err) throw err;
            db.collection('news', function (err, collection) {
                collection.find(
                    {
                        $and: [
                            { "date": date },

                        ],
                    },
                    {
                        score: { $meta: "textScore" }
                    }
                ).sort({ score: { $meta: "textScore" } })
                    .toArray(function (err, items) {
                        if (err) throw err;
                        console.log("All results " + items.length + " results!");
                        contents = ''
                        news = []
                        emailObj = {
                            'email': email,
                            'category': category,
                            'news': items.length,
                        }
                        console.log(emailObj)
                        news.push(emailObj)




                        // items.length長度為0就會是undefined
                        for (var i in items) {
                            if (items[i]['title'] == undefined) {
                                var itemOne = ''
                            }
                            else {
                                var itemOne = items[i]['title']
                            }
                            break
                        }
                        itemOne = itemOne.replace(/\s+/g, '')
                        // 第一行印出第一個item的title和剩餘items長度
                        contents += '<ul>' + '<h3 ' + 'style=\"font-family:\'EB Garamond\';\"' + '>' + itemOne + '，' + '還有 ' + (news[0]['news'] - 1).toString() + ' 則最新報導</h3><hr><ul>'
                        // 印出每一項title和紀錄位置，點擊title可以跳至該位置
                        for (var i in items) {
                            contents += '<li> <a href=\"#' + i + '\"' + 'style=\"text-decoration:none;\"' + '>' + items[i]["title"].replace(/\s+/g, '') + '</a> </li>'
                        }
                        contents += '</ul ></ul > <ul>' + '<hr>'
                        // 印出title,description,image
                        for (var i in items) {
                            contents += ' <a name=\"' + i + '\"' + '</a>' + '<a href=\"' + items[i]["url"] + '\"' + 'target=\"_blank\"' + '>' +
                                '<h3>' + items[i]["title"].replace(/\s+/g, '') + '</h3>' + '</a>' +
                                ' <p>' + ' <h4 style="color:Gray;" " font-family: \'EB Garamond\';">' + '關鍵字：' + items[i]["keywords"] + '</h4>' + '</p>' +
                                '<img src="' + items[i]["image"] + '"' + ' alt="News" width="400" height="265">' +
                                '<p>' + items[i]["description"] + '</p >' +
                                '</br>'




                        }
                        // 結束
                        contents += ' </ul ><ul> <hr> <p style="color:Gray;" " font-family: \'EB Garamond\';">You are subscribed to email updates from newsletter . </p></ul> '
                        // console.log(contents)
                        resolve()
                        db.close(); //關閉連線
                        sendMail()
                    });
            });

        });
    });
}


async function search(email, category) {
    console.log("search")
    var date = moment().tz('Asia/Taipei').format('YYYY-MM-DD');

    return new Promise((resolve, reject) => {
        MongoClient.connect("mongodb://localhost:27017/mymondb", function (err, db) {
            if (err) throw err;
            db.collection('news', function (err, collection) {
                collection.find(
                    {
                        $and: [
                            { "date": date },
                            { "category": category },

                        ],
                    },
                    {
                        score: { $meta: "textScore" }
                    }
                ).sort({ score: { $meta: "textScore" } })
                    .toArray(function (err, items) {
                        if (err) throw err;
                        console.log("All results " + items.length + " results!");
                        contents = ''
                        news = []
                        emailObj = {
                            'email': email,
                            'category': category,
                            'news': items.length,
                        }
                        console.log(emailObj)
                        news.push(emailObj)




                        // items.length長度為0就會是undefined
                        for (var i in items) {
                            if (items[i]['title'] == undefined) {
                                var itemOne = ''
                            }
                            else {
                                var itemOne = items[i]['title']
                            }
                            break
                        }
                        itemOne = itemOne.replace(/\s+/g, '')
                        // 第一行印出第一個item的title和剩餘items長度
                        contents += '<ul>' + '<h3 ' + 'style=\"font-family:\'EB Garamond\';\"' + '>' + itemOne + '，' + '還有 ' + (news[0]['news'] - 1).toString() + ' 則最新報導</h3><hr><ul>'
                        // 印出每一項title和紀錄位置，點擊title可以跳至該位置
                        for (var i in items) {
                            contents += '<li> <a href=\"#' + i + '\"' + 'style=\"text-decoration:none;\"' + '>' + items[i]["title"].replace(/\s+/g, '') + '</a> </li>'
                        }
                        contents += '</ul ></ul > <ul>' + '<hr>'
                        // 印出title,description,image
                        for (var i in items) {
                            contents += ' <a name=\"' + i + '\"' + '</a>' + '<a href=\"' + items[i]["url"] + '\"' + 'target=\"_blank\"' + '>' +
                                '<h3>' + items[i]["title"].replace(/\s+/g, '') + '</h3>' + '</a>' +
                                ' <p>' + ' <h4 style="color:Gray;" " font-family: \'EB Garamond\';">' + '關鍵字：' + items[i]["keywords"] + '</h4>' + '</p>' +
                                '<img src="' + items[i]["image"] + '"' + ' alt="News" width="400" height="265">' +
                                '<p>' + items[i]["description"] + '</p >' +
                                '</br>'




                        }
                        // 結束
                        contents += ' </ul ><ul> <hr> <p style="color:Gray;" " font-family: \'EB Garamond\';">You are subscribed to email updates from newsletter . </p></ul> '
                        // console.log(contents)
                        resolve()
                        db.close(); //關閉連線
                        sendMail()
                    });
            });

        });
    });
}



async function sendMail() {
    var options = {
        //寄件者
        from: 'd02405035@ems.npu.edu.tw',
        //收件者
        to: news[0]["email"],
        //副本
        // cc: 'd02405035@gmail.com',
        // //密件副本
        // bcc: 'account4@gmail.com',
        //主旨
        subject: date + '＊' + news[0]["category"] + '＊', // Subject line
        //純文字
        text: 'Newsletter', // plaintext body
        //嵌入 html 的內文
        html: contents,

    };

    //發送信件方法
    transporter.sendMail(options, function (error, info) {
        if (error) {
            console.log(error);
        } else {
            console.log('訊息發送: ' + info.response);
        }
    });
}



/** Clear ES index, parse and index all files from the books directory */
async function readAndSend() {
    try {


        let files = fs.readdirSync('./userEmail').filter(file => file.slice(-4) === '.txt')
        file = files[0]
        console.log(`Reading File - ${file}`)
        const filePath = path.join('./userEmail', file)
        // // console.log("t1")
        await parseFile(filePath)
        console.log(emaiList)
        // console.log(filePath)
        // console.log("t2")
        // resolve()

    } catch (err) {
        console.error(err)
    }
}

readAndSend()
// console.log(contents[0]["email"]) //email

// var items = [{ email: 'd02405035@gmail.com' }, {
//     title: '中職／連3個半季拋彩帶！　桃猿勇奪職棒29年上半季冠軍', url: 'https://sports.ettoday.net/news/1192976'
// },
// { title: '2個月前才釀17死　廣西發公文禁止端午節龍舟活動', url: 'https://www.ettoday.net/news/20180617/1193033.htm' }]


// var str = ''
// for (var i in items) {
//     // console.log(contents[i]['url'])
//     if (i != 0) {
//         str += '<li> <a href=\"' + items[i]["url"] + '\">' + items[i]["title"] + '</a> </li>'
//     }

// }
// str += ' </a >  </li >  </ul > <hr> <p style="color:Gray;" " font-family: \'EB Garamond\';">You are subscribed to email updates from newsletter . </p> <p style="color:Gray;" "background-color:LightGray;" " font-family: \'EB Garamond\';" > To stop receiving these emails, you may unsubscribe now.</p > ',
//     console.log(str)
