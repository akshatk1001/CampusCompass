from sentence_transformers import SentenceTransformer
import pandas as pd
import torch
from sklearn import preprocessing

DEVICE = "mps" if torch.backends.mps.is_available() else "cpu"

model = SentenceTransformer("all-MiniLM-L6-v2")

df = pd.read_csv("NicosScrapedData.csv")
#Get a vector of the Club Names from the scraped data
club_name = df["Club Name"].to_list()
#get a list of the Descriptions of the club
descriptions = df["Description Excerpt"].to_list()

name_desc = df["Club Name"] + " " + df["Description Excerpt"]



all_identities = [
    "White European Italian",
    "Black African American",
    "Native American",
    "Asian",
    "Hawaiian Pacific Islander",
    "woman women",
    "man men",
    "sisterhood sister woman women sorority",
    "brotherhood brother man men",
    "Agricultural and Environmental Plant Sciences", "Agricultural Business", "Agricultural Communication",
    "Agricultural Science", "Agricultural Systems Management", "Animal Science", "BioResource and Agricultural Engineering",
    "Dairy Science", "Environmental Earth and Soil Sciences", "Environmental Management and Protection", "Food Science",
    "Forestry and Natural Resources", "Nutrition", "Recreation, Parks and Tourism Administration", "Wine and Viticulture",
    "Architectural Engineering", "Architecture", "City and Regional Planning", "Construction Management", "Landscape Architecture",
    "Business Administration", "Economics", "Industrial Technology and Packaging",
    "Aerospace Engineering", "Biomedical Engineering", "Civil Engineering", "Computer Engineering", "Computer Science",
    "Electrical Engineering", "Environmental Engineering", "General Engineering", "Industrial Engineering",
    "Manufacturing Engineering", "Materials Engineering", "Mechanical Engineering", "Software Engineering",
    "Art and Design", "Communication Studies", "English", "Ethnic Studies", "Graphic Communication", "History",
    "Interdisciplinary Studies", "Journalism", "Liberal Arts and Engineering Studies", "Music", "Philosophy",
    "Political Science", "Psychology", "Sociology", "Theatre Arts", "Women's, Gender and Queer Studies",
    "World Languages and Cultures",
    "Biochemistry", "Biological Sciences", "Chemistry", "Kinesiology", "Liberal Studies", "Mathematics",
    "Microbiology", "Physics", "Public Health", "Statistics"
]

all_embeddings = model.encode(name_desc, show_progress_bar=True, device=DEVICE)
#descriptions_embeddings = model.encode(club_name, show_progress_bar=True, device=DEVICE)
tags_embedding = model.encode(all_identities, show_progress_bar=True, device=DEVICE)

similarity_matrix = model.similarity(all_embeddings, tags_embedding)

min_max_scaler = preprocessing.MinMaxScaler()
scaled_similarity_matrix = min_max_scaler.fit_transform(similarity_matrix)

sim_df = pd.DataFrame(scaled_similarity_matrix, columns= all_identities)
sim_df['Club Name'] = club_name

# race: threshold 0.6 and whatever is remaining take the highest value and set it to 1.0, Set the rest to 0.0
# gender: use for loop to check for specific word. After, do thresholding with a value of 0.5. If both above or below 0.5, set to 1.0 for both. Otherwise, set larger to 1.0, and the other to 0.0. 
# major: no threshold, no changing.



# 0:4 Race
# 5:6 gender
# 7:8 greek life
# 9:end major

race_thresh = 0.6
race_cols = [ "White European Italian", "Black African American", "Native American", "Asian", "Hawaiian Pacific Islander"]

# race: threshold 0.6 and whatever is remaining take the highest value and set it to 1.0, Set the rest to 0.0
for index, row in sim_df.iterrows():    
    race_list = row[0:4].to_list()
    maximum = max(race_list)
    max_index = race_list.index(maximum)
    minimum = min(race_list)

    for col in race_cols:
        sim_df.loc[index, col] = 0.0

    if minimum >= race_thresh:
        for col in race_cols:
            sim_df.loc[index, col] = 1.0        
            
    elif maximum > race_thresh:
        sim_df.loc[index, race_cols[max_index]] = 1.0

sim_df.to_csv('IdentityScored.csv', index=False)