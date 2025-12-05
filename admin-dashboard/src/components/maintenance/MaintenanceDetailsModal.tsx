import { X, MapPin, User, Calendar } from 'lucide-react'
import { formatDateTime } from '../../lib/utils'

interface MaintenanceDetailsModalProps {
  request: any
  onClose: () => void
}

export default function MaintenanceDetailsModal({ request, onClose }: MaintenanceDetailsModalProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'in_progress': return 'bg-blue-100 text-blue-800'
      case 'completed': return 'bg-green-100 text-green-800'
      case 'cancelled': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800'
      case 'high': return 'bg-orange-100 text-orange-800'
      case 'medium': return 'bg-yellow-100 text-yellow-800'
      case 'low': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">Maintenance Request Details</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Title and Status */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">{request.title}</h3>
            <div className="flex items-center space-x-2">
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(request.status)}`}>
                {request.status?.replace('_', ' ').toUpperCase()}
              </span>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(request.priority)}`}>
                {request.priority?.toUpperCase()} PRIORITY
              </span>
            </div>
          </div>

          {/* Description */}
          <div>
            <h4 className="font-medium text-gray-900 mb-2">Description</h4>
            <p className="text-gray-600">{request.description}</p>
          </div>

          {/* Property Information */}
          <div>
            <h4 className="font-medium text-gray-900 mb-3">Property Information</h4>
            <div className="space-y-2">
              <div className="flex items-center text-sm text-gray-600">
                <MapPin className="w-4 h-4 mr-3 text-gray-400" />
                <div>
                  <p className="font-medium text-gray-900">{request.propertyName}</p>
                  {request.unitNumber && (
                    <p className="text-gray-500">Unit {request.unitNumber}</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Reporter Information */}
          <div>
            <h4 className="font-medium text-gray-900 mb-3">Reported By</h4>
            <div className="flex items-center text-sm text-gray-600">
              <User className="w-4 h-4 mr-3 text-gray-400" />
              <span>{request.reportedBy || 'Unknown'}</span>
            </div>
          </div>

          {/* Facilitator Information */}
          {request.assignedFacilitator && (
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Assigned Facilitator</h4>
              <div className="flex items-center text-sm text-gray-600">
                <User className="w-4 h-4 mr-3 text-gray-400" />
                <span>{request.assignedFacilitator}</span>
              </div>
            </div>
          )}

          {/* Timeline */}
          <div>
            <h4 className="font-medium text-gray-900 mb-3">Timeline</h4>
            <div className="space-y-2">
              <div className="flex items-center text-sm text-gray-600">
                <Calendar className="w-4 h-4 mr-3 text-gray-400" />
                <div>
                  <p className="text-gray-500">Created</p>
                  <p className="font-medium text-gray-900">{formatDateTime(request.createdAt)}</p>
                </div>
              </div>
              {request.completedAt && (
                <div className="flex items-center text-sm text-gray-600">
                  <Calendar className="w-4 h-4 mr-3 text-gray-400" />
                  <div>
                    <p className="text-gray-500">Completed</p>
                    <p className="font-medium text-gray-900">{formatDateTime(request.completedAt)}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Images */}
          {request.images && request.images.length > 0 && (
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Images</h4>
              <div className="grid grid-cols-2 gap-4">
                {request.images.map((image: string, index: number) => (
                  <img
                    key={index}
                    src={image}
                    alt={`Maintenance ${index + 1}`}
                    className="w-full h-48 object-cover rounded-lg"
                  />
                ))}
              </div>
            </div>
          )}
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
