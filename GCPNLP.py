print("Start!")

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

# cal emotion of user
with engine.begin() as conn:
    results = conn.execute('SELECT reaction FROM fb_rawdata WHERE user_sentiment_score IS NULL OR user_magnitude_score IS NULL LIMIT 2;')
    rows = results.fetchall()
    for i in rows:
        FBreaction = i['reaction']
        allReactions = FBreaction.split(sep="|")
        user_sent = 0
        user_mag = 0

        for j in allReactions:
            if (j[-1] == "讚"):
                print(j)
                reactionDigit = re.findall(r"\d",j)
                combinedReaction = ''.join(str(k) for k in reactionDigit)
                combinedReaction = int(combinedReaction)
            elif(j[-1] == "心"):
                print(j)
                reactionDigit = re.findall(r"\d",j)
                combinedReaction = ''.join(str(k) for k in reactionDigit)
                combinedReaction = int(combinedReaction)
                user_sent += combinedReaction*0.9
                user_mag += combinedReaction*0.9
                print(f"user_sent after love is {user_sent}")
                print(f"user_mag after love is {user_mag}")
            elif(j[-1] == "哈"):
                print(j)
                reactionDigit = re.findall(r"\d",j)
                combinedReaction = ''.join(str(k) for k in reactionDigit)
                combinedReaction = int(combinedReaction)
            elif(j[-1] == "怒"):
                print(j)
                reactionDigit = re.findall(r"\d",j)
                combinedReaction = ''.join(str(k) for k in reactionDigit)
                combinedReaction = int(combinedReaction)
            elif(j[-1] == "哇"):
                print(j)
                reactionDigit = re.findall(r"\d",j)
                combinedReaction = ''.join(str(k) for k in reactionDigit)
                combinedReaction = int(combinedReaction)
            elif(j[-1] == "嗚"):
                print(j)
                reactionDigit = re.findall(r"\d",j)
                combinedReaction = ''.join(str(k) for k in reactionDigit)
                combinedReaction = int(combinedReaction)
            





