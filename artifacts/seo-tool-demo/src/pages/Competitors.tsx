import React from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Target, Users, TrendingUp, AlertTriangle } from "lucide-react";

const competitors = [
  {
    name: "Mike's HVAC & Plumbing",
    isSelf: true,
    rank: 3,
    reviews: 127,
    rating: 4.7,
    estTraffic: "1,240",
    visibility: 73,
  },
  {
    name: "City Plumbing Co.",
    isSelf: false,
    rank: 1,
    reviews: 342,
    rating: 4.8,
    estTraffic: "3,100",
    visibility: 92,
  },
  {
    name: "Pro HVAC Services",
    isSelf: false,
    rank: 2,
    reviews: 215,
    rating: 4.6,
    estTraffic: "2,450",
    visibility: 85,
  },
  {
    name: "QuickFix Plumbing",
    isSelf: false,
    rank: 4,
    reviews: 89,
    rating: 4.2,
    estTraffic: "850",
    visibility: 54,
  },
  {
    name: "Austin Reliable Air",
    isSelf: false,
    rank: 5,
    reviews: 45,
    rating: 3.9,
    estTraffic: "420",
    visibility: 38,
  }
];

export default function Competitors() {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="p-8 space-y-8 max-w-7xl mx-auto"
    >
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Competitor Analysis</h1>
        <p className="text-muted-foreground mt-1">See how you stack up against the top players in your market.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="shadow-sm border-border/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Target className="w-4 h-4" />
              Market Position
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold font-display">#3</div>
            <p className="text-sm text-muted-foreground mt-1">Out of 24 tracked local businesses</p>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-border/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Gap to #1
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold font-display text-accent">19 pts</div>
            <p className="text-sm text-muted-foreground mt-1">Visibility score difference to City Plumbing</p>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-border/50 bg-amber-50/50 dark:bg-amber-950/10 border-amber-100 dark:border-amber-900/30">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-amber-800 dark:text-amber-400 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" />
              Primary Weakness
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold text-amber-900 dark:text-amber-300">Review Volume</div>
            <p className="text-sm text-amber-700/80 dark:text-amber-400/80 mt-1">Top competitors have 2x more reviews.</p>
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-sm border-border/50">
        <CardHeader>
          <CardTitle>Competitor Leaderboard</CardTitle>
          <CardDescription>Metrics based on your primary tracked keywords in Austin area</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[300px]">Business Name</TableHead>
                <TableHead className="text-center">Avg Rank</TableHead>
                <TableHead className="text-center">Reviews / Rating</TableHead>
                <TableHead className="text-right">Est. Traffic/mo</TableHead>
                <TableHead className="text-right w-[200px]">Visibility Score</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {competitors.map((comp) => (
                <TableRow key={comp.name} className={comp.isSelf ? "bg-accent/5" : ""}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      {comp.name}
                      {comp.isSelf && <Badge className="bg-accent text-accent-foreground ml-2">You</Badge>}
                    </div>
                  </TableCell>
                  <TableCell className="text-center font-display font-bold">
                    #{comp.rank}
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="flex items-center justify-center gap-2">
                      <span className="font-medium">{comp.reviews}</span>
                      <span className="text-muted-foreground text-sm">({comp.rating}★)</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right text-muted-foreground">
                    {comp.estTraffic}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-3">
                      <div className="w-[100px] h-2 rounded-full bg-primary/20 overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${comp.isSelf ? "bg-accent" : "bg-primary"}`}
                          style={{ width: `${comp.visibility}%` }}
                        />
                      </div>
                      <span className="font-bold text-sm w-8">{comp.visibility}</span>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </motion.div>
  );
}
