import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { facilitatorsApi } from '../lib/api'
import { Plus, Edit, Trash2, Eye } from 'lucide-react'
import CreateFacilitatorModal from '../components/facilitators/CreateFacilitatorModal'
import FacilitatorDetailsModal from '../components/facilitators/FacilitatorDetailsModal'

export default function Facilitators() {
  const queryClient = useQueryClient()
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [selectedFacilitator, setSelectedFacilitator] = useState<any>(null)
  const [showDetailsModal, setShowDetailsModal] = useState(false)

  const { data, isLoading } = useQuery({
    queryKey: ['facilitators'],
    queryFn: facilitatorsApi.getAll,
  })

  const deleteMutation = useMutation({
    mutationFn: facilitatorsApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['facilitators'] })
    },
  })

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this facilitator?')) {
      await deleteMutation.mutateAsync(id)
    }
  }

  const handleViewDetails = (facilitator: any) => {
    setSelectedFacilitator(facilitator)
    setShowDetailsModal(true)
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
          <h1 className="text-3xl font-bold text-gray-900">Facilitators</h1>
          <p className="text-gray-600 mt-2">Manage maintenance facilitators</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
        >
          <Plus className="w-5 h-5 mr-2" />
          Add Facilitator
        </button>
      </div>

      {/* Facilitators Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {data?.data?.map((facilitator: any) => (
          <div key={facilitator.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
                  <span className="text-primary-700 font-semibold text-lg">
                    {facilitator.firstName?.[0]}{facilitator.lastName?.[0]}
                  </span>
                </div>
                <div className="ml-3">
                  <h3 className="font-semibold text-gray-900">
                    {facilitator.firstName} {facilitator.lastName}
                  </h3>
                  <p className="text-sm text-gray-500">{facilitator.email}</p>
                </div>
              </div>
            </div>

            <div className="space-y-2 mb-4">
              <div className="flex items-center text-sm text-gray-600">
                <span className="font-medium">Phone:</span>
                <span className="ml-2">{facilitator.phoneNumber || 'N/A'}</span>
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <span className="font-medium">Properties:</span>
                <span className="ml-2">{facilitator.assignedProperties || 0}</span>
              </div>
              <div className="flex items-center text-sm">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  facilitator.isActive
                    ? 'bg-green-100 text-green-800'
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {facilitator.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
            </div>

            <div className="flex items-center space-x-2 pt-4 border-t border-gray-200">
              <button
                onClick={() => handleViewDetails(facilitator)}
                className="flex-1 flex items-center justify-center px-3 py-2 text-sm font-medium text-primary-700 bg-primary-50 rounded-lg hover:bg-primary-100 transition-colors"
              >
                <Eye className="w-4 h-4 mr-1" />
                View
              </button>
              <button
                onClick={() => handleDelete(facilitator.id)}
                className="flex items-center justify-center px-3 py-2 text-sm font-medium text-red-700 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {data?.data?.length === 0 && (
        <div className="text-center py-12">
          <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No facilitators yet</h3>
          <p className="text-gray-600 mb-4">Get started by adding your first facilitator</p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            <Plus className="w-5 h-5 mr-2" />
            Add Facilitator
          </button>
        </div>
      )}

      {/* Modals */}
      {showCreateModal && (
        <CreateFacilitatorModal
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => {
            setShowCreateModal(false)
            queryClient.invalidateQueries({ queryKey: ['facilitators'] })
          }}
        />
      )}

      {showDetailsModal && selectedFacilitator && (
        <FacilitatorDetailsModal
          facilitator={selectedFacilitator}
          onClose={() => {
            setShowDetailsModal(false)
            setSelectedFacilitator(null)
          }}
        />
      )}
    </div>
  )
}
