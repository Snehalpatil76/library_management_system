import React, { useState } from "react";
import Layout from "@/components/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Calendar, Clock, User, BookOpen, AlertTriangle } from "lucide-react";
import { useLibrary } from "@/hooks/useLibrary";
import { format, isAfter, differenceInDays } from "date-fns";

const MemberDashboard = () => {
  const [selectedMember, setSelectedMember] = useState<string>('');
  const { members, borrowRecords, returnBook, loading } = useLibrary();

  const selectedMemberData = members.find(m => m.member_id === selectedMember);
  const memberBorrowRecords = borrowRecords.filter(
    record => record.member_id === selectedMember && !record.return_date
  );

  const handleReturn = async (bookId: string) => {
    await returnBook(bookId);
  };

  const getStatusBadge = (dueDate: string) => {
    const due = new Date(dueDate);
    const now = new Date();
    const daysUntilDue = differenceInDays(due, now);
    
    if (isAfter(now, due)) {
      return <Badge variant="destructive">Overdue</Badge>;
    } else if (daysUntilDue <= 2) {
      return <Badge variant="outline" className="border-warning text-warning">Due Soon</Badge>;
    } else {
      return <Badge variant="default" className="bg-success">On Time</Badge>;
    }
  };

  const getDaysInfo = (dueDate: string) => {
    const due = new Date(dueDate);
    const now = new Date();
    const daysUntilDue = differenceInDays(due, now);
    
    if (isAfter(now, due)) {
      const overdueDays = Math.abs(daysUntilDue);
      return {
        text: `${overdueDays} day${overdueDays !== 1 ? 's' : ''} overdue`,
        color: "text-destructive"
      };
    } else {
      return {
        text: `${daysUntilDue} day${daysUntilDue !== 1 ? 's' : ''} remaining`,
        color: daysUntilDue <= 2 ? "text-warning" : "text-success"
      };
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <User className="h-12 w-12 text-primary animate-pulse mx-auto mb-4" />
              <p className="text-muted-foreground">Loading member data...</p>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Member Dashboard</h1>
          <p className="text-muted-foreground">View borrowed books and manage returns</p>
        </div>

        {/* Member Selection */}
        <Card className="gradient-card mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Select Member
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Select value={selectedMember} onValueChange={setSelectedMember}>
              <SelectTrigger className="max-w-md">
                <SelectValue placeholder="Choose a member to view their dashboard" />
              </SelectTrigger>
              <SelectContent>
                {members.map(member => (
                  <SelectItem key={member.member_id} value={member.member_id}>
                    <div className="flex flex-col">
                      <span className="font-medium">{member.name}</span>
                      <span className="text-sm text-muted-foreground">{member.email}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        {/* Member Info & Borrowed Books */}
        {selectedMemberData && (
          <>
            {/* Member Information */}
            <Card className="gradient-card mb-8">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5 text-primary" />
                  Member Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <h3 className="font-semibold text-foreground">Name</h3>
                    <p className="text-muted-foreground">{selectedMemberData.name}</p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">Email</h3>
                    <p className="text-muted-foreground">{selectedMemberData.email}</p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">Phone</h3>
                    <p className="text-muted-foreground">{selectedMemberData.phone || 'Not provided'}</p>
                  </div>
                </div>
                
                <Separator className="my-4" />
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">{memberBorrowRecords.length}</div>
                    <p className="text-sm text-muted-foreground">Currently Borrowed</p>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-warning">
                      {memberBorrowRecords.filter(record => {
                        const daysUntilDue = differenceInDays(new Date(record.due_date), new Date());
                        return daysUntilDue <= 2 && daysUntilDue >= 0;
                      }).length}
                    </div>
                    <p className="text-sm text-muted-foreground">Due Soon</p>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-destructive">
                      {memberBorrowRecords.filter(record => 
                        isAfter(new Date(), new Date(record.due_date))
                      ).length}
                    </div>
                    <p className="text-sm text-muted-foreground">Overdue</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Borrowed Books */}
            <Card className="gradient-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-primary" />
                  Currently Borrowed Books
                </CardTitle>
                <CardDescription>
                  Books that need to be returned
                </CardDescription>
              </CardHeader>
              <CardContent>
                {memberBorrowRecords.length === 0 ? (
                  <div className="text-center py-8">
                    <BookOpen className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No borrowed books</h3>
                    <p className="text-muted-foreground">
                      This member hasn't borrowed any books currently.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {memberBorrowRecords.map(record => {
                      const daysInfo = getDaysInfo(record.due_date);
                      return (
                        <div key={record.record_id} className="border border-border rounded-lg p-4 space-y-3">
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <h3 className="font-semibold text-lg">{record.book?.title}</h3>
                              <p className="text-muted-foreground">by {record.book?.author}</p>
                              <p className="text-sm text-muted-foreground">{record.book?.category}</p>
                            </div>
                            {getStatusBadge(record.due_date)}
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                            <div className="flex items-center gap-2">
                              <Calendar className="h-4 w-4 text-muted-foreground" />
                              <span>Borrowed: {format(new Date(record.issue_date), 'MMM dd, yyyy')}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Clock className="h-4 w-4 text-muted-foreground" />
                              <span>Due: {format(new Date(record.due_date), 'MMM dd, yyyy')}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <AlertTriangle className={`h-4 w-4 ${daysInfo.color}`} />
                              <span className={daysInfo.color}>{daysInfo.text}</span>
                            </div>
                          </div>
                          
                          <div className="flex justify-end">
                            <Button 
                              onClick={() => handleReturn(record.book_id)}
                              variant="outline"
                              size="sm"
                            >
                              Return Book
                            </Button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </>
        )}

        {!selectedMember && (
          <Card className="gradient-card">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <User className="h-16 w-16 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">Select a member</h3>
              <p className="text-muted-foreground text-center">
                Choose a member from the dropdown above to view their dashboard
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </Layout>
  );
};

export default MemberDashboard;