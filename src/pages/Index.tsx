import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "@/components/Layout";
import DatabaseActivity from "@/components/DatabaseActivity";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, Users, Search, BarChart3, TrendingUp } from "lucide-react";
import { useLibrary } from "@/hooks/useLibrary";

const Index = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();
  const { books, members, borrowRecords } = useLibrary();

  const handleSearch = () => {
    if (searchQuery.trim()) {
      navigate(`/browse?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const availableBooks = books.filter(book => book.availability_status).length;
  const borrowedBooks = books.filter(book => !book.availability_status).length;
  const overdueBooks = borrowRecords.filter(record => 
    !record.return_date && new Date(record.due_date) < new Date()
  ).length;

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-6">
            <div className="p-4 rounded-full bg-primary/10 border border-primary/20">
              <BookOpen className="h-16 w-16 text-primary" />
            </div>
          </div>
          <h1 className="text-5xl font-bold mb-4 text-foreground">
            Welcome to <span className="text-primary">LibroHub</span>
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Your comprehensive library management solution. Search, borrow, and manage books with ease.
          </p>
          
          {/* Quick Search */}
          <div className="max-w-lg mx-auto flex gap-2">
            <Input
              placeholder="Search for books, authors, or categories..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={handleKeyPress}
              className="flex-1"
            />
            <Button onClick={handleSearch} className="px-6">
              <Search className="h-4 w-4 mr-2" />
              Search
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <Card className="gradient-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Books</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">{books.length}</div>
              <p className="text-xs text-muted-foreground">
                Books in library
              </p>
            </CardContent>
          </Card>
          
          <Card className="gradient-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Available</CardTitle>
              <TrendingUp className="h-4 w-4 text-success" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-success">{availableBooks}</div>
              <p className="text-xs text-muted-foreground">
                Ready to borrow
              </p>
            </CardContent>
          </Card>
          
          <Card className="gradient-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Borrowed</CardTitle>
              <Users className="h-4 w-4 text-accent" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-accent">{borrowedBooks}</div>
              <p className="text-xs text-muted-foreground">
                Currently on loan
              </p>
            </CardContent>
          </Card>
          
          <Card className="gradient-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Overdue</CardTitle>
              <BarChart3 className="h-4 w-4 text-destructive" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-destructive">{overdueBooks}</div>
              <p className="text-xs text-muted-foreground">
                Need attention
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <Card className="gradient-card hover:shadow-lg transition-all duration-300 cursor-pointer" onClick={() => navigate('/browse')}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Search className="h-5 w-5 text-primary" />
                Browse Books
              </CardTitle>
              <CardDescription>
                Explore our collection and find your next read
              </CardDescription>
            </CardHeader>
          </Card>
          
          <Card className="gradient-card hover:shadow-lg transition-all duration-300 cursor-pointer" onClick={() => navigate('/members')}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-accent" />
                Member Dashboard
              </CardTitle>
              <CardDescription>
                View borrowed books and manage returns
              </CardDescription>
            </CardHeader>
          </Card>
          
          <Card className="gradient-card hover:shadow-lg transition-all duration-300 cursor-pointer" onClick={() => navigate('/librarian')}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-primary" />
                Librarian Panel
              </CardTitle>
              <CardDescription>
                Manage books, members, and library operations
              </CardDescription>
            </CardHeader>
          </Card>
        </div>

        {/* Database Activity Section */}
        <DatabaseActivity />
      </div>
    </Layout>
  );
};

export default Index;
