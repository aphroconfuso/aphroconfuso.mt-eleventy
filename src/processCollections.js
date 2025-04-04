const makeSortableTitle = require('./makeSortableTitle');
const slugifyMaltese = require('./slugifyMaltese.js');

module.exports = (storyCollections) =>
  storyCollections.map(({ id, attributes }) => ({
    id,
    title: attributes.title,
    description: attributes.description,
		moreToCome: attributes.moreToCome,
    stories: attributes.stories
      ? attributes.stories.data.map(({ attributes: storyAttributes }) => ({
          slug: slugifyMaltese(`${attributes.title} ${storyAttributes.title}`),
					sortTitle: makeSortableTitle(storyAttributes.title),
          title: storyAttributes.title
        }))
      : [],
  }));
