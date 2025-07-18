const fromStoriesById = (field, stories, id) => {
  const story = stories.find((s) => s.id === id);
  return story ? story[field] : null;
};

module.exports = {
  eleventyComputed: {
    podcastLengthMinutesFallback: (data) =>
      fromStoriesById("podcastLengthMinutesFallback", data.stories, data.promo.id),
  },
};
