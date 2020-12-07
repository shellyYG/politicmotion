print("Start!")
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


# cal emotion of user
with engine.begin() as conn:
    results = conn.execute('SELECT id, reaction FROM fb_rawdata WHERE user_sentiment_score IS NULL OR user_magnitude_score IS NULL ORDER BY id ASC;')
    rows = results.fetchall()
    for i in rows:
        print(i)
        FBid = i['id']
        FBreaction = i['reaction']
        allReactions = FBreaction.split(sep="|")
        user_sent = 0
        user_mag = 0
        user_len = 0

        try:
            for j in allReactions:
                if (j[-1] == "讚"):
                    reactionDigit = re.findall(r"\d",j)
                    combinedReaction = ''.join(str(k) for k in reactionDigit)
                    combinedReaction = int(combinedReaction)
                elif(j[-1] == "心"):
                    reactionDigit = re.findall(r"\d",j)
                    combinedReaction = ''.join(str(k) for k in reactionDigit)
                    combinedReaction = int(combinedReaction)
                    user_sent += combinedReaction*0.9
                    user_mag += combinedReaction*0.9
                    user_len += combinedReaction
                elif(j[-1] == "哈"):
                    reactionDigit = re.findall(r"\d",j)
                    combinedReaction = ''.join(str(k) for k in reactionDigit)
                    combinedReaction = int(combinedReaction)
                    user_sent += combinedReaction*0.5
                    user_mag += combinedReaction*0.5
                    user_len += combinedReaction
                elif(j[-1] == "怒"):
                    reactionDigit = re.findall(r"\d",j)
                    combinedReaction = ''.join(str(k) for k in reactionDigit)
                    combinedReaction = int(combinedReaction)
                    user_sent += combinedReaction*(-0.9)
                    user_mag += combinedReaction*0.9
                    user_len += combinedReaction
                elif(j[-1] == "哇"):
                    reactionDigit = re.findall(r"\d",j)
                    combinedReaction = ''.join(str(k) for k in reactionDigit)
                    combinedReaction = int(combinedReaction)
                elif(j[-1] == "嗚"):
                    reactionDigit = re.findall(r"\d",j)
                    combinedReaction = ''.join(str(k) for k in reactionDigit)
                    combinedReaction = int(combinedReaction)
                    user_sent += combinedReaction*(-0.6)
                    user_mag += combinedReaction*0.6
                    user_len += combinedReaction
                else:
                    user_sent = 0
                    user_mag = 0
        except: 
            user_sent = 0
            user_mag = 0
        
        if (user_sent == 0 or user_mag == 0):
            user_len = 1 # prevent dividing by zero
        else:
            user_len = user_len
        
        user_sent = user_sent/user_len
        user_mag = user_mag/user_len
    
        updates = conn.execute(f'UPDATE fb_rawdata SET user_sentiment_score = {user_sent}, user_magnitude_score = {user_mag} WHERE id = {FBid}')

print("Done calculating user emotion scores!")