import csv

# ------------------------------------------------
# 1. DEFINE TAGS AND BROAD CATEGORIES
# ------------------------------------------------

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
    "Arts & Culture": [3, 8, 18, 20, 26, 27],
#    "STEM & Innovation": [4, 10, 14, 19, 25, 37],
#    "Community & Advocacy": [1, 5, 17, 21, 24, 33, 36],
#    "Professional & Career Development": [2, 6, 7, 22, 28, 29, 30, 31],
#    "Health & Wellness": [11, 35, 16, 38],
    "Social & Recreational": [9, 12, 39, 40],
    "Other": [13, 15, 23, 32, 34]
}


# ------------------------------------------------
# 2. HELPER FUNCTIONS
# ------------------------------------------------

def get_yes_no(prompt):
    """
    Asks a yes/no question via input() and returns True if user inputs "yes"
    (case-insensitive), False otherwise.
    """
    while True:
        response = input(prompt + " [yes/no]: ").strip().lower()
        if response in ["yes", "y"]:
            return True
        elif response in ["no", "n"]:
            return False
        else:
            print("Please answer 'yes' or 'no'.")


def load_clubs_from_csv(csv_filename):
    """
    Expects a CSV file with:
        column 1 (club_name),
        column 2 (description),
        column 3 (Tag IDs (comma- or semicolon-separated), e.g. 3;20;8)
    Returns a list of club dicts:
        [{"name": str, "description": str, "tags": [list of ints]}, ...]
    """
    clubs = []
    with open(csv_filename, mode='r', encoding='utf-8-sig') as f:
        reader = csv.reader(f)
        for row in reader:
            if not row:
                continue
            club_name = row[0].strip()
            description = row[1].strip()
            tag_str = row[2].strip()

            # Split by semicolon or comma
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


# ------------------------------------------------
# 3. COLLECT USER INTERESTS (BRANCHING LOGIC)
# ------------------------------------------------

def collect_user_tags():
    """
    Asks the user about each broad category, then drills down to specific tags
    if the user says 'yes.' Returns two sets: yes_tags, no_tags.
    """
    yes_tags = set()
    no_tags = set()

    print("\nWelcome to the Club Match Survey!")
    print("We will ask about some broad categories first.\n")

    for category_name, tag_ids in BROAD_CATEGORIES.items():
        # Ask if user is interested in this broad category
        interested = get_yes_no(f"Are you interested in {category_name}?")
        if interested:
            print(f"\nGreat! Let's see which specific areas of {category_name} interest you...")
            for tid in tag_ids:
                tag_interested = get_yes_no(f"Are you interested in '{ALL_TAGS[tid]}'?")
                if tag_interested:
                    yes_tags.add(tid)
                else:
                    no_tags.add(tid)
        else:
            # If no, mark all tags in that category as "no"
            for tid in tag_ids:
                no_tags.add(tid)
        print("")

    return yes_tags, no_tags


# ------------------------------------------------
# 4. MATCHING & RANKING
# ------------------------------------------------

def get_match_score(yes_tags, club_tags):
    """
    Returns the number of matched tags between user's yes_tags and the club's tags.
    """
    intersection = set(club_tags).intersection(yes_tags)
    return len(intersection)


def filter_and_rank_clubs(clubs, yes_tags, partial_threshold=0.5):
    """
    1) Filter out clubs that don't meet the 'partial_threshold' of matching.
       partial_threshold is a fraction of the user's yes_tags that must match.
         e.g., 0.5 means at least 50% of the user's yes-tags must appear in the club.
    2) Rank (sort) clubs by how many tags match (descending).

    Returns a sorted list of clubs that meet or exceed the threshold.
    """
    user_yes_count = len(yes_tags)
    if user_yes_count == 0:
        # If user didn't say "yes" to any tags, we might return an empty list
        # or all clubs. We'll choose to return all clubs in that case.
        # Adjust as needed.
        return clubs

    qualified_clubs = []
    for club in clubs:
        score = get_match_score(yes_tags, club["tags"])

        # Calculate fraction of yes_tags matched
        match_fraction = score / user_yes_count if user_yes_count > 0 else 0

        # Check if it meets partial threshold
        if match_fraction >= partial_threshold:
            # Store the score so we can sort later
            club_with_score = {
                "name": club["name"],
                "description": club["description"],
                "tags": club["tags"],
                "score": score
            }
            qualified_clubs.append(club_with_score)

    # Sort by score descending
    qualified_clubs.sort(key=lambda c: c["score"], reverse=True)
    return qualified_clubs


# ------------------------------------------------
# 5. MAIN SCRIPT
# ------------------------------------------------

def main():
    # 1. Collect user yes/no responses
    yes_tags, no_tags = collect_user_tags()

    # Print the user's selected tags
    print("\nSurvey complete!")
    print(f"You said YES to these tags ({len(yes_tags)} total):")
    for t in sorted(yes_tags):
        print(f"  - {t}: {ALL_TAGS[t]}")

    print(f"\nYou said NO to these tags ({len(no_tags)} total):")
    for t in sorted(no_tags):
        print(f"  - {t}: {ALL_TAGS[t]}")

    # 2. Load clubs from CSV
    csv_filename = "clubs.csv"  # Adjust the path as needed
    clubs = load_clubs_from_csv(csv_filename)

    # 3. Filter & rank clubs based on user yes_tags
    #    Example partial_threshold = 0.5 (require at least 50% of user’s yes-tags to match)
    partial_threshold = 0.1
    matched_clubs = filter_and_rank_clubs(clubs, yes_tags, partial_threshold=partial_threshold)

    # 4. Display matched clubs
    print(
        f"\nBased on your interests, here are clubs that match at least {int(partial_threshold * 100)}% of your yes-tags:\n")
    if matched_clubs:
        for club in matched_clubs:
            matched_tag_count = club["score"]
            # Extract which tags are matched for the user’s convenience
            matched_tag_names = [
                ALL_TAGS[t] for t in club["tags"] if t in yes_tags
            ]
            print(f"Club: {club['name']}")
            print(f"Description: {club['description']}")
            print(f"Matched Tag Count: {matched_tag_count}")
            print(f"Matched Tag Names: {matched_tag_names}")
            print("-" * 50)
    else:
        print("No clubs met the partial match threshold.")

    print("\nThank you for using the Club Match Survey!")


# ------------------------------------------------
# 6. ENTRY POINT
# ------------------------------------------------

if __name__ == "__main__":
    main()
