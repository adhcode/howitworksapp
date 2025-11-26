import { useQuery } from '@tanstack/react-query'
import { facilitatorsApi, propertiesApi, maintenanceApi } from '../lib/api'
import { Users, Home, Wrench, AlertCircle } from 'lucide-react'

export default function Dashboard() {
  const { data: facilitators } = useQuery({
    queryKey: ['facilitators'],
    queryFn: facilitatorsApi.getAll,
  })

  const { data: properties } = useQuery({
    queryKey: ['properties'],
    queryFn: () => propertiesApi.getAll(1, 100),
  })

  const { data: maintenance } = useQuery({
    queryKey: ['maintenance'],
    queryFn: () => maintenanceApi.getAll(),
  })

  const stats = [
    {
      name: 'Total Facilitators',
      value: facilitators?.data?.length || 0,
      icon: Users,
      color: 'bg-blue-500',
    },
    {
      name: 'Total Properties',
      value: properties?.data?.length || 0,
      icon: Home,
      color: 'bg-green-500',
    },
    {
      name: 'Maintenance Requests',
      value: maintenance?.data?.length || 0,
      icon: Wrench,
      color: 'bg-orange-500',
    },
    {
      name: 'Pending Requests',
      value: maintenance?.data?.filter((m: any) => m.status === 'pending').length || 0,
      icon: AlertCircle,
      color: 'bg-red-500',
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

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Maintenance */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Recent Maintenance</h2>
          </div>
          <div className="p-6">
            {maintenance?.data?.slice(0, 5).map((item: any) => (
              <div key={item.id} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
                <div>
                  <p className="font-medium text-gray-900">{item.title}</p>
                  <p className="text-sm text-gray-500">{item.propertyName}</p>
                </div>
                <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                  item.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                  item.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                  'bg-green-100 text-green-800'
                }`}>
                  {item.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Unassigned Properties */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Unassigned Properties</h2>
          </div>
          <div className="p-6">
            {properties?.data?.filter((p: any) => !p.facilitatorId).slice(0, 5).map((property: any) => (
              <div key={property.id} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
                <div>
                  <p className="font-medium text-gray-900">{property.name}</p>
                  <p className="text-sm text-gray-500">{property.city}</p>
                </div>
                <span className="px-3 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800">
                  No Facilitator
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
