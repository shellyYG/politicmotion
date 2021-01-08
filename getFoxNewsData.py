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

#Add options
option = webdriver.ChromeOptions()
option.add_argument('--headless')
option.add_argument('--disable-notifications')

#Find Post Link
driver = webdriver.Chrome(options = option)


def findArticles(n, topic1, topic2):
    topics = []
    topics.append(topic1)
    topics.append(topic2)
    topicString = listToString(topics)

    url=f'https://www.foxnews.com/search-results/search?q={topic1}, {topic2}&submit=Search'
    
    driver.get(url)
    time.sleep(3)

    for i in range(n): # load n times
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
    

    print("Start saving to sql")
    Foxdf.columns = ['post_link','published_time','title','abstract','news_id', 'news_source','topics','saved_date']
    Foxdf.to_sql(
    'news_rawdata',
    con=engine,
    index=False,
    if_exists = 'append'  #if table exist, then append the rows rather than fail (default is fail)
    )   

    print("Finished saving to sql")
    driver.close()

postLinks = []

def getLatestNews(n):
    url='https://www.foxnews.com/politics'
    
    driver.get(url)
    time.sleep(3)

    soup = BeautifulSoup(driver.page_source, "html.parser")

    for i in range(n): # load n times
        try: #try to scroll down
            driver.execute_script('window.scrollTo(0, document.body.scrollHeight);') #scroll down
        except:
            pass
                   
        try: #click on interstital close button
            interstitials = soup.findAll('div',{'class':'fc-dialog-container'})
            for i in interstitials:
                i.find('button',{'class':'fc-close'}).click()
            
        except:
            pass
            
        try: #try to scroll down again
            driver.execute_script('window.scrollTo(0, document.body.scrollHeight);') #scroll down
            time.sleep(3)
            driver.find_element_by_class_name('load-more').click()  #click on loadmore
            time.sleep(3)
            
        except:
            pass
    
    postTitles = []
    postTimes = []
    postContent = []

    articleList = soup.find('main',{'class':'main-content'})
    upperSection = articleList.findAll('section',{'class':'collection collection-article-list'})[0]
    posts = upperSection.findAll('article',{'class':'article'})
    
    for i in posts:
        rawLink = i.find('a').attrs['href']
        
        if(rawLink[0:9]=='/politics'):
            fullLink = "https://www.foxnews.com"+rawLink
            
        else:
            fullLink = rawLink

        postLinks.append(fullLink)
        
        postTimes.append(i.find('span',{'class':'time'}).string)
        try:
            postTitles.append(i.find('h4',{'class':'title'}).string)
        except:
            postTitles.append('No Title Found')
        try:
            postContent.append(i.find('p',{'class':'dek'}).find('a').string)
        except:
            postContent.append('No Content Found')
    

    Foxdf = pd.DataFrame({'postlink': postLinks,
                          'published_time':postTimes,
                          'title':postTitles,
                          'abstract':postContent})
    Foxdf["news_id"] = "0"
    Foxdf["news_source"] = "Fox News"
    Foxdf["topics"] = "To be defined"
    Foxdf['SavedDate'] = date.today()


    print("Start saving to sql")
    Foxdf.columns = ['post_link','published_time','title','abstract','news_id', 'news_source','topics','saved_date']
    Foxdf.to_sql(
    'news_rawdata',
    con=engine,
    index=False,
    if_exists = 'append'  #if table exist, then append the rows rather than fail (default is fail)
    )   
    print("Finished saving to sql")

    driver.close()
    time.sleep(3)


# findArticles(1, "Biden", "Hong Kong") #n doesnt need to be big because its searching by topics

getLatestNews(10)

# get all post links that does not have paragraph yet
allLinksToFill = []
with engine.begin() as conn:
    results = conn.execute('SELECT n.post_link FROM politicmotion.news_rawdata n LEFT JOIN politicmotion.fox_details f ON n.post_link = f.post_link WHERE f.paragraph IS NULL AND n.news_source = "fox news";')
    rows = results.fetchall()
    for i in rows:
        linksToFill = i['post_link']
        allLinksToFill.append(linksToFill)


print("Start getting detailed news: ")
# get content in postLinks
allArticleDetails = []
def getDetailedNews():
    
    for i in allLinksToFill: # or postLinks in the future
        try:
            driver = webdriver.Chrome(options = option)  #need to declare driver again
            time.sleep(3)
        
            driver.get(i)
            time.sleep(3)
            soupFullArticle = BeautifulSoup(driver.page_source, "html.parser")

            try: #click on interstital close button
                interstitialsFullArticle = soupFullArticle.findAll('div',{'class':'fc-dialog-container'})
                for i in interstitialsFullArticle:
                    i.find('button',{'class':'fc-close'}).click()
                
            except:
                pass
                

            try:
                paragraphs = soupFullArticle.findAll('p', {'class':'speakable'})
                
                concateP=""
                for paragraph in paragraphs:
                    concateP = concateP + " " + paragraph.text

                allArticleDetails.append(concateP)
            
            except:
                allArticleDetails.append('No Paragraph Found')

            driver.close()
        except:
            allArticleDetails.append("No Content Found")

    FoxDetaildf = pd.DataFrame({'post_link': allLinksToFill,
                          'paragraph':allArticleDetails,
                          })
    FoxDetaildf['SavedDate'] = date.today()

    print("Start saving news details to sql")
    FoxDetaildf.columns = ['post_link','paragraph','saved_date']
    FoxDetaildf.to_sql(
    'fox_details',
    con=engine,
    index=False,
    if_exists = 'append'  #if table exist, then append the rows rather than fail (default is fail)
    )   
    print("Saved to table fox_details.")


getDetailedNews()
print("Done getFoxNewsData")
