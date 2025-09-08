import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import Layout from "@/components/Layout";
import BookCard from "@/components/BookCard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Search, Filter, BookOpen } from "lucide-react";
import { useLibrary } from "@/hooks/useLibrary";
import { useToast } from "@/hooks/use-toast";

const BrowseBooks = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [availabilityFilter, setAvailabilityFilter] = useState<string>('all');
  const [selectedMember, setSelectedMember] = useState<string>('');
  const [borrowDialogOpen, setBorrowDialogOpen] = useState(false);
  const [selectedBookId, setSelectedBookId] = useState<string>('');
  
  const { books, members, categories, borrowBook, returnBook, loading } = useLibrary();
  const { toast } = useToast();

  useEffect(() => {
    const search = searchParams.get('search');
    if (search) {
      setSearchQuery(search);
    }
  }, [searchParams]);

  const filteredBooks = books.filter(book => {
    const matchesSearch = !searchQuery || 
      book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      book.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
      book.category.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = selectedCategory === 'all' || book.category === selectedCategory;
    
    const matchesAvailability = availabilityFilter === 'all' || 
      (availabilityFilter === 'available' && book.availability_status) ||
      (availabilityFilter === 'borrowed' && !book.availability_status);
    
    return matchesSearch && matchesCategory && matchesAvailability;
  });

  const handleSearch = () => {
    if (searchQuery.trim()) {
      setSearchParams({ search: searchQuery.trim() });
    } else {
      setSearchParams({});
    }
  };

  const handleBorrow = (bookId: string) => {
    setSelectedBookId(bookId);
    setBorrowDialogOpen(true);
  };

  const handleConfirmBorrow = async () => {
    if (!selectedMember) {
      toast({
        variant: "destructive",
        title: "Selection Required",
        description: "Please select a member to borrow the book."
      });
      return;
    }

    await borrowBook(selectedBookId, selectedMember);
    setBorrowDialogOpen(false);
    setSelectedMember('');
    setSelectedBookId('');
  };

  const handleReturn = async (bookId: string) => {
    await returnBook(bookId);
  };

  if (loading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <BookOpen className="h-12 w-12 text-primary animate-pulse mx-auto mb-4" />
              <p className="text-muted-foreground">Loading books...</p>
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
          <h1 className="text-3xl font-bold mb-2">Browse Books</h1>
          <p className="text-muted-foreground">Discover and manage our book collection</p>
        </div>

        {/* Search and Filters */}
        <Card className="gradient-card mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Search & Filters
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="flex gap-2">
                <Input
                  placeholder="Search books, authors..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  className="flex-1"
                />
                <Button onClick={handleSearch}>
                  <Search className="h-4 w-4" />
                </Button>
              </div>
              
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map(category => (
                    <SelectItem key={category.category_id} value={category.category_name}>
                      {category.category_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Select value={availabilityFilter} onValueChange={setAvailabilityFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Availability" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Books</SelectItem>
                  <SelectItem value="available">Available Only</SelectItem>
                  <SelectItem value="borrowed">Borrowed Only</SelectItem>
                </SelectContent>
              </Select>
              
              <div className="text-sm text-muted-foreground flex items-center justify-center">
                {filteredBooks.length} book{filteredBooks.length !== 1 ? 's' : ''} found
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Books Grid */}
        {filteredBooks.length === 0 ? (
          <Card className="gradient-card">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <BookOpen className="h-16 w-16 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No books found</h3>
              <p className="text-muted-foreground text-center">
                Try adjusting your search criteria or filters
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredBooks.map(book => (
              <BookCard
                key={book.book_id}
                book={book}
                onBorrow={handleBorrow}
                onReturn={handleReturn}
              />
            ))}
          </div>
        )}

        {/* Borrow Dialog */}
        <Dialog open={borrowDialogOpen} onOpenChange={setBorrowDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Select Member to Borrow Book</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <Select value={selectedMember} onValueChange={setSelectedMember}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a member" />
                </SelectTrigger>
                <SelectContent>
                  {members.map(member => (
                    <SelectItem key={member.member_id} value={member.member_id}>
                      {member.name} ({member.email})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={() => setBorrowDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleConfirmBorrow}>
                  Confirm Borrow
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
};

export default BrowseBooks;