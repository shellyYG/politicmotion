print("Start!")
# from google.cloud import language
from google.cloud import language_v1
# Instantiates a client
client = language_v1.LanguageServiceClient()
# The text to analyze
text = u"Hello, world there!"
document = language_v1.Document(content=text, type_=language_v1.Document.Type.PLAIN_TEXT)

# Detects the sentiment of the text
sentiment = client.analyze_sentiment(request={'document': document}).document_sentiment

print("Text: {}".format(text))
print("Sentiment: {}, {}".format(sentiment.score, sentiment.magnitude))
print("End!")
# def language_analysis(text):
#     client = language_v1.Client()
#     document.client.document_from_text(text)
#     sent_analysis = document.analyze_sentiment()
#     print(dir(sent_analysis))
#     sentiment = sent_analysis.sentiment
#     ent_analysis = document.analyze_entities()
#     entities = ent_analysis.entities
#     return sentiment, entities


# example_text = 'Is it good that I am in Taiwan?'

# sentiment, entities = language_analysis(example_text)
# print(sentiment.score,sentiment.magnitude)