import { useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { adminApi, facilitatorApi } from '../lib/api'
import { useAuthStore } from '../store/authStore'
import { Home, MapPin, Users, AlertCircle, Building2, User } from 'lucide-react'
import AssignFacilitatorModal from '../components/properties/AssignFacilitatorModal'
import { StatCardSkeleton } from '../components/ui/Skeleton'

export default function Properties() {
  const queryClient = useQueryClient()
  const { user } = useAuthStore()
  const isFacilitator = user?.role === 'facilitator'
  const [selectedProperty, setSelectedProperty] = useState<any>(null)
  const [showAssignModal, setShowAssignModal] = useState(false)
  const [filter, setFilter] = useState<'all' | 'assigned' | 'unassigned'>('all')

  const { data: propertiesData, isLoading } = useQuery({
    queryKey: ['properties', isFacilitator ? user?.id : 'all'],
    queryFn: () => isFacilitator
      ? facilitatorApi.getMyProperties(user?.id || '')
      : adminApi.getProperties(1, 100),
  })

  const { data: facilitatorsData } = useQuery({
    queryKey: ['facilitators'],
    queryFn: adminApi.getFacilitators,
    enabled: !isFacilitator,
  })

  // Backend returns { data: [...], meta: {...} } which gets unwrapped by interceptor to just { data: [...], meta: {...} }
  // So we need to access .data to get the array
  const properties = Array.isArray(propertiesData) ? propertiesData : (propertiesData?.data || [])
  const facilitators = Array.isArray(facilitatorsData) ? facilitatorsData : (facilitatorsData?.data || [])

  const filteredProperties = properties.filter((property: any) => {
    if (filter === 'assigned') return property.facilitatorId
    if (filter === 'unassigned') return !property.facilitatorId
    return true
  })

  const handleAssignFacilitator = (property: any) => {
    setSelectedProperty(property)
    setShowAssignModal(true)
  }

  const getFacilitatorName = (facilitatorId: string) => {
    const facilitator = facilitators.find((f: any) => f.id === facilitatorId)
    return facilitator ? `${facilitator.firstName} ${facilitator.lastName}` : 'Unknown'
  }


  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl sm:text-4xl font-bold text-[#2E2E2E] tracking-tight">
            {isFacilitator ? 'My Properties' : 'Properties'}
          </h1>
          <p className="text-gray-600 mt-2 text-base sm:text-lg">
            {isFacilitator ? 'Properties assigned to you' : 'Manage properties and facilitator assignments'}
          </p>
        </div>
      </div>

      {/* Filter Tabs */}
      {!isFacilitator && (
        <div className="flex flex-wrap gap-2 sm:gap-3">
          {[
            { key: 'all', label: 'All', fullLabel: 'All Properties', count: properties.length },
            { key: 'assigned', label: 'Assigned', fullLabel: 'Assigned', count: properties.filter((p: any) => p.facilitatorId).length },
            { key: 'unassigned', label: 'Unassigned', fullLabel: 'Unassigned', count: properties.filter((p: any) => !p.facilitatorId).length },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key as any)}
              className={`px-4 sm:px-6 py-2 sm:py-3 rounded-xl font-semibold transition-all duration-300 text-sm sm:text-base ${filter === tab.key
                  ? 'bg-[#1A2A52] text-white shadow-lg shadow-[#1A2A52]/20'
                  : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
                }`}
            >
              <span className="hidden sm:inline">{tab.fullLabel}</span>
              <span className="sm:hidden">{tab.label}</span>
              <span className={`ml-2 px-2 py-0.5 rounded-full text-xs font-bold ${filter === tab.key ? 'bg-white/20' : 'bg-gray-100'
                }`}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>
      )}

      {/* Stats Cards */}
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
                <p className="text-xs sm:text-sm font-medium text-gray-600 mb-1">Total Properties</p>
                <p className="text-2xl sm:text-3xl font-bold text-[#2E2E2E]">{properties.length}</p>
              </div>
              <div className="bg-blue-50 p-3 sm:p-4 rounded-xl">
                <Home className="w-6 h-6 sm:w-7 sm:h-7 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm font-medium text-gray-600 mb-1">Assigned</p>
                <p className="text-2xl sm:text-3xl font-bold text-green-600">
                  {properties.filter((p: any) => p.facilitatorId).length}
                </p>
              </div>
              <div className="bg-green-50 p-3 sm:p-4 rounded-xl">
                <Users className="w-6 h-6 sm:w-7 sm:h-7 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm font-medium text-gray-600 mb-1">Unassigned</p>
                <p className="text-2xl sm:text-3xl font-bold text-orange-600">
                  {properties.filter((p: any) => !p.facilitatorId).length}
                </p>
              </div>
              <div className="bg-orange-50 p-3 sm:p-4 rounded-xl">
                <AlertCircle className="w-6 h-6 sm:w-7 sm:h-7 text-orange-600" />
              </div>
            </div>
          </div>
        </div>
      )}


      {/* Properties Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
              <div className="h-48 bg-gray-200 animate-pulse"></div>
              <div className="p-6 space-y-4">
                <div className="h-6 bg-gray-200 rounded animate-pulse w-3/4"></div>
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                  <div className="h-4 bg-gray-200 rounded animate-pulse w-5/6"></div>
                </div>
                <div className="pt-4 border-t border-gray-100">
                  <div className="h-10 bg-gray-200 rounded-xl animate-pulse"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {filteredProperties.map((property: any) => (
          <div
            key={property.id}
            className="group bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-xl hover:border-[#1A2A52]/20 transition-all duration-300"
          >
            <div className="h-48 bg-gradient-to-br from-[#1A2A52] to-[#2a3f6f] flex items-center justify-center relative overflow-hidden">
              <div className="absolute inset-0 bg-black/10"></div>
              <Home className="w-16 h-16 text-white/90 relative z-10" />
            </div>

            <div className="p-6">
              <h3 className="font-bold text-xl text-[#2E2E2E] mb-3 group-hover:text-[#1A2A52] transition-colors">
                {property.name}
              </h3>

              <div className="space-y-3 mb-5">
                <div className="flex items-start gap-2 text-sm text-gray-600">
                  <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0 text-gray-400" />
                  <span className="line-clamp-2">{property.address}, {property.city}</span>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2 text-gray-600">
                    <Building2 className="w-4 h-4 text-gray-400" />
                    <span>Units</span>
                  </div>
                  <span className="font-semibold text-[#2E2E2E]">{property.totalUnits || 0}</span>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Type</span>
                  <span className="font-semibold text-[#2E2E2E] capitalize">{property.propertyType}</span>
                </div>
              </div>


              <div className="pt-5 border-t border-gray-100">
                {property.facilitatorId ? (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="bg-green-50 p-2 rounded-lg">
                        <User className="w-4 h-4 text-green-600" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Assigned to</p>
                        <p className="text-sm font-semibold text-[#2E2E2E]">
                          {getFacilitatorName(property.facilitatorId)}
                        </p>
                      </div>
                    </div>
                    {!isFacilitator && (
                      <button
                        onClick={() => handleAssignFacilitator(property)}
                        className="text-sm text-[#1A2A52] hover:text-[#2a3f6f] font-semibold"
                      >
                        Change
                      </button>
                    )}
                  </div>
                ) : !isFacilitator ? (
                  <button
                    onClick={() => handleAssignFacilitator(property)}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-orange-50 text-orange-700 rounded-xl hover:bg-orange-100 transition-colors font-semibold"
                  >
                    <AlertCircle className="w-4 h-4" />
                    Assign Facilitator
                  </button>
                ) : null}
              </div>
            </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!isLoading && filteredProperties.length === 0 && (
        <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
          <div className="bg-gray-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
            <Home className="w-10 h-10 text-gray-400" />
          </div>
          <h3 className="text-xl font-bold text-[#2E2E2E] mb-2">No properties found</h3>
          <p className="text-gray-600">
            {filter === 'unassigned'
              ? 'All properties have been assigned to facilitators'
              : 'No properties match the selected filter'}
          </p>
        </div>
      )}

      {showAssignModal && selectedProperty && (
        <AssignFacilitatorModal
          property={selectedProperty}
          facilitators={facilitators}
          onClose={() => {
            setShowAssignModal(false)
            setSelectedProperty(null)
          }}
          onSuccess={() => {
            setShowAssignModal(false)
            setSelectedProperty(null)
            queryClient.invalidateQueries({ queryKey: ['properties'] })
          }}
        />
      )}
    </div>
  )
}
