'use server'

import { userQuery } from '@/lib/users-db'
import { db } from '@/lib/db'
import { runQuery } from '@/lib/neo4j'
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

export type BotStatusResult = {
  success: true
  mysql: {
    total: number
    processed: number
    percentage: string
  }
  neo4j: {
    nodes: number
    edges: number
  }
  recent: any[]
} | {
  success: false
  error: string
}

export async function getBotStatus(): Promise<BotStatusResult> {
  const session = await getServerSession(authConfig)
  if (!session || session.user.role !== 'ADMIN') throw new Error('Unauthorized')

  try {
    // 1. MySQL Word Stats
    const [totalRows]: any = await db.execute('SELECT COUNT(*) as totalWords FROM word')
    const totalWords = Number(totalRows[0]?.totalWords || 0)

    const [processedRows]: any = await db.execute('SELECT COUNT(*) as processedWords FROM word WHERE abstraction_level > 0 AND abstraction_level IS NOT NULL')
    const processedWords = Number(processedRows[0]?.processedWords || 0)
    
    // 2. Neo4j Stats
    const neoNodes = await runQuery('MATCH (n:Word) RETURN count(n) as count')
    const neoEdges = await runQuery('MATCH ()-[r:HYPERNYM_OF]->() RETURN count(r) as count')
    
    // 3. Last 5 Activity
    const [recentWords]: any = await db.execute('SELECT id, word, abstraction_level FROM word WHERE abstraction_level > 0 ORDER BY id DESC LIMIT 5')

    const percentage = totalWords > 0 ? ((processedWords / totalWords) * 100).toFixed(2) : "0.00"

    // Helper to extract Neo4j counts (handling both Integer objects and numbers)
    const getNeoCount = (res: any) => {
        const val = res[0]?.count
        if (!val) return 0
        return typeof val === 'object' && 'low' in val ? val.low : Number(val)
    }

    return {
      success: true,
      mysql: {
        total: totalWords,
        processed: processedWords,
        percentage: percentage,
      },
      neo4j: {
        nodes: getNeoCount(neoNodes),
        edges: getNeoCount(neoEdges),
      },
      recent: recentWords || []
    }
  } catch (error) {
    console.error('[Admin Action] Error getting bot status:', error)
    return { success: false, error: 'Database connection failed or timeout' }
  }
}
