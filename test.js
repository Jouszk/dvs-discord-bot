// Function to shuffle an array using Fisher-Yates algorithm
function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

// Given array of arrays
const entries = [
  {
    name: "Team 1",
    players: ["Player 1", "Player 2"],
  },
  {
    name: "Team 2",
    players: ["Player 3", "Player 4"],
  },
  {
    name: "Team 3",
    players: ["Player 5", "Player 6"],
  },
  {
    name: "Team 4",
    players: ["Player 7", "Player 8"],
  },
  {
    name: "Team 5",
    players: ["Player 9", "Player 10"],
  },
  {
    name: "Team 6",
    players: ["Player 11", "Player 12"],
  },
  {
    name: "Team 7",
    players: ["Player 13", "Player 14"],
  },
  {
    name: "Team 8",
    players: ["Player 15", "Player 16"],
  },
  {
    name: "Team 9",
    players: ["Player 17", "Player 18"],
  },
];

// Shuffle the entries (teams)
shuffleArray(entries);

// Create a tournament bracket
const bracket = [];

// Iterate over pairs of teams and create matchups
for (let i = 0; i < entries.length; i += 2) {
  const match = [entries[i], entries[i + 1]];
  bracket.push(match);
}

// Output the shuffled bracket
console.log(bracket);
