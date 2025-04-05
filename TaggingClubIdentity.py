from sentence_transformers import SentenceTransformer
import pandas as pd
import torch
from sklearn import preprocessing

DEVICE = "mps" if torch.backends.mps.is_available() else "cpu"
model = SentenceTransformer("all-MiniLM-L6-v2")
df = pd.read_csv("NicosScrapedData.csv")

name_desc = df["Club Name"] + " " + df["Description Excerpt"]

# maybe add lgbtq tag
all_identities = [
    "White European Italian",
    "Black African American",
    "Native American",
    "Asian",
    "Hawaiian Pacific Islander",
    "woman women",
    "man men",
    "Greek"
    # ,
    # "Christian",
    # "Islam",
    # "Judaism",
    # "Hinduism",
    # "Buddhism",
    # "Agricultural and Environmental Plant Sciences", "Agricultural Business", "Agricultural Communication",
    # "Agricultural Science", "Agricultural Systems Management", "Animal Science", "BioResource and Agricultural Engineering",
    # "Dairy Science", "Environmental Earth and Soil Sciences", "Environmental Management and Protection", "Food Science",
    # "Forestry and Natural Resources", "Nutrition", "Recreation, Parks and Tourism Administration", "Wine and Viticulture",
    # "Architectural Engineering", "Architecture", "City and Regional Planning", "Construction Management", "Landscape Architecture",
    # "Business Administration", "Economics", "Industrial Technology and Packaging",
    # "Aerospace Engineering", "Biomedical Engineering", "Civil Engineering", "Computer Engineering", "Computer Science",
    # "Electrical Engineering", "Environmental Engineering", "General Engineering", "Industrial Engineering",
    # "Manufacturing Engineering", "Materials Engineering", "Mechanical Engineering", "Software Engineering",
    # "Art and Design", "Communication Studies", "English", "Ethnic Studies", "Graphic Communication", "History",
    # "Interdisciplinary Studies", "Journalism", "Liberal Arts and Engineering Studies", "Music", "Philosophy",
    # "Political Science", "Psychology", "Sociology", "Theatre Arts", "Women's, Gender and Queer Studies",
    # "World Languages and Cultures",
    # "Biochemistry", "Biological Sciences", "Chemistry", "Kinesiology", "Liberal Studies", "Mathematics",
    # "Microbiology", "Physics", "Public Health", "Statistics"
]

all_embeddings = model.encode(name_desc, show_progress_bar=True, device=DEVICE)
tags_embedding = model.encode(all_identities, show_progress_bar=True, device=DEVICE)

similarity_matrix = model.similarity(all_embeddings, tags_embedding)

min_max_scaler = preprocessing.MinMaxScaler()
scaled_similarity_matrix = min_max_scaler.fit_transform(similarity_matrix)

sim_df = pd.DataFrame(scaled_similarity_matrix, columns= all_identities)
sim_df.insert(loc = 0, column = "Club Name", value = df["Club Name"])
sim_df["Description"] = name_desc

# major: no threshold, no changing.

# 1:5 Race -> 0:4
# 6:7 gender -> 5:6
# 8:9 greek life -> 7:8
# 10:14 -> 
# 15:end major

race_thresh = 0.6
race_cols = [ "White European Italian", "Black African American", "Native American", "Asian", "Hawaiian Pacific Islander"]

for index, row in sim_df.iterrows():
    # race: threshold 0.6 and whatever is remaining take the highest value and set it to 1.0, Set the rest to 0.0
    race_list = row[1:5].to_list()
    maximum = max(race_list)
    minimum = min(race_list)
    max_index = race_list.index(maximum)

    for col in race_cols:
        sim_df.loc[index, col] = 0.0 # MIGHT have to set to 0.5 

    if minimum >= race_thresh:
        for col in race_cols:
            sim_df.loc[index, col] = 1.0
            
    elif maximum > race_thresh:
        sim_df.loc[index, race_cols[max_index]] = 1.0

    # gender: use for loop to check for specific word. After, do thresholding with a value of 0.5. If both above or below 0.5, set to 1.0 for both. Otherwise, set larger to 1.0, and the other to 0.0. 
    women_list = ["woman", "woman's", "women", "women's", "womens", "sisterhood", "sister", "sisters", "sorority"]
    men_list = ["man", "man's", "men", "men's", "mens", "brotherhood", "brother", "brothers"]

    club_name = sim_df.loc[index, "Description"]


    found = None
    gender_thresh = 0.575

    for word in str(club_name).split():
        if word in women_list:
            found = "woman"
            break
        elif word in men_list:
            found = "man"
            break

    if found == "man":
        sim_df.loc[index, "woman women"] = 0.0
        sim_df.loc[index, "man men"] = 1.0
    elif found == "woman":
        sim_df.loc[index, "woman women"] = 1.0
        sim_df.loc[index, "man men"] = 0.0
    else:
        woman_score = sim_df.loc[index, "woman women"]
        man_score = sim_df.loc[index, "man men"]

        if (woman_score >= gender_thresh and man_score >= gender_thresh) or (woman_score < gender_thresh and man_score < gender_thresh):
            sim_df.loc[index, "woman women"] = 1.0
            sim_df.loc[index, "man men"] = 1.0
        elif woman_score > man_score:
            sim_df.loc[index, "woman women"] = 1.0
            sim_df.loc[index, "man men"] = 0.0
        else:
            sim_df.loc[index, "woman women"] = 0.0
            sim_df.loc[index, "man men"] = 1.0


sim_df.to_csv('IdentityScored.csv', index=False)