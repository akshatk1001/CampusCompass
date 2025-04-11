from sentence_transformers import SentenceTransformer
import pandas as pd
import torch
from sklearn import preprocessing

DEVICE = "mps" if torch.backends.mps.is_available() else "cuda" if torch.cuda.is_available() else "cpu"
model = SentenceTransformer("all-MiniLM-L6-v2")
df = pd.read_csv("NicosScrapedData.csv")

name_desc = df["Club Name"] + " " + df["Description Excerpt"]

# maybe add lgbtq tag
all_identities = [
    "White European Italian", # Caucasian
    "Black African American", # African American
    "Native American", # Native American
    "Asian", # Asian American
    "Hispanic", # Hispanic
    "Native Hawaiian or Other Pacific Islander", # AAPI
    "woman women",
    "man men",
    "Greek", 
    "lgbtq",
    "Christian",
    "Islam",
    "Jewish",
    "Hindu",
    "Buddhism",
    "Muslim",
    "Sikh"
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
    # "Microbiology", "Physics", "Public Health", "Statistics",
]

description_embeddings = model.encode(name_desc, show_progress_bar=True, device=DEVICE)
tags_embedding = model.encode(all_identities, show_progress_bar=True, device=DEVICE)

similarity_matrix = model.similarity(description_embeddings, tags_embedding) # rows are descriptions, columns are tags

min_max_scaler = preprocessing.MinMaxScaler()
scaled_similarity_matrix = min_max_scaler.fit_transform(similarity_matrix)

sim_df = pd.DataFrame(scaled_similarity_matrix, columns = all_identities)
sim_df.insert(loc = 0, column = "Club Name", value = df["Club Name"])
sim_df["Description"] = name_desc

def race_threshold(thresh_value, race_list, dataframe):
    for index, row in dataframe.iterrows():
        race_vals = row[race_list].to_list()
        maximum_race_val = max(race_vals)
        minimum_race_val = min(race_vals)
        max_val_index = race_vals.index(maximum_race_val)

        for col in race_list:
            dataframe.loc[index, col] = 0.0 # MIGHT have to set to 0.5 

        if minimum_race_val >= thresh_value or maximum_race_val < thresh_value:
            for col in race_list:
                dataframe.loc[index, col] = 1.0

        elif maximum_race_val >= thresh_value:
            dataframe.loc[index, race_list[max_val_index]] = 1.0


def gender_threshold(dataframe, thresh_value):
    women_list = {"woman", "woman's", "women", "women's", "womens", "sisterhood", "sister", "sisters", "sorority"}
    men_list = {"man", "man's", "men", "men's", "mens", "brotherhood", "brother", "brothers"}

    for index, row in dataframe.iterrows():
        description = row["Description"]
        found = None

        for word in str(description).lower().split():
            if word in women_list:
                found = "woman"
                break
            elif word in men_list:
                found = "man"
                break
        
        if found == "man":
            dataframe.loc[index, "woman women"] = 0.0
            dataframe.loc[index, "man men"] = 1.0
        elif found == "woman":
            dataframe.loc[index, "woman women"] = 1.0
            dataframe.loc[index, "man men"] = 0.0
        else:
            woman_score = dataframe.loc[index, "woman women"]
            man_score = dataframe.loc[index, "man men"]

            if (woman_score >= thresh_value and man_score >= thresh_value) or (woman_score < thresh_value and man_score < thresh_value):
                dataframe.loc[index, "woman women"] = 1.0
                dataframe.loc[index, "man men"] = 1.0
            elif woman_score > man_score:
                dataframe.loc[index, "woman women"] = 1.0
                dataframe.loc[index, "man men"] = 0.0
            else:
                dataframe.loc[index, "woman women"] = 0.0
                dataframe.loc[index, "man men"] = 1.0


def greek_life_threshold(dataframe):
    greek_life_list = {"greek", "fraternity", "sorority", "brotherhood", "sisterhood", "brothers", "sisters",
                       "alpha", "beta", "gamma", "delta", "epsilon", "zeta", "eta", "theta", "iota", "kappa",
                       "lambda", "mu", "nu", "xi", "omicron", "pi", "rho", "sigma", "tau", "upsilon",
                       "phi", "chi", "psi", "omega"}

    for index, row in dataframe.iterrows():
        description = row["Description"]
        found = None
        for word in str(description).lower().split():
            if word in greek_life_list:
                found = "greek"
                break

        if found == "greek":
            dataframe.loc[index, "Greek"] = 1.0
        else:
            dataframe.loc[index, "Greek"] = 0.0

def lgbtq_threshold(dataframe, thresh_value):
    for index, row in dataframe.iterrows():
        lgbtq_score = row["lgbtq"]
        if lgbtq_score >= thresh_value:
            dataframe.loc[index, "lgbtq"] = 1.0
        else:
            dataframe.loc[index, "lgbtq"] = 0.0


def main():
    racelist = ["White European Italian", "Black African American", "Native American", "Hispanic", "Asian", "Native Hawaiian or Other Pacific Islander"]

    race_threshold(0.6, racelist, sim_df) # The largest race value is set to 1.0 as long as it's above 0.6. Otherwise they are all set to 1.0. 
    gender_threshold(sim_df, 0.575) # If the name/desc contains the gender in it, set it to 1.0. Otherwise, if both are above or below 0.575, set them both to 1.0. Otherwise, set the larger one to 1.0 and the smaller one to 0.0.
    greek_life_threshold(sim_df) # If the name/desc contains greek life in it, set it to 1.0. Otherwise, set it to 0.0.
    lgbtq_threshold(sim_df, 0.65) # If the lgbtq score above 0.65, set it to 1.0. Otherwise, set it to 0.0.

    sim_df.to_csv('IdentityScored.csv', index=False)

    print(f"Device is {DEVICE}")

if __name__ == "__main__":
    main()