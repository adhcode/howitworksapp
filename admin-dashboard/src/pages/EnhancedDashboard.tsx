import { useQuery } from '@tanstack/react-query'
import { adminApi, facilitatorApi } from '../lib/api'
import { useAuthStore } from '../store/authStore'
import { Users, Home, Wrench, Building2, UserCheck, AlertCircle } from 'lucide-react'
import { StatCardSkeleton, ChartSkeleton } from '../components/ui/Skeleton'
import LineChart from '../components/charts/LineChart'
import BarChart from '../components/charts/BarChart'
import PieChart from '../components/charts/PieChart'

export default function EnhancedDashboard() {
  const { user } = useAuthStore()
  const isFacilitator = user?.role === 'facilitator'

  // Fetch dashboard stats
  const { data: dashboardStats, isLoading: statsLoading } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: adminApi.getDashboardStats,
    enabled: !isFacilitator,
  })

  const { data: facilitatorStats, isLoading: facilitatorStatsLoading } = useQuery({
    queryKey: ['facilitator-stats', user?.id],
    queryFn: () => facilitatorApi.getMyStats(user?.id || ''),
    enabled: isFacilitator,
  })

  // Fetch analytics data for charts
  const { data: revenueData, isLoading: revenueLoading } = useQuery({
    queryKey: ['revenue-analytics'],
    queryFn: () => adminApi.getRevenueAnalytics('6m'),
    enabled: !isFacilitator,
  })

  const { data: maintenanceData, isLoading: maintenanceLoading } = useQuery({
    queryKey: ['maintenance-analytics'],
    queryFn: () => adminApi.getMaintenanceAnalytics('6m'),
    enabled: !isFacilitator,
  })

  // Admin stats configuration
  const adminStats = [
    {
      name: 'Total Properties',
      value: dashboardStats?.totalProperties || 0,
      icon: Home,
      bgColor: 'bg-[#1A2A52]/10',
      iconColor: 'text-[#1A2A52]',
      color: 'from-[#1A2A52] to-[#2a3f6f]',
    },
    {
      name: 'Total Landlords',
      value: dashboardStats?.totalLandlords || 0,
      icon: Users,
      bgColor: 'bg-green-50',
      iconColor: 'text-green-600',
      color: 'from-green-500 to-green-600',
    },
    {
      name: 'Total Facilitators',
      value: dashboardStats?.totalFacilitators || 0,
      icon: UserCheck,
      bgColor: 'bg-[#1A2A52]/10',
      iconColor: 'text-[#1A2A52]',
      color: 'from-[#1A2A52] to-[#2a3f6f]',
    },
    {
      name: 'Total Units',
      value: dashboardStats?.totalUnits || 0,
      icon: Building2,
      bgColor: 'bg-blue-50',
      iconColor: 'text-blue-600',
      color: 'from-blue-500 to-blue-600',
    },
    {
      name: 'Occupied Units',
      value: dashboardStats?.occupiedUnits || 0,
      icon: Home,
      bgColor: 'bg-green-50',
      iconColor: 'text-green-600',
      color: 'from-green-500 to-green-600',
    },
    {
      name: 'Maintenance Requests',
      value: dashboardStats?.activeMaintenanceRequests || 0,
      icon: Wrench,
      bgColor: 'bg-orange-50',
      iconColor: 'text-orange-600',
      color: 'from-orange-500 to-orange-600',
    },
  ]

  // Facilitator stats configuration
  const facilitatorStatsConfig = [
    {
      name: 'Assigned Properties',
      value: facilitatorStats?.assignedProperties || 0,
      icon: Home,
      bgColor: 'bg-[#1A2A52]/10',
      iconColor: 'text-[#1A2A52]',
      color: 'from-[#1A2A52] to-[#2a3f6f]',
    },
    {
      name: 'Total Tenants',
      value: facilitatorStats?.totalTenants || 0,
      icon: Users,
      bgColor: 'bg-green-50',
      iconColor: 'text-green-600',
      color: 'from-green-500 to-green-600',
    },
    {
      name: 'Total Units',
      value: facilitatorStats?.totalUnits || 0,
      icon: Building2,
      bgColor: 'bg-[#1A2A52]/10',
      iconColor: 'text-[#1A2A52]',
      color: 'from-[#1A2A52] to-[#2a3f6f]',
    },
    {
      name: 'Maintenance Requests',
      value: facilitatorStats?.maintenanceRequests || 0,
      icon: Wrench,
      bgColor: 'bg-orange-50',
      iconColor: 'text-orange-600',
      color: 'from-orange-500 to-orange-600',
    },
  ]

  const stats = isFacilitator ? facilitatorStatsConfig : adminStats

  // Prepare chart data
  const revenueChartData = revenueData?.monthlyData || []
  const maintenanceChartData = maintenanceData?.monthlyData || []

  // Property status data for pie chart
  const propertyStatusData = [
    { name: 'With Facilitator', value: dashboardStats?.propertiesWithFacilitators || 0 },
    { name: 'Without Facilitator', value: (dashboardStats?.totalProperties || 0) - (dashboardStats?.propertiesWithFacilitators || 0) },
  ]

  // Occupancy data for pie chart
  const occupancyData = [
    { name: 'Occupied', value: dashboardStats?.occupiedUnits || 0 },
    { name: 'Vacant', value: dashboardStats?.vacantUnits || 0 },
  ]

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-[#2E2E2E] tracking-tight">Dashboard</h1>
        <p className="text-gray-600 mt-2 text-lg">
          {isFacilitator ? 'Your performance overview' : 'Platform overview and analytics'}
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {(statsLoading || facilitatorStatsLoading) ? (
          <>
            <StatCardSkeleton />
            <StatCardSkeleton />
            <StatCardSkeleton />
            <StatCardSkeleton />
            <StatCardSkeleton />
            <StatCardSkeleton />
          </>
        ) : (
          stats.map((stat) => (
            <div
              key={stat.name}
              className="group relative bg-white rounded-2xl border border-gray-100 p-6 hover:shadow-xl transition-all duration-300 overflow-hidden"
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
          ))
        )}
      </div>

      {/* Charts Section - Admin Only */}
      {!isFacilitator && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Revenue Chart */}
          {revenueLoading ? (
            <ChartSkeleton />
          ) : revenueChartData.length > 0 ? (
            <LineChart
              data={revenueChartData}
              xKey="month"
              yKey="amount"
              title="Revenue Trend (Last 6 Months)"
              color="#10b981"
              height={300}
            />
          ) : (
            <div className="bg-white rounded-2xl border border-gray-100 p-6">
              <h3 className="text-lg font-bold text-[#2E2E2E] mb-4">Revenue Trend</h3>
              <div className="flex flex-col items-center justify-center h-64 text-gray-400">
                <AlertCircle className="w-16 h-16 mb-4" />
                <p className="text-sm">No revenue data available yet</p>
              </div>
            </div>
          )}

          {/* Maintenance Requests Chart */}
          {maintenanceLoading ? (
            <ChartSkeleton />
          ) : maintenanceChartData.length > 0 ? (
            <BarChart
              data={maintenanceChartData}
              xKey="month"
              yKey="count"
              title="Maintenance Requests (Last 6 Months)"
              color="#f59e0b"
              height={300}
            />
          ) : (
            <div className="bg-white rounded-2xl border border-gray-100 p-6">
              <h3 className="text-lg font-bold text-[#2E2E2E] mb-4">Maintenance Requests</h3>
              <div className="flex flex-col items-center justify-center h-64 text-gray-400">
                <Wrench className="w-16 h-16 mb-4" />
                <p className="text-sm">No maintenance data available yet</p>
              </div>
            </div>
          )}

          {/* Property Assignment Pie Chart */}
          {statsLoading ? (
            <ChartSkeleton />
          ) : propertyStatusData.some(d => d.value > 0) ? (
            <PieChart
              data={propertyStatusData}
              nameKey="name"
              valueKey="value"
              title="Property Facilitator Assignment"
              colors={['#10b981', '#ef4444']}
              height={300}
            />
          ) : (
            <div className="bg-white rounded-2xl border border-gray-100 p-6">
              <h3 className="text-lg font-bold text-[#2E2E2E] mb-4">Property Assignment</h3>
              <div className="flex flex-col items-center justify-center h-64 text-gray-400">
                <AlertCircle className="w-16 h-16 mb-4" />
                <p className="text-sm">No properties available yet</p>
              </div>
            </div>
          )}

          {/* Occupancy Pie Chart */}
          {statsLoading ? (
            <ChartSkeleton />
          ) : occupancyData.some(d => d.value > 0) ? (
            <PieChart
              data={occupancyData}
              nameKey="name"
              valueKey="value"
              title="Unit Occupancy Rate"
              colors={['#0ea5e9', '#94a3b8']}
              height={300}
            />
          ) : (
            <div className="bg-white rounded-2xl border border-gray-100 p-6">
              <h3 className="text-lg font-bold text-[#2E2E2E] mb-4">Unit Occupancy</h3>
              <div className="flex flex-col items-center justify-center h-64 text-gray-400">
                <Building2 className="w-16 h-16 mb-4" />
                <p className="text-sm">No unit data available yet</p>
              </div>
            </div>
          )}
        </div>
      )}

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
              <p className="font-semibold text-[#2E2E2E] text-lg">{isFacilitator ? 'My Properties' : 'View Properties'}</p>
              <p className="text-sm text-gray-500 mt-0.5">{isFacilitator ? 'Properties assigned to you' : 'Manage all properties'}</p>
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
    </div>
  )
}
