module.exports = {
  eleventyComputed: {
    ownPageGenerics: data => data.collections.generics.filter(
			generic => !!generic.data.ownPage
    )
  }
};
