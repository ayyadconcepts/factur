"use client"

import * as React from "react"
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts"

import { useIsMobile } from "@/hooks/use-mobile"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  ToggleGroup,
  ToggleGroupItem,
} from "@/components/ui/toggle-group"

export interface ChartDataPoint {
  date: string;
  conversions: number;
  volume: number;
}

interface ChartAreaInteractiveProps {
  data?: ChartDataPoint[];
}

const chartConfig = {
  conversions: {
    label: "Factures",
    color: "#02b282",
  },
} satisfies ChartConfig

export function ChartAreaInteractive({ data: initialData }: ChartAreaInteractiveProps) {
  const isMobile = useIsMobile()
  const [timeRange, setTimeRange] = React.useState("90d")

  React.useEffect(() => {
    if (isMobile) {
      setTimeRange("7d")
    }
  }, [isMobile])

  // Générer des données par défaut si aucune donnée n'est passée
  const chartData = React.useMemo(() => {
    if (initialData && initialData.length > 0) {
      return initialData;
    }
    const result: ChartDataPoint[] = [];
    const now = new Date();
    for (let i = 89; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0] ?? '';
      result.push({
        date: dateStr,
        conversions: 0,
        volume: 0,
      });
    }
    return result;
  }, [initialData]);

  const filteredData = React.useMemo(() => {
    const now = new Date();
    let daysToSubtract = 90;
    if (timeRange === "30d") daysToSubtract = 30;
    else if (timeRange === "7d") daysToSubtract = 7;

    const startDate = new Date(now);
    startDate.setDate(startDate.getDate() - daysToSubtract);
    const startStr = startDate.toISOString().split('T')[0] ?? '';

    const sliced = chartData.filter((item) => !startStr || item.date >= startStr);
    return sliced.length > 0 ? sliced : chartData.slice(-daysToSubtract);
  }, [chartData, timeRange]);

  const totalPeriodConversions = React.useMemo(() => {
    return filteredData.reduce((acc, curr) => acc + (curr.conversions || 0), 0);
  }, [filteredData]);

  return (
    <div className="rounded-xl bg-cream-light p-4 flex flex-col gap-3 shadow-[0_2px_12px_rgba(0,0,0,0.04),0_1px_3px_rgba(0,0,0,0.02)] dark:shadow-[0_2px_12px_rgba(0,0,0,0.25)]">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-xs font-semibold tracking-tight text-foreground">
            Activité des conversions
          </h3>
          <p className="text-[11px] text-muted-foreground mt-0.5">
            {totalPeriodConversions} facture{totalPeriodConversions > 1 ? 's' : ''} électronique{totalPeriodConversions > 1 ? 's' : ''} convertie{totalPeriodConversions > 1 ? 's' : ''} sur la période
          </p>
        </div>

        <div className="flex items-center gap-2">
          <ToggleGroup
            multiple={false}
            value={timeRange ? [timeRange] : []}
            onValueChange={(value) => {
              setTimeRange(value[0] ?? "90d")
            }}
            variant="outline"
            className="hidden sm:flex border border-border rounded-lg p-0.5 bg-cream-dark/50"
          >
            <ToggleGroupItem
              value="90d"
              className="h-6 text-[11px] px-2 rounded-md font-medium text-muted-foreground data-[state=on]:bg-cream-light data-[state=on]:text-foreground data-[state=on]:shadow-2xs"
            >
              3 derniers mois
            </ToggleGroupItem>
            <ToggleGroupItem
              value="30d"
              className="h-6 text-[11px] px-2 rounded-md font-medium text-muted-foreground data-[state=on]:bg-cream-light data-[state=on]:text-foreground data-[state=on]:shadow-2xs"
            >
              30 derniers jours
            </ToggleGroupItem>
            <ToggleGroupItem
              value="7d"
              className="h-6 text-[11px] px-2 rounded-md font-medium text-muted-foreground data-[state=on]:bg-cream-light data-[state=on]:text-foreground data-[state=on]:shadow-2xs"
            >
              7 derniers jours
            </ToggleGroupItem>
          </ToggleGroup>

          <Select
            value={timeRange}
            onValueChange={(value) => {
              if (value !== null) {
                setTimeRange(value)
              }
            }}
          >
            <SelectTrigger
              className="flex w-36 h-7 text-xs bg-cream-light border-border sm:hidden"
              size="sm"
              aria-label="Sélectionner une période"
            >
              <SelectValue placeholder="3 derniers mois" />
            </SelectTrigger>
            <SelectContent className="rounded-lg bg-cream-light border-border">
              <SelectItem value="90d" className="text-xs">
                3 derniers mois
              </SelectItem>
              <SelectItem value="30d" className="text-xs">
                30 derniers jours
              </SelectItem>
              <SelectItem value="7d" className="text-xs">
                7 derniers jours
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="pt-2">
        <ChartContainer
          config={chartConfig}
          className="aspect-auto h-[180px] w-full"
        >
          <AreaChart data={filteredData}>
            <defs>
              <linearGradient id="fillConversions" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="#02b282"
                  stopOpacity={0.18}
                />
                <stop
                  offset="95%"
                  stopColor="#02b282"
                  stopOpacity={0.0}
                />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} stroke="var(--color-border)" strokeDasharray="3 3" opacity={0.4} />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={6}
              minTickGap={32}
              tick={{ fontSize: 11, fill: 'var(--color-muted-foreground)' }}
              tickFormatter={(value) => {
                const date = new Date(value)
                return date.toLocaleDateString("fr-FR", {
                  month: "short",
                  day: "numeric",
                })
              }}
            />
            <ChartTooltip
              cursor={{ stroke: '#02b282', strokeWidth: 1, strokeDasharray: '3 3' }}
              content={
                <ChartTooltipContent
                  className="bg-cream-light border-border text-xs rounded-lg shadow-sm"
                  labelFormatter={(value) => {
                    return new Date(value).toLocaleDateString("fr-FR", {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })
                  }}
                  indicator="dot"
                />
              }
            />
            <Area
              dataKey="conversions"
              type="monotone"
              fill="url(#fillConversions)"
              stroke="#02b282"
              strokeWidth={1.75}
            />
          </AreaChart>
        </ChartContainer>
      </div>
    </div>
  )
}
