from selenium import webdriver
from selenium.webdriver.chrome.options import Options
import time
import re, time
from datetime import date
from bs4 import BeautifulSoup
import pandas as pd

# read .env file element
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
def FindLinks(url, n):
    Links = []
    driver.get(url)

    time.sleep(3) #wait for a few secs for the element to show
    try:
        driver.find_element_by_class_name('layerCancel').click() ##byPass we got error message box
        driver.execute_script('window.scrollTo(0, document.body.scrollHeight);')  #scroll down
    except:
        driver.execute_script('window.scrollTo(0, document.body.scrollHeight);')  #scroll down

    for i in range(n): #make it sleep a few secs so you can see the next block box
        try:
            driver.find_element_by_class_name('layerCancel').click() #byPass we got error message box
            driver.execute_script('window.scrollTo(0, document.body.scrollHeight);')
            time.sleep(3)
        except:
            driver.execute_script('window.scrollTo(0, document.body.scrollHeight);')
            time.sleep(3)
   
    try:
        driver.find_element_by_xpath('//a[@id="expanding_cta_close_button"]').click() #byPass register user box
        soup = BeautifulSoup(driver.page_source, "html.parser")
        posts = soup.findAll('div',{'class':'clearfix y_c3pyo2ta3'})
    except:
        soup = BeautifulSoup(driver.page_source, "html.parser")
        posts = soup.findAll('div',{'class':'clearfix y_c3pyo2ta3'})
    for i in posts:
        try: 
            driver.find_element_by_class_name('layerCancel').click()
            Links.append('https://www.facebook.com'+i.find('a',{'class':'_5pcq'}).attrs['href'].split('?',2)[0]) #get each post link
        except:
            Links.append('https://www.facebook.com'+i.find('a',{'class':'_5pcq'}).attrs['href'].split('?',2)[0]) #get each post link
    return Links


AllPost =[]

def PostContent(soup, source):
    AllReaction = []
    FullPost = {}
    userContent = soup.find('div', {'class':'_5pcr userContentWrapper'})
    try:
        Content = userContent.find('div',{'class':'_5pbx userContent _3576'}).text
        PosterInfo = userContent.find('div', {'class':'l_c3pyo2v0u _5eit i_c3pynyi2f clearfix'})
    except:
        Content = "No Content Found"
        PosterInfo = "No PosterInfo"
    try:
        Time = PosterInfo.find('abbr').attrs['title']
    except:
        Time = "No Time"
    try:
        moodInfo = userContent.find('span', {'class':'_1n9r _66lh'})
        
    except:
        moodInfo = "No moodInfo"
    try:
        Reactions = moodInfo.find_all('span', {'class':'_1n9k'})
        for Reaction in Reactions:
            ReactionNum = Reaction.find('a').attrs['aria-label']
            AllReaction.append(ReactionNum)
    except:
        Like = '0'

    # add Big title of article
    try:
        bigTitle = userContent.find('div', {'class': 'mbs _6m6 _2cnj _5s6c'}).text

    except:
        bigTitle = "No Big Title"
    
    # add Small title of article
    try:
        smallTitle = userContent.find('div', {'class': '_6m7 _3bt9'}).text
        
    except:
        smallTitle = "No Small Title"

    FullPost['Link'] = driver.current_url
    FullPost['Time'] = Time
    FullPost['Content'] = Content
    FullPost['Reaction'] = listToString(AllReaction)
    FullPost['Source'] = source
    FullPost['SavedDate'] = date.today()
    FullPost['bigTitle'] = bigTitle
    FullPost['smallTitle'] = smallTitle
    
    AllPost.append(FullPost)
    return AllPost

#==============================================================================================================================================================  ADD new news
#---------------------------------------------------------------------------------------------------------------------------- Get new New York Time Post
driver = webdriver.Chrome(options = option)
AllPost =[]
NYTimeLinks = FindLinks(url='https://www.facebook.com/nytimes/', n = 10)
for Link in NYTimeLinks:
    driver.get(Link) #expand link for soup below to catch
    soup = BeautifulSoup(driver.page_source, "html.parser")
    PostContent(soup, "nytimes")

# check if title exists
Facebookdf = pd.DataFrame(AllPost)
Facebookdf.columns = ['post_link','post_time','content','reaction','post_source', 'saved_date', 'title', 'small_title']
print(f"Facebookdf len before: {len(Facebookdf)}")

existingTitles = []
with engine.begin() as conn:
    results = conn.execute('SELECT DISTINCT title FROM politicmotion.fb_rawdata;')
    rows = results.fetchall()
    
    for i in rows:
        try:
            existingTitles.append(''.join(i)) #add tuples
        except:
            pass

# start delete df rows
RowsToDelete = Facebookdf['title'].isin(existingTitles)
Facebookdf = Facebookdf[~RowsToDelete]
print(f"Facebookdf len after removing existing titles: {len(Facebookdf)}")

Facebookdf.to_sql(
    'fb_rawdata',
    con=engine,
    index=False,
    if_exists = 'append'
)

driver.close()

#---------------------------------------------------------------------------------------------------------------------------- Get new Fox Post
driver = webdriver.Chrome(options = option)
AllPost =[]
FoxNewsLinks = FindLinks(url='https://www.facebook.com/FoxNews/', n = 10)
for Link in FoxNewsLinks:
    driver.get(Link) #expand link for soup below to catch
    soup = BeautifulSoup(driver.page_source, "html.parser")
    PostContent(soup, "foxnews")

# check if title exists
Foxnewsdf = pd.DataFrame(AllPost)
Foxnewsdf.columns = ['post_link','post_time','content','reaction','post_source', 'saved_date', 'title', 'small_title']
print(f"len before: {len(Foxnewsdf)}")

existingTitles = []
with engine.begin() as conn:
    results = conn.execute('SELECT DISTINCT title FROM politicmotion.fb_rawdata;')
    rows = results.fetchall()
    
    for i in rows:
        try:
            existingTitles.append(''.join(i)) #add tuples
        except:
            pass

# start delete df rows
RowsToDelete = Foxnewsdf['title'].isin(existingTitles)
Foxnewsdf = Foxnewsdf[~RowsToDelete]
print(f"Foxnewsdf len after removing existing titles: {len(Foxnewsdf)}")

Foxnewsdf.to_sql(
    'fb_rawdata',
    con=engine,
    index=False,
    if_exists = 'append'
)

driver.close()

print("Done getting data from FB")

