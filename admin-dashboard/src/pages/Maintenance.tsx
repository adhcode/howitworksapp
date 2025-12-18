import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { adminApi } from '../lib/api'
import { useAuthStore } from '../store/authStore'
import { Wrench, AlertCircle, Clock, CheckCircle, XCircle, User, Mail, Phone } from 'lucide-react'
import { formatRelativeTime } from '../lib/utils'
import MaintenanceDetailsModal from '../components/maintenance/MaintenanceDetailsModal'
import { StatCardSkeleton } from '../components/ui/Skeleton'

export default function Maintenance() {
  const { user } = useAuthStore()
  const isFacilitator = user?.role === 'facilitator'
  const [selectedRequest, setSelectedRequest] = useState<any>(null)
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [priorityFilter, setPriorityFilter] = useState<string>('all')

  const { data, isLoading } = useQuery({
    queryKey: ['maintenance', statusFilter, priorityFilter, isFacilitator ? user?.id : 'all'],
    queryFn: () => adminApi.getMaintenance({
      status: statusFilter !== 'all' ? statusFilter : undefined,
      priority: priorityFilter !== 'all' ? priorityFilter : undefined,
    }),
  })

  const requests = Array.isArray(data) ? data : (data?.data || [])

  const stats = {
    total: requests.length,
    pending: requests.filter((r: any) => r.status === 'pending').length,
    inProgress: requests.filter((r: any) => r.status === 'in_progress').length,
    completed: requests.filter((r: any) => r.status === 'completed').length,
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="w-4 h-4" />
      case 'in_progress': return <Wrench className="w-4 h-4" />
      case 'completed': return <CheckCircle className="w-4 h-4" />
      case 'cancelled': return <XCircle className="w-4 h-4" />
      default: return <AlertCircle className="w-4 h-4" />
    }
  }

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

  const handleViewDetails = (request: any) => {
    setSelectedRequest(request)
    setShowDetailsModal(true)
  }

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl sm:text-4xl font-bold text-[#2E2E2E] tracking-tight">Maintenance Requests</h1>
        <p className="text-gray-600 mt-2 text-base sm:text-lg">Monitor and manage maintenance requests</p>
      </div>

      {/* Stats */}
      {isLoading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <StatCardSkeleton />
          <StatCardSkeleton />
          <StatCardSkeleton />
          <StatCardSkeleton />
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <div className="bg-white rounded-2xl border border-gray-100 p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm font-medium text-gray-600 mb-1">Total</p>
                <p className="text-2xl sm:text-3xl font-bold text-[#2E2E2E]">{stats.total}</p>
              </div>
              <div className="bg-[#1A2A52]/10 p-2 sm:p-3 rounded-xl">
                <Wrench className="w-5 h-5 sm:w-6 sm:h-6 text-[#1A2A52]" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm font-medium text-gray-600 mb-1">Pending</p>
                <p className="text-2xl sm:text-3xl font-bold text-yellow-600">{stats.pending}</p>
              </div>
              <div className="bg-yellow-50 p-2 sm:p-3 rounded-xl">
                <Clock className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm font-medium text-gray-600 mb-1">In Progress</p>
                <p className="text-2xl sm:text-3xl font-bold text-blue-600">{stats.inProgress}</p>
              </div>
              <div className="bg-blue-50 p-2 sm:p-3 rounded-xl">
                <Wrench className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm font-medium text-gray-600 mb-1">Completed</p>
                <p className="text-2xl sm:text-3xl font-bold text-green-600">{stats.completed}</p>
              </div>
              <div className="bg-green-50 p-2 sm:p-3 rounded-xl">
                <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-gray-100 p-4 sm:p-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1A2A52] focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Priority</label>
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1A2A52] focus:border-transparent"
            >
              <option value="all">All Priorities</option>
              <option value="urgent">Urgent</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>
        </div>
      </div>


      {/* Requests List */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        {isLoading ? (
          <div className="p-6 space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="border border-gray-100 rounded-xl p-4 space-y-3">
                <div className="h-5 bg-gray-200 rounded animate-pulse w-2/3"></div>
                <div className="h-4 bg-gray-200 rounded animate-pulse w-full"></div>
                <div className="flex gap-2">
                  <div className="h-6 bg-gray-200 rounded animate-pulse w-20"></div>
                  <div className="h-6 bg-gray-200 rounded animate-pulse w-24"></div>
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
                      Request
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Property
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Reported By
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Facilitator
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Priority
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {requests.map((request: any) => (
                    <tr key={request.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-medium text-[#2E2E2E]">{request.title || request.issue}</p>
                          <p className="text-sm text-gray-500 line-clamp-1">{request.description}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <p className="text-sm font-medium text-gray-900">{request.propertyName}</p>
                          {request.unitNumber && (
                            <p className="text-sm text-gray-500">Unit {request.unitNumber}</p>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className="bg-gray-100 p-1.5 rounded-full">
                            <User className="w-3 h-3 text-gray-600" />
                          </div>
                          <span className="text-sm text-gray-900">{request.reportedBy || request.tenant || 'Unknown'}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          <p className="text-sm font-medium text-gray-900">{request.facilitatorName || 'Not assigned'}</p>
                          {request.facilitatorEmail && (
                            <div className="flex items-center gap-1 text-xs text-gray-500">
                              <Mail className="w-3 h-3" />
                              <a href={`mailto:${request.facilitatorEmail}`} className="hover:text-[#1A2A52]">
                                {request.facilitatorEmail}
                              </a>
                            </div>
                          )}
                          {request.facilitatorPhone && (
                            <div className="flex items-center gap-1 text-xs text-gray-500">
                              <Phone className="w-3 h-3" />
                              <a href={`tel:${request.facilitatorPhone}`} className="hover:text-[#1A2A52]">
                                {request.facilitatorPhone}
                              </a>
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(request.priority)}`}>
                          {request.priority?.toUpperCase()}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(request.status)}`}>
                          {getStatusIcon(request.status)}
                          <span>{request.status?.replace('_', ' ').toUpperCase()}</span>
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => handleViewDetails(request)}
                          className="text-[#1A2A52] hover:text-[#2a3f6f] font-medium text-sm"
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Card View */}
            <div className="lg:hidden p-4 space-y-4">
              {requests.map((request: any) => (
                <div key={request.id} className="border border-gray-200 rounded-xl p-4 space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-semibold text-[#2E2E2E] flex-1">{request.title || request.issue}</h3>
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(request.status)}`}>
                      {getStatusIcon(request.status)}
                    </span>
                  </div>
                  
                  <p className="text-sm text-gray-600 line-clamp-2">{request.description}</p>
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-500">Property:</span>
                      <span className="font-medium text-gray-900">{request.propertyName}</span>
                    </div>
                    
                    {request.unitNumber && (
                      <div className="flex items-center justify-between">
                        <span className="text-gray-500">Unit:</span>
                        <span className="font-medium text-gray-900">{request.unitNumber}</span>
                      </div>
                    )}
                    
                    <div className="flex items-center justify-between">
                      <span className="text-gray-500">Reported by:</span>
                      <span className="font-medium text-gray-900">{request.reportedBy || request.tenant || 'Unknown'}</span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-gray-500">Priority:</span>
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(request.priority)}`}>
                        {request.priority?.toUpperCase()}
                      </span>
                    </div>
                    
                    {request.facilitatorName && (
                      <div className="pt-2 border-t border-gray-100">
                        <p className="text-xs text-gray-500 mb-1">Facilitator:</p>
                        <p className="font-medium text-gray-900">{request.facilitatorName}</p>
                        {request.facilitatorEmail && (
                          <a href={`mailto:${request.facilitatorEmail}`} className="text-xs text-[#1A2A52] hover:underline flex items-center gap-1 mt-1">
                            <Mail className="w-3 h-3" />
                            {request.facilitatorEmail}
                          </a>
                        )}
                        {request.facilitatorPhone && (
                          <a href={`tel:${request.facilitatorPhone}`} className="text-xs text-[#1A2A52] hover:underline flex items-center gap-1 mt-1">
                            <Phone className="w-3 h-3" />
                            {request.facilitatorPhone}
                          </a>
                        )}
                      </div>
                    )}
                  </div>
                  
                  <button
                    onClick={() => handleViewDetails(request)}
                    className="w-full mt-2 px-4 py-2 bg-[#1A2A52] text-white rounded-lg hover:bg-[#2a3f6f] transition-colors text-sm font-medium"
                  >
                    View Details
                  </button>
                </div>
              ))}
            </div>

            {/* Empty State */}
            {requests.length === 0 && (
              <div className="text-center py-16">
                <div className="bg-gray-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Wrench className="w-10 h-10 text-gray-400" />
                </div>
                <h3 className="text-xl font-bold text-[#2E2E2E] mb-2">No maintenance requests</h3>
                <p className="text-gray-600">No requests match the selected filters</p>
              </div>
            )}
          </>
        )}
      </div>

      {/* Details Modal */}
      {showDetailsModal && selectedRequest && (
        <MaintenanceDetailsModal
          request={selectedRequest}
          onClose={() => {
            setShowDetailsModal(false)
            setSelectedRequest(null)
          }}
        />
      )}
    </div>
  )
}
