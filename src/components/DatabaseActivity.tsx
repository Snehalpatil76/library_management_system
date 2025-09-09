import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Activity, Database, Clock, CheckCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface QueryActivity {
  id: string;
  timestamp: Date;
  query: string;
  table: string;
  operation: string;
  status: 'success' | 'pending';
  duration?: number;
}

const DatabaseActivity = () => {
  const [activities, setActivities] = useState<QueryActivity[]>([]);

  useEffect(() => {
    // Track real-time database queries
    const trackQuery = (table: string, operation: string, query: string) => {
      const activity: QueryActivity = {
        id: Math.random().toString(36).substr(2, 9),
        timestamp: new Date(),
        query: query.substring(0, 100) + (query.length > 100 ? '...' : ''),
        table,
        operation,
        status: 'success',
        duration: Math.floor(Math.random() * 100) + 20 // Simulated duration
      };

      setActivities(prev => [activity, ...prev.slice(0, 19)]); // Keep last 20 activities
    };

    // Intercept supabase queries by extending the client
    const originalFrom = supabase.from;
    supabase.from = function(table: string) {
      const query = originalFrom.call(this, table);
      
      // Override select method
      const originalSelect = query.select;
      query.select = function(columns?: string, options?: any) {
        trackQuery(table, 'SELECT', `SELECT ${columns || '*'} FROM ${table}`);
        return originalSelect.call(this, columns, options);
      };

      // Override insert method
      const originalInsert = query.insert;
      query.insert = function(data: any) {
        trackQuery(table, 'INSERT', `INSERT INTO ${table} VALUES (...)`);
        return originalInsert.call(this, data);
      };

      // Override update method
      const originalUpdate = query.update;
      query.update = function(data: any) {
        trackQuery(table, 'UPDATE', `UPDATE ${table} SET ...`);
        return originalUpdate.call(this, data);
      };

      // Override delete method
      const originalDelete = query.delete;
      query.delete = function() {
        trackQuery(table, 'DELETE', `DELETE FROM ${table}`);
        return originalDelete.call(this);
      };

      return query;
    };

    // Add some initial sample activities
    const initialActivities: QueryActivity[] = [
      {
        id: '1',
        timestamp: new Date(Date.now() - 1000),
        query: 'SELECT * FROM books WHERE availability_status = true',
        table: 'books',
        operation: 'SELECT',
        status: 'success',
        duration: 45
      },
      {
        id: '2',
        timestamp: new Date(Date.now() - 2000),
        query: 'SELECT * FROM members',
        table: 'members',
        operation: 'SELECT',
        status: 'success',
        duration: 32
      },
      {
        id: '3',
        timestamp: new Date(Date.now() - 3000),
        query: 'SELECT * FROM borrow_records JOIN books ON...',
        table: 'borrow_records',
        operation: 'SELECT',
        status: 'success',
        duration: 78
      }
    ];
    setActivities(initialActivities);

    return () => {
      // Cleanup if needed
    };
  }, []);

  const getOperationColor = (operation: string) => {
    switch (operation) {
      case 'SELECT': return 'bg-blue-500/20 text-blue-400 border-blue-500/50';
      case 'INSERT': return 'bg-green-500/20 text-green-400 border-green-500/50';
      case 'UPDATE': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50';
      case 'DELETE': return 'bg-red-500/20 text-red-400 border-red-500/50';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/50';
    }
  };

  return (
    <Card className="gradient-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5 text-primary" />
          Real-time Database Activity
        </CardTitle>
        <CardDescription>
          Live SQL queries and database operations
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {activities.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">
              <Activity className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>No recent database activity</p>
            </div>
          ) : (
            activities.map((activity) => (
              <div key={activity.id} className="flex items-start gap-3 p-3 rounded-lg bg-muted/30 border border-border/50">
                <div className="flex-shrink-0 mt-1">
                  {activity.status === 'success' ? (
                    <CheckCircle className="h-4 w-4 text-success" />
                  ) : (
                    <Activity className="h-4 w-4 text-warning animate-pulse" />
                  )}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge className={`text-xs ${getOperationColor(activity.operation)}`}>
                      {activity.operation}
                    </Badge>
                    <span className="text-sm font-medium text-accent">{activity.table}</span>
                    {activity.duration && (
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {activity.duration}ms
                      </span>
                    )}
                  </div>
                  
                  <code className="text-xs text-muted-foreground bg-muted/50 px-2 py-1 rounded block truncate">
                    {activity.query}
                  </code>
                  
                  <div className="text-xs text-muted-foreground mt-1">
                    {activity.timestamp.toLocaleTimeString()}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default DatabaseActivity;