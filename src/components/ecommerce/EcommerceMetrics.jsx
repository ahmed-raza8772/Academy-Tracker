import {
  ArrowDownIcon,
  ArrowUpIcon,
  BoxIconLine,
  GroupIcon,
} from "../../icons";
import Badge from "../ui/badge/Badge";

function MetricCard({ title, value, icon, trend, percent }) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
      <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-xl dark:bg-gray-800">
        {icon}
      </div>

      <div className="flex items-end justify-between mt-5">
        <div>
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {title}
          </span>
          <h4 className="mt-2 font-bold text-gray-800 text-title-sm dark:text-white/90">
            {value}
          </h4>
        </div>

        <Badge color={trend === "up" ? "success" : "error"}>
          {trend === "up" ? <ArrowUpIcon /> : <ArrowDownIcon />}
          {percent}
        </Badge>
      </div>
    </div>
  );
}

export default function EcommerceMetrics() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-6">
      <MetricCard
        title="Customers"
        value="3,782"
        icon={<GroupIcon className="text-gray-800 size-6 dark:text-white/90" />}
        trend="up"
        percent="11.01%"
      />
      <MetricCard
        title="Orders"
        value="5,359"
        icon={
          <BoxIconLine className="text-gray-800 size-6 dark:text-white/90" />
        }
        trend="down"
        percent="9.05%"
      />
    </div>
  );
}
