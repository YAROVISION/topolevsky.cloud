'use client'

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Label,
  Pie,
  PieChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  Area,
  AreaChart
} from 'recharts'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart'

const subscriptionConfig = {
  FREE: {
    label: 'FREE',
    color: 'hsl(var(--muted))',
  },
  PRO: {
    label: 'PRO',
    color: 'hsl(var(--primary))',
  },
  SPECIAL: {
    label: 'SPECIAL',
    color: 'hsl(var(--warning, 38 92% 50%))',
  },
} satisfies ChartConfig

const COLORS = ['#94a3b8', '#3b82f6', '#f59e0b'] // FREE (slate-400), PRO (blue-500), SPECIAL (amber-500)

export function SubscriptionDistribution({ data }: { data: any[] }) {
  // Ensure we have values for all tiers even if 0
  const tiers = ['FREE', 'PRO', 'SPECIAL']
  const chartData = tiers.map(tier => {
    const found = data.find(d => d.name === tier)
    return {
      name: tier,
      value: found ? Number(found.value) : 0,
      fill: tier === 'FREE' ? '#94a3b8' : tier === 'PRO' ? '#3b82f6' : '#f59e0b'
    }
  })

  return (
    <Card className="flex flex-col">
      <CardHeader className="items-center pb-0">
        <CardTitle>Subscription Tiers</CardTitle>
        <CardDescription>Current user distribution</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pb-0">
        <ChartContainer
          config={subscriptionConfig}
          className="mx-auto aspect-square max-h-[250px]"
        >
          <PieChart>
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
            <Pie
              data={chartData}
              dataKey="value"
              nameKey="name"
              innerRadius={60}
              strokeWidth={5}
            >
              <Label
                content={({ viewBox }) => {
                  if (viewBox && 'cx' in viewBox && 'cy' in viewBox) {
                    const total = chartData.reduce((acc, curr) => acc + curr.value, 0)
                    return (
                      <text
                        x={viewBox.cx}
                        y={viewBox.cy}
                        textAnchor="middle"
                        dominantBaseline="middle"
                      >
                        <tspan
                          x={viewBox.cx}
                          y={viewBox.cy}
                          className="fill-foreground text-3xl font-bold"
                        >
                          {total}
                        </tspan>
                        <tspan
                          x={viewBox.cx}
                          y={(viewBox.cy || 0) + 24}
                          className="fill-muted-foreground"
                        >
                          Users
                        </tspan>
                      </text>
                    )
                  }
                }}
              />
            </Pie>
          </PieChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}

export function RegistrationDynamics({ data }: { data: any[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Registration Dynamics</CardTitle>
        <CardDescription>Daily registrations for the last 30 days</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer
          config={{
            count: {
              label: 'Registrations',
              color: 'hsl(var(--primary))',
            },
          }}
          className="h-[300px] w-full"
        >
          <AreaChart
            data={data}
            margin={{
              left: 12,
              right: 12,
            }}
          >
            <CartesianGrid vertical={false} strokeDasharray="3 3" opacity={0.3} />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={32}
              tickFormatter={(value) => {
                const date = new Date(value)
                return date.toLocaleDateString('uk-UA', {
                  month: 'short',
                  day: 'numeric',
                })
              }}
            />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent indicator="line" />}
            />
            <Area
              dataKey="count"
              type="natural"
              fill="hsl(var(--primary))"
              fillOpacity={0.1}
              stroke="hsl(var(--primary))"
              strokeWidth={2}
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
