import { Doughnut } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";

ChartJS.register(ArcElement, Tooltip, Legend);

const DemographicCard = () => {
  const gradeDistribution = {
    labels: ["Grade 1-3", "Grade 4-6", "Grade 7-9", "Grade 10-12"],
    datasets: [
      {
        data: [25, 30, 28, 17],
        backgroundColor: [
          "rgba(59, 130, 246, 0.8)",
          "rgba(16, 185, 129, 0.8)",
          "rgba(245, 158, 11, 0.8)",
          "rgba(239, 68, 68, 0.8)",
        ],
        borderWidth: 2,
        borderColor: "white",
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: "bottom",
      },
    },
  };

  const stats = [
    { label: "International Students", value: "12%", change: "+2%" },
    { label: "Scholarship Students", value: "18%", change: "+5%" },
    { label: "New Enrollments", value: "45", change: "+8" },
  ];

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-white/[0.05] dark:bg-white/[0.03]">
      <h3 className="mb-6 text-lg font-semibold text-gray-900 dark:text-white">
        Student Demographics
      </h3>

      <div className="mb-6 h-48">
        <Doughnut data={gradeDistribution} options={options} />
      </div>

      <div className="space-y-3">
        {stats.map((stat, index) => (
          <div
            key={index}
            className="flex items-center justify-between border-b border-gray-100 pb-3 dark:border-gray-700"
          >
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {stat.label}
            </span>
            <div className="text-right">
              <span className="block font-semibold text-gray-900 dark:text-white">
                {stat.value}
              </span>
              <span className="text-xs text-green-600 dark:text-green-400">
                {stat.change}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DemographicCard;
