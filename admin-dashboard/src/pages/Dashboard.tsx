import { useQuery } from '@tanstack/react-query'
import { adminApi, facilitatorApi } from '../lib/api'
import { useAuthStore } from '../store/authStore'
import { Users, Home, Wrench, Building2, UserCheck } from 'lucide-react'

export default function Dashboard() {
  const { user } = useAuthStore()
  const isFacilitator = user?.role === 'facilitator'

  const { data: dashboardStats, isLoading } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: adminApi.getDashboardStats,
    enabled: !isFacilitator,
  })

  const { data: facilitatorStats, isLoading: facilitatorLoading } = useQuery({
    queryKey: ['facilitator-stats', user?.id],
    queryFn: () => facilitatorApi.getMyStats(user?.id || ''),
    enabled: isFacilitator,
  })

  const stats = isFacilitator ? [
    {
      name: 'Assigned Properties',
      value: facilitatorStats?.assignedProperties || 0,
      icon: Home,
      color: 'from-[#1A2A52] to-[#2a3f6f]',
      bgColor: 'bg-[#1A2A52]/10',
      iconColor: 'text-[#1A2A52]',
    },
    {
      name: 'Total Tenants',
      value: facilitatorStats?.totalTenants || 0,
      icon: Users,
      color: 'from-green-500 to-green-600',
      bgColor: 'bg-green-50',
      iconColor: 'text-green-600',
    },
    {
      name: 'Total Units',
      value: facilitatorStats?.totalUnits || 0,
      icon: Building2,
      color: 'from-[#1A2A52] to-[#2a3f6f]',
      bgColor: 'bg-[#1A2A52]/10',
      iconColor: 'text-[#1A2A52]',
    },
    {
      name: 'Maintenance Requests',
      value: facilitatorStats?.maintenanceRequests || 0,
      icon: Wrench,
      color: 'from-orange-500 to-orange-600',
      bgColor: 'bg-orange-50',
      iconColor: 'text-orange-600',
    },
  ] : [
    {
      name: 'Total Properties',
      value: dashboardStats?.totalProperties || 0,
      icon: Home,
      color: 'from-[#1A2A52] to-[#2a3f6f]',
      bgColor: 'bg-[#1A2A52]/10',
      iconColor: 'text-[#1A2A52]',
    },
    {
      name: 'Total Landlords',
      value: dashboardStats?.totalLandlords || 0,
      icon: Users,
      color: 'from-green-500 to-green-600',
      bgColor: 'bg-green-50',
      iconColor: 'text-green-600',
    },
    {
      name: 'Total Facilitators',
      value: dashboardStats?.totalFacilitators || 0,
      icon: UserCheck,
      color: 'from-[#1A2A52] to-[#2a3f6f]',
      bgColor: 'bg-[#1A2A52]/10',
      iconColor: 'text-[#1A2A52]',
    },
    {
      name: 'Total Units',
      value: dashboardStats?.totalUnits || 0,
      icon: Building2,
      color: 'from-blue-500 to-blue-600',
      bgColor: 'bg-blue-50',
      iconColor: 'text-blue-600',
    },
    {
      name: 'Occupied Units',
      value: dashboardStats?.occupiedUnits || 0,
      icon: Home,
      color: 'from-green-500 to-green-600',
      bgColor: 'bg-green-50',
      iconColor: 'text-green-600',
    },
    {
      name: 'Maintenance Requests',
      value: dashboardStats?.activeMaintenanceRequests || 0,
      icon: Wrench,
      color: 'from-orange-500 to-orange-600',
      bgColor: 'bg-orange-50',
      iconColor: 'text-orange-600',
    },
  ]

  if (isLoading || facilitatorLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 border-4 border-[#1A2A52]/20 border-t-[#1A2A52] rounded-full animate-spin"></div>
          <p className="text-sm text-gray-500 font-medium">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold text-[#2E2E2E] tracking-tight">
          {isFacilitator ? 'My Dashboard' : 'Dashboard'}
        </h1>
        <p className="text-gray-600 mt-2 text-lg">
          {isFacilitator ? 'Overview of your assigned properties' : 'Complete overview of your platform'}
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {stats.map((stat) => (
          <div
            key={stat.name}
            className="group relative bg-white rounded-2xl border border-gray-100 p-6 hover:shadow-lg transition-all duration-300 overflow-hidden"
          >
            {/* Background gradient on hover */}
            <div className={`absolute inset-0 bg-gradient-to-br ${stat.color} opacity-0 group-hover:opacity-5 transition-opacity duration-300`}></div>
            
            <div className="relative">
              <div className="flex items-start justify-between mb-4">
                <div className={`${stat.bgColor} p-3 rounded-xl`}>
                  <stat.icon className={`w-6 h-6 ${stat.iconColor}`} />
                </div>
              </div>
              
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">{stat.name}</p>
                <p className="text-4xl font-bold text-[#2E2E2E] tracking-tight">{stat.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-2xl border border-gray-100 p-8">
        <h2 className="text-2xl font-bold text-[#2E2E2E] mb-6">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {!isFacilitator && (
            <a
              href="/facilitators"
              className="group flex items-center gap-4 p-5 border-2 border-gray-100 rounded-xl hover:border-[#1A2A52] hover:bg-[#1A2A52]/5 transition-all duration-300"
            >
              <div className="bg-[#1A2A52]/10 p-3 rounded-xl group-hover:bg-[#1A2A52]/20 transition-colors">
                <UserCheck className="w-7 h-7 text-[#1A2A52]" />
              </div>
              <div>
                <p className="font-semibold text-[#2E2E2E] text-lg">Manage Facilitators</p>
                <p className="text-sm text-gray-500 mt-0.5">View and assign facilitators</p>
              </div>
            </a>
          )}
          <a
            href="/properties"
            className="group flex items-center gap-4 p-5 border-2 border-gray-100 rounded-xl hover:border-[#1A2A52] hover:bg-[#1A2A52]/5 transition-all duration-300"
          >
            <div className="bg-[#1A2A52]/10 p-3 rounded-xl group-hover:bg-[#1A2A52]/20 transition-colors">
              <Home className="w-7 h-7 text-[#1A2A52]" />
            </div>
            <div>
              <p className="font-semibold text-[#2E2E2E] text-lg">
                {isFacilitator ? 'My Properties' : 'View Properties'}
              </p>
              <p className="text-sm text-gray-500 mt-0.5">
                {isFacilitator ? 'Properties assigned to you' : 'Manage all properties'}
              </p>
            </div>
          </a>
          <a
            href="/maintenance"
            className="group flex items-center gap-4 p-5 border-2 border-gray-100 rounded-xl hover:border-[#1A2A52] hover:bg-[#1A2A52]/5 transition-all duration-300"
          >
            <div className="bg-orange-50 p-3 rounded-xl group-hover:bg-orange-100 transition-colors">
              <Wrench className="w-7 h-7 text-orange-600" />
            </div>
            <div>
              <p className="font-semibold text-[#2E2E2E] text-lg">Maintenance</p>
              <p className="text-sm text-gray-500 mt-0.5">Track maintenance requests</p>
            </div>
          </a>
        </div>
      </div>

      {/* System Status */}
      {!isFacilitator && dashboardStats && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <h3 className="text-lg font-bold text-[#2E2E2E] mb-4">Property Overview</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Total Properties</span>
                <span className="font-semibold text-[#2E2E2E]">{dashboardStats.totalProperties}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">With Facilitators</span>
                <span className="font-semibold text-green-600">{dashboardStats.propertiesWithFacilitators || 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Unassigned</span>
                <span className="font-semibold text-orange-600">
                  {(dashboardStats.totalProperties || 0) - (dashboardStats.propertiesWithFacilitators || 0)}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <h3 className="text-lg font-bold text-[#2E2E2E] mb-4">Units Status</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Total Units</span>
                <span className="font-semibold text-[#2E2E2E]">{dashboardStats.totalUnits}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Occupied</span>
                <span className="font-semibold text-green-600">{dashboardStats.occupiedUnits}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Vacant</span>
                <span className="font-semibold text-blue-600">{dashboardStats.vacantUnits}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
