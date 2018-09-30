const MongoClient = require('mongodb').MongoClient;
const fs = require('fs')
const Koa = require('koa')
const Router = require('koa-router')
const app = new Koa()
const router = new Router()
var moment = require('moment') //時間
var moment = require('moment-timezone') //時區
var allResults = 0; //所有資料筆數
var limit = 0; //最多limit筆資料
var skip = 0;   //跳過前面skip筆資料
var check = 0;//每次搜尋歸0
var first_skip = 0;
var offset = 10;
var start = 0;
var end = 0;

// date = '2018-06-14'
// cateogry = '時尚消費'
app.use(async (ctx, next) => {
    ctx.set('Access-Control-Allow-Origin', '*')
    return next()
})


router.get('/sub', async (ctx, next) => {
    var { email, subCategory } = ctx.request.query
    user = {
        'email': email,
        'subCategory': subCategory,
    }
    ctx.body = user
    console.log('----------')
    // email_list.push(user);
    console.log(user)
    // writefile
    fs.appendFile('./userEmail/emailList.txt', '@user:' + '\n' + '@email:' + user.email + '\n' + '@category:' + user.subCategory + '\n', "UTF8", function (err) {
        if (err)
            console.log(err);
        else
            console.log('Append operation complete.');
    });

});


router.get('/search', async (ctx, next) => {
    console.log("router.get('/search')")
    var { term, date, category, limit, skip } = ctx.request.query
    if (date == '今天新聞') { var first_Date = moment().tz('Asia/Taipei').format('YYYY-MM-DD'); var last_Date = first_Date }
    if (date == '昨天新聞') { var first_Date = moment().tz('Asia/Taipei').subtract(1, 'days').format('YYYY-MM-DD'); var last_Date = first_Date }
    if (date == '當週新聞') {
        var last_Date = moment().tz('Asia/Taipei').format('YYYY-MM-DD');//當天
        var week_day = moment().tz('Asia/Taipei').format('d'); //星期幾 
        var week_day_Mon = moment().tz('Asia/Taipei').subtract(week_day - 1, 'days').format('YYYY-MM-DD');//星期一日期
        var first_Date = week_day_Mon

    }
    if (date == '當月新聞') {
        var first_Date = moment().tz('Asia/Taipei').format('YYYY-MM-01')
        var last_Date = moment().tz('Asia/Taipei').endOf('month').format('YYYY-MM-DD')

    }
    if (date == '2018') {
        var first_Date = moment().tz('Asia/Taipei').format('YYYY-01-01')
        var last_Date = moment().tz('Asia/Taipei').format('YYYY-12-31')

    }
    if (date == '2017') {
        var first_Date = moment().tz('Asia/Taipei').subtract(1, 'years').format('YYYY-01-01');
        var last_Date = moment().tz('Asia/Taipei').subtract(1, 'years').format('YYYY-12-31');
    }
    if (date == '2016') {
        var first_Date = moment().tz('Asia/Taipei').subtract(2, 'years').format('YYYY-01-01');
        var last_Date = moment().tz('Asia/Taipei').subtract(2, 'years').format('YYYY-12-31');
    }
    if (date == '2015') {
        var first_Date = moment().tz('Asia/Taipei').subtract(3, 'years').format('YYYY-01-01');
        var last_Date = moment().tz('Asia/Taipei').subtract(3, 'years').format('YYYY-12-31');
    }
    if (date == '2014') {
        var first_Date = moment().tz('Asia/Taipei').subtract(4, 'years').format('YYYY-01-01');
        var last_Date = moment().tz('Asia/Taipei').subtract(4, 'years').format('YYYY-12-31');
    }
    if (date == '2013') {
        var first_Date = moment().tz('Asia/Taipei').subtract(5, 'years').format('YYYY-01-01');
        var last_Date = moment().tz('Asia/Taipei').subtract(5, 'years').format('YYYY-12-31');
    }
    if (date == '2012') {
        var first_Date = moment().tz('Asia/Taipei').subtract(6, 'years').format('YYYY-01-01');
        var last_Date = moment().tz('Asia/Taipei').subtract(6, 'years').format('YYYY-12-31');
    }

    limit = parseInt(limit);
    skip = parseInt(skip);
    console.log(`${term},${first_Date},${last_Date},${category},${limit},${skip}`)
    return new Promise((resolve, reject) => {
        MongoClient.connect("mongodb://localhost:27017/mymondb", function (err, db) {
            if (err) throw err;
            db.collection('news', function (err, collection) {
                collection.find(
                    {
                        $text: { $search: term },
                        $and: [
                            { "date": { $gte: first_Date, $lte: last_Date } },
                            { "category": category },

                        ],
                    },
                    {
                        score: { $meta: "textScore" }
                    }
                ).limit(10).skip(skip).sort({ score: { $meta: "textScore" } })
                    .toArray(function (err, items) {
                        if (err) throw err;
                        console.log("All results " + items.length + " results!");
                        // 如果limit=30，skip=20  =>第3分頁會出現第第30~60筆，limit=40，skip=30 =>第4分頁會出現第第40~80筆，拿取前一頁除了前10筆以外的資料，e.g.第3頁=拿第2頁扣掉前十筆的資料
                        console.log(items.length)
                        // ctx.body = items.splice(0, 10)
                        ctx.body = items
                        console.log(ctx.body.length)
                        resolve()

                        db.close(); //關閉連線
                    });
            });

        });
    });
})
// 拿總結果數
router.get('/', async (ctx, next) => {
    console.log("router.get(' /')")
    // ctx.request.quer= > { term: 'javan', offset: '0' }

    var { term, date, category } = ctx.request.query
    if (date == '今天新聞') { var first_Date = moment().tz('Asia/Taipei').format('YYYY-MM-DD'); var last_Date = first_Date }
    if (date == '昨天新聞') { var first_Date = moment().tz('Asia/Taipei').subtract(1, 'days').format('YYYY-MM-DD'); var last_Date = first_Date }
    if (date == '當週新聞') {
        var last_Date = moment().tz('Asia/Taipei').format('YYYY-MM-DD');//當天
        var week_day = moment().tz('Asia/Taipei').format('d'); //星期幾 
        var week_day_Mon = moment().tz('Asia/Taipei').subtract(week_day - 1, 'days').format('YYYY-MM-DD');//星期一日期
        var first_Date = week_day_Mon

    }
    if (date == '當月新聞') {
        var first_Date = moment().tz('Asia/Taipei').format('YYYY-MM-01')
        var last_Date = moment().tz('Asia/Taipei').endOf('month').format('YYYY-MM-DD')

    }
    if (date == '2018') {
        var first_Date = moment().tz('Asia/Taipei').format('YYYY-01-01')
        var last_Date = moment().tz('Asia/Taipei').format('YYYY-12-31')

    }
    if (date == '2017') {
        var first_Date = moment().tz('Asia/Taipei').subtract(1, 'years').format('YYYY-01-01');
        var last_Date = moment().tz('Asia/Taipei').subtract(1, 'years').format('YYYY-12-31');
    }
    if (date == '2016') {
        var first_Date = moment().tz('Asia/Taipei').subtract(2, 'years').format('YYYY-01-01');
        var last_Date = moment().tz('Asia/Taipei').subtract(2, 'years').format('YYYY-12-31');
    }
    if (date == '2015') {
        var first_Date = moment().tz('Asia/Taipei').subtract(3, 'years').format('YYYY-01-01');
        var last_Date = moment().tz('Asia/Taipei').subtract(3, 'years').format('YYYY-12-31');
    }
    if (date == '2014') {
        var first_Date = moment().tz('Asia/Taipei').subtract(4, 'years').format('YYYY-01-01');
        var last_Date = moment().tz('Asia/Taipei').subtract(4, 'years').format('YYYY-12-31');
    }
    if (date == '2013') {
        var first_Date = moment().tz('Asia/Taipei').subtract(5, 'years').format('YYYY-01-01');
        var last_Date = moment().tz('Asia/Taipei').subtract(5, 'years').format('YYYY-12-31');
    }
    if (date == '2012') {
        var first_Date = moment().tz('Asia/Taipei').subtract(6, 'years').format('YYYY-01-01');
        var last_Date = moment().tz('Asia/Taipei').subtract(6, 'years').format('YYYY-12-31');
    }
    console.log(`${term},${date},${category}`)
    console.log(`${term},${first_Date},${last_Date},${category}`)

    // ctx.body = 'we are at home!';

    return new Promise((resolve, reject) => {
        MongoClient.connect("mongodb://localhost:27017/mymondb", function (err, db) {
            if (err) throw err;
            db.collection('news', function (err, collection) {
                collection.find(
                    {
                        $text: { $search: term },
                        $and: [
                            { "date": { $gte: first_Date, $lte: last_Date } },
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
                        // 如果limit=30，skip=20  =>第3分頁會出現第第30~60筆，limit=40，skip=30 =>第4分頁會出現第第40~80筆，拿取前一頁除了前10筆以外的資料，e.g.第3頁=拿第2頁扣掉前十筆的資料
                        // console.log(items)

                        // ctx.body = items.splice(0, 10)
                        ctx.body = items.length

                        console.log(ctx.body.length)
                        resolve()
                        db.close(); //關閉連線
                    });
            });

        });
    });
})

// 預設是全部新聞
router.get('/all_news', async (ctx, next) => {
    console.log("router.get('all_news')")
    // ctx.request.quer= > { term: 'javan', offset: '0' }
    var { term, date } = ctx.request.query
    if (date == '今天新聞') { var first_Date = moment().tz('Asia/Taipei').format('YYYY-MM-DD'); var last_Date = first_Date }
    if (date == '昨天新聞') { var first_Date = moment().tz('Asia/Taipei').subtract(1, 'days').format('YYYY-MM-DD'); var last_Date = first_Date }
    if (date == '當週新聞') {
        var last_Date = moment().tz('Asia/Taipei').format('YYYY-MM-DD');//當天
        var week_day = moment().tz('Asia/Taipei').format('d'); //星期幾 
        var week_day_Mon = moment().tz('Asia/Taipei').subtract(week_day - 1, 'days').format('YYYY-MM-DD');//星期一日期
        var first_Date = week_day_Mon

    }
    if (date == '當月新聞') {
        var first_Date = moment().tz('Asia/Taipei').format('YYYY-MM-01')
        var last_Date = moment().tz('Asia/Taipei').endOf('month').format('YYYY-MM-DD')

    }
    if (date == '2018') {
        var first_Date = moment().tz('Asia/Taipei').format('YYYY-01-01')
        var last_Date = moment().tz('Asia/Taipei').format('YYYY-12-31')

    }
    if (date == '2017') {
        var first_Date = moment().tz('Asia/Taipei').subtract(1, 'years').format('YYYY-01-01');
        var last_Date = moment().tz('Asia/Taipei').subtract(1, 'years').format('YYYY-12-31');
    }
    if (date == '2016') {
        var first_Date = moment().tz('Asia/Taipei').subtract(2, 'years').format('YYYY-01-01');
        var last_Date = moment().tz('Asia/Taipei').subtract(2, 'years').format('YYYY-12-31');
    }
    if (date == '2015') {
        var first_Date = moment().tz('Asia/Taipei').subtract(3, 'years').format('YYYY-01-01');
        var last_Date = moment().tz('Asia/Taipei').subtract(3, 'years').format('YYYY-12-31');
    }
    if (date == '2014') {
        var first_Date = moment().tz('Asia/Taipei').subtract(4, 'years').format('YYYY-01-01');
        var last_Date = moment().tz('Asia/Taipei').subtract(4, 'years').format('YYYY-12-31');
    }
    if (date == '2013') {
        var first_Date = moment().tz('Asia/Taipei').subtract(5, 'years').format('YYYY-01-01');
        var last_Date = moment().tz('Asia/Taipei').subtract(5, 'years').format('YYYY-12-31');
    }
    if (date == '2012') {
        var first_Date = moment().tz('Asia/Taipei').subtract(6, 'years').format('YYYY-01-01');
        var last_Date = moment().tz('Asia/Taipei').subtract(6, 'years').format('YYYY-12-31');
    }
    console.log(`${term},${date},${first_Date},${last_Date}`)
    // ctx.body = 'we are at home!';

    return new Promise((resolve, reject) => {
        MongoClient.connect("mongodb://localhost:27017/mymondb", function (err, db) {
            if (err) throw err;
            db.collection('news', function (err, collection) {
                collection.find(
                    {
                        $text: { $search: term },
                        $and: [
                            { "date": { $gte: first_Date, $lte: last_Date } },

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
                        console.log(items.length)
                        // ctx.body = items.splice(0, 10)
                        ctx.body = items.length

                        console.log(ctx.body.length)
                        resolve()

                        db.close(); //關閉連線
                    });
            });

        });
    });
})

router.get('/all_news_search', async (ctx, next) => {
    console.log("router.get('all_news_search')")
    var { term, date, limit, skip } = ctx.request.query
    if (date == '今天新聞') { var first_Date = moment().tz('Asia/Taipei').format('YYYY-MM-DD'); var last_Date = first_Date }
    if (date == '昨天新聞') { var first_Date = moment().tz('Asia/Taipei').subtract(1, 'days').format('YYYY-MM-DD'); var last_Date = first_Date }
    if (date == '當週新聞') {
        var last_Date = moment().tz('Asia/Taipei').format('YYYY-MM-DD');//當天
        var week_day = moment().tz('Asia/Taipei').format('d'); //星期幾 
        var week_day_Mon = moment().tz('Asia/Taipei').subtract(week_day - 1, 'days').format('YYYY-MM-DD');//星期一日期
        var first_Date = week_day_Mon

    }
    if (date == '當月新聞') {
        var first_Date = moment().tz('Asia/Taipei').format('YYYY-MM-01')
        var last_Date = moment().tz('Asia/Taipei').endOf('month').format('YYYY-MM-DD')

    }
    if (date == '2018') {
        var first_Date = moment().tz('Asia/Taipei').format('YYYY-01-01')
        var last_Date = moment().tz('Asia/Taipei').format('YYYY-12-31')

    }
    if (date == '2017') {
        var first_Date = moment().tz('Asia/Taipei').subtract(1, 'years').format('YYYY-01-01');
        var last_Date = moment().tz('Asia/Taipei').subtract(1, 'years').format('YYYY-12-31');
    }
    if (date == '2016') {
        var first_Date = moment().tz('Asia/Taipei').subtract(2, 'years').format('YYYY-01-01');
        var last_Date = moment().tz('Asia/Taipei').subtract(2, 'years').format('YYYY-12-31');
    }
    if (date == '2015') {
        var first_Date = moment().tz('Asia/Taipei').subtract(3, 'years').format('YYYY-01-01');
        var last_Date = moment().tz('Asia/Taipei').subtract(3, 'years').format('YYYY-12-31');
    }
    if (date == '2014') {
        var first_Date = moment().tz('Asia/Taipei').subtract(4, 'years').format('YYYY-01-01');
        var last_Date = moment().tz('Asia/Taipei').subtract(4, 'years').format('YYYY-12-31');
    }
    if (date == '2013') {
        var first_Date = moment().tz('Asia/Taipei').subtract(5, 'years').format('YYYY-01-01');
        var last_Date = moment().tz('Asia/Taipei').subtract(5, 'years').format('YYYY-12-31');
    }
    if (date == '2012') {
        var first_Date = moment().tz('Asia/Taipei').subtract(6, 'years').format('YYYY-01-01');
        var last_Date = moment().tz('Asia/Taipei').subtract(6, 'years').format('YYYY-12-31');
    }
    limit = parseInt(limit);
    skip = parseInt(skip);

    console.log(`${term},${date},${first_Date},${last_Date},${limit},${skip}`)
    return new Promise((resolve, reject) => {
        MongoClient.connect("mongodb://localhost:27017/mymondb", function (err, db) {
            if (err) throw err;
            db.collection('news', function (err, collection) {
                collection.find(
                    {
                        $text: { $search: term },
                        $and: [
                            { "date": { $gte: first_Date, $lte: last_Date } },

                        ],
                    },
                    {
                        score: { $meta: "textScore" }
                    }
                ).limit(10).skip(skip).sort({ score: { $meta: "textScore" } })
                    .toArray(function (err, items) {
                        if (err) throw err;
                        console.log("All results " + items.length + " results!");
                        // 如果limit=30，skip=20  =>第3分頁會出現第第30~60筆，limit=40，skip=30 =>第4分頁會出現第第40~80筆，拿取前一頁除了前10筆以外的資料，e.g.第3頁=拿第2頁扣掉前十筆的資料
                        console.log(items.length)
                        // ctx.body = items.splice(0, 10)
                        ctx.body = items
                        console.log(ctx.body.length)
                        resolve()

                        db.close(); //關閉連線
                    });
            });

        });
    });
})


const port = process.env.PORT || 3000

app
    .use(router.routes())
    .listen(port, err => {
        if (err) console.error(err)
        console.log(`App Listening on Port ${port}`)
    })