import { apiConnector } from '../apiConnector'
import toast from 'react-hot-toast'

export const getAdminStats = async (token) => {
  try {
    const res = await apiConnector('GET', '/api/v1/admin/stats', null, { Authorization: `Bearer ${token}` })
    if (res?.data?.success) return res.data
    toast.error(res?.data?.message || 'Failed to fetch admin stats')
  } catch (error) {
    console.error('getAdminStats error:', error)
    toast.error('Failed to fetch admin stats')
  }
  return null
}

export const getAdminClients = async (token, search = '', limit = 50) => {
  try {
    const res = await apiConnector('GET', `/api/v1/admin/clients?search=${search}&limit=${limit}`, null, { Authorization: `Bearer ${token}` })
    if (res?.data?.success) return res.data
  } catch (error) {
    console.error('getAdminClients error:', error)
  }
  return { clients: [], total: 0 }
}

export const getAdminPractitioners = async (token, search = '', limit = 50) => {
  try {
    const res = await apiConnector('GET', `/api/v1/admin/practitioners?search=${search}&limit=${limit}`, null, { Authorization: `Bearer ${token}` })
    if (res?.data?.success) return res.data
  } catch (error) {
    console.error('getAdminPractitioners error:', error)
  }
  return { practitioners: [], total: 0 }
}

export const getAdminPayments = async (token, type = '', search = '', limit = 50) => {
  try {
    const params = new URLSearchParams({ limit: String(limit) })
    if (type) params.append('type', type)
    if (search) params.append('search', search)

    const res = await apiConnector('GET', `/api/v1/admin/payments?${params.toString()}`, null, { Authorization: `Bearer ${token}` })
    if (res?.data?.success) return res.data
  } catch (error) {
    console.error('getAdminPayments error:', error)
  }
  return { payments: [], total: 0 }
}

export const processMonthlyPayout = async (token, practitionerId, amount) => {
  try {
    const res = await apiConnector('POST', '/api/v1/admin/payout', { practitionerId, amount }, { Authorization: `Bearer ${token}` })
    if (res?.data?.success) {
      toast.success(res.data.message || 'Payout recorded successfully')
      return res.data
    }
    toast.error(res?.data?.message || 'Payout failed')
  } catch (error) {
    console.error('processMonthlyPayout error:', error)
    toast.error('Payout failed')
  }
  return null
}
