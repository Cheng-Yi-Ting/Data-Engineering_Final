#!/bin/bash
#crontab -e :*/1 * * * * bash /home/test/data1/final/spider_script.sh
echo start spider
cd /home/test/data1/final/Taiwan-news-crawlers/
export PATH="/root/anaconda3/bin:/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin:/snap/bin"
scrapy crawl china
scrapy crawl ettoday
cd /home/test/data1/final/node_test/server/
node mail.js