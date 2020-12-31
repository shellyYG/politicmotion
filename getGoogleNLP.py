print("Calling Google Natural Language Processing API!")

# from google.cloud import language
from google.cloud import language_v1
# Instantiates a client
client = language_v1.LanguageServiceClient()

# read .env file element
from dotenv import load_dotenv
load_dotenv()
import os
# connect to amazon RDS mysql server
import mysql.connector
import sqlalchemy
from sqlalchemy import * #run sql statement

# regular expression
import re

DBHOST= os.getenv("DBHOST")
DBUSER= os.getenv("DBUSER")
DBPASS= os.getenv("DBPASS")
DBDATABASE= os.getenv("DBDATABASE")

engine = sqlalchemy.create_engine(f'mysql+pymysql://{DBUSER}:{DBPASS}@{DBHOST}:3306/{DBDATABASE}')

if(engine):
    print("Connect to mysql successfully!")
else:
    print("Oops, connect to mysql unsuccessfully.")

# calculate the sentiment score & save
metadata = MetaData(engine)
metadata.reflect()

# get emotion of text
with engine.begin() as conn:
    results = conn.execute('SELECT id, content FROM fb_rawdata WHERE sentiment_score IS NULL OR magnitude_score IS NULL;')
    rows = results.fetchall()

    for i in rows:
        FBid = i['id']
        print(FBid)
        FBcontent = i['content']
        document = language_v1.Document(content=FBcontent, type_=language_v1.Document.Type.PLAIN_TEXT)
        sentiment = client.analyze_sentiment(request={'document': document}).document_sentiment

        updates = conn.execute(f'UPDATE fb_rawdata SET sentiment_score = {sentiment.score}, magnitude_score = {sentiment.magnitude} WHERE id = {FBid}')

    print('Done inserting sentiment scores.')    


            





