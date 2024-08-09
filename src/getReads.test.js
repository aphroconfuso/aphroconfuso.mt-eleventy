const getReads = require('./getReads.js');

test('returns correct conjugation', () => {
  expect(getReads('hu')).toBe('jaqra');
});

test('returns 3rd plural if no pronoun is provided', () => {
  expect(getReads(null)).toBe('jaqraw');
});
