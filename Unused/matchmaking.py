import csv
from sklearn.metrics.pairwise import cosine_similarity
import numpy as np

# 1. DEFINE TAGS AND BROAD CATEGORIES
ALL_TAGS = {
    1: "Community Service",
    2: "Professional Networking",
    3: "Creative Arts",
    4: "Technology Integration",
    5: "Environmental Sustainability",
    6: "Leadership Development",
    7: "Academic Support",
    8: "Cultural Diversity",
    9: "Social Events",
    10: "Innovation and Entrepreneurship",
    11: "Health and Wellness",
    12: "Religious and Spiritual",
    13: "Competitive Teams",
    14: "Engineering Focus",
    15: "Agricultural Practices",
    16: "Sports and Recreation",
    17: "Political Activism",
    18: "Historical Preservation",
    19: "Science and Research",
    20: "Music and Performance",
    21: "Advocacy and Human Rights",
    22: "Corporate Partnerships",
    23: "International Focus",
    24: "Equity and Inclusion",
    25: "STEM Education",
    26: "Literary and Writing",
    27: "Artistic Expression",
    28: "Financial Education",
    29: "Media and Communications",
    30: "Career Readiness",
    31: "Legal Education",
    32: "Safety and Security",
    33: "Volunteer Opportunities",
    34: "Women’s Interests",
    35: "Mental Health",
    36: "Animal Welfare",
    37: "Technology and Coding",
    38: "Outdoor Activities",
    39: "Family and Parenting",
    40: "Culinary Arts"
}

BROAD_CATEGORIES = {
    "Sports and Recreation": [16, 13, 38, 11, 35, 6, 33],
    "Creative Arts": [3, 20, 27, 26, 29, 8, 10, 35],
    "Community Service & Advocacy": [1, 21, 24, 33, 34, 12, 36, 5, 32],
    "Professional Development & Networking": [2, 30, 28, 6, 22, 4, 31, 7, 10],
    "Technology and Engineering": [4, 37, 14, 25, 19, 10, 5],
    "Environmental Sustainability": [5, 15, 19, 38, 36, 21, 1, 33],
    "Cultural Diversity and Social Connection": [8, 23, 24, 12, 18, 21, 34, 39, 9]
}

# Question sets for categories remain unchanged
CATEGORY_QUESTIONS = {
     "Sports and Recreation": [
        ("Do you enjoy team-based sports like soccer, basketball, or cricket?", [16, 13]),
        ("Are individual sports, such as cycling or fencing, more your style?", [16, 38]),
        ("Do you prefer outdoor activities like hiking, rowing, or dragon boating?", [38, 11]),
        ("Would you participate in competitive events like triathlons or esports?", [13, 16]),
        ("Are you interested in exploring unique sports, such as archery or unicycling?", [16, 38]),
        ("Do you enjoy water sports, such as sailing, waterskiing, or rowing?", [38, 11]),
        ("Would you like to join a recreational club for fun rather than competition?", [33, 16])
    ],
"Creative Arts": [
        ("Do you enjoy creating visual art, such as painting or drawing?", [27, 3]),
        ("Are you passionate about performing arts, like dance, theater, or music?", [20, 3]),
        ("Do you like writing, such as poetry, short stories, or journalism?", [26, 29]),
        ("Would you join a comedy or improv club?", [20, 8]),
        ("Are you interested in exploring textile arts or sustainable fashion?", [27, 5]),
        ("Do you prefer collaborative projects, such as producing performances or art exhibitions?", [3, 27]),
        ("Are you interested in photography or digital design?", [3, 29]),
        ("Would you enjoy expressing your creativity in a non-competitive environment?", [27, 35])
    ],
    "Community Service & Advocacy": [
        ("Are you passionate about volunteering to help your community?", [1, 33]),
        ("Do you enjoy advocating for social or environmental justice?", [21, 5]),
        ("Would you like to work on projects promoting equity and inclusion?", [24, 34]),
        ("Are you interested in supporting causes such as animal welfare?", [36, 1]),
        ("Do you want to participate in activities that promote human rights?", [21, 33]),
        ("Would you enjoy planning community events to bring people together?", [9, 1]),
        ("Are you open to working with diverse cultural groups to achieve shared goals?", [8, 23])
    ],
    "Professional Development & Networking": [
        ("Do you want to join a club that focuses on career readiness or job skills?", [30, 2]),
        ("Are you interested in learning about entrepreneurship or innovation?", [10, 28]),
        ("Would you like to connect with professionals in your field of study?", [22, 2]),
        ("Do you enjoy participating in leadership development programs?", [6, 2]),
        ("Would you attend workshops on financial literacy or budgeting?", [28, 30]),
        ("Are you interested in clubs that promote academic or professional success?", [7, 30]),
        ("Do you enjoy collaborating with peers to solve real-world problems?", [4, 10])
    ],
    "Technology and Engineering": [
        ("Are you passionate about coding or software development?", [37, 4]),
        ("Do you enjoy working on engineering projects or building things?", [14, 4]),
        ("Would you like to join a robotics or AI-focused club?", [37, 19]),
        ("Are you interested in promoting STEM education in your community?", [25, 33]),
        ("Do you enjoy participating in hackathons or coding competitions?", [37, 13]),
        ("Are you passionate about the future of renewable energy or sustainable tech?", [5, 14]),
        ("Would you like to work on interdisciplinary projects involving technology?", [4, 14])
    ],
    "Environmental Sustainability": [
        ("Are you passionate about addressing climate change?", [5, 21]),
        ("Do you enjoy participating in projects focused on conservation?", [5, 33]),
        ("Would you like to join a club that promotes sustainable agriculture?", [15, 5]),
        ("Are you interested in outdoor activities like tree planting or cleanups?", [33, 38]),
        ("Do you enjoy raising awareness about environmental issues?", [5, 21]),
        ("Would you work on initiatives to reduce campus waste or improve recycling?", [5, 15]),
        ("Are you interested in collaborating on research about sustainability?", [19, 5])
    ],
    "Cultural Diversity and Social Connection": [
        ("Do you enjoy learning about and experiencing other cultures?", [8, 23]),
        ("Are you passionate about promoting equity and inclusion on campus?", [24, 21]),
        ("Would you like to join a club that focuses on multicultural events?", [9, 23]),
        ("Are you interested in joining clubs that celebrate specific heritages?", [8, 34]),
        ("Do you enjoy participating in activities that bring diverse groups together?", [9, 24]),
        ("Would you like to explore clubs focused on international connections?", [23, 8]),
        ("Are you passionate about addressing issues of social justice?", [21, 24])
    ]
}

# 2. HELPER FUNCTIONS
def load_clubs_from_csv(filename):
    """Loads clubs from a CSV file."""
    clubs = []
    with open(filename, mode='r', encoding='utf-8-sig') as f:
        reader = csv.reader(f)
        for row in reader:
            if not row:
                continue
            club_name = row[0].strip()
            description = row[1].strip()
            tag_str = row[2].strip()

            # Split tags by semicolon or comma
            if ";" in tag_str:
                tag_list = [int(x) for x in tag_str.split(";") if x.strip().isdigit()]
            else:
                tag_list = [int(x) for x in tag_str.split(",") if x.strip().isdigit()]

            clubs.append({
                "name": club_name,
                "description": description,
                "tags": tag_list
            })
    return clubs

def get_yes_no(prompt):
    while True:
        answer = input(prompt + " (yes/no): ").strip().lower()
        if answer in ['yes', 'y']:
            return True
        elif answer in ['no', 'n']:
            return False
        else:
            print("Please answer 'yes' or 'no'.")


def collect_user_tags():
    """Collects user responses and returns averaged scores."""
    tag_scores = {tag_id: [] for tag_id in ALL_TAGS}  # Start with an empty list for each tag

    print("\nWelcome to the Club Match Survey! We will ask you questions about various interests.\n")

    for category_name, questions in CATEGORY_QUESTIONS.items():
        interested = get_yes_no(f"Are you interested in {category_name}?")
        if interested:
            print(f"\nGreat! Let's see which specific areas of {category_name} interest you...")
            for question, tag_ids in questions:
                tag_interested = get_yes_no(question)
                score = 10 if tag_interested else 0
                for tag_id in tag_ids:
                    tag_scores[tag_id].append(score)
        else:
            print(f"\nNo worries, we'll skip {category_name}...\n")
            # Assign "no response" (NR) to all tags in this category
            for question, tag_ids in questions:
                for tag_id in tag_ids:
                    tag_scores[tag_id].append(None)

    # Process the collected scores: default to 3 for tags with only "NR"
    averaged_scores = {}
    for tag_id, scores in tag_scores.items():
        filtered_scores = [s for s in scores if s is not None]
        if not filtered_scores:
            averaged_scores[tag_id] = 3  # Default score
        else:
            averaged_scores[tag_id] = sum(filtered_scores) / len(filtered_scores)

    return averaged_scores

def calculate_similarity(user_scores, club_scores):
    """Calculates cosine similarity between user and club scores."""
    user_vector = np.array([user_scores[tag_id] for tag_id in ALL_TAGS])
    club_vector = np.array([club_scores.get(tag_id, 0) for tag_id in ALL_TAGS])
    similarity = cosine_similarity([user_vector], [club_vector])[0][0]
    return similarity

def rank_clubs_by_similarity(clubs, averaged_scores):
    """Ranks clubs by similarity to user's scores."""
    ranked_clubs = []
    for club in clubs:
        club_scores = {tag: 10 if tag in club["tags"] else 0 for tag in ALL_TAGS}  # Club's tag scores
        similarity = calculate_similarity(averaged_scores, club_scores)
        ranked_clubs.append({**club, "similarity": similarity})

    # Sort clubs by similarity, highest first
    ranked_clubs.sort(key=lambda c: c["similarity"], reverse=True)
    return ranked_clubs[:10]  # Return top 10 clubs

# 3. MAIN SCRIPT
def main():
    # Load clubs from CSV
    csv_filename = "/Users/nicolasjulia/Downloads/clubs - Sheet1.csv"
    clubs = load_clubs_from_csv(csv_filename)

    # Collect user responses and scores
    averaged_scores = collect_user_tags()

    print("\nSurvey complete! Here's how you scored for each tag:")
    for tag_id, score in sorted(averaged_scores.items()):
        print(f"  - {tag_id}: {ALL_TAGS[tag_id]} => Score: {score:.2f}")

    # Rank clubs by similarity
    matched_clubs = rank_clubs_by_similarity(clubs, averaged_scores)

    # Display the top 10 most similar clubs
    print("\nHere are the top 10 clubs that match your interests:")
    for club in matched_clubs:
        print(f"\nClub: {club['name']}")
        print(f"Description: {club['description']}")
        print(f"Similarity Score: {club['similarity']:.4f}")
        print("Tags: ", ", ".join([ALL_TAGS[tag] for tag in club["tags"]]))

if __name__ == "__main__":
    main()
