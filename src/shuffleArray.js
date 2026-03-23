const shuffleArray = (arr, limit = 6, maxNulls = 2) => {
	if (!Array.isArray(arr)) return arr;
	const priced = arr.filter(item => item.bookPrice != null);
	const unpriced = arr.filter(item => item.bookPrice == null);

	// helper: partial shuffle + take n
	function sample(input, n) {
		const result = [...input];
		const len = result.length;
		const take = Math.max(0, Math.min(n, len));

		for (let i = 0; i < take; i++) {
			const j = i + Math.floor(Math.random() * (len - i));
			[result[i], result[j]] = [result[j], result[i]];
		}

		return result.slice(0, take);
	}

	if (typeof limit !== "number") {
		// fallback: full shuffle of everything
		return sample(arr, arr.length);
	}

	// how many priced items we want
	const maxPriced = Math.max(0, limit - maxNulls);

	const pickedPriced = sample(priced, maxPriced);

	// fill remaining slots with unpriced
	const remaining = limit - pickedPriced.length;
	const pickedUnpriced = sample(unpriced, remaining);

	return [...pickedPriced, ...pickedUnpriced];
};

module.exports = shuffleArray;
