const RecentActivity = () => {
  const activities = [
    {
      id: 1,
      student: "Sarah Johnson",
      action: "Submitted assignment",
      subject: "Mathematics",
      time: "2 min ago",
      type: "assignment",
      status: "submitted",
    },
    {
      id: 2,
      student: "Michael Chen",
      action: "Absent marked",
      subject: "Science",
      time: "1 hour ago",
      type: "attendance",
      status: "absent",
    },
    {
      id: 3,
      student: "Emma Wilson",
      action: "Grade updated",
      subject: "English Essay",
      time: "3 hours ago",
      type: "grade",
      status: "A-",
    },
    {
      id: 4,
      student: "David Kim",
      action: "Parent meeting scheduled",
      subject: "Progress Review",
      time: "5 hours ago",
      type: "meeting",
      status: "scheduled",
    },
    {
      id: 5,
      student: "Lisa Rodriguez",
      action: "Scholarship application",
      subject: "Approved",
      time: "1 day ago",
      type: "application",
      status: "approved",
    },
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case "submitted":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
      case "absent":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300";
      case "A-":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300";
      case "scheduled":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300";
      case "approved":
        return "bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-300";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300";
    }
  };

  const getActionIcon = (type) => {
    switch (type) {
      case "assignment":
        return "📝";
      case "attendance":
        return "📊";
      case "grade":
        return "⭐";
      case "meeting":
        return "👥";
      case "application":
        return "📄";
      default:
        return "📌";
    }
  };

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-white/[0.05] dark:bg-white/[0.03]">
      <h3 className="mb-6 text-lg font-semibold text-gray-900 dark:text-white">
        Recent Activity
      </h3>

      <div className="space-y-4">
        {activities.map((activity) => (
          <div key={activity.id} className="flex items-start space-x-4">
            <div className="text-2xl">{getActionIcon(activity.type)}</div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                  {activity.student}
                </p>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {activity.time}
                </span>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                {activity.action} - {activity.subject}
              </p>
            </div>
            <span
              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(activity.status)}`}
            >
              {activity.status}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RecentActivity;
