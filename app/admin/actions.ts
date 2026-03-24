'use server'

import { userQuery } from '@/lib/users-db'
import { getServerSession } from 'next-auth'
import { authConfig } from '@/config/auth'
import { revalidatePath } from 'next/cache'

export async function updateUserTier(userId: string, tier: string) {
  const session = await getServerSession(authConfig)

  if (!session || session.user.role !== 'ADMIN') {
    throw new Error('Unauthorized')
  }

  try {
    await userQuery(
      'UPDATE users SET subscriptionTier = ? WHERE id = ?',
      [tier, userId]
    )
    
    revalidatePath('/admin/users')
    return { success: true }
  } catch (error) {
    console.error('[Admin Action] Error updating user tier:', error)
    return { success: false, error: 'Failed to update user status' }
  }
}

export async function getAllUsers() {
  const session = await getServerSession(authConfig)

  if (!session || session.user.role !== 'ADMIN') {
    throw new Error('Unauthorized')
  }

  try {
    const users = await userQuery<any>(
      'SELECT id, email, name, role, subscriptionTier, createdAt FROM users ORDER BY createdAt DESC'
    )
    return users
  } catch (error) {
    console.error('[Admin Action] Error getting all users:', error)
    return []
  }
}

export async function getSubscriptionStats() {
  const session = await getServerSession(authConfig)
  if (!session || session.user.role !== 'ADMIN') throw new Error('Unauthorized')

  try {
    const stats = await userQuery<any>(
      'SELECT subscriptionTier as name, COUNT(*) as value FROM users GROUP BY subscriptionTier'
    )
    return stats
  } catch (error) {
    console.error('[Admin Action] Error getting subscription stats:', error)
    return []
  }
}

export async function getRegistrationStats() {
  const session = await getServerSession(authConfig)
  if (!session || session.user.role !== 'ADMIN') throw new Error('Unauthorized')

  try {
    const stats = await userQuery<any>(
      "SELECT DATE_FORMAT(createdAt, '%Y-%m-%d') as date, COUNT(*) as count FROM users GROUP BY date ORDER BY date ASC LIMIT 30"
    )
    return stats
  } catch (error) {
    console.error('[Admin Action] Error getting registration stats:', error)
    return []
  }
}
