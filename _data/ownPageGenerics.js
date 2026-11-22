const getGenerics = require("./generics.js");

module.exports = async () => {
  const generics = await getGenerics();

  return Object.entries(generics)
    .filter(([key, generic]) => !!generic.ownPage)
    .map(([key, generic]) => ({
      ...generic,
      key
    }));
};
