import React, { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Phone, TrendingUp, Clock, Search, PhoneCall, Mail } from "lucide-react";

const leads = [
  { id: 1, name: "Robert Chang", phone: "(512) 555-0142", jobType: "AC Repair", source: "Google", date: "Today, 9:14am", status: "New" },
  { id: 2, name: "Angela Torres", phone: "(512) 555-0289", jobType: "Plumbing Leak", source: "Yelp", date: "Today, 8:02am", status: "Contacted" },
  { id: 3, name: "James Whitfield", phone: "(512) 555-0361", jobType: "Furnace Install", source: "Google", date: "Yesterday, 4:45pm", status: "Booked" },
  { id: 4, name: "Priya Sharma", phone: "(512) 555-0477", jobType: "Drain Cleaning", source: "Direct", date: "Yesterday, 2:31pm", status: "Booked" },
  { id: 5, name: "Carlos Medina", phone: "(512) 555-0593", jobType: "Water Heater", source: "Google", date: "Mon, 11:00am", status: "Contacted" },
  { id: 6, name: "Sandra Hill", phone: "(512) 555-0612", jobType: "AC Tune-Up", source: "Yelp", date: "Mon, 9:17am", status: "Booked" },
  { id: 7, name: "Michael Drew", phone: "(512) 555-0734", jobType: "Emergency Plumbing", source: "Google", date: "Sun, 10:55pm", status: "New" },
  { id: 8, name: "Tanya Brooks", phone: "(512) 555-0851", jobType: "HVAC Maintenance", source: "Direct", date: "Fri, 3:20pm", status: "Booked" },
];

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

export default function Leads() {
  const [search, setSearch] = useState("");

  const filtered = leads.filter(
    (l) =>
      l.name.toLowerCase().includes(search.toLowerCase()) ||
      l.jobType.toLowerCase().includes(search.toLowerCase())
  );

  const newCount = leads.filter((l) => l.status === "New").length;
  const bookedCount = leads.filter((l) => l.status === "Booked").length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="p-8 space-y-8 max-w-7xl mx-auto"
    >
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Lead Tracking</h1>
        <p className="text-muted-foreground mt-1">Every call and form submission that came through your online presence.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="shadow-sm border-border/50 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <Phone className="w-16 h-16" />
          </div>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Phone className="w-4 h-4" />
              Total Leads This Month
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold" data-testid="stat-total-leads">34</div>
            <div className="mt-2 flex items-center text-sm text-green-600 font-medium">
              <TrendingUp className="w-4 h-4 mr-1" />
              +12% from last month
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-border/50 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <Clock className="w-16 h-16" />
          </div>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Awaiting Response
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-amber-500" data-testid="stat-awaiting">{newCount}</div>
            <div className="mt-2 text-sm text-muted-foreground">New leads need follow-up</div>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-border/50 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <TrendingUp className="w-16 h-16" />
          </div>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Jobs Booked
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-green-600" data-testid="stat-booked">{bookedCount}</div>
            <div className="mt-2 text-sm text-muted-foreground">
              {Math.round((bookedCount / leads.length) * 100)}% close rate
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-sm border-border/50">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Recent Leads</CardTitle>
            <CardDescription>Inbound contacts from the last 7 days</CardDescription>
          </div>
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search leads..."
              className="pl-9 w-[220px]"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              data-testid="input-search-leads"
            />
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Job Type</TableHead>
                <TableHead>Source</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((lead) => (
                <TableRow key={lead.id} data-testid={`row-lead-${lead.id}`}>
                  <TableCell>
                    <div className="font-medium">{lead.name}</div>
                    <div className="text-xs text-muted-foreground">{lead.phone}</div>
                  </TableCell>
                  <TableCell className="font-medium">{lead.jobType}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={sourceStyles[lead.source] ?? ""}>
                      {lead.source}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">{lead.date}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={statusStyles[lead.status] ?? ""}>
                      {lead.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button size="sm" variant="ghost" className="h-8 w-8 p-0" data-testid={`button-call-${lead.id}`}>
                        <PhoneCall className="w-4 h-4" />
                      </Button>
                      <Button size="sm" variant="ghost" className="h-8 w-8 p-0" data-testid={`button-email-${lead.id}`}>
                        <Mail className="w-4 h-4" />
                      </Button>
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
