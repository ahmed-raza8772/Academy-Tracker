import { useState } from "react";

const EduMetrics = () => {
  const [metrics] = useState([
    {
      title: "Total Students",
      value: "1,248",
      change: "+12%",
      isPositive: true,
      icon: "👨‍🎓",
      description: "Active enrollments",
    },
    {
      title: "Total Teachers",
      value: "48",
      change: "+3%",
      isPositive: true,
      icon: "👩‍🏫",
      description: "Teaching staff",
    },
    {
      title: "Attendance Rate",
      value: "94.2%",
      change: "+2.1%",
      isPositive: true,
      icon: "📊",
      description: "This month",
    },
    {
      title: "Avg. GPA",
      value: "3.42",
      change: "-0.1",
      isPositive: false,
      icon: "⭐",
      description: "School average",
    },
  ]);

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {metrics.map((metric, index) => (
        <div
          key={index}
          className="rounded-xl border border-gray-200 bg-white p-5 dark:border-white/[0.05] dark:bg-white/[0.03]"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                {metric.title}
              </p>
              <h3 className="mt-2 text-2xl font-semibold text-gray-900 dark:text-white">
                {metric.value}
              </h3>
              <div className="mt-1 flex items-center">
                <span
                  className={`text-sm font-medium ${
                    metric.isPositive
                      ? "text-green-600 dark:text-green-400"
                      : "text-red-600 dark:text-red-400"
                  }`}
                >
                  {metric.change}
                </span>
                <span className="ml-2 text-sm text-gray-500 dark:text-gray-400">
                  {metric.description}
                </span>
              </div>
            </div>
            <div className="text-3xl">{metric.icon}</div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default EduMetrics;
