import React from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Eye, Search, Navigation, Phone, Image, Star, MessageSquare, Clock, CheckCircle2, AlertCircle } from "lucide-react";

const weeklyViews = [
  { day: "Mon", searches: 42, maps: 31 },
  { day: "Tue", searches: 38, maps: 29 },
  { day: "Wed", searches: 55, maps: 44 },
  { day: "Thu", searches: 61, maps: 50 },
  { day: "Fri", searches: 73, maps: 62 },
  { day: "Sat", searches: 48, maps: 38 },
  { day: "Sun", searches: 22, maps: 19 },
];

const monthlyStats = [
  { label: "Profile Views", value: "1,482", change: "+18%", icon: Eye, positive: true },
  { label: "Search Impressions", value: "8,340", change: "+24%", icon: Search, positive: true },
  { label: "Direction Requests", value: "214", change: "+9%", icon: Navigation, positive: true },
  { label: "Calls from Profile", value: "87", change: "-3%", icon: Phone, positive: false },
];

const qaItems = [
  {
    id: 1,
    question: "Do you offer emergency HVAC repair after hours?",
    answer: "Yes! We offer 24/7 emergency service for heating and cooling issues. Call us any time.",
    answered: true,
    date: "3 weeks ago",
  },
  {
    id: 2,
    question: "What areas do you serve in the Austin metro?",
    answer: null,
    answered: false,
    date: "5 days ago",
  },
  {
    id: 3,
    question: "Do you offer free estimates for new AC installation?",
    answer: "Absolutely — we provide free, no-obligation estimates for all new system installations.",
    answered: true,
    date: "2 months ago",
  },
];

export default function GoogleBusiness() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="p-8 space-y-8 max-w-7xl mx-auto"
    >
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Google Business Profile</h1>
          <p className="text-muted-foreground mt-1">Monitor how customers find and interact with your listing.</p>
        </div>
        <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 border-none px-3 py-1">
          <CheckCircle2 className="w-3.5 h-3.5 mr-1.5" />
          Profile Verified
        </Badge>
      </div>

      {/* Profile Summary Card */}
      <Card className="shadow-sm border-border/50">
        <CardContent className="p-6">
          <div className="flex items-start gap-6">
            <div className="h-20 w-20 rounded-xl bg-accent/20 flex items-center justify-center text-3xl font-bold text-accent shrink-0">
              MH
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-xl font-bold text-foreground">Mike's HVAC & Plumbing</h2>
              <p className="text-muted-foreground text-sm mt-0.5">Plumber · HVAC Contractor</p>
              <p className="text-muted-foreground text-sm">3412 Lamar Blvd, Austin, TX 78705</p>
              <div className="flex items-center gap-4 mt-3">
                <div className="flex items-center gap-1.5 text-sm font-medium text-amber-500">
                  <Star className="w-4 h-4 fill-amber-500" />
                  4.7
                  <span className="text-muted-foreground font-normal">(127 reviews)</span>
                </div>
                <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                  <Clock className="w-4 h-4" />
                  Open 24/7
                </div>
                <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                  <Image className="w-4 h-4" />
                  38 photos
                </div>
              </div>
            </div>
            <Button variant="outline" size="sm" data-testid="button-edit-profile">
              Edit Profile
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Monthly Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {monthlyStats.map((stat) => (
          <Card key={stat.label} className="shadow-sm border-border/50" data-testid={`card-stat-${stat.label.toLowerCase().replace(/\s+/g, "-")}`}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <stat.icon className="w-4 h-4" />
                {stat.label}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stat.value}</div>
              <div className={`mt-1 text-sm font-medium ${stat.positive ? "text-green-600" : "text-red-500"}`}>
                {stat.change} this month
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Weekly Views Chart */}
      <Card className="shadow-sm border-border/50">
        <CardHeader>
          <CardTitle>Weekly Profile Activity</CardTitle>
          <CardDescription>Search impressions vs. Maps views by day of week</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[280px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyViews} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} />
                <Tooltip
                  contentStyle={{ backgroundColor: "hsl(var(--card))", borderColor: "hsl(var(--border))", borderRadius: "8px" }}
                  itemStyle={{ color: "hsl(var(--foreground))" }}
                />
                <Bar dataKey="searches" name="Search Impressions" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} barSize={18} />
                <Bar dataKey="maps" name="Maps Views" fill="hsl(var(--accent))" radius={[4, 4, 0, 0]} barSize={18} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Q&A Section */}
      <Card className="shadow-sm border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5" />
            Customer Q&amp;A
          </CardTitle>
          <CardDescription>Questions asked on your Google Business profile</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {qaItems.map((item) => (
            <div key={item.id} className="rounded-lg border border-border p-4 space-y-3" data-testid={`card-qa-${item.id}`}>
              <div className="flex items-start justify-between gap-4">
                <p className="font-medium text-sm text-foreground">Q: {item.question}</p>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-xs text-muted-foreground">{item.date}</span>
                  {item.answered ? (
                    <Badge variant="outline" className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 border-none text-xs">
                      <CheckCircle2 className="w-3 h-3 mr-1" />
                      Answered
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400 border-none text-xs">
                      <AlertCircle className="w-3 h-3 mr-1" />
                      Needs Answer
                    </Badge>
                  )}
                </div>
              </div>
              {item.answer ? (
                <p className="text-sm text-muted-foreground pl-4 border-l-2 border-accent">
                  A: {item.answer}
                </p>
              ) : (
                <Button size="sm" data-testid={`button-answer-${item.id}`}>
                  Write an Answer
                </Button>
              )}
            </div>
          ))}
        </CardContent>
      </Card>
    </motion.div>
  );
}
