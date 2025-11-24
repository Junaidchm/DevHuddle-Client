"use client";

import { Card, CardContent } from "@/components/ui/card";
import { BellOff } from "lucide-react";

export const NotificationEmpty = () => {
  return (
    <Card>
      <CardContent className="flex flex-col items-center justify-center gap-4 p-16 text-center">
        <BellOff className="w-12 h-12 text-muted-foreground" />
        <h3 className="text-lg font-semibold">All caught up!</h3>
        <p className="text-sm text-muted-foreground">You have no new notifications.</p>
      </CardContent>
    </Card>
  );
};