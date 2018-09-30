import os
import re
import requests
import codecs
import sys
import json
import argparse
import time
from collections import deque
from pymongo import MongoClient
import jieba
jieba.set_dictionary('jieba_dict.txt')  # jieba繁體辭典
jieba.load_userdict('dict.txt')  # 萌典
# 取得網頁respone，if success,then return respone 200

# -----mongodb-----
client = MongoClient()
client = MongoClient("mongodb://localhost:27017/")  # 建立连接：
db = client.mymondb  # 指定将要进行操作的database
collection = db.news  # 指定将要进行操作的collection
# print(db)

filename = 'chinatime' + '.json'
filename = os.path.join('.', filename)

queue = deque()
visited = set()

url = 'http://www.chinatimes.com/newspapers/20180614000356-260205'  # start url
allowed_domain = 'http://www.chinatimes.com/newspapers/'

# start_url = {
#     "url": url,

# }
# collection.insert_one(url)
# a = collection.find_one({"name": "aa"})

visited |= {url}

queue.append(url)
cnt = 0


while queue:
    # if(cnt == 2):
    #     break
    temp_str = ''
    text_str = ''
    text_filter = []

    url = queue.popleft()  # 連結頭
    # visited |= {url}  # 標記為已訪問
    print('已經抓取: ' + str(cnt) + '   正在抓取 <---  ' + url)
    print('visited:%s' % len(visited))
    cnt += 1
    try:
        html = requests.get(url)
    except:
        continue

    try:
        text = html.text  # 取得網頁原始碼
    except:
        continue
    # 找網頁中所有連結
    # text_href = re.findall(r'(?<=<a href=")[^"]*', text)  # 尋找網頁中所有連結
    linkre = re.compile('href=\"(.+?)\"')  # href re pattern
    all_link = linkre.findall(text)  # 尋找網頁中所有連結
    for x in all_link:
        if allowed_domain in x and x not in visited:
            # pass
            visited |= {x}
            queue.append(x)
            print('加入隊列 --->  ' + x)
            # print(x)

     # -----category extractor-----
    c_p_start = 'articleSection'
    c_s = text.find(c_p_start)+25
    c_len = c_s+10  # 先往後取10個，遇到"break
    category = ''
    for i in range(c_s, c_len):
        if(text[i] == '"'):
            break
        else:
            category += text[i]

    if(category == '財經焦點'):
        category = '財經要聞'
    if(category == '全球財經'):
        category = '財經要聞'
    if(category == '金融．稅務'):
        category = '財經要聞'
    if(category == '產業．科技'):
        category = '生活新聞'
    if(category == '證券．權證'):
        category = '財經要聞'
    if(category == '投資理財'):
        category = '財經要聞'
    if(category == '產業特刊'):
        category = '生活新聞'
    if(category == '焦點新聞'):
        category = '焦點要聞'
    if(category == '話題觀察'):
        category = '生活新聞'
    if(category == '兩岸新聞'):
        category = '兩岸要聞'
    if(category == '時尚娛樂'):
        category = '娛樂新聞'
    if(category == '兩岸藝文'):
        category = '兩岸要聞'
    if(category == '產業財經'):
        category = '財經要聞'
    if(category == '論壇廣場'):
        category = '時論廣場'

    # -----date extractor-----
    d_p_start = 'time datetime'
    date_s = text.find(d_p_start)+15  # 從time datetime後開始取
    date_len = date_s+10  # 日期共10字元
    date = ''
    date_str = ''

    for i in range(date_s, date_len):
        date += text[i]

    for i in date:
        if(i == '/'):
            date_str += '-'
        else:
            date_str += i

    # -----title extractor-----
    t_p_start = '<title>'
    t_p_end = '</title>'

    title_s = text.find(t_p_start)+7  # 從<title>後開始取
    title_e = text.find(t_p_end)
    title_len = title_e-title_s
    title = ''
    for i in range(title_s, title_e):
        title += text[i]
    title = title[:-8]  # remove - 中時電子報
    # -----tcontent extractor-----
    # regex patterns
    re_style = re.compile(
        '<\s*style[^>]*>[^<]*<\s*/\s*style\s*>', re.I)  # 去除style tag
    re_type = re.compile('<!DOCTYPE html>')  # 去除html開頭type
    re_comment = re.compile('<!--.*?-->')  # 去除HTML注释
    re_script = re.compile(r'<script[\s\S]+?/script>')  # 去除script tag
    re_html = re.compile('<[A-Za-z\/][^>]*>')  # 去除html tag

    # 去除
    text = re_type.sub('', text)
    text = re_comment.sub('', text)
    text = re_style.sub('', text)
    text = re_script.sub("", text)
    text = re_html.sub('', text)

    text = text.replace(" ", "")  # 去除空白
    text = text.replace("\t", "")  # 去除tab
    # string transforms to array
    text_split = text.split('\n')  # 以\n做斷行，轉成array

    # 過濾字數
    for i in range(0, len(text_split)):
        if(len(text_split[i]) < 50):
            text_split[i] = ''

    i = 0
    while(i < len(text_split)):
        if(len(text_split[i]) != 0):
            # 往下取10行
            for j in range(0, 21):
                try:
                    temp_str = temp_str+text_split[i+j]
                    # 去除\n和\r，strip and replace can't work.
                    for k in temp_str:
                        if k == '\n' or k == '\r':
                            pass
                        else:
                            # 10行的內容全部加起來
                            text_str += k
                    temp_str = ''
                except:
                    break
            i = i+j
            text_filter.append(text_str)
            text_str = ''
        i += 1

    try:
        content = max(text_filter, key=len)
        title = ' '.join(jieba.cut(title,  cut_all=False))
        content = ' '.join(jieba.cut(content,  cut_all=False))
    except:
        print('content or title content empty')
        continue

    bulkOps = {
        'website': "中國時報",
        "url": url,
        "title": title,
        'date': date_str,
        "content": content,
        'category': category
    }
    # 判斷url存在
    is_exist = collection.find_one(
        {"url": url})

    print(is_exist)
    # if None => insert
    if(is_exist == None):
        collection.insert_one(bulkOps)
    # collection.insert_one(bulkOps)

    # with codecs.open(filename, 'a', encoding='utf-8') as f:
    #     f.write('@GAISRec:'+'\n')
    #     f.write('website:'+'中國時報'+'\n')
    #     f.write('url:'+url+'\n')
    #     f.write('title:'+title+'\n')
    #     f.write('date:'+date_str+'\n')
    #     try:
    #         f.write('text:'+max(text_filter, key=len)+'\n')
    #     except:
    #         f.write('text:'+'\n')
    #     f.write('category:'+category+'\n')
