const pluralToSingularGlobal = (word) => {
  // Handle words ending in 'ies', which typically become 'y'
  if (word.endsWith("ies")) {
    return word.slice(0, -3) + "y";
  }

  // Handle other common plural endings
  const endings = [
    { plural: "es", singular: "" }, // Handles cases like boxes -> box
    { plural: "s", singular: "" }, // Handles cases like apples -> apple
    { plural: "en", singular: "" }, // Handles cases like oxen -> ox
  ];

  // Check each ending for a match and replace
  for (const ending of endings) {
    if (word.endsWith(ending.plural)) {
      return word.slice(0, -ending.plural.length) + ending.singular;
    }
  }

  // Return the word if no ending matched
  return word;
};

export default pluralToSingularGlobal;
