from sentence_transformers import SentenceTransformer
import pandas as pd
import torch
from sklearn import preprocessing

DEVICE = "mps" if torch.backends.mps.is_available() else "cuda" if torch.cuda.is_available() else "cpu"
model = SentenceTransformer("sentence-transformers/all-mpnet-base-v2")
df = pd.read_csv("NicosScrapedData.csv")

name_desc = df["Club Name"] + " " + df["Description Excerpt"]

# maybe add lgbtq tag
all_identities = [
    "Leadership",
    "Teamwork",
    "Community Service",
    "Advocacy",
    "Social Justice",
    "Sustainability",
    "Technology",
    "Arts & Crafts",
    "Performing Arts",
    "Cultural Expression",
    "Diversity & Inclusion",
    "Mentorship",
    "Career Growth",
    "Networking",
    "Entrepreneurship",
    "Research",
    "Fitness",
    "Competitive Sports",
    "Outdoor Activities",
    "Wellness",
    "Mental Health",
    "Academic Focus",
    "Debate & Discussion",
    "Gaming",
    "Social Events",
    "Media & Film",
    "Writing & Literature",
    "Music",
    "Dance",
    "Fashion & Design",
    "Food & Cooking",
    "Language & Culture",
    "Political Action",
    "Fundraising",
    "Tutoring & Teaching",
    "DIY & Making",
    "Faith & Spirituality",
    "Professional Skills",
    "Public Speaking",
    "Problem Solving",
    "Gaming & eSports",
    "Robotics & AI",
    #______________ Identity stuff _________________
    #Gender
    "woman women",
    "man men",
    "lgbtq",
    #Race
    "White European Italian", # Caucasian
    "Black African American", # African American
    "Native American", # Native American
    "Asian", # Asian American
    "Hispanic", # Hispanic
    "Native Hawaiian or Other Pacific Islander", # AAPI
    #Greek life
    "Greek", 
    #Religion
    "Christian",
    "Islam",
    "Jewish Community and Judaism",
    "Hindu",
    "Buddhism",
    "Sikh",
    #Major
    "Aerospace Engineering",
    "Agricultural Business",
    "Agricultural Communication",
    "Agricultural Science",
    "Agricultural Systems Management",
    "Animal Science",
    "Anthropology and Geography",
    "Architectural Engineering",
    "Architecture",
    "Art and Design",
    "Biochemistry",
    "Biological Sciences",
    "Biomedical Engineering",
    "BioResource and Agricultural Engineering",
    "Business Administration",
    "Chemistry",
    "Child Development",
    "City and Regional Planning",
    "Civil Engineering",
    "Communication Studies",
    "Comparative Ethnic Studies",
    "Computer Engineering",
    "Computer Science",
    "Construction Management",
    "Dairy Science",
    "Economics",
    "Electrical Engineering",
    "English",
    "Environmental Earth and Soil Sciences",
    "Environmental Engineering",
    "Environmental Management and Protection",
    "Food Science",
    "Forest and Fire Sciences",
    "General Engineering",
    "Graphic Communication",
    "History",
    "Industrial Engineering",
    "Industrial Technology and Packaging",
    "Interdisciplinary Studies",
    "Journalism",
    "Kinesiology",
    "Landscape Architecture",
    "Liberal Arts and Engineering Studies",
    "Liberal Studies",
    "Manufacturing Engineering",
    "Marine Sciences",
    "Materials Engineering",
    "Mathematics",
    "Mechanical Engineering",
    "Microbiology",
    "Music",
    "Nutrition",
    "Philosophy",
    "Physics",
    "Plant Sciences",
    "Political Science",
    "Public Health",
    "Psychology",
    "Recreation, Parks, and Tourism Administration",
    "Sociology",
    "Software Engineering",
    "Spanish",
    "Statistics",
    "Theatre Arts",
    "Wine and Viticulture"]

description_embeddings = model.encode(name_desc, show_progress_bar=True, device=DEVICE)
tags_embedding = model.encode(all_identities, show_progress_bar=True, device=DEVICE)

similarity_matrix = model.similarity(description_embeddings, tags_embedding) # rows are descriptions, columns are tags

min_max_scaler = preprocessing.MinMaxScaler()
scaled_similarity_matrix = min_max_scaler.fit_transform(similarity_matrix)

sim_df = pd.DataFrame(scaled_similarity_matrix, columns = all_identities)
sim_df.insert(loc = 0, column = "Club Name", value = df["Club Name"])
sim_df.insert(loc = 1, column = "links", value = df["tablescraper-selected-row href"])
sim_df["Description"] = name_desc

def race_threshold(thresh_value, race_list, dataframe):
    for index, row in dataframe.iterrows():
        race_vals = row[race_list].to_list()
        maximum_race_val = max(race_vals)
        minimum_race_val = min(race_vals)
        max_val_index = race_vals.index(maximum_race_val)

        for col in race_list:
            dataframe.loc[index, col] = 0.0 # MIGHT have to set to 0.5 

        if minimum_race_val >= thresh_value:
            for col in race_list:
                dataframe.loc[index, col] = 1.0
        
        elif maximum_race_val >= thresh_value:
            dataframe.loc[index, race_list[max_val_index]] = 1.0

        elif maximum_race_val < thresh_value:
            for col in race_list:
                dataframe.loc[index, col] = 1


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

    race_threshold(0.6, racelist, sim_df)
    gender_threshold(sim_df, 0.575)
    greek_life_threshold(sim_df)
    lgbtq_threshold(sim_df, 0.65)

    sim_df.to_csv('newTagsWithIdentity.csv', index=False)

    print(f"Device is {DEVICE}")

if __name__ == "__main__":
    main()