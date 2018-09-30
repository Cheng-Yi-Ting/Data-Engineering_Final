const fs = require('fs')
const path = require('path')
const readline = require('readline');
const nodejieba = require("nodejieba");
const MongoClient = require('mongodb').MongoClient;
const MongoConnection = require('./connection')

function parseFile(filePath) {
    var bulkOps = []
    var bulkcount = 0
    var url = ''
    var title = ''
    var text = ''
    var text_tag = 0//判斷@B
    var inputStream = fs.createReadStream(filePath, { encoding: 'utf8' });
    // 將讀取資料流導入 Readline 進行處理 
    var lineReader = readline.createInterface({ input: inputStream });
    lineReader.on('line', function (line) {
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
            // jieba斷詞
            title = nodejieba.cut(title);
            text = nodejieba.cut(text);
            title = title.join(' ');
            text = text.join(' ');
            bulkOps.push({
                "url": url,
                "title": title,
                "text": text
            });
            bulkcount += 1
            bulkinsert(bulkOps)
            bulkOps = []
            bulkcount = 0

            url = ''
            title = ''
            text = ''
        }
    });
}

function bulkinsert(bulkOps) {
    MongoClient.connect("mongodb://localhost:27017/mymondb", function (err, db) {
        if (err) throw err;
        db.collection('news', function (err, collection) {
            console.log("Bulk Insert")
            console.log(`There are currently ${bulkcount} documents`)
            var bulk = collection.initializeOrderedBulkOp();

            bulk.insert(bulkOps);

            bulk.execute(function (err, res) {
                // console.timeEnd("Bulk Insert");
            });

        });
        db.close(); //關閉連線
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
        for (let file of files) {
            console.log(`Reading File - ${file}`)
            const filePath = path.join('.\\books', file)
            // parseFile(filePath)
            // Insert the remaining datas
            console.log('bulkcount' + bulkcount)
            if (bulkcount % 5 != 0) {
                console.log("Bulk Insert remain")
                var bulk_remain = bulkcount % 5
                console.log(bulk_remain)
                bulkinsert(bulkOps, bulk_remain)
                bulkOps = []
                bulkcount = 0
            }
        } catch (err) {
            console.error(err)
        }
    }

readAndInsert()
