module.exports = (authorsType) => authorsType && authorsType.replace(/\_.*/, '') || 'solo';
