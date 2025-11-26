import { useQuery } from '@tanstack/react-query'
import { facilitatorsApi } from '../../lib/api'
import { X, Mail, Phone, Home, Calendar } from 'lucide-react'
import { formatDate } from '../../lib/utils'

interface FacilitatorDetailsModalProps {
  facilitator: any
  onClose: () => void
}

export default function FacilitatorDetailsModal({ facilitator, onClose }: FacilitatorDetailsModalProps) {
  const { data: propertiesData } = useQuery({
    queryKey: ['facilitator-properties', facilitator.id],
    queryFn: () => facilitatorsApi.getAssignedProperties(facilitator.id),
  })

  const properties = propertiesData?.data || []

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">Facilitator Details</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Profile Section */}
          <div className="flex items-center">
            <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center">
              <span className="text-primary-700 font-semibold text-2xl">
                {facilitator.firstName?.[0]}{facilitator.lastName?.[0]}
              </span>
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-semibold text-gray-900">
                {facilitator.firstName} {facilitator.lastName}
              </h3>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                facilitator.isActive
                  ? 'bg-green-100 text-green-800'
                  : 'bg-gray-100 text-gray-800'
              }`}>
                {facilitator.isActive ? 'Active' : 'Inactive'}
              </span>
            </div>
          </div>

          {/* Contact Information */}
          <div>
            <h4 className="font-medium text-gray-900 mb-3">Contact Information</h4>
            <div className="space-y-2">
              <div className="flex items-center text-sm text-gray-600">
                <Mail className="w-4 h-4 mr-3 text-gray-400" />
                {facilitator.email}
              </div>
              {facilitator.phoneNumber && (
                <div className="flex items-center text-sm text-gray-600">
                  <Phone className="w-4 h-4 mr-3 text-gray-400" />
                  {facilitator.phoneNumber}
                </div>
              )}
              <div className="flex items-center text-sm text-gray-600">
                <Calendar className="w-4 h-4 mr-3 text-gray-400" />
                Joined {formatDate(facilitator.createdAt)}
              </div>
            </div>
          </div>

          {/* Assigned Properties */}
          <div>
            <h4 className="font-medium text-gray-900 mb-3">
              Assigned Properties ({properties.length})
            </h4>
            {properties.length > 0 ? (
              <div className="space-y-2">
                {properties.map((property: any) => (
                  <div key={property.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center">
                      <Home className="w-4 h-4 mr-3 text-gray-400" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">{property.name}</p>
                        <p className="text-xs text-gray-500">{property.city}</p>
                      </div>
                    </div>
                    <span className="text-xs text-gray-500">{property.totalUnits} units</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500">No properties assigned yet</p>
            )}
          </div>
        </div>

        <div className="border-t border-gray-200 px-6 py-4">
          <button
            onClick={onClose}
            className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}
