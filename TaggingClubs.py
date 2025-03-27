from sentence_transformers import SentenceTransformer
import pandas as pd
import torch
from sklearn import preprocessing

DEVICE = "mps" if torch.backends.mps.is_available() else "cpu"

model = SentenceTransformer("all-MiniLM-L6-v2")

df = pd.read_csv("NicosScrapedData.csv")
#Get a vector of the Club Names from the scraped data
club_name = df["Club Name"]
#get a list of the Descriptions of the club
descriptions = df["Description Excerpt"].to_list()
#Get the links to the website from scraped data
links = df["tablescraper-selected-row href"]

all_tags = [
    "Volunteering",
    "Networking",
    "Visual Arts",
    "Software Development",
    "Sustainability",
    "Leadership",
    "Tutoring",
    "Cultural Awareness",
    "Socializing",
    "Entrepreneurship",
    "Fitness",
    "Spirituality",
    "Competitive Gaming",
    "Engineering",
    "Agriculture",
    "Recreation",
    "Activism",
    "Historical Studies",
    "Research",
    "Performing Arts",
    "Human Rights",
    "Corporate Relations",
    "International Relations",
    "Inclusion",
    "STEM Education",
    "Creative Writing",
    "Artistic Design",
    "Financial Literacy",
    "Digital Media",
    "Career Development",
    "Legal Studies",
    "Campus Security",
    "Community Outreach",
    "Women's Empowerment",
    "Mental Wellness",
    "Animal Rights",
    "Coding",
    "Outdoor Adventures",
    "Family Support",
    "Culinary Arts"
]

descriptions_embeddings = model.encode(descriptions, show_progress_bar=True, device=DEVICE)
tags_embedding = model.encode(all_tags, show_progress_bar=True, device=DEVICE)

similarity_matrix = model.similarity(descriptions_embeddings, tags_embedding)

min_max_scaler = preprocessing.MinMaxScaler()
scaled_similarity_matrix = min_max_scaler.fit_transform(similarity_matrix)

sim_df = pd.DataFrame(scaled_similarity_matrix, columns= all_tags)
sim_df['Club Name'] = club_name
sim_df["Link"] = links

sim_df.to_csv('26MarchScored.csv', index=False)
