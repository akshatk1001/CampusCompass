/**
 * IDENTITY_QUESTIONS & IDENTITY_OPTIONS
 * These objects define the set of identity-based questions and corresponding answer options.
 * They allow users to indicate their identity traits, which can then be used for matchmaking.
 */
export const IDENTITY_QUESTIONS = {
  "Identity": [
    "What gender do you identify the most with?",
    "What race do you identify the most with?",
    "What is your major?",
    "What religion do you identify the most with?",
    "Are you interested in joining LGBTQ+ related communities?",
    "Are you interested in Greek Life?"
  ]
};

export const IDENTITY_OPTIONS = {
  "What gender do you identify the most with?": [
    { value: 'man men', label: 'Male' },
    { value: 'woman women', label: 'Female' },
    { value: 'other', label: 'Non-binary' },
    { value: 'other', label: 'Other/Decline To Say' }
  ],
  "What race do you identify the most with?": [
    { value: 'White European Italian', label: 'White' },
    { value: 'Black African American', label: 'Black or African American' },
    { value: 'Native American', label: 'American Indian or Alaska Native' },
    { value: 'Asian', label: 'Asian' },
    { value: 'Hispanic', label: 'Hispanic' },
    { value: 'Native Hawaiian or Other Pacific Islander', label: 'Native Hawaiian or Other Pacific Islander' },
    { value: 'other', label: 'Other/Decline To Say' }
  ],
  "What is your major?": [
    { value: "other", label: "Other/Decline To Say" },
    { value: "Aerospace Engineering", label: "Aerospace Engineering" },
    { value: "Agricultural Business", label: "Agricultural Business" },
    { value: "Agricultural Communication", label: "Agricultural Communication" },
    { value: "Agricultural Science", label: "Agricultural Science" },
    { value: "Agricultural Systems Management", label: "Agricultural Systems Management" },
    { value: "Animal Science", label: "Animal Science" },
    { value: "Anthropology and Geography", label: "Anthropology and Geography" },
    { value: "Architectural Engineering", label: "Architectural Engineering" },
    { value: "Architecture", label: "Architecture" },
    { value: "Art and Design", label: "Art and Design" },
    { value: "Biochemistry", label: "Biochemistry" },
    { value: "Biological Sciences", label: "Biological Sciences" },
    { value: "Biomedical Engineering", label: "Biomedical Engineering" },
    { value: "BioResource and Agricultural Engineering", label: "BioResource and Agricultural Engineering" },
    { value: "Business Administration", label: "Business Administration" },
    { value: "Chemistry", label: "Chemistry" },
    { value: "Child Development", label: "Child Development" },
    { value: "City and Regional Planning", label: "City and Regional Planning" },
    { value: "Civil Engineering", label: "Civil Engineering" },
    { value: "Communication Studies", label: "Communication Studies" },
    { value: "Comparative Ethnic Studies", label: "Comparative Ethnic Studies" },
    { value: "Computer Engineering", label: "Computer Engineering" },
    { value: "Computer Science", label: "Computer Science" },
    { value: "Construction Management", label: "Construction Management" },
    { value: "Dairy Science", label: "Dairy Science" },
    { value: "Economics", label: "Economics" },
    { value: "Electrical Engineering", label: "Electrical Engineering" },
    { value: "English", label: "English" },
    { value: "Environmental Earth and Soil Sciences", label: "Environmental Earth and Soil Sciences" },
    { value: "Environmental Engineering", label: "Environmental Engineering" },
    { value: "Environmental Management and Protection", label: "Environmental Management and Protection" },
    { value: "Food Science", label: "Food Science" },
    { value: "Forest and Fire Sciences", label: "Forest and Fire Sciences" },
    { value: "General Engineering", label: "General Engineering" },
    { value: "Graphic Communication", label: "Graphic Communication" },
    { value: "History", label: "History" },
    { value: "Industrial Engineering", label: "Industrial Engineering" },
    { value: "Industrial Technology and Packaging", label: "Industrial Technology and Packaging" },
    { value: "Interdisciplinary Studies", label: "Interdisciplinary Studies" },
    { value: "Journalism", label: "Journalism" },
    { value: "Kinesiology", label: "Kinesiology" },
    { value: "Landscape Architecture", label: "Landscape Architecture" },
    { value: "Liberal Arts and Engineering Studies", label: "Liberal Arts and Engineering Studies" },
    { value: "Liberal Studies", label: "Liberal Studies" },
    { value: "Manufacturing Engineering", label: "Manufacturing Engineering" },
    { value: "Marine Sciences", label: "Marine Sciences" },
    { value: "Materials Engineering", label: "Materials Engineering" },
    { value: "Mathematics", label: "Mathematics" },
    { value: "Mechanical Engineering", label: "Mechanical Engineering" },
    { value: "Microbiology", label: "Microbiology" },
    { value: "Music", label: "Music" },
    { value: "Nutrition", label: "Nutrition" },
    { value: "Philosophy", label: "Philosophy" },
    { value: "Physics", label: "Physics" },
    { value: "Plant Sciences", label: "Plant Sciences" },
    { value: "Political Science", label: "Political Science" },
    { value: "Public Health", label: "Public Health" },
    { value: "Psychology", label: "Psychology" },
    { value: "Recreation, Parks, and Tourism Administration", label: "Recreation, Parks, and Tourism Administration" },
    { value: "Sociology", label: "Sociology" },
    { value: "Software Engineering", label: "Software Engineering" },
    { value: "Spanish", label: "Spanish" },
    { value: "Statistics", label: "Statistics" },
    { value: "Theatre Arts", label: "Theatre Arts" },
    { value: "Wine and Viticulture", label: "Wine and Viticulture" }
  ],
  "What religion do you identify the most with?": [
    { value: 'Christian', label: 'Christianity' },
    { value: 'Jewish Community and Judaism', label: 'Jewish' },
    { value: 'Islam', label: 'Islam' },
    { value: 'Hindu', label: 'Hinduism' },
    { value: 'Buddhism', label: 'Buddhism' },
    { value: 'other', label: 'Atheist' },
    { value: 'other', label: 'Agnostic' },
    { value: 'other', label: 'Other/Decline To Say' }
  ],
  "Are you interested in joining LGBTQ+ related communities?": [
    { value: 'lgbtq', label: 'Yes' },
    { value: 'other', label: 'Maybe' },
    { value: 'other', label: 'No' }
  ],
  "Are you interested in Greek Life?": [
    { value: 'Greek', label: 'Yes' },
    { value: 'other', label: 'Maybe' },
    { value: 'other', label: 'No' }
  ]
};

export const ONLY_IDENTITIES = [
  /* Lengths of each identity category (for debugging purposes):
  * 2
  * 6
  * 65
  * 5
  * 1
  * 1
  */
  ["man men", "woman women"],
  ["White European Italian", "Black African American", "Native American", "Asian", "Hispanic", "Native Hawaiian or Other Pacific Islander"],
  ["Aerospace Engineering", "Agricultural Business", "Agricultural Communication", "Agricultural Science", "Agricultural Systems Management",
    "Animal Science", "Anthropology and Geography", "Architectural Engineering", "Architecture", "Art and Design", "Biochemistry", "Biological Sciences", 
    "Biomedical Engineering", "BioResource and Agricultural Engineering", "Business Administration", "Chemistry",
    "Child Development", "City and Regional Planning", "Civil Engineering", 
    "Communication Studies", "Comparative Ethnic Studies", "Computer Engineering", 
    "Computer Science", "Construction Management", "Dairy Science", "Economics",  
    "Electrical Engineering", "English", "Environmental Earth and Soil Sciences", 
    "Environmental Engineering", "Environmental Management and Protection", "Food Science", 
    "Forest and Fire Sciences", "General Engineering", "Graphic Communication", "History", 
    "Industrial Engineering", "Industrial Technology and Packaging", "Interdisciplinary Studies", 
    "Journalism", "Kinesiology", "Landscape Architecture", "Liberal Arts and Engineering Studies",
    "Liberal Studies", "Manufacturing Engineering", "Marine Sciences", "Materials Engineering", 
    "Mathematics", "Mechanical Engineering", "Microbiology", "Music", "Nutrition", "Philosophy", 
    "Physics", "Plant Sciences", "Political Science", "Public Health", "Psychology", 
    "Recreation, Parks, and Tourism Administration", "Sociology", "Software Engineering", "Spanish", 
    "Statistics", "Theatre Arts", "Wine and Viticulture"],
  ["Christian", "Jewish Community and Judaism", "Islam", "Hindu", "Buddhism"],
  ["lgbtq"],
  ["Greek"]
]