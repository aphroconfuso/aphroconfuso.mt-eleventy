const fixBlockquotes = require('./fixBlockquotes.js');

var nestedString = `
  <blockquote>
    <blockquote>Ħafna affarijiet.</blockquote>
  </blockquote>
`;

var nestedString2 = `
  <blockquote>
    <p>Ħafna affarijiet.</p>
  </blockquote>
`;

var cleanResult = `
  <blockquote>Ħafna affarijiet.</blockquote>
`;

test('returns <p>.*</p> removed>', () => {
	expect(fixBlockquotes(nestedString)).toBe(cleanResult);
});

test('returns <p>.*</p> removed>', () => {
	expect(fixBlockquotes(nestedString2)).toBe(cleanResult);
});
