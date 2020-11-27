from selenium import webdriver
from selenium.webdriver.chrome.options import Options
import time
import re, time, requests
from datetime import date
from bs4 import BeautifulSoup
import pandas as pd

from dotenv import load_dotenv
load_dotenv()
import os

# connect to amazon RDS mysql server
import mysql.connector
import sqlalchemy

DBHOST= os.getenv("DBHOST")
DBUSER= os.getenv("DBUSER")
DBPASS= os.getenv("DBPASS")
DBDATABASE= os.getenv("DBDATABASE")

engine = sqlalchemy.create_engine(f'mysql+pymysql://{DBUSER}:{DBPASS}@{DBHOST}:3306/{DBDATABASE}')

if(engine):
    print("Connect to mysql successfully!")
else:
    print("Oops, connect to mysql unsuccessfully.")

def listToString(s):
    joined_string = "|".join(s)
    return joined_string

#Find Post Link
driver = webdriver.Chrome()


def findArticles(n, topic1, topic2):
    topics = []
    topics.append(topic1)
    topics.append(topic2)
    topicString = listToString(topics)

    url=f'https://www.foxnews.com/search-results/search?q={topic1}, {topic2}&submit=Search'
    print("url is: "+url)
    driver.get(url)
    time.sleep(3)

    for i in range(n): # load n times
        print(i)
        try:
            driver.execute_script('window.scrollTo(0, document.body.scrollHeight);') #scroll down
            time.sleep(3)
            driver.find_element_by_class_name('load-more').click()  #click on loadmore
            time.sleep(3)
            print("load button has shown again")
        except:
            print("no load button")

    postLinks = []
    postTitles = []
    postTimes = []
    postContent = []
    soup = BeautifulSoup(driver.page_source, "html.parser")
    posts = soup.findAll('article',{'class':'article'})

    for i in posts:
        postLinks.append(i.find('a').attrs['href'])
        postTitles.append(i.find('h2',{'class':'title'}).string)
        postTimes.append(i.find('span',{'class':'time'}).string)
        postContent.append(i.find('p',{'class':'dek'}).find('a').string)

    Foxdf = pd.DataFrame({'postlink': postLinks,
                          'published_time':postTimes,
                          'title':postTitles,
                          'abstract':postContent})
    Foxdf["news_id"] = "0"
    Foxdf["news_source"] = "Fox News"
    Foxdf["topics"] = topicString
    Foxdf['SavedDate'] = date.today()
    print(Foxdf)

    print("Start saving to sql")
    Foxdf.columns = ['post_link','published_time','title','abstract','news_id', 'news_source','topics','saved_date']
    Foxdf.to_sql(
    'news_rawdata',
    con=engine,
    index=False,
    if_exists = 'append'  #if table exist, then append the rows rather than fail (default is fail)
    )   

    print("Finished saving to sql")


findArticles(2, "Trump", "vaccination")