import { getRegistrationStats, getSubscriptionStats } from '@/app/admin/actions'
import { RegistrationDynamics, SubscriptionDistribution } from '@/components/admin/analytics-charts'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export const dynamic = 'force-dynamic'

export default async function AdminAnalyticsPage() {
  const [subStats, regStats] = await Promise.all([
    getSubscriptionStats(),
    getRegistrationStats()
  ])

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Analytics Dashboard</h2>
        <p className="text-muted-foreground">
          Visual representation of your client base and growth.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
        <div className="md:col-span-1 lg:col-span-3">
          <SubscriptionDistribution data={subStats} />
        </div>
        <div className="md:col-span-1 lg:col-span-4">
          <RegistrationDynamics data={regStats} />
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
         <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
               <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            </CardHeader>
            <CardContent>
               <div className="text-2xl font-bold">
                  {subStats.reduce((acc, curr) => acc + Number(curr.value), 0)}
               </div>
            </CardContent>
         </Card>
         <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
               <CardTitle className="text-sm font-medium">Active PRO</CardTitle>
            </CardHeader>
            <CardContent>
               <div className="text-2xl font-bold">
                  {subStats.find(s => s.name === 'PRO')?.value || 0}
               </div>
            </CardContent>
         </Card>
         <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
               <CardTitle className="text-sm font-medium">Special Status</CardTitle>
            </CardHeader>
            <CardContent>
               <div className="text-2xl font-bold text-amber-500">
                  {subStats.find(s => s.name === 'SPECIAL')?.value || 0}
               </div>
            </CardContent>
         </Card>
      </div>
    </div>
  )
}
