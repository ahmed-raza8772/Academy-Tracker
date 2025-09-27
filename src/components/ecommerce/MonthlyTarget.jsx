const MonthlyTarget = () => {
  const targets = [
    {
      name: "Student Enrollment",
      current: 85,
      target: 100,
      color: "bg-blue-500",
    },
    {
      name: "Teacher Recruitment",
      current: 4,
      target: 5,
      color: "bg-green-500",
    },
    {
      name: "Library Books Added",
      current: 120,
      target: 150,
      color: "bg-purple-500",
    },
    {
      name: "Parent Meetings",
      current: 18,
      target: 25,
      color: "bg-orange-500",
    },
  ];

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-white/[0.05] dark:bg-white/[0.03]">
      <h3 className="mb-6 text-lg font-semibold text-gray-900 dark:text-white">
        Monthly Targets Progress
      </h3>
      <div className="space-y-6">
        {targets.map((target, index) => (
          <div key={index}>
            <div className="mb-2 flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {target.name}
              </span>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {target.current}/{target.target}
              </span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
              <div
                className={`h-full rounded-full ${target.color}`}
                style={{ width: `${(target.current / target.target) * 100}%` }}
              ></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MonthlyTarget;
