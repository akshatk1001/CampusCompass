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

all_identities = [
    "White European Italian",
    "Black African American",
    "American Indian Alaska Native",
    "Asian",
    "Native Hawaiian Pacific Islander",
    "woman women",
    "man men",
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

descriptions_embeddings = model.encode(descriptions, show_progress_bar=True, device=DEVICE)
#descriptions_embeddings = model.encode(club_name, show_progress_bar=True, device=DEVICE)
tags_embedding = model.encode(all_identities, show_progress_bar=True, device=DEVICE)

similarity_matrix = model.similarity(descriptions_embeddings, tags_embedding)

min_max_scaler = preprocessing.MinMaxScaler()
scaled_similarity_matrix = min_max_scaler.fit_transform(similarity_matrix)

sim_df = pd.DataFrame(scaled_similarity_matrix, columns= all_identities)
sim_df['Club Name'] = club_name

sim_df.to_csv('IdentityScored.csv', index=False)
