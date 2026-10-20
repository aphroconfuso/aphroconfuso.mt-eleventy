
const shuffleBooksArray = (arr, limit = 6, maxNulls = 2) => {
	if (!Array.isArray(arr)) return arr;

	const priced = arr.filter(item => item.bookPrice != null);
	const unpriced = arr.filter(item => item.bookPrice == null);

	// Helper: partial shuffle + take n
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
		return sample(arr, arr.length);
	}

	// Select priced items first, reserving slots for unpriced items
	const maxPriced = Math.max(0, limit - maxNulls);
	const pickedPriced = sample(priced, maxPriced);

	// Fill remaining slots with unpriced items
	const remaining = limit - pickedPriced.length;
	const pickedUnpriced = sample(unpriced, remaining);

	// If there aren't enough unpriced items, fill the remaining slots
	// with additional priced items not already selected
	const extraSlots = remaining - pickedUnpriced.length;

	const pickedExtraPriced = sample(
		priced.filter(item => !pickedPriced.includes(item)),
		extraSlots
	);

	return [...pickedPriced, ...pickedUnpriced, ...pickedExtraPriced];
};

module.exports = shuffleBooksArray;
