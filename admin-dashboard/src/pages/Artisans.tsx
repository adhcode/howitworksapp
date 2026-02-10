import { useState, useEffect } from 'react';
import { Search, Filter, Eye, CheckCircle, XCircle, Trash2, ExternalLink } from 'lucide-react';
import { api } from '../lib/api';

interface Artisan {
  id: string;
  fullName: string;
  phoneNumber: string;
  email?: string;
  address: string;
  city: string;
  state: string;
  specialty: string;
  yearsOfExperience: number;
  refereeName: string;
  refereePhone: string;
  additionalSkills?: string;
  availability: string;
  status: 'pending' | 'approved' | 'rejected' | 'inactive';
  referredByFacilitatorName?: string;
  adminNotes?: string;
  createdAt: string;
}

export default function Artisans() {
  const [artisans, setArtisans] = useState<Artisan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [specialtyFilter, setSpecialtyFilter] = useState<string>('');
  const [selectedArtisan, setSelectedArtisan] = useState<Artisan | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  useEffect(() => {
    fetchArtisans();
  }, [statusFilter, specialtyFilter]);

  const fetchArtisans = async () => {
    try {
      setLoading(true);
      setError('');
      const params = new URLSearchParams();
      if (statusFilter) params.append('status', statusFilter);
      if (specialtyFilter) params.append('specialty', specialtyFilter);
      if (searchTerm) params.append('search', searchTerm);

      const response = await api.get(`/artisans/admin/all?${params.toString()}`);
      setArtisans(Array.isArray(response.data) ? response.data : []);
    } catch (error: any) {
      console.error('Failed to fetch artisans:', error);
      setError(error.response?.data?.message || error.message || 'Failed to load artisans');
      setArtisans([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    fetchArtisans();
  };

  const handleStatusUpdate = async (id: string, status: string, notes?: string) => {
    try {
      await api.patch(`/artisans/admin/${id}/status`, { status, adminNotes: notes });
      fetchArtisans();
      setShowDetailsModal(false);
    } catch (error) {
      console.error('Failed to update status:', error);
      alert('Failed to update artisan status');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this artisan?')) return;

    try {
      await api.delete(`/artisans/admin/${id}`);
      fetchArtisans();
      setShowDetailsModal(false);
    } catch (error) {
      console.error('Failed to delete artisan:', error);
      alert('Failed to delete artisan');
    }
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      pending: 'bg-yellow-100 text-yellow-800',
      approved: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
      inactive: 'bg-gray-100 text-gray-800',
    };
    return styles[status as keyof typeof styles] || styles.pending;
  };

  const filteredArtisans = artisans.filter(artisan =>
    artisan.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    artisan.phoneNumber.includes(searchTerm) ||
    artisan.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Artisan Directory</h1>
        <p className="text-gray-600">Manage artisans referred by facilitators</p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="md:col-span-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search by name, phone, or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1A2A52] focus:border-transparent"
              />
            </div>
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1A2A52] focus:border-transparent"
          >
            <option value="">All Status</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
            <option value="inactive">Inactive</option>
          </select>

          <select
            value={specialtyFilter}
            onChange={(e) => setSpecialtyFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1A2A52] focus:border-transparent"
          >
            <option value="">All Specialties</option>
            <option value="Plumber">Plumber</option>
            <option value="Electrician">Electrician</option>
            <option value="Carpenter">Carpenter</option>
            <option value="Painter">Painter</option>
            <option value="Mason/Bricklayer">Mason/Bricklayer</option>
            <option value="Tiler">Tiler</option>
            <option value="Welder">Welder</option>
            <option value="HVAC Technician">HVAC Technician</option>
            <option value="Roofer">Roofer</option>
            <option value="Landscaper">Landscaper</option>
            <option value="General Handyman">General Handyman</option>
            <option value="Other">Other</option>
          </select>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-sm text-gray-600">Total Artisans</p>
          <p className="text-2xl font-bold text-gray-900">{artisans.length}</p>
        </div>
        <div className="bg-yellow-50 rounded-lg shadow p-4">
          <p className="text-sm text-yellow-800">Pending</p>
          <p className="text-2xl font-bold text-yellow-900">
            {artisans.filter(a => a.status === 'pending').length}
          </p>
        </div>
        <div className="bg-green-50 rounded-lg shadow p-4">
          <p className="text-sm text-green-800">Approved</p>
          <p className="text-2xl font-bold text-green-900">
            {artisans.filter(a => a.status === 'approved').length}
          </p>
        </div>
        <div className="bg-red-50 rounded-lg shadow p-4">
          <p className="text-sm text-red-800">Rejected</p>
          <p className="text-2xl font-bold text-red-900">
            {artisans.filter(a => a.status === 'rejected').length}
          </p>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {error && (
          <div className="p-4 bg-red-50 border-b border-red-200">
            <p className="text-red-700">{error}</p>
            <button 
              onClick={fetchArtisans}
              className="mt-2 text-sm text-red-600 hover:text-red-800 underline"
            >
              Try again
            </button>
          </div>
        )}
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1A2A52] mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading artisans...</p>
          </div>
        ) : filteredArtisans.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <p>No artisans found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Specialty
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Location
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Experience
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Referred By
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
                {filteredArtisans.map((artisan) => (
                  <tr key={artisan.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{artisan.fullName}</div>
                        <div className="text-sm text-gray-500">{artisan.phoneNumber}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {artisan.specialty}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {artisan.city}, {artisan.state}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {artisan.yearsOfExperience} years
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {artisan.referredByFacilitatorName || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadge(artisan.status)}`}>
                        {artisan.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => {
                          setSelectedArtisan(artisan);
                          setShowDetailsModal(true);
                        }}
                        className="text-[#1A2A52] hover:text-[#2d4575] mr-3"
                      >
                        <Eye className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Details Modal */}
      {showDetailsModal && selectedArtisan && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-2xl font-bold text-gray-900">Artisan Details</h2>
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Full Name</label>
                    <p className="text-gray-900">{selectedArtisan.fullName}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Phone Number</label>
                    <p className="text-gray-900">{selectedArtisan.phoneNumber}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Email</label>
                    <p className="text-gray-900">{selectedArtisan.email || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Specialty</label>
                    <p className="text-gray-900">{selectedArtisan.specialty}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Experience</label>
                    <p className="text-gray-900">{selectedArtisan.yearsOfExperience} years</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Availability</label>
                    <p className="text-gray-900">{selectedArtisan.availability}</p>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-500">Address</label>
                  <p className="text-gray-900">{selectedArtisan.address}</p>
                  <p className="text-gray-600 text-sm">{selectedArtisan.city}, {selectedArtisan.state}</p>
                </div>

                {selectedArtisan.additionalSkills && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">Additional Skills</label>
                    <p className="text-gray-900">{selectedArtisan.additionalSkills}</p>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Referee Name</label>
                    <p className="text-gray-900">{selectedArtisan.refereeName}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Referee Phone</label>
                    <p className="text-gray-900">{selectedArtisan.refereePhone}</p>
                  </div>
                </div>

                {selectedArtisan.referredByFacilitatorName && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">Referred By</label>
                    <p className="text-gray-900">{selectedArtisan.referredByFacilitatorName}</p>
                  </div>
                )}

                <div>
                  <label className="text-sm font-medium text-gray-500">Current Status</label>
                  <p>
                    <span className={`px-3 py-1 inline-flex text-sm font-semibold rounded-full ${getStatusBadge(selectedArtisan.status)}`}>
                      {selectedArtisan.status}
                    </span>
                  </p>
                </div>

                {selectedArtisan.status === 'pending' && (
                  <div className="flex gap-3 pt-4">
                    <button
                      onClick={() => handleStatusUpdate(selectedArtisan.id, 'approved')}
                      className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center justify-center gap-2"
                    >
                      <CheckCircle className="w-5 h-5" />
                      Approve
                    </button>
                    <button
                      onClick={() => handleStatusUpdate(selectedArtisan.id, 'rejected')}
                      className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 flex items-center justify-center gap-2"
                    >
                      <XCircle className="w-5 h-5" />
                      Reject
                    </button>
                  </div>
                )}

                <div className="pt-4 border-t">
                  <button
                    onClick={() => handleDelete(selectedArtisan.id)}
                    className="text-red-600 hover:text-red-800 flex items-center gap-2"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete Artisan
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
