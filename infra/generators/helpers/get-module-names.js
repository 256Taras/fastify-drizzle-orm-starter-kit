/**
 * Module for retrieving model name in different cases.
 * @module getModelNames
 */

/**
 * Function for retrieving model name in different cases.
 *
 * @param {string} modelName - The model name.
 * @returns {object} - Object with model name in different cases.
 */
const getModuleNames = (modelName) => {
  // Generate camelCase
  const camelCase = modelName.replace(/(?:^\w|[A-Z]|\b\w|\s+)/g, (match, index) =>
    index === 0 ? match.toLowerCase() : match.toUpperCase(),
  );

  // Generate kebabCase
  const kebabCase = modelName
    .replace(/([a-z])([A-Z])/g, "$1-$2")
    .replace(/\s+/g, "-")
    .toLowerCase();

  // Generate snake_case
  const snakeCase = modelName
    .replace(/([a-z])([A-Z])/g, "$1_$2")
    .replace(/\s+/g, "_")
    .toLowerCase();

  // Generate UPPER_SNAKE_CASE
  const upperSnakeCase = snakeCase.toUpperCase();

  const pascalCase = camelCase.charAt(0).toUpperCase() + camelCase.slice(1);

  return {
    pascalCase,
    camelCase: camelCase.charAt(0).toUpperCase() + camelCase.slice(1), // Upper first letter
    lowerCamelCase: camelCase, // camelCase with first letter lower
    kebabCase, // hyphenated lower-case
    snakeCase, // underscored lower-case
    upperSnakeCase, // underscored upper-case
  };
};

export default getModuleNames;
