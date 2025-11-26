import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { propertiesApi } from '../../lib/api'
import { X, User } from 'lucide-react'

interface AssignFacilitatorModalProps {
  property: any
  facilitators: any[]
  onClose: () => void
  onSuccess: () => void
}

export default function AssignFacilitatorModal({
  property,
  facilitators,
  onClose,
  onSuccess,
}: AssignFacilitatorModalProps) {
  const [selectedFacilitatorId, setSelectedFacilitatorId] = useState(property.facilitatorId || '')
  const [error, setError] = useState('')

  const assignMutation = useMutation({
    mutationFn: (facilitatorId: string) =>
      propertiesApi.assignFacilitator(property.id, facilitatorId),
    onSuccess: () => {
      onSuccess()
    },
    onError: (err: any) => {
      setError(err.response?.data?.message || 'Failed to assign facilitator')
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedFacilitatorId) {
      setError('Please select a facilitator')
      return
    }
    setError('')
    assignMutation.mutate(selectedFacilitatorId)
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Assign Facilitator</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="mb-6">
          <p className="text-sm text-gray-600">Property:</p>
          <p className="font-medium text-gray-900">{property.name}</p>
          <p className="text-sm text-gray-500">{property.address}, {property.city}</p>
        </div>

        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Facilitator *
            </label>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {facilitators.map((facilitator) => (
                <label
                  key={facilitator.id}
                  className={`flex items-center p-3 border rounded-lg cursor-pointer transition-colors ${
                    selectedFacilitatorId === facilitator.id
                      ? 'border-primary-500 bg-primary-50'
                      : 'border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  <input
                    type="radio"
                    name="facilitator"
                    value={facilitator.id}
                    checked={selectedFacilitatorId === facilitator.id}
                    onChange={(e) => setSelectedFacilitatorId(e.target.value)}
                    className="mr-3"
                  />
                  <div className="flex items-center flex-1">
                    <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center mr-3">
                      <span className="text-primary-700 font-semibold">
                        {facilitator.firstName?.[0]}{facilitator.lastName?.[0]}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">
                        {facilitator.firstName} {facilitator.lastName}
                      </p>
                      <p className="text-sm text-gray-500">{facilitator.email}</p>
                    </div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={assignMutation.isPending}
              className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50"
            >
              {assignMutation.isPending ? 'Assigning...' : 'Assign Facilitator'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
