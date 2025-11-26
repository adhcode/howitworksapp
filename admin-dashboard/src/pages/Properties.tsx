import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { propertiesApi, facilitatorsApi } from '../lib/api'
import { Home, MapPin, Users, AlertCircle } from 'lucide-react'
import { formatCurrency } from '../lib/utils'
import AssignFacilitatorModal from '../components/properties/AssignFacilitatorModal'

export default function Properties() {
  const queryClient = useQueryClient()
  const [selectedProperty, setSelectedProperty] = useState<any>(null)
  const [showAssignModal, setShowAssignModal] = useState(false)
  const [filter, setFilter] = useState<'all' | 'assigned' | 'unassigned'>('all')

  const { data: propertiesData, isLoading } = useQuery({
    queryKey: ['properties'],
    queryFn: () => propertiesApi.getAll(1, 100),
  })

  const { data: facilitatorsData } = useQuery({
    queryKey: ['facilitators'],
    queryFn: facilitatorsApi.getAll,
  })

  const properties = propertiesData?.data || []
  const facilitators = facilitatorsData?.data || []

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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Properties</h1>
          <p className="text-gray-600 mt-2">Manage properties and facilitator assignments</p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex space-x-2 mb-6">
        {[
          { key: 'all', label: 'All Properties' },
          { key: 'assigned', label: 'Assigned' },
          { key: 'unassigned', label: 'Unassigned' },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key as any)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === tab.key
                ? 'bg-primary-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Properties</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{properties.length}</p>
            </div>
            <div className="bg-blue-500 p-3 rounded-lg">
              <Home className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Assigned</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">
                {properties.filter((p: any) => p.facilitatorId).length}
              </p>
            </div>
            <div className="bg-green-500 p-3 rounded-lg">
              <Users className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Unassigned</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">
                {properties.filter((p: any) => !p.facilitatorId).length}
              </p>
            </div>
            <div className="bg-red-500 p-3 rounded-lg">
              <AlertCircle className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Properties Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProperties.map((property: any) => (
          <div key={property.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            {/* Property Image Placeholder */}
            <div className="h-48 bg-gradient-to-br from-primary-100 to-primary-200 flex items-center justify-center">
              <Home className="w-16 h-16 text-primary-600" />
            </div>

            <div className="p-6">
              <h3 className="font-semibold text-lg text-gray-900 mb-2">{property.name}</h3>
              
              <div className="space-y-2 mb-4">
                <div className="flex items-start text-sm text-gray-600">
                  <MapPin className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" />
                  <span>{property.address}, {property.city}</span>
                </div>
                
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Units:</span>
                  <span className="font-medium text-gray-900">{property.totalUnits || 0}</span>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Type:</span>
                  <span className="font-medium text-gray-900 capitalize">{property.propertyType}</span>
                </div>
              </div>

              {/* Facilitator Assignment */}
              <div className="pt-4 border-t border-gray-200">
                {property.facilitatorId ? (
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Assigned to:</p>
                      <p className="text-sm font-medium text-gray-900">
                        {getFacilitatorName(property.facilitatorId)}
                      </p>
                    </div>
                    <button
                      onClick={() => handleAssignFacilitator(property)}
                      className="text-sm text-primary-600 hover:text-primary-700 font-medium"
                    >
                      Change
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => handleAssignFacilitator(property)}
                    className="w-full flex items-center justify-center px-4 py-2 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition-colors"
                  >
                    <AlertCircle className="w-4 h-4 mr-2" />
                    Assign Facilitator
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredProperties.length === 0 && (
        <div className="text-center py-12">
          <Home className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No properties found</h3>
          <p className="text-gray-600">
            {filter === 'unassigned' 
              ? 'All properties have been assigned to facilitators'
              : 'No properties match the selected filter'}
          </p>
        </div>
      )}

      {/* Assign Facilitator Modal */}
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
