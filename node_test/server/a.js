const MongoClient = require('mongodb').MongoClient;
const Koa = require('koa')
const Router = require('koa-router')
const app = new Koa()
const router = new Router()
var allResults = 0; //所有資料筆數
var limit = 0; //最多limit筆資料
var skip = 0;   //跳過前面skip筆資料
var check = 0;//每次搜尋歸0
var first_skip = 0;
var offset = 10;
var start = 0;
var end = 0;

var arr = []

term = '科技'
date = '2018-06-14'
date2 = '2018-06-15'
cateogry = '時尚消費'
list = { "category": cateogry }
MongoClient.connect("mongodb://localhost:27017/mymondb", function (err, db) {
    if (err) throw err;
    db.collection('news', function (err, collection) {
        collection.find(
            {
                // $text: { $search: term },
                $and: [
                    // { "date": { $gte: '2016-01-01', $lte: '2016-12-31' } },
                    // { "date": date },
                    { "category": '焦點要聞' },

                ],
            },
            {
                score: { $meta: "textScore" }
            }
        ).sort({ score: { $meta: "textScore" } })
            .toArray(function (err, items) {
                if (err) throw err;
                console.log("All results " + items.length + " results!");
                // 如果limit=30，skip=20  =>第3分頁會出現第第30~60筆，limit=40，skip=30 =>第4分頁會出現第第40~80筆，拿取前一頁除了前10筆以外的資料，e.g.第3頁=拿第2頁扣掉前十筆的資料



                // ctx.body = items.splice(0, 10)
                // ctx.body = items
                // console.log(ctx.body.length)

                db.close(); //關閉連線
            });
    });

});

// $and: [{ "price": date }, { "category": cateogry }]