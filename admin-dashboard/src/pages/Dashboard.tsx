import { useQuery } from '@tanstack/react-query'
import { adminApi, facilitatorApi } from '../lib/api'
import { useAuthStore } from '../store/authStore'
import { Users, Home, Wrench, Building2, UserCheck } from 'lucide-react'

export default function Dashboard() {
  const { user } = useAuthStore()
  const isFacilitator = user?.role === 'facilitator'

  const { data: dashboardStats } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: adminApi.getDashboardStats,
    enabled: !isFacilitator, // Only fetch for admins
  })

  const { data: facilitatorStats } = useQuery({
    queryKey: ['facilitator-stats', user?.id],
    queryFn: () => facilitatorApi.getMyStats(user?.id || ''),
    enabled: isFacilitator, // Only fetch for facilitators
  })

  const stats = isFacilitator ? [
    {
      name: 'Assigned Properties',
      value: facilitatorStats?.assignedProperties || 0,
      icon: Home,
      color: 'bg-blue-500',
    },
    {
      name: 'Total Tenants',
      value: facilitatorStats?.totalTenants || 0,
      icon: Users,
      color: 'bg-green-500',
    },
    {
      name: 'Total Units',
      value: facilitatorStats?.totalUnits || 0,
      icon: Building2,
      color: 'bg-indigo-500',
    },
    {
      name: 'Maintenance Requests',
      value: facilitatorStats?.maintenanceRequests || 0,
      icon: Wrench,
      color: 'bg-orange-500',
    },
  ] : [
    {
      name: 'Total Properties',
      value: dashboardStats?.totalProperties || 0,
      icon: Home,
      color: 'bg-blue-500',
    },
    {
      name: 'Total Landlords',
      value: dashboardStats?.totalLandlords || 0,
      icon: Users,
      color: 'bg-green-500',
    },
    {
      name: 'Total Facilitators',
      value: dashboardStats?.totalFacilitators || 0,
      icon: UserCheck,
      color: 'bg-purple-500',
    },
    {
      name: 'Total Units',
      value: dashboardStats?.totalUnits || 0,
      icon: Building2,
      color: 'bg-indigo-500',
    },
    {
      name: 'Occupied Units',
      value: dashboardStats?.occupiedUnits || 0,
      icon: Home,
      color: 'bg-green-500',
    },
    {
      name: 'Maintenance Requests',
      value: dashboardStats?.activeMaintenanceRequests || 0,
      icon: Wrench,
      color: 'bg-orange-500',
    },
  ]

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-2">Overview of your platform</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat) => (
          <div key={stat.name} className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{stat.value}</p>
              </div>
              <div className={`${stat.color} p-3 rounded-lg`}>
                <stat.icon className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {!isFacilitator && (
            <a
              href="/facilitators"
              className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition"
            >
              <UserCheck className="w-8 h-8 text-purple-500 mr-3" />
              <div>
                <p className="font-medium text-gray-900">Manage Facilitators</p>
                <p className="text-sm text-gray-500">View and assign facilitators</p>
              </div>
            </a>
          )}
          <a
            href="/properties"
            className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition"
          >
            <Home className="w-8 h-8 text-blue-500 mr-3" />
            <div>
              <p className="font-medium text-gray-900">{isFacilitator ? 'My Properties' : 'View Properties'}</p>
              <p className="text-sm text-gray-500">{isFacilitator ? 'Properties assigned to you' : 'Manage all properties'}</p>
            </div>
          </a>
          <a
            href="/maintenance"
            className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition"
          >
            <Wrench className="w-8 h-8 text-orange-500 mr-3" />
            <div>
              <p className="font-medium text-gray-900">Maintenance</p>
              <p className="text-sm text-gray-500">Track maintenance requests</p>
            </div>
          </a>
        </div>
      </div>
    </div>
  )
}
