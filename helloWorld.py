from selenium import webdriver
from selenium.webdriver.chrome.options import Options
import time
import re, time, requests
from bs4 import BeautifulSoup
import pandas as pd

# connect to amazon RDS mysql server
import mysql.connector
import sqlalchemy

engine = sqlalchemy.create_engine('mysql+pymysql://admin:mysql2020@stylish-rds.chrntoztzsyd.us-east-2.rds.amazonaws.com:3306/politicmotion')
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
    driver.find_element_by_class_name('layerCancel').click() ##byPass we got error message box
    driver.execute_script('window.scrollTo(0, document.body.scrollHeight);')  #scroll down
    for i in range(n): #make it sleep a few secs so you can see the next block box
        print(i)
        driver.execute_script('window.scrollTo(0, document.body.scrollHeight);')
        time.sleep(3)
   
    driver.find_element_by_xpath('//a[@id="expanding_cta_close_button"]').click() #byPass register user box

    soup = BeautifulSoup(driver.page_source, "html.parser")
    posts = soup.findAll('div',{'class':'clearfix y_c3pyo2ta3'})
    for i in posts:
        Links.append('https://www.facebook.com'+i.find('a',{'class':'_5pcq'}).attrs['href'].split('?',2)[0])
    return Links


Links = FindLinks(url='https://www.facebook.com/nytimes/', n = 2)


PostsInformation = pd.DataFrame()

AllPost =[]

def PostContent(soup):
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

    FullPost['Link'] = driver.current_url
    FullPost['Time'] = Time
    FullPost['Content'] = Content
    FullPost['Reaction'] = listToString(AllReaction)
    
    AllPost.append(FullPost)
    return AllPost


PostsInformation = pd.DataFrame()
for Link in Links:
    print("At Link: "+Link)
    driver.get(Link) #expand link for soup below to catch
    soup = BeautifulSoup(driver.page_source, "html.parser")
    PostContent(soup)
    # print(PostContent(soup))
    

# transform list of dict to dataframe
Facebookdf = pd.DataFrame(AllPost)
Facebookdf["Source"] = 'nytimes'
print("Facebookdf DataFrame is:")
print(Facebookdf)

Facebookdf.columns = ['post_link','post_time','content','reaction','post_source']

print("renamed Facebookdf:")
print(Facebookdf)


Facebookdf.to_sql(
    'fb_rawdata',
    con=engine,
    index=False,
    if_exists = 'append'  #if table exist, then append the rows rather than fail (default is fail)
)


# # driver.close() # close the browser