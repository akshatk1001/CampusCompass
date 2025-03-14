'''Import Libraries'''
import pandas as pd
import nltk
from nltk.corpus import stopwords

# from pywsd.utils import lemmatize_sentence # Comment out when not using because it takes a while to initialize when testing

from gensim.models import Word2Vec


'''Import Data'''
df = pd.read_csv("DataWithoutOrgsLemANDLower.csv")


'''Clean Up/Standardize CSV'''
def lemmatize_desc(description):
    new_description = ""
    stopwords_set = set(stopwords.words('english'))
    punctuation = [".", "!", "?", ",", ";", ":", "(", ")", "[", "]", "{", "}", "'", '"', "’", "‘", "“", "”"]
    for word in punctuation:
        stopwords_set.add(word)

    if not isinstance(description, str):
        return ""
    
    words_list = nltk.word_tokenize(description)
    for word in words_list:
        if not word.isdigit() and word.lower() not in stopwords_set:
            new_description += " " + lemmatize_sentence(word.lower())[0]
    return new_description

def preprocessing_descs(description):
    if not isinstance(description, str):
        return ""
    
    add_to_stopwords = [".", ",", "poly", "cal", "slo", "san", "luis", "obispo", "organization", "sigma", "chi", 
                        "omega", "beta", "theta", "pi", "phi", "kappa" "epsilon", "alpha", "zeta", "tau", "nu", "club"]
    stopwords_set = set(stopwords.words('english'))
    new_description = ""

    for word in add_to_stopwords:
        stopwords_set.add(word)

    words_list = nltk.word_tokenize(description)

    for word in words_list:
        if not word.isdigit() and word.lower() not in stopwords_set:
            new_description = new_description + " " + lemmatize_sentence(word.lower())[0]
    return new_description

def preprocessing_names(name):
    new_name = ""

    if not isinstance(name, str):
        return ""

    words_list = nltk.word_tokenize(name) 

    for word in words_list:
        if not word.isdigit():
            new_name = new_name + " " + word.lower()
        else:
            new_name = new_name + " " + word
    return new_name

def main(df):
    df['New Club Name'] = df['New Club Name'].apply(preprocessing_names)
    df['New Description'] = df['New Description'].apply(preprocessing_descs)

# main(df)
# df.to_csv('NewScrapedData2.csv')



'''Creating Tags'''
cleaned_up_df = pd.read_csv('NewScrapedData.csv')

def create_vecmodel(csv_file):
    descriptions = []
    for description in csv_file['New Description']:
        if isinstance(description, str):
            descriptions.append(nltk.word_tokenize(description))
    
    model = Word2Vec(sentences=descriptions, workers=4, window=10, vector_size=100, epochs = 5, min_count=1) 
    return model

cur_model = create_vecmodel(cleaned_up_df)
cur_model.save('ModelOnNewData.model')

# list_of_words = ["team", "compete", "competitive", "play", "offer", "competes", "woman", 
#     "collegiate", "california", "join", "level", "travel", "competition", 
#     "player", "new", "league", "game", "national", "welcome", "throughout"]

# similar_words_list = cur_model.wv.most_similar(positive=list_of_words)

# print(similar_words_list)

# print(cur_model.wv.similarity('french', 'eco'))