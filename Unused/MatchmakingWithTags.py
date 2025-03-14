import csv
import pandas as pd
from sklearn.metrics.pairwise import cosine_similarity
import numpy as np

# 1. DEFINE TAGS AND BROAD CATEGORIES

'''HAVE TO CHANGE ALL OF THIS AND IMPORT IT FROM APP JS'''

ALL_TAGS = {
    1: ["Community Service", 1],
    2: ["Professional Networking", 2],
    3: ["Creative Arts", 3],
    4: ["Technology Integration", 14],
    5: ["Environmental Sustainability", 5],
    6: ["Leadership Development", 2],
    7: ["Academic Support", 2],
    8: ["Cultural Diversity", 8],
    9: ["Social Events", 8],
    10: ["Innovation and Entrepreneurship", 14],
    11: ["Health and Wellness", 16],
    12: ["Religious and Spiritual", 8],
    13: ["Competitive Teams", 16],
    14: ["Engineering Focus", 14],
    15: ["Agricultural Practices", 5],
    16: ["Sports and Recreation", 16],
    17: ["Political Activism", 1],
    18: ["Historical Preservation", 8],
    19: ["Science and Research", 14],
    20: ["Music and Performance", 3],
    21: ["Advocacy and Human Rights", 1],
    22: ["Corporate Partnerships", 2],
    23: ["International Focus", 8],
    24: ["Equity and Inclusion", 8],
    25: ["STEM Education", 14],
    26: ["Literary and Writing", 3],
    27: ["Artistic Expression", 3],
    28: ["Financial Education", 2],
    29: ["Media and Communications", 3],
    30: ["Career Readiness", 2],
    31: ["Legal Education", 1],
    32: ["Safety and Security", 1],
    33: ["Volunteer Opportunities", 1],
    34: ["Women’s Interests", 8],
    35: ["Mental Health", 1],
    36: ["Animal Welfare", 5],
    37: ["Technology and Coding", 14],
    38: ["Outdoor Activities", 16],
    39: ["Family and Parenting", 1],
    40: ["Culinary Arts", 3]
}

# Question sets for categories remain unchanged
CATEGORY_QUESTIONS = {
     "Sports and Recreation": [
        ("Do you enjoy team-based sports like soccer, basketball, or cricket?", [16, 13]),
        ("Are individual sports, such as cycling or fencing, more your style?", [16, 38]),
        ("Do you prefer outdoor activities like hiking, rowing, or dragon boating?", [16, 38, 11]),
        ("Would you participate in competitive events like triathlons or esports?", [16, 13]),
        ("Are you interested in exploring unique sports, such as archery or unicycling?", [16, 38]),
        ("Do you enjoy water sports, such as sailing, waterskiing, or rowing?", [16, 38, 11]),
        ("Would you like to join a recreational club for fun rather than competition?", [16, 33])
    ],
    "Creative Arts": [
        ("Do you enjoy creating visual art, such as painting or drawing?", [3, 27]),
        ("Are you passionate about performing arts, like dance, theater, or music?", [3, 20]),
        ("Do you like writing, such as poetry, short stories, or journalism?", [3, 26]),
        ("Would you join a comedy or improv club?", [3, 20]),
        ("Are you interested in exploring textile arts or sustainable fashion?", [3, 27, 5]),
        ("Do you prefer collaborative projects, such as producing performances or art exhibitions?", [3, 27]),
        ("Are you interested in photography or digital design?", [3, 29]),
        ("Would you enjoy expressing your creativity in a non-competitive environment?", [3, 27, 35])
    ],
    "Community Service & Advocacy": [
        ("Are you passionate about volunteering to help your community?", [1, 33]),
        ("Do you enjoy advocating for social or environmental justice?", [1, 21, 5]),
        ("Would you like to work on projects promoting equity and inclusion?", [1, 24, 34]),
        ("Are you interested in supporting causes such as animal welfare?", [1, 36]),
        ("Do you want to participate in activities that promote human rights?", [1, 21, 33]),
        ("Would you enjoy planning community events to bring people together?", [1, 9]),
        ("Are you open to working with diverse cultural groups to achieve shared goals?", [1, 8, 23])
    ],
    "Professional Development & Networking": [
        ("Do you want to join a club that focuses on career readiness or job skills?", [2, 30]),
        ("Are you interested in learning about entrepreneurship or innovation?", [2, 10, 28]),
        ("Would you like to connect with professionals in your field of study?", [2, 22]),
        ("Do you enjoy participating in leadership development programs?", [2, 6]),
        ("Would you attend workshops on financial literacy or budgeting?", [2, 28, 30]),
        ("Are you interested in clubs that promote academic or professional success?", [2, 7, 30]),
        ("Do you enjoy collaborating with peers to solve real-world problems?", [2, 4, 10])
    ],
    "Technology and Engineering": [
        ("Are you passionate about coding or software development?", [14, 37, 4]),
        ("Do you enjoy working on engineering projects or building things?", [14, 4]),
        ("Would you like to join a robotics or AI-focused club?", [14, 37, 19]),
        ("Are you interested in promoting STEM education in your community?", [14, 25, 33]),
        ("Do you enjoy participating in hackathons or coding competitions?", [14, 37, 13]),
        ("Are you passionate about the future of renewable energy or sustainable tech?", [14, 5]),
        ("Would you like to work on interdisciplinary projects involving technology?", [14, 4])
    ],
    "Environmental Sustainability": [
        ("Are you passionate about addressing climate change?", [5, 21]),
        ("Do you enjoy participating in projects focused on conservation?", [5, 33]),
        ("Would you like to join a club that promotes sustainable agriculture?", [5, 15]),
        ("Are you interested in outdoor activities like tree planting or cleanups?", [5, 33, 38]),
        ("Do you enjoy raising awareness about environmental issues?", [5, 21]),
        ("Would you work on initiatives to reduce campus waste or improve recycling?", [5, 15]),
        ("Are you interested in collaborating on research about sustainability?", [5, 19])
    ],
    "Cultural Diversity and Social Connection": [
        ("Do you enjoy learning about and experiencing other cultures?", [8, 23]),
        ("Are you passionate about promoting equity and inclusion on campus?", [8, 24, 21]),
        ("Would you like to join a club that focuses on multicultural events?", [8, 9, 23]),
        ("Are you interested in joining clubs that celebrate specific heritages?", [8, 24]),
        ("Do you enjoy participating in activities that bring diverse groups together?", [8, 9, 34]),
        ("Would you like to explore clubs focused on international connections?", [8, 23]),
        ("Are you passionate about addressing issues of social justice?", [8, 21, 24])
    ]
}

# 2. HELPER FUNCTIONS

def rename_category_to_number(category_name):
    if category_name == "Community Service & Advocacy":
        return 1
    elif category_name == "Creative Arts":
        return 3
    elif category_name == "Sports and Recreation": 
        return 16
    elif category_name == "Environmental Sustainability":
        return 5
    elif category_name == "Professional Development & Networking":
        return 2
    elif category_name == "Technology and Engineering":
        return 14
    elif category_name == "Cultural Diversity and Social Connection":
        return 8
    

def get_user_tags_df(tags, questions):
    columns_list = [value[0] for value in tags.values()]
    user_tags_dictionary = {key_number : [] for key_number in tags}
    
    print("Welcome to the Club Match Survey! We will ask you questions about various interests.\n")
    
    for category_name, questions in CATEGORY_QUESTIONS.items():
        interested = get_yes_no_maybe(f"\nAre you interested in {category_name}?")
        actual_category_number = rename_category_to_number(category_name)
            
        if interested == 1:
            user_tags_dictionary[actual_category_number].append(1)
            user_tags_dictionary = sub_questions(category_name, questions, user_tags_dictionary)
        elif interested == .5:
            user_tags_dictionary[actual_category_number].append(.5)
            user_tags_dictionary = sub_questions(category_name, questions, user_tags_dictionary)
        else:
            user_tags_dictionary[actual_category_number].append(0)

    user_tags_dictionary = calc_user_tag_scores(user_tags_dictionary, tags)

    user_df = pd.DataFrame(user_tags_dictionary.values()).transpose()
    user_df.columns = columns_list  
    return user_df

def calc_user_tag_scores(user_tags_dictionary, tags_with_parents_dictionary):

    for tagnumber, list_of_responses in user_tags_dictionary.items():
        parent_tag = tags_with_parents_dictionary[tagnumber][1]
        parent_response_list = user_tags_dictionary[parent_tag] 

        if isinstance(parent_response_list, int) or isinstance(parent_response_list, float):
            average_parent = parent_response_list
        else:
            average_parent = sum(parent_response_list)/len(parent_response_list)
        
        if list_of_responses == []:
            average_tag = 0
        else:
            average_tag = sum(list_of_responses)/len(list_of_responses)
        
        # if average_tag < average_parent: 
        #     average_tag = (average_tag+average_parent)/2

        if average_tag == 1 and len(list_of_responses) >= 1:
            average_tag = 2

        user_tags_dictionary[tagnumber] = average_tag

    return user_tags_dictionary

def sub_questions(category_name, questions, user_tags_dictionary):
    print(f"Great! Let's see which specific areas of {category_name} interest you...")

    for question, tag_ids in questions:
        tag_interested = get_yes_no(question)

        if tag_interested == 1:
            for tag_id in tag_ids:
                user_tags_dictionary[tag_id].append(1)
        else:
            for tag_id in tag_ids:
                user_tags_dictionary[tag_id].append(0)

    return user_tags_dictionary

    
def get_yes_no_maybe(prompt):
    while True:
        answer = input(prompt + " (yes/maybe/no): ").strip().lower()
        if answer in ['yes', 'y']:
            return 1
        elif answer in ['no', 'n']:
            return 0
        elif answer in ['maybe', 'm']:
            return 0.5
        else:
            print("Please answer 'yes', 'maybe', or 'no'.")

def get_yes_no(prompt):
    while True:
        answer = input(prompt + " (yes/no): ").strip().lower()
        if answer in ['yes', 'y']:
            return 1
        elif answer in ['no', 'n']:
            return 0
        else:
            print("Please answer 'yes' or 'no'.")

def calculate_similarity(user_scores, club_scores):
    user_vector = np.array([user_scores.loc[0, ALL_TAGS[tag_id][0]] for tag_id in ALL_TAGS])
    club_vector = np.array([club_scores[ALL_TAGS[tag_id][0]] for tag_id in ALL_TAGS])

    similarity = cosine_similarity([user_vector], [club_vector])[0][0] 
    return similarity

def rank_clubs_by_similarity(user_scores : pd.DataFrame, clubs_scored : pd.DataFrame):
    ranked_clubs = []
    for index, club in clubs_scored.iterrows():
        similarity = calculate_similarity(user_scores, club)
        ranked_clubs.append({
            "Club Name": club["Club Name"],
            "similarity": similarity
        })
    
    ranked_clubs.sort(key=lambda x: x["similarity"], reverse=True)

    return ranked_clubs[:10]


# 3. MAIN SCRIPT
def main():
    # Load clubs from CSV
    csv_filename = "FinalWinterClubScores.csv"
    club_scores = pd.read_csv(csv_filename)
    
    # Collect user responses and scores
    user_tags = get_user_tags_df(ALL_TAGS, CATEGORY_QUESTIONS)
    
    print("\nSurvey complete! Here's how you scored for each tag:")
    print(user_tags, "\n\n")

    # Rank clubs by similarity
    matched_clubs = rank_clubs_by_similarity(user_tags, club_scores)

    # Display the top 10 most similar clubs
    print("\nHere are the top 10 clubs that match your interests:")
    for club in matched_clubs:
        print(f"\nClub: {club['Club Name']}")
        print(f"Similarity Score: {club['similarity']:.4f}")
    
if __name__ == "__main__":
    main()
