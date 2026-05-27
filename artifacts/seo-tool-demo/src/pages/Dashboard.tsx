import React from "react";
import { motion } from "framer-motion";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area
} from "recharts";
import {
  ArrowUpRight,
  ArrowDownRight,
  MapPin,
  Star,
  PhoneMissed,
  Phone,
  Search,
  ChevronUp,
  ChevronDown
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

const visibilityData = [
  { month: "Jan", score: 45 },
  { month: "Feb", score: 48 },
  { month: "Mar", score: 52 },
  { month: "Apr", score: 51 },
  { month: "May", score: 58 },
  { month: "Jun", score: 63 },
  { month: "Jul", score: 62 },
  { month: "Aug", score: 68 },
  { month: "Sep", score: 69 },
  { month: "Oct", score: 71 },
  { month: "Nov", score: 72 },
  { month: "Dec", score: 73 },
];

const keywordRankings = [
  { keyword: "HVAC repair Austin", rank: 2, change: 1, volume: "4,500" },
  { keyword: "emergency plumber", rank: 3, change: 0, volume: "3,200" },
  { keyword: "AC installation near me", rank: 1, change: 2, volume: "2,800" },
  { keyword: "water heater replacement", rank: 5, change: -1, volume: "1,500" },
  { keyword: "furnace repair", rank: 4, change: 3, volume: "1,200" },
  { keyword: "commercial HVAC", rank: 7, change: 1, volume: "800" },
];

export default function Dashboard() {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="p-8 space-y-8 max-w-7xl mx-auto"
    >
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Dashboard</h1>
          <p className="text-muted-foreground mt-1">Here's how your business is performing online.</p>
        </div>
        <div className="flex gap-2">
          <Badge variant="secondary" className="px-3 py-1 font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
            Systems Healthy
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card className="shadow-sm border-border/50 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <Search className="w-16 h-16" />
          </div>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Search className="w-4 h-4" />
              Local Search Visibility
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-bold font-display">73</span>
              <span className="text-sm text-muted-foreground">/ 100</span>
            </div>
            <div className="mt-2 flex items-center text-sm text-green-600 font-medium">
              <ArrowUpRight className="w-4 h-4 mr-1" />
              +12% from last month
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-border/50 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <MapPin className="w-16 h-16" />
          </div>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              Google Maps Ranking
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-bold font-display">#3</span>
            </div>
            <div className="mt-2 flex items-center text-sm text-muted-foreground">
              For "HVAC near me"
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-border/50 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <Star className="w-16 h-16" />
          </div>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Star className="w-4 h-4" />
              Total Reviews
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-bold font-display">127</span>
              <span className="text-sm font-medium text-amber-500">4.7 Avg</span>
            </div>
            <div className="mt-2 flex items-center text-sm text-green-600 font-medium">
              <ArrowUpRight className="w-4 h-4 mr-1" />
              +8 new this month
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-border/50 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <Phone className="w-16 h-16" />
          </div>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Phone className="w-4 h-4" />
              Leads Generated
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-bold font-display">34</span>
            </div>
            <div className="mt-2 flex items-center text-sm text-green-600 font-medium">
              <ArrowUpRight className="w-4 h-4 mr-1" />
              +12% from last month
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-border/50 relative overflow-hidden bg-red-50/50 dark:bg-red-950/10 border-red-100 dark:border-red-900/30">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <PhoneMissed className="w-16 h-16 text-red-500" />
          </div>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-red-800 dark:text-red-400 flex items-center gap-2">
              <PhoneMissed className="w-4 h-4" />
              Missed Calls
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-bold font-display text-red-600 dark:text-red-500">6</span>
            </div>
            <div className="mt-2 flex items-center text-sm text-red-600/80 font-medium">
              Requires attention
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card className="shadow-sm border-border/50">
          <CardHeader>
            <CardTitle>Search Visibility Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={visibilityData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--accent))" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="hsl(var(--accent))" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                  <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '8px' }}
                    itemStyle={{ color: 'hsl(var(--foreground))' }}
                  />
                  <Area type="monotone" dataKey="score" stroke="hsl(var(--accent))" strokeWidth={3} fillOpacity={1} fill="url(#colorScore)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-border/50">
          <CardHeader>
            <CardTitle>Top Keyword Rankings</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Keyword</TableHead>
                  <TableHead className="text-right">Rank</TableHead>
                  <TableHead className="text-right">Change</TableHead>
                  <TableHead className="text-right">Volume</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {keywordRankings.map((kw) => (
                  <TableRow key={kw.keyword}>
                    <TableCell className="font-medium">{kw.keyword}</TableCell>
                    <TableCell className="text-right font-display font-bold">#{kw.rank}</TableCell>
                    <TableCell className="text-right">
                      {kw.change > 0 ? (
                        <span className="flex items-center justify-end text-green-600 font-medium">
                          <ChevronUp className="w-4 h-4 mr-1" />
                          {kw.change}
                        </span>
                      ) : kw.change < 0 ? (
                        <span className="flex items-center justify-end text-red-600 font-medium">
                          <ChevronDown className="w-4 h-4 mr-1" />
                          {Math.abs(kw.change)}
                        </span>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right text-muted-foreground">{kw.volume}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </motion.div>
  );
}
