export const memoryStorage = {};

export const boostDropletsForAllCourses = (onComplete) => {
  const courseIds = [
    'cs101', 'math2413', 'hist1301', 'bio1306',
    'chem1411', 'phil1301', 'engl1301', 'econ2301',
  ];

  courseIds.forEach(courseId => {
    const key = `droplets-${courseId}`;
    const current = memoryStorage[key] || 0;
    memoryStorage[key] = Math.min(current + 10, 100);
  });

  if (onComplete) onComplete();
};
