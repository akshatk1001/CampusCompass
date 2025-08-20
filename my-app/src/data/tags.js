/**
 * ALL_TAGS
 * A mapping of tag IDs to an array containing the tag name.
 * The second element in the array is the tag ID itself, maintained for compatibility with existing logic.
 */
export const ALL_TAGS = {
  1: ["Leadership", 1],
  2: ["Teamwork", 2],
  3: ["Community Service", 3],
  4: ["Advocacy", 4],
  5: ["Social Justice", 5],
  6: ["Architecture & Urban Planning", 6],
  7: ["Technology", 7],
  8: ["Arts & Crafts", 8],
  9: ["Performing Arts", 9],
  10: ["Cultural Expression", 10],
  11: ["Diversity & Inclusion", 11],
  12: ["Mentorship", 12],
  13: ["Career Growth", 13],
  14: ["Networking", 14],
  15: ["Entrepreneurship", 15],
  16: ["Research", 16],
  17: ["Fitness", 17],
  18: ["Competitive Sports", 18],
  19: ["Outdoor Activities", 19],
  20: ["Wellness", 20],
  21: ["Mental Health", 21],
  22: ["Academic Focus", 22],
  23: ["Debate & Discussion", 23],
  24: ["Virtual Reality", 24],
  25: ["Social Events", 25],
  26: ["Media & Film", 26],
  27: ["Journalism", 27],
  28: ["Music", 28],
  29: ["Dance", 29],
  30: ["UI Design", 30],
  31: ["Hospitality", 31],
  32: ["International Relations", 32],
  33: ["Political Action", 33],
  34: ["Fundraising", 34],
  35: ["Tutoring & Teaching", 35],
  36: ["DIY & Making", 36],
  37: ["Ethics", 37],
  38: ["Professional Skills", 38],
  39: ["Public Speaking", 39],
  40: ["Problem Solving", 40],
  41: ["Analytics", 41],
  42: ["Robotics & AI", 42],
  43: ["Space & Astronomy", 43],
  44: ["Gaming & eSports", 44]
};

/**
 * TAG_LIST
 * A simple list of tag names corresponding to the keys in ALL_TAGS.
 */
export const TAG_LIST = Object.values(ALL_TAGS).map(tag => tag[0]);
