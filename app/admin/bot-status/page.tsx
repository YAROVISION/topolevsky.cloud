import { getBotStatus } from '../actions'
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from '@/components/ui/badge'
import { Database, Zap, Share2, Layers, RefreshCcw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default async function BotStatusPage() {
  const status = await getBotStatus()

  // Type Guard for TypeScript
  if (!status.success) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <div className="p-3 rounded-full bg-destructive/10">
            <Zap className="h-10 w-10 text-destructive" />
        </div>
        <h2 className="text-2xl font-bold text-destructive">Error Loading Status</h2>
        <p className="text-muted-foreground">{status.error}</p>
        <Link href="/admin">
          <Button variant="outline">Back to Dashboard</Button>
        </Link>
      </div>
    )
  }

  // At this point, status.success is true, so status.mysql/neo4j are defined
  const { mysql, neo4j, recent } = status

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Bot Status</h2>
          <p className="text-muted-foreground transition-all">
            Monitoring Lexical Graph Bot (Gemini 2.5 Flash Edition)
          </p>
        </div>
        <Link href="/admin/bot-status">
            <Button variant="outline" className="gap-2 hover:bg-muted">
                <RefreshCcw className="h-4 w-4" />
                Refresh
            </Button>
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">MySQL Total Words</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-mono">{(mysql.total || 0).toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              Total words in dictionary
            </p>
          </CardContent>
        </Card>
        <Card className="hover:shadow-md transition-shadow border-l-4 border-l-yellow-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Processed Words</CardTitle>
            <Zap className="h-4 w-4 text-yellow-500 fill-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-mono">{(mysql.processed || 0).toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              {mysql.percentage}% completed
            </p>
          </CardContent>
        </Card>
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Neo4j Nodes</CardTitle>
            <Layers className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-mono">{(neo4j.nodes || 0).toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              Word nodes in graph
            </p>
          </CardContent>
        </Card>
        <Card className="hover:shadow-md transition-shadow border-l-4 border-l-green-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Neo4j Relationships</CardTitle>
            <Share2 className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-mono">{(neo4j.edges || 0).toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              Hypernym relationships
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Progress Bar */}
      <Card>
        <CardHeader>
          <CardTitle>Overall Progress</CardTitle>
          <CardDescription>
            Dictionary categorization completion rate
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Progress value={parseFloat(mysql.percentage)} className="h-3" />
          <div className="flex justify-between text-xs text-muted-foreground uppercase tracking-wider font-bold">
            <span className="flex items-center gap-1"><Zap className="h-3 w-3 text-yellow-500" /> {mysql.processed.toLocaleString()} processed</span>
            <span>{mysql.total.toLocaleString()} total words</span>
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>
            Latest 5 words successfully categorized by ШІ
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Word</TableHead>
                <TableHead>Abstraction Level</TableHead>
                <TableHead className="text-right">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(recent || []).map((word: any) => (
                <TableRow key={word.id} className="hover:bg-muted/50 transition-colors">
                  <TableCell className="font-mono text-xs text-muted-foreground">#{word.id}</TableCell>
                  <TableCell className="font-bold text-base">{word.word}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-3">
                        <Badge variant="outline" className="w-8 justify-center font-mono">
                            {word.abstraction_level}
                        </Badge>
                        <div className="h-2 w-32 bg-secondary rounded-full overflow-hidden hidden sm:block">
                            <div 
                                className="h-full bg-primary transition-all duration-500" 
                                style={{ width: `${(word.abstraction_level / 10) * 100}%` }}
                            />
                        </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2 items-center">
                        <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                        <Badge variant="secondary" className="bg-green-100 text-green-700 hover:bg-green-100 border-none font-medium">
                            Categorized
                        </Badge>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {(!recent || recent.length === 0) && (
                <TableRow>
                  <TableCell colSpan={4} className="text-center h-24 text-muted-foreground">
                    No recent activity found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
