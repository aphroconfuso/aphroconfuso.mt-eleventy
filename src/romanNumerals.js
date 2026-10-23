const toRoman = (num, uppercase = false) => {
    const numerals = [
        [1000, 'M'], [900, 'CM'], [500, 'D'], [400, 'CD'],
        [100, 'C'], [90, 'XC'], [50, 'L'], [40, 'XL'],
        [10, 'X'], [9, 'IX'], [5, 'V'], [4, 'IV'], [1, 'I']
    ];

	if (!Number.isInteger(num) || num < 1 || num > 3999) {
		console.log('num', num);
		throw new RangeError('Number must be an integer between 1 and 3999');
  }

    let result = '';

    for (const [value, symbol] of numerals) {
        while (num >= value) {
            result += symbol;
            num -= value;
        }
    }

    return uppercase ? result : result.toLowerCase();
};

module.exports = toRoman;
