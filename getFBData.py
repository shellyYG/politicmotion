from selenium import webdriver
from selenium.webdriver.chrome.options import Options
import time
import re, time, requests
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


#Find Post Link
driver = webdriver.Chrome()
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
        print(i)
        try:
            driver.find_element_by_class_name('layerCancel').click() #byPass we got error message box
            driver.execute_script('window.scrollTo(0, document.body.scrollHeight);')
            time.sleep(3)
            print("blockbox has shown again")
        except:
            driver.execute_script('window.scrollTo(0, document.body.scrollHeight);')
            time.sleep(3)
            print("no blockbox")
   
    print("一")
    try:
        driver.find_element_by_xpath('//a[@id="expanding_cta_close_button"]').click() #byPass register user box
        print("二")
        soup = BeautifulSoup(driver.page_source, "html.parser")
        print("三")
        posts = soup.findAll('div',{'class':'clearfix y_c3pyo2ta3'})
        print("四")
    except:
        print("二")
        soup = BeautifulSoup(driver.page_source, "html.parser")
        print("三")
        posts = soup.findAll('div',{'class':'clearfix y_c3pyo2ta3'})
        print("四")
    for i in posts:
        print("五")
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
        print("no content found")
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
        print("Failed to load Reactions")

    # add Big title of article
    try:
        bigTitle = userContent.find('div', {'class': 'mbs _6m6 _2cnj _5s6c'}).text
        print("has bigTitle")
        print(bigTitle)
    except:
        bigTitle = "No Big Title"
        print("NO bigTitle")
    
    # add Small title of article
    try:
        smallTitle = userContent.find('div', {'class': '_6m7 _3bt9'}).text
        print("has smallTitle")
        print(smallTitle)
    except:
        smallTitle = "No Small Title"
        print("No Small Title")

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

#========================================================= update existing FB data
def contentToFill(soup, linkToFill):
    userContent = soup.find('div', {'class':'_5pcr userContentWrapper'})
    try:
        Content = userContent.find('div',{'class':'_5pbx userContent _3576'}).text
        PosterInfo = userContent.find('div', {'class':'l_c3pyo2v0u _5eit i_c3pynyi2f clearfix'})
    except:
        Content = "No Content Found"
        PosterInfo = "No PosterInfo"
        print("no content found")
    

    # add Big title of article
    try:
        bigTitle = userContent.find('div', {'class': 'mbs _6m6 _2cnj _5s6c'}).text
        print("has bigTitle")
        print(bigTitle)
    except:
        bigTitle = "No Big Title"
        print("No Big Title")
    
    # add Small title of article
    try:
        smallTitle = userContent.find('div', {'class': '_6m7 _3bt9'}).text
        print("has smallTitle")
        print(smallTitle)
    except:
        smallTitle = "No Small Title"
        print("No Small Title")

    
    with engine.begin() as conn:
        results = conn.execute(f'UPDATE politicmotion.fb_rawdata SET title = "{bigTitle}", small_title = "{smallTitle}" WHERE post_link = "{linkToFill}";')
    print("Done try")
 
    return {bigTitle, smallTitle}
#===========================================================================================================================Get New York Time Post
# NYTimeLinks = FindLinks(url='https://www.facebook.com/nytimes/', n = 1)


# # get all post links that does not have paragraph yet
# NYTLinksToFill = []
# with engine.begin() as conn:
#     results = conn.execute('SELECT id, post_link FROM politicmotion.fb_rawdata WHERE post_source = "nytimes" AND (title IS NULL OR title = "No Big Title") AND post_link IS NOT NULL AND id > 4112 ORDER BY id ASC LIMIT 50;')
#     rows = results.fetchall()
#     for i in rows:
#         print(i)
#         linksToFill = i['post_link']
#         NYTLinksToFill.append(linksToFill)
# print("NYTLinksToFill: ")
# print(NYTLinksToFill)

# # start update the content
# for Link in NYTLinksToFill:
#     print("At Link: "+Link)
#     driver.get(Link) #expand link for soup below to catch
#     soup = BeautifulSoup(driver.page_source, "html.parser")
    
#     contentToFill(soup,Link)

# # # transform list of dict to dataframe
# print("done try")
# driver.close()

# # Add new news
# for Link in NYTimeLinks:
#     print("At Link: "+Link)
#     driver.get(Link) #expand link for soup below to catch
#     soup = BeautifulSoup(driver.page_source, "html.parser")
    
#     PostContent(soup, "nytimes")

# # transform list of dict to dataframe
# Facebookdf = pd.DataFrame(AllPost)
# Facebookdf.columns = ['post_link','post_time','content','reaction','post_source', 'saved_date', 'title', 'small_title']
# Facebookdf.to_sql(
#     'fb_rawdata',
#     con=engine,
#     index=False,
#     if_exists = 'append'  #if table exist, then append the rows rather than fail (default is fail)
# )

# driver.close()

#===========================================================================================================================Get Fox News Post

#get all post links that does not have paragraph yet
FoxLinksToFill = []
with engine.begin() as conn:
    results = conn.execute('SELECT id, post_link FROM politicmotion.fb_rawdata WHERE id> 4118 AND post_source = "foxnews" AND (title IS NULL OR title = "No Big Title") AND post_link IS NOT NULL ORDER BY id ASC LIMIT 50;')
    rows = results.fetchall()
    for i in rows:
        print(i)
        linksToFill = i['post_link']
        FoxLinksToFill.append(linksToFill)
print("FoxLinksToFill: ")
print(FoxLinksToFill)

# start update the content
for Link in FoxLinksToFill:
    print("At Fox Link: "+Link)
    driver.get(Link) #expand link for soup below to catch
    soup = BeautifulSoup(driver.page_source, "html.parser")
    
    contentToFill(soup,Link)

# # transform list of dict to dataframe
print("done try (fox)")
driver.close()

# Add new news







# driver = webdriver.Chrome()
# AllPost =[]
# FoxNewsLinks = FindLinks(url='https://www.facebook.com/FoxNews/', n = 1)
# for Link in FoxNewsLinks:
#     print("At Link: "+Link)
#     driver.get(Link) #expand link for soup below to catch
#     soup = BeautifulSoup(driver.page_source, "html.parser")
#     PostContent(soup, "foxnews")

# # transform list of dict to dataframe
# Foxnewsdf = pd.DataFrame(AllPost)
# Foxnewsdf.columns = ['post_link','post_time','content','reaction','post_source', 'saved_date', 'title', 'small_title']
# Foxnewsdf.to_sql(
#     'fb_rawdata',
#     con=engine,
#     index=False,
#     if_exists = 'append'  #if table exist, then append the rows rather than fail (default is fail)
# )

# driver.close()




