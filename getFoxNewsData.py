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
url='https://www.foxnews.com/search-results/search?q=trump, vaccination&submit=Search'
driver.get(url)
time.sleep(3)
driver.execute_script('window.scrollTo(0, document.body.scrollHeight);')  #scroll down