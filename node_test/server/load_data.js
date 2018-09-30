const fs = require('fs')
const path = require('path')
const readline = require('readline');
const nodejieba = require("nodejieba");
const MongoClient = require('mongodb').MongoClient;
const MongoConnection = require('./connection')
var LineReaderSync = require("line-reader-sync")
var async = require('async');
var line;
var start = 0;
var end = 0;
var total = 0;
nodejieba.load({
    userDict: './userdict.txt',
});
var url = ''
var title = ''
var text = ''
var text_tag = 0 //判斷@B
var bulkOps = []
var bulkcount = 0
async function parseFile(filePath) {

    lrs = new LineReaderSync(filePath)
    // 將讀取資料流導入 Readline 進行處理 
    while (true) {
        line = lrs.readline()
        if (line === null) {
            console.log("EOF");
            break;
        }
        if (line.indexOf("@U:") == 0) {
            for (i = 3; i < line.length; i++) {
                url += line[i]
            }
        }
        if (line.indexOf("@T:") == 0) {
            for (i = 3; i < line.length; i++) {
                title += line[i]
            }
        }
        if (text_tag == 1) {
            for (i = 0; i < line.length; i++) {
                if (line[i] != ' ') {
                    text += line[i]
                }
            }
            text_tag = 0
        }
        if (line.indexOf("@B:") == 0) {
            text_tag = 1
        }
        if (url != '' && title != '' && text != '') {

            bulkcount += 1
            // console.log(bulkcount)
            // console.log(url)
            // console.log(title)
            // console.log(text)
            push()
            if (bulkcount > 0 && bulkcount % 2 === 0) {
                console.log(`bulkcount: ${bulkcount}`)
                // console.log("bulkinsert start")
                let r = await bulkinsert()

                // console.log("bulkinsert end")
            }


        }
    }
    // }
}


// 斷詞＆push to array
async function push() {
    // console.log("push start")
    title = nodejieba.cut(title, true);
    text = nodejieba.cut(text, true);
    title = title.join(' ');
    text = text.join(' ');
    bulkOps.push({
        "url": url,
        "title": title,
        "text": text
    });
    url = ''
    title = ''
    text = ''
    // console.log("push end")
}

// bulkinsert to Mongodb
function bulkinsert() {
    // console.log("db function")
    return new Promise(resolve => {
        MongoClient.connect("mongodb://localhost:27017/mymondb", function (err, db) {
            if (err) throw err;
            // if (bulkOps.length == 0) { resolve() }
            db.collection('news', function (err, collection) {
                console.log("BulkOps.length: " + bulkOps.length)
                // var bulk = collection.initializeOrderedBulkOp();
                // for (let i = 0; i < bulkOps.length; i++) {
                //     bulk.insert(bulkOps[i]);
                // }
                // bulk.execute(function (err, res) {
                //     // console.timeEnd("Bulk Insert");

                // });
                bulkOps = []
                // if (bulkOps.length == 0) {
                //     console.log("total: " + total);
                //     end = new Date().getTime();
                //     console.log((end - start) / 1000 + "sec");
                // }
                resolve()

            });
            db.close(); //關閉連線
        });
    });
}


/** Clear ES index, parse and index all files from the books directory */
async function readAndInsert() {
    try {
        // Create index with mongodb
        // await MongoConnection.CreateIndex()

        let files = fs.readdirSync('.\\books').filter(file => file.slice(-4) === '.rec')
        // 同
        // let files = fs.readdirSync('./books').filter(function (file) {
        //   return file.slice(-4) === '.txt';
        // });
        console.log(`Found ${files.length} Files`)
        // test tiime consuming
        console.time('test time');
        // Read each news file, and bulk insert  in mongodb
        start = new Date().getTime();
        for (let file of files) {
            console.log(`Reading File - ${file}`)
            const filePath = path.join('.\\books', file)
            // console.log("t1")
            await parseFile(filePath)

            if (bulkOps.length != 0) {
                // console.log("Yes")
                await bulkinsert()
            }
            // console.log("t2")
            // resolve()

        }
        console.timeEnd('test time');
    } catch (err) {
        console.error(err)
    }
}

readAndInsert()