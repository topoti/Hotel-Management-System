// Dates like "2026-11-01" are saved in MongoDB as 2026-11-01T00:00:00Z (midnight UTC).
// This returns today's date in the same format, using the server's local calendar day.
const startOfToday = () => {
  const now = new Date();
  return new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()));
};

// The day after a given date
const addDays = (date, days) => new Date(date.getTime() + days * 24 * 60 * 60 * 1000);

module.exports = { startOfToday, addDays };
