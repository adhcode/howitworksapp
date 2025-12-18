import { useQuery } from '@tanstack/react-query'
import { landlordsApi } from '../lib/api'
import { UserCog, Mail, Phone, Home, Calendar } from 'lucide-react'
import { formatDate } from '../lib/utils'
import { StatCardSkeleton } from '../components/ui/Skeleton'

export default function Landlords() {
  const { data, isLoading } = useQuery({
    queryKey: ['landlords'],
    queryFn: landlordsApi.getAll,
  })

  const landlords = data?.data || data || []

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl sm:text-4xl font-bold text-[#2E2E2E] tracking-tight">Landlords</h1>
        <p className="text-gray-600 mt-2 text-base sm:text-lg">View and manage landlord accounts</p>
      </div>

      {/* Stats */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          <StatCardSkeleton />
          <StatCardSkeleton />
          <StatCardSkeleton />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          <div className="bg-white rounded-2xl border border-gray-100 p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm font-medium text-gray-600 mb-1">Total Landlords</p>
                <p className="text-2xl sm:text-3xl font-bold text-[#2E2E2E]">{landlords.length}</p>
              </div>
              <div className="bg-[#1A2A52]/10 p-3 sm:p-4 rounded-xl">
                <UserCog className="w-6 h-6 sm:w-7 sm:h-7 text-[#1A2A52]" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm font-medium text-gray-600 mb-1">Active</p>
                <p className="text-2xl sm:text-3xl font-bold text-green-600">
                  {landlords.filter((l: any) => l.isActive).length}
                </p>
              </div>
              <div className="bg-green-50 p-3 sm:p-4 rounded-xl">
                <UserCog className="w-6 h-6 sm:w-7 sm:h-7 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm font-medium text-gray-600 mb-1">Inactive</p>
                <p className="text-2xl sm:text-3xl font-bold text-gray-600">
                  {landlords.filter((l: any) => !l.isActive).length}
                </p>
              </div>
              <div className="bg-gray-100 p-3 sm:p-4 rounded-xl">
                <UserCog className="w-6 h-6 sm:w-7 sm:h-7 text-gray-600" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Landlords Table/Cards */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        {isLoading ? (
          <div className="p-6 space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center gap-4 p-4 border border-gray-100 rounded-xl">
                <div className="w-12 h-12 bg-gray-200 rounded-full animate-pulse"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded animate-pulse w-1/3"></div>
                  <div className="h-3 bg-gray-200 rounded animate-pulse w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="hidden lg:block overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Landlord
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Contact
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Properties
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Joined
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {landlords.map((landlord: any) => (
                    <tr key={landlord.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <div className="h-10 w-10 rounded-full bg-[#1A2A52]/10 flex items-center justify-center">
                              <span className="text-[#1A2A52] font-semibold">
                                {landlord.firstName?.[0]}{landlord.lastName?.[0]}
                              </span>
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-[#2E2E2E]">
                              {landlord.firstName} {landlord.lastName}
                            </div>
                            <div className="text-sm text-gray-500">ID: {landlord.id.slice(0, 8)}...</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          <div className="flex items-center text-sm text-gray-900">
                            <Mail className="w-4 h-4 mr-2 text-gray-400" />
                            {landlord.email}
                          </div>
                          {landlord.phoneNumber && (
                            <div className="flex items-center text-sm text-gray-500">
                              <Phone className="w-4 h-4 mr-2 text-gray-400" />
                              {landlord.phoneNumber}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center text-sm text-gray-900">
                          <Home className="w-4 h-4 mr-2 text-gray-400" />
                          {landlord.propertiesCount || 0} properties
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          landlord.isActive
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {landlord.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        <div className="flex items-center">
                          <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                          {formatDate(landlord.createdAt)}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Card View */}
            <div className="lg:hidden p-4 space-y-4">
              {landlords.map((landlord: any) => (
                <div key={landlord.id} className="border border-gray-200 rounded-xl p-4 hover:border-[#1A2A52]/20 transition-colors">
                  <div className="flex items-start gap-3 mb-3">
                    <div className="flex-shrink-0 h-12 w-12">
                      <div className="h-12 w-12 rounded-full bg-[#1A2A52]/10 flex items-center justify-center">
                        <span className="text-[#1A2A52] font-semibold text-lg">
                          {landlord.firstName?.[0]}{landlord.lastName?.[0]}
                        </span>
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-base font-semibold text-[#2E2E2E] truncate">
                        {landlord.firstName} {landlord.lastName}
                      </h3>
                      <p className="text-sm text-gray-500">ID: {landlord.id.slice(0, 8)}...</p>
                    </div>
                    <span className={`flex-shrink-0 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      landlord.isActive
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {landlord.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center text-sm text-gray-900">
                      <Mail className="w-4 h-4 mr-2 text-gray-400 flex-shrink-0" />
                      <span className="truncate">{landlord.email}</span>
                    </div>
                    {landlord.phoneNumber && (
                      <div className="flex items-center text-sm text-gray-500">
                        <Phone className="w-4 h-4 mr-2 text-gray-400 flex-shrink-0" />
                        {landlord.phoneNumber}
                      </div>
                    )}
                    <div className="flex items-center text-sm text-gray-900">
                      <Home className="w-4 h-4 mr-2 text-gray-400 flex-shrink-0" />
                      {landlord.propertiesCount || 0} properties
                    </div>
                    <div className="flex items-center text-sm text-gray-500">
                      <Calendar className="w-4 h-4 mr-2 text-gray-400 flex-shrink-0" />
                      Joined {formatDate(landlord.createdAt)}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Empty State */}
            {landlords.length === 0 && (
              <div className="text-center py-16">
                <div className="bg-gray-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <UserCog className="w-10 h-10 text-gray-400" />
                </div>
                <h3 className="text-xl font-bold text-[#2E2E2E] mb-2">No landlords found</h3>
                <p className="text-gray-600">Landlords will appear here once they register</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
