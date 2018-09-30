const fs = require('fs')
const path = require('path')
const readline = require('readline');
const nodejieba = require("nodejieba");
const MongoClient = require('mongodb').MongoClient;
const MongoConnection = require('./connection')
var LineReaderSync = require("line-reader-sync")
// const filePath = ".\\books\\row_data"
const filePath = "D:\\ettoday"
var count = 0
var flag = 0 //text寫完
var c = 0
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
async function parseFile() {
    lrs = new LineReaderSync(filePath)
    while (true) {
        line = lrs.readline()
        if (line === null) {
            console.log("EOF");
            break;
        }

        if (line.indexOf("@url:") == 0) {
            for (i = 5; i < line.length; i++) {
                url += line[i]
            }
        }
        if (line.indexOf("@title:") == 0) {
            for (i = 7; i < line.length; i++) {
                title += line[i]
            }
        }

        if (text_tag == 1) {

            for (i = 0; i < line.length; i++) {
                text += line[i]
            }
            // 讀body的每一行都去空白，不然會被吃字
            text = text.trim()
            if (line.indexOf("@") == 0) {
                text_tag = 0
                flag = 1
            }
        }
        if (line.indexOf("@body:") == 0) {
            for (i = 6; i < line.length; i++) {
                text += line[i]
            }
            // 讀body的每一行都去空白，不然會被吃字
            text = text.trim()

            text_tag = 1
        }

        if (url != '' && title != '' && flag == 1) {
            // console.log(`url: ${url}`)
            // console.log(`title: ${title}`)
            // 去除頭的空白
            // text = text.trim()
            // 去除最後的@
            text = text.slice(0, text.length - 2)
            // console.log(`text: ${text}`)

            bulkcount += 1
            // console.log(bulkcount)

            push()
            if (bulkcount > 0 && bulkcount % 10000 === 0) {
                console.log(`bulkcount: ${bulkcount}`)
                let r = await bulkinsert()

            }

        }

    }
}


// 斷詞＆push to array
async function push() {
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
    flag = 0
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
                var bulk = collection.initializeOrderedBulkOp();
                for (let i = 0; i < bulkOps.length; i++) {
                    bulk.insert(bulkOps[i]);
                }
                bulk.execute(function (err, res) {
                    // console.timeEnd("Bulk Insert");

                });
                bulkOps = []
                resolve()

            });
            db.close(); //關閉連線
        });
    });
}

async function readAndInsert() {
    try {
        console.time('test time');
        await parseFile()
        console.timeEnd('test time');
    } catch (err) {
        console.error(err)
    }
}

// readAndInsert()
readAndInsert()