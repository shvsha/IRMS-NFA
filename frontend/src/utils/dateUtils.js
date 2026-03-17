export function getWeekRange(week, year, month) {
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  return { 1:[1,7], 2:[8,14], 3:[15,21], 4:[22,daysInMonth] }[week];
}
