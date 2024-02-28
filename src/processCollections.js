// TODO: Also get more stories from storycollection

module.exports = (storycollections) => {
	return storycollections.map((storycollection) => {
		return {
			id: storycollection.id,
			title: storycollection.attributes.title,
			description: storycollection.attributes.description,
			moreToCome: storycollection.attributes.moreToCome,
			// stories:
		}
	});
}
