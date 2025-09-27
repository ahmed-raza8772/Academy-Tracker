import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const StatisticsChart = () => {
  const data = {
    labels: ["Mathematics", "Science", "English", "History", "Arts", "PE"],
    datasets: [
      {
        label: "Average Score",
        data: [85, 78, 92, 75, 88, 95],
        backgroundColor: "rgba(99, 102, 241, 0.8)",
      },
      {
        label: "Pass Rate %",
        data: [92, 85, 96, 80, 90, 98],
        backgroundColor: "rgba(16, 185, 129, 0.8)",
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: "top",
      },
      title: {
        display: true,
        text: "Subject-wise Performance Analysis",
      },
    },
  };

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-white/[0.05] dark:bg-white/[0.03]">
      <Bar data={data} options={options} />
    </div>
  );
};

export default StatisticsChart;
