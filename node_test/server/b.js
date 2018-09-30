var moment = require('moment')
var moment = require('moment-timezone')
today = moment().tz('Asia/Taipei').format('YYYY-MM-DD')
yesterday = moment().tz('Asia/Taipei').subtract(1, 'days').format('YYYY-MM-DD');
week_day = moment().tz('Asia/Taipei').format('d'); //星期幾
before_Sevendays = moment().tz('Asia/Taipei').subtract(7, 'days').format('YYYY-MM-DD');//7天前



// for (i = 1; i <= week_day; i++) {
//     week_day = moment().tz('Asia/Taipei').format('d')
//     console.log(i)
// }

// console.log('today:' + today)
// console.log('yesterday:' + yesterday)
// console.log('week_day:' + week_day)

week_day_Mon = moment().tz('Asia/Taipei').subtract(week_day - 1, 'days').format('YYYY-MM-DD');//星期一日期

year_First = moment().tz('Asia/Taipei').format('YYYY-01-01')
year_Last = moment().tz('Asia/Taipei').format('YYYY-12-31')

month_First = moment().tz('Asia/Taipei').format('YYYY-MM-01')
month_last = moment().tz('Asia/Taipei').endOf('month').format('YYYY-MM-DD')

last_year__First = moment().tz('Asia/Taipei').subtract(2, 'years').format('YYYY-01-01');//星期一日期
last_year__Last = moment().tz('Asia/Taipei').subtract(2, 'years').format('YYYY-12-31');//星期一日期
console.log('last_year__First:' + last_year__First)
console.log('last_year__Last:' + last_year__Last)

