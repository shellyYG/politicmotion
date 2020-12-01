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

# get emotion of FB reaction
print('I want to laugh a little bit.')
reaction = u'I want to laugh a little bit.'
document = language_v1.Document(content=reaction, type_=language_v1.Document.Type.PLAIN_TEXT)
sentiment = client.analyze_sentiment(request={'document': document}).document_sentiment
print(sentiment.score)
print(sentiment.magnitude)

print('This is super funny.')
reaction2 = u'This is super funny.'
document = language_v1.Document(content=reaction2, type_=language_v1.Document.Type.PLAIN_TEXT)
sentiment = client.analyze_sentiment(request={'document': document}).document_sentiment
print(sentiment.score)
print(sentiment.magnitude)

print('I feel a little bid sad.')
reaction3 = u'I feel a little bid sad.'
document = language_v1.Document(content=reaction3, type_=language_v1.Document.Type.PLAIN_TEXT)
sentiment = client.analyze_sentiment(request={'document': document}).document_sentiment
print(sentiment.score)
print(sentiment.magnitude)

print('What the fuck! This is so sad.')
reaction4 = u'What the fuck! This is so sad.'
document = language_v1.Document(content=reaction4, type_=language_v1.Document.Type.PLAIN_TEXT)
sentiment = client.analyze_sentiment(request={'document': document}).document_sentiment
print(sentiment.score)
print(sentiment.magnitude)

print('I feel a little bit angry')
reactionAngry = u'I feel a little bit angry'
document = language_v1.Document(content=reactionAngry, type_=language_v1.Document.Type.PLAIN_TEXT)
sentiment = client.analyze_sentiment(request={'document': document}).document_sentiment
print(sentiment.score)
print(sentiment.magnitude)

print('What the fuck! I am super angry')
reactionSAngry = u'What the fuck! I am super angry'
document = language_v1.Document(content=reactionSAngry, type_=language_v1.Document.Type.PLAIN_TEXT)
sentiment = client.analyze_sentiment(request={'document': document}).document_sentiment
print(sentiment.score)
print(sentiment.magnitude)

print('Its sweet.')
reactionLove = u'Its sweet.'
document = language_v1.Document(content=reactionLove, type_=language_v1.Document.Type.PLAIN_TEXT)
sentiment = client.analyze_sentiment(request={'document': document}).document_sentiment
print(sentiment.score)
print(sentiment.magnitude)

print('Its so sweet.')
reactionSLove = u'Its so sweet.'
document = language_v1.Document(content=reactionSLove, type_=language_v1.Document.Type.PLAIN_TEXT)
sentiment = client.analyze_sentiment(request={'document': document}).document_sentiment
print(sentiment.score)
print(sentiment.magnitude)



# # get emotion of text
# with engine.begin() as conn:
#     results = conn.execute('SELECT id, content FROM fb_rawdata WHERE sentiment_score IS NULL OR magnitude_score IS NULL;')
#     rows = results.fetchall()

#     for i in rows:
#         FBid = i['id']
#         print(FBid)
#         FBcontent = i['content']
#         document = language_v1.Document(content=FBcontent, type_=language_v1.Document.Type.PLAIN_TEXT)
#         sentiment = client.analyze_sentiment(request={'document': document}).document_sentiment

#         updates = conn.execute(f'UPDATE fb_rawdata SET sentiment_score = {sentiment.score}, magnitude_score = {sentiment.magnitude} WHERE id = {FBid}')
        



