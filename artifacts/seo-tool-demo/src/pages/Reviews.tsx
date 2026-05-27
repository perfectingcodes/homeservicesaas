import React from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Star, MessageCircleReply, ThumbsUp, Filter } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

const ratingDist = [
  { rating: "5 Stars", count: 104, color: "hsl(var(--chart-3))" },
  { rating: "4 Stars", count: 14, color: "hsl(var(--chart-4))" },
  { rating: "3 Stars", count: 4, color: "hsl(var(--muted-foreground))" },
  { rating: "2 Stars", count: 2, color: "hsl(var(--chart-5))" },
  { rating: "1 Star", count: 3, color: "hsl(var(--chart-5))" },
];

const mockReviews = [
  {
    id: 1,
    author: "Sarah Jenkins",
    date: "2 days ago",
    rating: 5,
    source: "Google",
    content: "Mike and his team were lifesavers! Our AC went out during the hottest week of the year. They arrived within 2 hours of calling, diagnosed the issue quickly, and had it running again. Very professional and transparent about pricing.",
    status: "unresponded"
  },
  {
    id: 2,
    author: "David Thompson",
    date: "1 week ago",
    rating: 5,
    source: "Google",
    content: "Excellent plumbing work. They installed a new tankless water heater for us. The crew was clean, respectful of our home, and explained everything clearly.",
    status: "responded"
  },
  {
    id: 3,
    author: "Marcus Ramirez",
    date: "2 weeks ago",
    rating: 4,
    source: "Yelp",
    content: "Good service overall. The technician was a bit late due to traffic, but did a thorough job fixing our leaky pipes. Would use them again.",
    status: "unresponded"
  },
  {
    id: 4,
    author: "Elena Rodriguez",
    date: "3 weeks ago",
    rating: 5,
    source: "Google",
    content: "We've used Mike's HVAC for our business maintenance for years. Reliable, honest, and they know what they're doing. Highly recommend for commercial work.",
    status: "responded"
  },
  {
    id: 5,
    author: "Tom Baker",
    date: "1 month ago",
    rating: 1,
    source: "Google",
    content: "Called for an emergency repair and was told someone would be out that evening. No one showed up and no one called. Very disappointed.",
    status: "unresponded"
  }
];

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star 
          key={star} 
          className={`w-4 h-4 ${star <= rating ? "fill-amber-500 text-amber-500" : "fill-muted text-muted"}`} 
        />
      ))}
    </div>
  );
}

export default function Reviews() {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="p-8 space-y-8 max-w-7xl mx-auto"
    >
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Reputation Management</h1>
        <p className="text-muted-foreground mt-1">Monitor and respond to customer reviews across all platforms.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="shadow-sm border-border/50">
          <CardContent className="pt-6">
            <div className="text-center space-y-2">
              <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Average Rating</h3>
              <div className="text-5xl font-bold font-display text-amber-500">4.7</div>
              <div className="flex justify-center pb-2">
                <StarRating rating={5} />
              </div>
              <p className="text-sm text-muted-foreground">Based on 127 total reviews</p>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-border/50">
          <CardContent className="pt-6">
            <div className="text-center space-y-2">
              <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Response Rate</h3>
              <div className="text-5xl font-bold font-display text-green-600">84%</div>
              <p className="text-sm font-medium mt-2">Avg. Response Time: <span className="text-foreground">1.2 days</span></p>
              <p className="text-xs text-muted-foreground">You have 3 reviews waiting for a response</p>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-border/50">
          <CardContent className="pt-6 h-[180px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={ratingDist} layout="vertical" margin={{ top: 0, right: 10, left: 0, bottom: 0 }}>
                <XAxis type="number" hide />
                <YAxis dataKey="rating" type="category" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} width={50} />
                <Tooltip cursor={{fill: 'hsl(var(--muted))'}} contentStyle={{ borderRadius: '8px' }} />
                <Bar dataKey="count" radius={[0, 4, 4, 0]} barSize={12}>
                  {ratingDist.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Review Feed</h2>
          <Button variant="outline" size="sm" className="gap-2">
            <Filter className="w-4 h-4" />
            Filter
          </Button>
        </div>

        <div className="space-y-4">
          {mockReviews.map((review) => (
            <Card key={review.id} className="shadow-sm border-border/50 overflow-hidden">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <Avatar className="h-10 w-10 border border-border">
                    <AvatarFallback className="bg-primary/10 text-primary font-medium">
                      {review.author.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1 space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-semibold">{review.author}</h4>
                          <span className="text-xs text-muted-foreground">• {review.date}</span>
                        </div>
                        <div className="flex items-center gap-3 mt-1">
                          <StarRating rating={review.rating} />
                          <Badge variant="outline" className="text-[10px] font-normal px-1.5 py-0">
                            {review.source}
                          </Badge>
                        </div>
                      </div>
                      
                      {review.status === 'unresponded' ? (
                        <Badge variant="destructive" className="bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 border-none">
                          Needs Response
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 border-none">
                          Responded
                        </Badge>
                      )}
                    </div>
                    
                    <p className="text-sm text-foreground/90 leading-relaxed">
                      "{review.content}"
                    </p>

                    <div className="pt-2 flex items-center gap-3">
                      {review.status === 'unresponded' ? (
                        <Button size="sm" className="gap-2 font-medium">
                          <MessageCircleReply className="w-4 h-4" />
                          Write Response
                        </Button>
                      ) : (
                        <Button size="sm" variant="outline" className="gap-2 text-muted-foreground">
                          <MessageCircleReply className="w-4 h-4" />
                          Edit Response
                        </Button>
                      )}
                      
                      {review.rating === 5 && (
                        <Button size="sm" variant="ghost" className="gap-2 text-muted-foreground">
                          <ThumbsUp className="w-4 h-4" />
                          Share to Social
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
