import React from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { MapPin, Navigation, TrendingUp, Search } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const localKeywords = [
  { id: 1, keyword: "HVAC repair Austin", rank: 2, trend: [4, 3, 3, 2, 2], searches: 4500, cpc: "$12.50" },
  { id: 2, keyword: "emergency plumber", rank: 3, trend: [5, 4, 3, 3, 3], searches: 3200, cpc: "$25.00" },
  { id: 3, keyword: "AC installation near me", rank: 1, trend: [2, 2, 1, 1, 1], searches: 2800, cpc: "$18.00" },
  { id: 4, keyword: "water heater replacement", rank: 5, trend: [3, 4, 4, 4, 5], searches: 1500, cpc: "$15.00" },
  { id: 5, keyword: "furnace repair", rank: 4, trend: [6, 5, 5, 4, 4], searches: 1200, cpc: "$14.00" },
  { id: 6, keyword: "plumbing services", rank: 6, trend: [8, 7, 7, 6, 6], searches: 2100, cpc: "$20.00" },
  { id: 7, keyword: "drain cleaning", rank: 8, trend: [10, 9, 8, 8, 8], searches: 1800, cpc: "$16.00" },
];

const rankDistribution = [
  { name: "Top 3", count: 3 },
  { name: "Pos 4-10", count: 8 },
  { name: "Pos 11-20", count: 12 },
  { name: "Pos 21-50", count: 24 },
  { name: "50+", count: 45 },
];

function Sparkline({ data }: { data: number[] }) {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const height = 24;
  const width = 60;
  
  // Invert Y so lower rank (e.g. 1) is higher on chart
  const points = data.map((val, i) => {
    const x = (i / (data.length - 1)) * width;
    const y = ((val - min) / range) * height; 
    return `${x},${y}`;
  }).join(" ");

  const isPositive = data[0] > data[data.length - 1]; // Lower number = better rank

  return (
    <svg width={width} height={height} className="overflow-visible">
      <polyline
        points={points}
        fill="none"
        stroke={isPositive ? "hsl(var(--chart-3))" : "hsl(var(--chart-5))"}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function LocalRankings() {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="p-8 space-y-8 max-w-7xl mx-auto"
    >
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Local Rankings</h1>
        <p className="text-muted-foreground mt-1">Track your visibility across local search and Google Maps.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 shadow-sm border-border/50">
          <CardHeader>
            <CardTitle>Google Maps Grid Tracker</CardTitle>
            <CardDescription>Average rank position within a 5-mile radius for "HVAC repair"</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="relative w-full h-[400px] rounded-xl overflow-hidden border border-border bg-accent/5">
              {/* Fake Map Background */}
              <div 
                className="absolute inset-0 opacity-20"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 0h40v40H0V0zm20 20h20v20H20V20zM0 20h20v20H0V20z' fill='%239C92AC' fill-opacity='0.4' fill-rule='evenodd'/%3E%3C/svg%3E")`,
                }}
              />
              
              {/* Center Pin */}
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
                <div className="bg-primary text-primary-foreground font-bold px-3 py-1 rounded-full shadow-lg text-sm mb-1 z-10 border border-primary/20">
                  Mike's HVAC
                </div>
                <div className="w-12 h-12 bg-accent/20 rounded-full flex items-center justify-center animate-pulse">
                  <div className="w-4 h-4 bg-accent rounded-full shadow-[0_0_15px_rgba(249,115,22,0.5)]"></div>
                </div>
              </div>

              {/* Grid Points */}
              <div className="absolute inset-0 grid grid-cols-5 grid-rows-5 p-8 gap-4">
                {Array.from({ length: 25 }).map((_, i) => {
                  // Fake ranks: closer to center = better
                  const row = Math.floor(i / 5);
                  const col = i % 5;
                  const dist = Math.abs(2 - row) + Math.abs(2 - col);
                  const rank = dist === 0 ? 1 : dist <= 1 ? Math.floor(Math.random() * 3) + 1 : Math.floor(Math.random() * 8) + 3;
                  
                  const isTop3 = rank <= 3;
                  const isTop10 = rank > 3 && rank <= 10;
                  
                  return (
                    <div key={i} className="relative flex items-center justify-center">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shadow-sm transition-transform hover:scale-110 cursor-pointer
                        ${isTop3 ? 'bg-green-500 text-white' : isTop10 ? 'bg-amber-500 text-white' : 'bg-red-500 text-white'}`}
                      >
                        {rank}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-border/50">
          <CardHeader>
            <CardTitle>Rank Distribution</CardTitle>
            <CardDescription>Current positions for all tracked keywords</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={rankDistribution} layout="vertical" margin={{ top: 0, right: 30, left: 20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="hsl(var(--border))" />
                  <XAxis type="number" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} />
                  <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'hsl(var(--foreground))' }} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '8px' }}
                    cursor={{fill: 'hsl(var(--muted))'}}
                  />
                  <Bar dataKey="count" fill="hsl(var(--accent))" radius={[0, 4, 4, 0]} barSize={24} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            
            <div className="mt-6 pt-6 border-t border-border space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Total Tracked Keywords</span>
                <span className="font-bold font-display">92</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Keywords in Top 3</span>
                <span className="font-bold font-display text-green-600">3 (3.2%)</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-sm border-border/50">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Keyword Positions</CardTitle>
            <CardDescription>Detailed view of your local search performance</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
              <Input placeholder="Search keywords..." className="pl-9 w-[250px]" />
            </div>
            <Button variant="outline">Filter</Button>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Keyword</TableHead>
                <TableHead className="text-right">Current Rank</TableHead>
                <TableHead className="w-[120px] text-center">30 Day Trend</TableHead>
                <TableHead className="text-right">Monthly Vol</TableHead>
                <TableHead className="text-right">Avg CPC</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {localKeywords.map((kw) => (
                <TableRow key={kw.id}>
                  <TableCell className="font-medium">{kw.keyword}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <span className={`font-bold font-display ${kw.rank <= 3 ? 'text-green-600' : ''}`}>#{kw.rank}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="flex justify-center">
                      <Sparkline data={kw.trend} />
                    </div>
                  </TableCell>
                  <TableCell className="text-right text-muted-foreground">{kw.searches.toLocaleString()}</TableCell>
                  <TableCell className="text-right text-muted-foreground">{kw.cpc}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </motion.div>
  );
}
