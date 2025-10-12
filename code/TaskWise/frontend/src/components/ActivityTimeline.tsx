import { Activity, CheckCircle2, Circle, Clock, UserPlus, Trash2 } from 'lucide-react';

interface ActivityItem {
  id: string;
  type: 'task_created' | 'task_completed' | 'task_updated' | 'member_added' | 'member_removed' | 'project_created';
  title: string;
  description: string;
  timestamp: Date;
  user: {
    name: string;
    avatar?: string;
  };
}

interface Props {
  activities: ActivityItem[];
}

export default function ActivityTimeline({ activities }: Props) {
  const getIcon = (type: string) => {
    switch (type) {
      case 'task_completed':
        return <CheckCircle2 className="w-5 h-5 text-green-600" />;
      case 'task_created':
        return <Circle className="w-5 h-5 text-blue-600" />;
      case 'member_added':
        return <UserPlus className="w-5 h-5 text-purple-600" />;
      case 'member_removed':
        return <Trash2 className="w-5 h-5 text-red-600" />;
      default:
        return <Activity className="w-5 h-5 text-gray-600" />;
    }
  };

  const getColor = (type: string) => {
    switch (type) {
      case 'task_completed':
        return 'bg-green-100 border-green-300';
      case 'task_created':
        return 'bg-blue-100 border-blue-300';
      case 'member_added':
        return 'bg-purple-100 border-purple-300';
      case 'member_removed':
        return 'bg-red-100 border-red-300';
      default:
        return 'bg-gray-100 border-gray-300';
    }
  };

  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="card">
      <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
        <Activity className="w-5 h-5 text-primary-600" />
        Recent Activity
      </h2>

      <div className="relative">
        {/* Timeline Line */}
        <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gray-200"></div>

        {/* Activity Items */}
        <div className="space-y-6">
          {activities.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No recent activity</p>
          ) : (
            activities.map((activity, index) => (
              <div key={activity.id} className="relative flex items-start gap-4 group">
                {/* Icon */}
                <div className={`relative z-10 flex items-center justify-center w-12 h-12 rounded-full border-2 ${getColor(activity.type)} transition-transform group-hover:scale-110`}>
                  {getIcon(activity.type)}
                </div>

                {/* Content */}
                <div className="flex-1 bg-white border border-gray-200 rounded-lg p-4 shadow-sm group-hover:shadow-md transition-all">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="font-semibold text-gray-900">{activity.title}</h3>
                      <p className="text-sm text-gray-600 mt-1">{activity.description}</p>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <Clock className="w-3 h-3" />
                      {formatTime(activity.timestamp)}
                    </div>
                  </div>

                  {/* User Info */}
                  <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-100">
                    <div className="w-6 h-6 bg-primary-600 rounded-full flex items-center justify-center text-white text-xs font-semibold">
                      {activity.user.name.charAt(0).toUpperCase()}
                    </div>
                    <span className="text-sm text-gray-700">{activity.user.name}</span>
                  </div>
                </div>

                {/* Connector Dot */}
                {index < activities.length - 1 && (
                  <div className="absolute left-6 top-16 w-2 h-2 bg-gray-300 rounded-full"></div>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {activities.length > 0 && (
        <button className="w-full mt-6 py-2 text-sm text-primary-600 hover:text-primary-700 font-medium transition">
          View All Activity →
        </button>
      )}
    </div>
  );
}
