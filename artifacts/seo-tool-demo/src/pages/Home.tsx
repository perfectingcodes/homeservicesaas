import React from "react";
import { motion } from "framer-motion";
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer, Cell,
} from "recharts";
import {
  ArrowUpRight, MapPin, Star, Phone, PhoneMissed,
  Search, ChevronUp, ChevronDown, Navigation,
  Eye, MessageCircleReply, ThumbsUp, Filter,
  CheckCircle2, AlertCircle, MessageSquare, Image, Clock,
  TrendingUp, Mail, PhoneCall,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

/* ─── Mock data ────────────────────────────────────────── */

const visibilityData = [
  { month: "Jan", score: 45 }, { month: "Feb", score: 48 }, { month: "Mar", score: 52 },
  { month: "Apr", score: 51 }, { month: "May", score: 58 }, { month: "Jun", score: 63 },
  { month: "Jul", score: 62 }, { month: "Aug", score: 68 }, { month: "Sep", score: 69 },
  { month: "Oct", score: 71 }, { month: "Nov", score: 72 }, { month: "Dec", score: 73 },
];

const keywordRankings = [
  { keyword: "HVAC repair Austin", rank: 2, change: 1, volume: "4,500" },
  { keyword: "emergency plumber", rank: 3, change: 0, volume: "3,200" },
  { keyword: "AC installation near me", rank: 1, change: 2, volume: "2,800" },
  { keyword: "water heater replacement", rank: 5, change: -1, volume: "1,500" },
  { keyword: "furnace repair", rank: 4, change: 3, volume: "1,200" },
  { keyword: "commercial HVAC", rank: 7, change: 1, volume: "800" },
];

const localKeywords = [
  { id: 1, keyword: "HVAC repair Austin", rank: 2, trend: [4, 3, 3, 2, 2], searches: 4500 },
  { id: 2, keyword: "emergency plumber", rank: 3, trend: [5, 4, 3, 3, 3], searches: 3200 },
  { id: 3, keyword: "AC installation near me", rank: 1, trend: [2, 2, 1, 1, 1], searches: 2800 },
  { id: 4, keyword: "water heater replacement", rank: 5, trend: [3, 4, 4, 4, 5], searches: 1500 },
  { id: 5, keyword: "furnace repair", rank: 4, trend: [6, 5, 5, 4, 4], searches: 1200 },
];

const rankDistribution = [
  { name: "Top 3", count: 3 }, { name: "Pos 4-10", count: 8 },
  { name: "Pos 11-20", count: 12 }, { name: "Pos 21-50", count: 24 }, { name: "50+", count: 45 },
];

const ratingDist = [
  { rating: "5 Stars", count: 104 }, { rating: "4 Stars", count: 14 },
  { rating: "3 Stars", count: 4 }, { rating: "2 Stars", count: 2 }, { rating: "1 Star", count: 3 },
];

const mockReviews = [
  { id: 1, author: "Sarah Jenkins", date: "2 days ago", rating: 5, source: "Google", content: "Mike and his team were lifesavers! Our AC went out during the hottest week of the year. They arrived within 2 hours, diagnosed the issue quickly, and had it running again.", status: "unresponded" },
  { id: 2, author: "David Thompson", date: "1 week ago", rating: 5, source: "Google", content: "Excellent plumbing work. They installed a new tankless water heater. The crew was clean, respectful of our home, and explained everything clearly.", status: "responded" },
  { id: 3, author: "Marcus Ramirez", date: "2 weeks ago", rating: 4, source: "Yelp", content: "Good service overall. The technician was a bit late due to traffic, but did a thorough job fixing our leaky pipes. Would use them again.", status: "unresponded" },
  { id: 4, author: "Tom Baker", date: "1 month ago", rating: 1, source: "Google", content: "Called for an emergency repair and was told someone would be out that evening. No one showed up and no one called. Very disappointed.", status: "unresponded" },
];

const competitors = [
  { name: "Mike's HVAC & Plumbing", isSelf: true, rank: 3, reviews: 127, rating: 4.7, estTraffic: "1,240", visibility: 73 },
  { name: "City Plumbing Co.", isSelf: false, rank: 1, reviews: 342, rating: 4.8, estTraffic: "3,100", visibility: 92 },
  { name: "Pro HVAC Services", isSelf: false, rank: 2, reviews: 215, rating: 4.6, estTraffic: "2,450", visibility: 85 },
  { name: "QuickFix Plumbing", isSelf: false, rank: 4, reviews: 89, rating: 4.2, estTraffic: "850", visibility: 54 },
  { name: "Austin Reliable Air", isSelf: false, rank: 5, reviews: 45, rating: 3.9, estTraffic: "420", visibility: 38 },
];

const leads = [
  { id: 1, name: "Robert Chang", phone: "(512) 555-0142", jobType: "AC Repair", source: "Google", date: "Today, 9:14am", status: "New" },
  { id: 2, name: "Angela Torres", phone: "(512) 555-0289", jobType: "Plumbing Leak", source: "Yelp", date: "Today, 8:02am", status: "Contacted" },
  { id: 3, name: "James Whitfield", phone: "(512) 555-0361", jobType: "Furnace Install", source: "Google", date: "Yesterday, 4:45pm", status: "Booked" },
  { id: 4, name: "Priya Sharma", phone: "(512) 555-0477", jobType: "Drain Cleaning", source: "Direct", date: "Yesterday, 2:31pm", status: "Booked" },
  { id: 5, name: "Carlos Medina", phone: "(512) 555-0593", jobType: "Water Heater", source: "Google", date: "Mon, 11:00am", status: "Contacted" },
];

const gbpWeekly = [
  { day: "Mon", searches: 42, maps: 31 }, { day: "Tue", searches: 38, maps: 29 },
  { day: "Wed", searches: 55, maps: 44 }, { day: "Thu", searches: 61, maps: 50 },
  { day: "Fri", searches: 73, maps: 62 }, { day: "Sat", searches: 48, maps: 38 },
  { day: "Sun", searches: 22, maps: 19 },
];

const qaItems = [
  { id: 1, question: "Do you offer emergency HVAC repair after hours?", answer: "Yes! We offer 24/7 emergency service for heating and cooling issues. Call us any time.", answered: true, date: "3 weeks ago" },
  { id: 2, question: "What areas do you serve in the Austin metro?", answer: null, answered: false, date: "5 days ago" },
  { id: 3, question: "Do you offer free estimates for new AC installation?", answer: "Absolutely — we provide free, no-obligation estimates for all new system installations.", answered: true, date: "2 months ago" },
];

/* ─── Small helpers ─────────────────────────────────────── */

function Sparkline({ data }: { data: number[] }) {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const h = 24, w = 60;
  const points = data.map((v, i) => `${(i / (data.length - 1)) * w},${((v - min) / range) * h}`).join(" ");
  const positive = data[0] > data[data.length - 1];
  return (
    <svg width={w} height={h} className="overflow-visible">
      <polyline points={points} fill="none"
        stroke={positive ? "hsl(var(--chart-3))" : "hsl(var(--chart-5))"}
        strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star key={s} className={`w-4 h-4 ${s <= rating ? "fill-amber-500 text-amber-500" : "fill-muted text-muted"}`} />
      ))}
    </div>
  );
}

const statusStyles: Record<string, string> = {
  New: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 border-none",
  Contacted: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400 border-none",
  Booked: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 border-none",
};
const sourceStyles: Record<string, string> = {
  Google: "bg-primary/10 text-primary border-none",
  Yelp: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border-none",
  Direct: "bg-muted text-muted-foreground border-none",
};

const sectionVariant = {
  hidden: { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.45 } },
};

/* ─── Main component ────────────────────────────────────── */

export default function Home() {
  return (
    <div className="p-4 sm:p-8 space-y-16 max-w-7xl mx-auto pb-24">

      {/* ── DASHBOARD OVERVIEW ─────────────────────────── */}
      <motion.section
        id="dashboard"
        initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.1 }}
        variants={sectionVariant}
      >
        <div className="flex items-end justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-foreground">Dashboard</h2>
            <p className="text-muted-foreground mt-1 text-sm">Here's how your business is performing online.</p>
          </div>
          <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 border-none px-3 py-1 text-xs font-medium">
            Systems Healthy
          </Badge>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-6">
          {[
            { icon: Search, label: "Local Search Visibility", value: "73", sub: "/ 100", note: "+12% from last month", ok: true },
            { icon: MapPin, label: "Google Maps Ranking", value: "#3", sub: "", note: 'For "HVAC near me"', ok: null },
            { icon: Star, label: "Total Reviews", value: "127", sub: "4.7 Avg", note: "+8 new this month", ok: true },
            { icon: Phone, label: "Leads Generated", value: "34", sub: "", note: "+12% from last month", ok: true },
            { icon: PhoneMissed, label: "Missed Calls", value: "6", sub: "", note: "Requires attention", ok: false },
          ].map((s) => (
            <Card key={s.label}
              className={`shadow-sm border-border/50 relative overflow-hidden ${s.ok === false ? "bg-red-50/50 dark:bg-red-950/10 border-red-100 dark:border-red-900/30" : ""}`}
              data-testid={`card-stat-${s.label.toLowerCase().replace(/\s+/g, "-")}`}
            >
              <div className="absolute top-0 right-0 p-3 opacity-10">
                <s.icon className="w-12 h-12" />
              </div>
              <CardHeader className="pb-1">
                <CardTitle className={`text-xs font-medium flex items-center gap-1.5 ${s.ok === false ? "text-red-700 dark:text-red-400" : "text-muted-foreground"}`}>
                  <s.icon className="w-3.5 h-3.5" />
                  {s.label}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-baseline gap-1.5">
                  <span className={`text-3xl font-bold ${s.ok === false ? "text-red-600 dark:text-red-500" : ""}`}>{s.value}</span>
                  {s.sub && <span className="text-xs font-medium text-amber-500">{s.sub}</span>}
                </div>
                <div className={`mt-1 flex items-center text-xs font-medium ${s.ok === true ? "text-green-600" : s.ok === false ? "text-red-600" : "text-muted-foreground"}`}>
                  {s.ok === true && <ArrowUpRight className="w-3.5 h-3.5 mr-0.5" />}
                  {s.note}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="shadow-sm border-border/50">
            <CardHeader><CardTitle className="text-base">Search Visibility Trend</CardTitle></CardHeader>
            <CardContent>
              <div className="h-[240px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={visibilityData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="gradScore" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--accent))" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="hsl(var(--accent))" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                    <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
                    <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", borderColor: "hsl(var(--border))", borderRadius: "8px" }} />
                    <Area type="monotone" dataKey="score" stroke="hsl(var(--accent))" strokeWidth={3} fillOpacity={1} fill="url(#gradScore)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-sm border-border/50">
            <CardHeader><CardTitle className="text-base">Top Keyword Rankings</CardTitle></CardHeader>
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
                      <TableCell className="text-sm font-medium">{kw.keyword}</TableCell>
                      <TableCell className="text-right font-bold text-sm">#{kw.rank}</TableCell>
                      <TableCell className="text-right">
                        {kw.change > 0 ? <span className="flex items-center justify-end text-green-600 text-xs font-medium"><ChevronUp className="w-3.5 h-3.5" />{kw.change}</span>
                          : kw.change < 0 ? <span className="flex items-center justify-end text-red-600 text-xs font-medium"><ChevronDown className="w-3.5 h-3.5" />{Math.abs(kw.change)}</span>
                          : <span className="text-muted-foreground text-xs">-</span>}
                      </TableCell>
                      <TableCell className="text-right text-muted-foreground text-xs">{kw.volume}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </motion.section>

      {/* ── LOCAL RANKINGS ─────────────────────────────── */}
      <motion.section
        id="local-rankings"
        initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.1 }}
        variants={sectionVariant}
      >
        <div className="mb-6">
          <h2 className="text-2xl font-bold tracking-tight text-foreground">Local Rankings</h2>
          <p className="text-muted-foreground mt-1 text-sm">Track your visibility across local search and Google Maps.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2 shadow-sm border-border/50">
            <CardHeader>
              <CardTitle className="text-base">Google Maps Grid Tracker</CardTitle>
              <CardDescription className="text-xs">Average rank within 5-mile radius for "HVAC repair"</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="relative w-full h-[320px] rounded-xl overflow-hidden border border-border bg-accent/5">
                <div className="absolute inset-0 opacity-15"
                  style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 0h40v40H0V0zm20 20h20v20H20V20zM0 20h20v20H0V20z' fill='%239C92AC' fill-opacity='0.4' fill-rule='evenodd'/%3E%3C/svg%3E")` }}
                />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center z-10">
                  <div className="bg-primary text-primary-foreground font-bold px-3 py-1 rounded-full shadow-lg text-xs mb-1">Mike's HVAC</div>
                  <div className="w-10 h-10 bg-accent/20 rounded-full flex items-center justify-center animate-pulse">
                    <div className="w-3 h-3 bg-accent rounded-full shadow-[0_0_12px_rgba(249,115,22,0.5)]" />
                  </div>
                </div>
                <div className="absolute inset-0 grid grid-cols-5 grid-rows-5 p-6 gap-3">
                  {Array.from({ length: 25 }).map((_, i) => {
                    const row = Math.floor(i / 5), col = i % 5;
                    const dist = Math.abs(2 - row) + Math.abs(2 - col);
                    const rank = dist === 0 ? 1 : dist <= 1 ? (i % 3) + 1 : (i % 8) + 3;
                    return (
                      <div key={i} className="flex items-center justify-center">
                        <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold shadow-sm hover:scale-110 transition-transform cursor-pointer ${rank <= 3 ? "bg-green-500 text-white" : rank <= 10 ? "bg-amber-500 text-white" : "bg-red-400 text-white"}`}>
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
              <CardTitle className="text-base">Rank Distribution</CardTitle>
              <CardDescription className="text-xs">Positions across all tracked keywords</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[220px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={rankDistribution} layout="vertical" margin={{ top: 0, right: 24, left: 16, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="hsl(var(--border))" />
                    <XAxis type="number" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
                    <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "hsl(var(--foreground))" }} />
                    <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", borderColor: "hsl(var(--border))", borderRadius: "8px" }} cursor={{ fill: "hsl(var(--muted))" }} />
                    <Bar dataKey="count" fill="hsl(var(--accent))" radius={[0, 4, 4, 0]} barSize={20} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-4 pt-4 border-t border-border space-y-3">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">Total Tracked</span><span className="font-bold">92</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">In Top 3</span><span className="font-bold text-green-600">3 (3.2%)</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="shadow-sm border-border/50 mt-6">
          <CardHeader>
            <CardTitle className="text-base">Keyword Positions</CardTitle>
            <CardDescription className="text-xs">30-day trend for your top local search terms</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Keyword</TableHead>
                  <TableHead className="text-right">Rank</TableHead>
                  <TableHead className="text-center w-[80px]">30d Trend</TableHead>
                  <TableHead className="text-right">Monthly Vol</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {localKeywords.map((kw) => (
                  <TableRow key={kw.id}>
                    <TableCell className="font-medium text-sm">{kw.keyword}</TableCell>
                    <TableCell className="text-right">
                      <span className={`font-bold text-sm ${kw.rank <= 3 ? "text-green-600" : ""}`}>#{kw.rank}</span>
                    </TableCell>
                    <TableCell className="text-center"><div className="flex justify-center"><Sparkline data={kw.trend} /></div></TableCell>
                    <TableCell className="text-right text-muted-foreground text-sm">{kw.searches.toLocaleString()}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </motion.section>

      {/* ── REVIEWS ────────────────────────────────────── */}
      <motion.section
        id="reviews"
        initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.05 }}
        variants={sectionVariant}
      >
        <div className="mb-6">
          <h2 className="text-2xl font-bold tracking-tight text-foreground">Reputation Management</h2>
          <p className="text-muted-foreground mt-1 text-sm">Monitor and respond to customer reviews across all platforms.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <Card className="shadow-sm border-border/50">
            <CardContent className="pt-6 text-center space-y-2">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Average Rating</p>
              <div className="text-5xl font-bold text-amber-500">4.7</div>
              <div className="flex justify-center"><StarRating rating={5} /></div>
              <p className="text-xs text-muted-foreground">127 total reviews</p>
            </CardContent>
          </Card>
          <Card className="shadow-sm border-border/50">
            <CardContent className="pt-6 text-center space-y-2">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Response Rate</p>
              <div className="text-5xl font-bold text-green-600">84%</div>
              <p className="text-sm font-medium">Avg response: <span className="text-foreground">1.2 days</span></p>
              <p className="text-xs text-muted-foreground">3 reviews awaiting response</p>
            </CardContent>
          </Card>
          <Card className="shadow-sm border-border/50">
            <CardContent className="pt-6 h-[160px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={ratingDist} layout="vertical" margin={{ top: 0, right: 10, left: 0, bottom: 0 }}>
                  <XAxis type="number" hide />
                  <YAxis dataKey="rating" type="category" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} width={50} />
                  <Tooltip cursor={{ fill: "hsl(var(--muted))" }} contentStyle={{ borderRadius: "8px" }} />
                  <Bar dataKey="count" radius={[0, 4, 4, 0]} barSize={10}>
                    {ratingDist.map((_, index) => {
                      const colors = ["hsl(var(--chart-3))", "hsl(var(--chart-4))", "hsl(var(--muted-foreground))", "hsl(var(--chart-5))", "hsl(var(--chart-5))"];
                      return <Cell key={`cell-${index}`} fill={colors[index]} />;
                    })}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-3">
          {mockReviews.map((review) => (
            <Card key={review.id} className="shadow-sm border-border/50" data-testid={`card-review-${review.id}`}>
              <CardContent className="p-5">
                <div className="flex items-start gap-3">
                  <Avatar className="h-9 w-9 border border-border shrink-0">
                    <AvatarFallback className="bg-primary/10 text-primary text-xs font-medium">
                      {review.author.split(" ").map((n) => n[0]).join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 space-y-2 min-w-0">
                    <div className="flex items-start justify-between gap-2 flex-wrap">
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-semibold text-sm">{review.author}</span>
                          <span className="text-xs text-muted-foreground">• {review.date}</span>
                          <Badge variant="outline" className="text-[10px] font-normal px-1.5 py-0">{review.source}</Badge>
                        </div>
                        <div className="mt-1"><StarRating rating={review.rating} /></div>
                      </div>
                      {review.status === "unresponded"
                        ? <Badge variant="outline" className="bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 border-none text-xs shrink-0">Needs Response</Badge>
                        : <Badge variant="outline" className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 border-none text-xs shrink-0">Responded</Badge>}
                    </div>
                    <p className="text-sm text-foreground/80 leading-relaxed">"{review.content}"</p>
                    <div className="flex items-center gap-2 pt-1">
                      {review.status === "unresponded"
                        ? <Button size="sm" className="gap-1.5 h-7 text-xs" data-testid={`button-respond-${review.id}`}><MessageCircleReply className="w-3.5 h-3.5" />Write Response</Button>
                        : <Button size="sm" variant="outline" className="gap-1.5 h-7 text-xs text-muted-foreground"><MessageCircleReply className="w-3.5 h-3.5" />Edit Response</Button>}
                      {review.rating === 5 && (
                        <Button size="sm" variant="ghost" className="gap-1.5 h-7 text-xs text-muted-foreground"><ThumbsUp className="w-3.5 h-3.5" />Share</Button>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </motion.section>

      {/* ── COMPETITORS ────────────────────────────────── */}
      <motion.section
        id="competitors"
        initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.05 }}
        variants={sectionVariant}
      >
        <div className="mb-6">
          <h2 className="text-2xl font-bold tracking-tight text-foreground">Competitor Analysis</h2>
          <p className="text-muted-foreground mt-1 text-sm">See how you stack up against the top players in your market.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <Card className="shadow-sm border-border/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-medium text-muted-foreground">Market Position</CardTitle>
            </CardHeader>
            <CardContent><div className="text-3xl font-bold">#3</div><p className="text-xs text-muted-foreground mt-1">Out of 24 local businesses</p></CardContent>
          </Card>
          <Card className="shadow-sm border-border/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-medium text-muted-foreground">Gap to #1</CardTitle>
            </CardHeader>
            <CardContent><div className="text-3xl font-bold text-accent">19 pts</div><p className="text-xs text-muted-foreground mt-1">Visibility score vs City Plumbing</p></CardContent>
          </Card>
          <Card className="shadow-sm border-border/50 bg-amber-50/50 dark:bg-amber-950/10 border-amber-100 dark:border-amber-900/30">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-medium text-amber-800 dark:text-amber-400">Primary Weakness</CardTitle>
            </CardHeader>
            <CardContent><div className="text-base font-bold text-amber-900 dark:text-amber-300">Review Volume</div><p className="text-xs text-amber-700/80 dark:text-amber-400/80 mt-1">Top competitors have 2x more reviews.</p></CardContent>
          </Card>
        </div>

        <Card className="shadow-sm border-border/50">
          <CardHeader>
            <CardTitle className="text-base">Competitor Leaderboard</CardTitle>
            <CardDescription className="text-xs">Based on your tracked keywords in the Austin area</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Business</TableHead>
                  <TableHead className="text-center">Avg Rank</TableHead>
                  <TableHead className="text-center">Reviews / Rating</TableHead>
                  <TableHead className="text-right hidden sm:table-cell">Est. Traffic/mo</TableHead>
                  <TableHead className="text-right w-[180px]">Visibility</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {competitors.map((comp) => (
                  <TableRow key={comp.name} className={comp.isSelf ? "bg-accent/5" : ""}>
                    <TableCell className="font-medium text-sm">
                      <div className="flex items-center gap-2">
                        {comp.name}
                        {comp.isSelf && <Badge className="bg-accent text-accent-foreground text-[10px] px-1.5 py-0">You</Badge>}
                      </div>
                    </TableCell>
                    <TableCell className="text-center font-bold text-sm">#{comp.rank}</TableCell>
                    <TableCell className="text-center text-sm">
                      {comp.reviews} <span className="text-muted-foreground">({comp.rating}★)</span>
                    </TableCell>
                    <TableCell className="text-right text-muted-foreground text-sm hidden sm:table-cell">{comp.estTraffic}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <div className="w-[80px] h-1.5 rounded-full bg-primary/20 overflow-hidden hidden sm:block">
                          <div className={`h-full rounded-full ${comp.isSelf ? "bg-accent" : "bg-primary"}`} style={{ width: `${comp.visibility}%` }} />
                        </div>
                        <span className="font-bold text-sm">{comp.visibility}</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </motion.section>

      {/* ── LEADS ──────────────────────────────────────── */}
      <motion.section
        id="leads"
        initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.05 }}
        variants={sectionVariant}
      >
        <div className="mb-6">
          <h2 className="text-2xl font-bold tracking-tight text-foreground">Lead Tracking</h2>
          <p className="text-muted-foreground mt-1 text-sm">Every call and form submission that came through your online presence.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <Card className="shadow-sm border-border/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-medium text-muted-foreground flex items-center gap-1.5"><Phone className="w-3.5 h-3.5" />Total This Month</CardTitle>
            </CardHeader>
            <CardContent><div className="text-3xl font-bold" data-testid="stat-total-leads">34</div><div className="mt-1 flex items-center text-xs text-green-600 font-medium"><TrendingUp className="w-3.5 h-3.5 mr-0.5" />+12% from last month</div></CardContent>
          </Card>
          <Card className="shadow-sm border-border/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-medium text-muted-foreground flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" />Awaiting Response</CardTitle>
            </CardHeader>
            <CardContent><div className="text-3xl font-bold text-amber-500" data-testid="stat-awaiting">2</div><div className="mt-1 text-xs text-muted-foreground">New leads need follow-up</div></CardContent>
          </Card>
          <Card className="shadow-sm border-border/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-medium text-muted-foreground flex items-center gap-1.5"><TrendingUp className="w-3.5 h-3.5" />Jobs Booked</CardTitle>
            </CardHeader>
            <CardContent><div className="text-3xl font-bold text-green-600" data-testid="stat-booked">4</div><div className="mt-1 text-xs text-muted-foreground">50% close rate</div></CardContent>
          </Card>
        </div>

        <Card className="shadow-sm border-border/50">
          <CardHeader>
            <CardTitle className="text-base">Recent Leads</CardTitle>
            <CardDescription className="text-xs">Inbound contacts from the last 7 days</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Job Type</TableHead>
                  <TableHead>Source</TableHead>
                  <TableHead className="hidden sm:table-cell">Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {leads.map((lead) => (
                  <TableRow key={lead.id} data-testid={`row-lead-${lead.id}`}>
                    <TableCell>
                      <div className="font-medium text-sm">{lead.name}</div>
                      <div className="text-xs text-muted-foreground">{lead.phone}</div>
                    </TableCell>
                    <TableCell className="text-sm">{lead.jobType}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={`text-xs ${sourceStyles[lead.source] ?? ""}`}>{lead.source}</Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground text-xs hidden sm:table-cell">{lead.date}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={`text-xs ${statusStyles[lead.status] ?? ""}`}>{lead.status}</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button size="sm" variant="ghost" className="h-7 w-7 p-0" data-testid={`button-call-${lead.id}`}><PhoneCall className="w-3.5 h-3.5" /></Button>
                        <Button size="sm" variant="ghost" className="h-7 w-7 p-0" data-testid={`button-email-${lead.id}`}><Mail className="w-3.5 h-3.5" /></Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </motion.section>

      {/* ── GOOGLE BUSINESS ────────────────────────────── */}
      <motion.section
        id="google-business"
        initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.05 }}
        variants={sectionVariant}
      >
        <div className="flex items-end justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-foreground">Google Business Profile</h2>
            <p className="text-muted-foreground mt-1 text-sm">Monitor how customers find and interact with your listing.</p>
          </div>
          <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 border-none px-3 py-1 text-xs shrink-0">
            <CheckCircle2 className="w-3 h-3 mr-1" />Profile Verified
          </Badge>
        </div>

        <Card className="shadow-sm border-border/50 mb-6">
          <CardContent className="p-5">
            <div className="flex items-start gap-4">
              <div className="h-16 w-16 rounded-xl bg-accent/20 flex items-center justify-center text-2xl font-bold text-accent shrink-0">MH</div>
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-bold">Mike's HVAC & Plumbing</h3>
                <p className="text-muted-foreground text-xs">Plumber · HVAC Contractor — 3412 Lamar Blvd, Austin, TX 78705</p>
                <div className="flex items-center gap-4 mt-2 flex-wrap">
                  <span className="flex items-center gap-1 text-sm font-medium text-amber-500"><Star className="w-3.5 h-3.5 fill-amber-500" />4.7 <span className="text-muted-foreground font-normal text-xs">(127 reviews)</span></span>
                  <span className="flex items-center gap-1 text-xs text-muted-foreground"><Clock className="w-3.5 h-3.5" />Open 24/7</span>
                  <span className="flex items-center gap-1 text-xs text-muted-foreground"><Image className="w-3.5 h-3.5" />38 photos</span>
                </div>
              </div>
              <Button variant="outline" size="sm" className="shrink-0" data-testid="button-edit-profile">Edit Profile</Button>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          {[
            { icon: Eye, label: "Profile Views", value: "1,482", change: "+18%", ok: true },
            { icon: Search, label: "Search Impressions", value: "8,340", change: "+24%", ok: true },
            { icon: Navigation, label: "Direction Requests", value: "214", change: "+9%", ok: true },
            { icon: Phone, label: "Calls from Profile", value: "87", change: "-3%", ok: false },
          ].map((s) => (
            <Card key={s.label} className="shadow-sm border-border/50">
              <CardHeader className="pb-1">
                <CardTitle className="text-xs font-medium text-muted-foreground flex items-center gap-1.5"><s.icon className="w-3.5 h-3.5" />{s.label}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{s.value}</div>
                <div className={`mt-1 text-xs font-medium ${s.ok ? "text-green-600" : "text-red-500"}`}>{s.change} this month</div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="shadow-sm border-border/50">
            <CardHeader>
              <CardTitle className="text-base">Weekly Profile Activity</CardTitle>
              <CardDescription className="text-xs">Search impressions vs. Maps views by day</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[220px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={gbpWeekly} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                    <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
                    <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", borderColor: "hsl(var(--border))", borderRadius: "8px" }} />
                    <Bar dataKey="searches" name="Search Impressions" fill="hsl(var(--primary))" radius={[3, 3, 0, 0]} barSize={14} />
                    <Bar dataKey="maps" name="Maps Views" fill="hsl(var(--accent))" radius={[3, 3, 0, 0]} barSize={14} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-sm border-border/50">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2"><MessageSquare className="w-4 h-4" />Customer Q&amp;A</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {qaItems.map((item) => (
                <div key={item.id} className="rounded-lg border border-border p-3 space-y-2" data-testid={`card-qa-${item.id}`}>
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm font-medium">Q: {item.question}</p>
                    {item.answered
                      ? <Badge variant="outline" className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 border-none text-[10px] shrink-0"><CheckCircle2 className="w-2.5 h-2.5 mr-1" />Answered</Badge>
                      : <Badge variant="outline" className="bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400 border-none text-[10px] shrink-0"><AlertCircle className="w-2.5 h-2.5 mr-1" />Needs Answer</Badge>}
                  </div>
                  {item.answer
                    ? <p className="text-xs text-muted-foreground pl-3 border-l-2 border-accent">A: {item.answer}</p>
                    : <Button size="sm" className="h-7 text-xs" data-testid={`button-answer-${item.id}`}>Write an Answer</Button>}
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </motion.section>
    </div>
  );
}
