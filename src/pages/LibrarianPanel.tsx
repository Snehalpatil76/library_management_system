import React, { useState } from "react";
import Layout from "@/components/Layout";
import BookCard from "@/components/BookCard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Settings, BookPlus, UserPlus, BarChart3, Calendar, TrendingUp, AlertTriangle } from "lucide-react";
import { useLibrary } from "@/hooks/useLibrary";
import { format, isAfter } from "date-fns";

const LibrarianPanel = () => {
  const { books, members, borrowRecords, categories, addBook, addMember, deleteBook, loading } = useLibrary();
  
  // Add Book Form State
  const [bookForm, setBookForm] = useState({
    title: '',
    author: '',
    category: '',
    isbn: '',
    published_year: '',
    description: ''
  });
  
  // Add Member Form State
  const [memberForm, setMemberForm] = useState({
    name: '',
    email: '',
    phone: ''
  });
  
  const [addBookDialogOpen, setAddBookDialogOpen] = useState(false);
  const [addMemberDialogOpen, setAddMemberDialogOpen] = useState(false);

  const handleAddBook = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bookForm.title || !bookForm.author || !bookForm.category) return;
    
    await addBook({
      title: bookForm.title,
      author: bookForm.author,
      category: bookForm.category,
      isbn: bookForm.isbn || undefined,
      published_year: bookForm.published_year ? parseInt(bookForm.published_year) : undefined,
      description: bookForm.description || undefined
    });
    
    setBookForm({
      title: '',
      author: '',
      category: '',
      isbn: '',
      published_year: '',
      description: ''
    });
    setAddBookDialogOpen(false);
  };

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!memberForm.name || !memberForm.email) return;
    
    await addMember({
      name: memberForm.name,
      email: memberForm.email,
      phone: memberForm.phone || undefined
    });
    
    setMemberForm({
      name: '',
      email: '',
      phone: ''
    });
    setAddMemberDialogOpen(false);
  };

  // Statistics
  const totalBooks = books.length;
  const availableBooks = books.filter(book => book.availability_status).length;
  const borrowedBooks = books.filter(book => !book.availability_status).length;
  const totalMembers = members.length;
  const activeLoans = borrowRecords.filter(record => !record.return_date).length;
  const overdueLoans = borrowRecords.filter(record => 
    !record.return_date && isAfter(new Date(), new Date(record.due_date))
  ).length;

  if (loading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <Settings className="h-12 w-12 text-primary animate-pulse mx-auto mb-4" />
              <p className="text-muted-foreground">Loading librarian data...</p>
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
          <h1 className="text-3xl font-bold mb-2">Librarian Panel</h1>
          <p className="text-muted-foreground">Manage library operations and resources</p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          <Card className="gradient-card">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-primary">{totalBooks}</div>
              <p className="text-xs text-muted-foreground">Total Books</p>
            </CardContent>
          </Card>
          <Card className="gradient-card">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-success">{availableBooks}</div>
              <p className="text-xs text-muted-foreground">Available</p>
            </CardContent>
          </Card>
          <Card className="gradient-card">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-accent">{borrowedBooks}</div>
              <p className="text-xs text-muted-foreground">Borrowed</p>
            </CardContent>
          </Card>
          <Card className="gradient-card">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-primary">{totalMembers}</div>
              <p className="text-xs text-muted-foreground">Members</p>
            </CardContent>
          </Card>
          <Card className="gradient-card">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-accent">{activeLoans}</div>
              <p className="text-xs text-muted-foreground">Active Loans</p>
            </CardContent>
          </Card>
          <Card className="gradient-card">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-destructive">{overdueLoans}</div>
              <p className="text-xs text-muted-foreground">Overdue</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="books">Books</TabsTrigger>
            <TabsTrigger value="members">Members</TabsTrigger>
            <TabsTrigger value="loans">Loan Records</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="gradient-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5 text-primary" />
                    Library Statistics
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between">
                    <span>Collection Utilization</span>
                    <span className="font-semibold">
                      {Math.round((borrowedBooks / totalBooks) * 100)}%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Active Members</span>
                    <span className="font-semibold">{totalMembers}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Books per Member</span>
                    <span className="font-semibold">
                      {(totalBooks / Math.max(totalMembers, 1)).toFixed(1)}
                    </span>
                  </div>
                </CardContent>
              </Card>

              <Card className="gradient-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-warning" />
                    Attention Required
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span>Overdue Books</span>
                    <Badge variant="destructive">{overdueLoans}</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Books Out of Stock</span>
                    <Badge variant="outline">{borrowedBooks}</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Categories</span>
                    <Badge variant="secondary">{categories.length}</Badge>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Dialog open={addBookDialogOpen} onOpenChange={setAddBookDialogOpen}>
                <DialogTrigger asChild>
                  <Card className="gradient-card hover:shadow-lg transition-all duration-300 cursor-pointer">
                    <CardContent className="flex flex-col items-center justify-center py-8">
                      <BookPlus className="h-12 w-12 text-primary mb-4" />
                      <h3 className="text-lg font-semibold mb-2">Add New Book</h3>
                      <p className="text-muted-foreground text-center">
                        Expand your library collection
                      </p>
                    </CardContent>
                  </Card>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>Add New Book</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleAddBook} className="space-y-4">
                    <div>
                      <Label htmlFor="title">Title *</Label>
                      <Input
                        id="title"
                        value={bookForm.title}
                        onChange={(e) => setBookForm({...bookForm, title: e.target.value})}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="author">Author *</Label>
                      <Input
                        id="author"
                        value={bookForm.author}
                        onChange={(e) => setBookForm({...bookForm, author: e.target.value})}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="category">Category *</Label>
                      <Select value={bookForm.category} onValueChange={(value) => setBookForm({...bookForm, category: value})}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map(category => (
                            <SelectItem key={category.category_id} value={category.category_id}>
                              {category.category_name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="isbn">ISBN</Label>
                      <Input
                        id="isbn"
                        value={bookForm.isbn}
                        onChange={(e) => setBookForm({...bookForm, isbn: e.target.value})}
                      />
                    </div>
                    <div>
                      <Label htmlFor="year">Published Year</Label>
                      <Input
                        id="year"
                        type="number"
                        value={bookForm.published_year}
                        onChange={(e) => setBookForm({...bookForm, published_year: e.target.value})}
                      />
                    </div>
                    <div>
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        value={bookForm.description}
                        onChange={(e) => setBookForm({...bookForm, description: e.target.value})}
                        rows={3}
                      />
                    </div>
                    <div className="flex gap-2 justify-end">
                      <Button type="button" variant="outline" onClick={() => setAddBookDialogOpen(false)}>
                        Cancel
                      </Button>
                      <Button type="submit">Add Book</Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>

              <Dialog open={addMemberDialogOpen} onOpenChange={setAddMemberDialogOpen}>
                <DialogTrigger asChild>
                  <Card className="gradient-card hover:shadow-lg transition-all duration-300 cursor-pointer">
                    <CardContent className="flex flex-col items-center justify-center py-8">
                      <UserPlus className="h-12 w-12 text-accent mb-4" />
                      <h3 className="text-lg font-semibold mb-2">Add New Member</h3>
                      <p className="text-muted-foreground text-center">
                        Register a new library member
                      </p>
                    </CardContent>
                  </Card>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>Add New Member</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleAddMember} className="space-y-4">
                    <div>
                      <Label htmlFor="name">Name *</Label>
                      <Input
                        id="name"
                        value={memberForm.name}
                        onChange={(e) => setMemberForm({...memberForm, name: e.target.value})}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="email">Email *</Label>
                      <Input
                        id="email"
                        type="email"
                        value={memberForm.email}
                        onChange={(e) => setMemberForm({...memberForm, email: e.target.value})}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="phone">Phone</Label>
                      <Input
                        id="phone"
                        value={memberForm.phone}
                        onChange={(e) => setMemberForm({...memberForm, phone: e.target.value})}
                      />
                    </div>
                    <div className="flex gap-2 justify-end">
                      <Button type="button" variant="outline" onClick={() => setAddMemberDialogOpen(false)}>
                        Cancel
                      </Button>
                      <Button type="submit">Add Member</Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          </TabsContent>

          {/* Books Tab */}
          <TabsContent value="books">
            <Card className="gradient-card">
              <CardHeader>
                <CardTitle>Book Collection</CardTitle>
                <CardDescription>Manage your library's book inventory</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {books.map(book => (
                    <BookCard
                      key={book.book_id}
                      book={book}
                      showActions={false}
                      showDelete={true}
                      onDelete={deleteBook}
                    />
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Members Tab */}
          <TabsContent value="members">
            <Card className="gradient-card">
              <CardHeader>
                <CardTitle>Library Members</CardTitle>
                <CardDescription>Manage member information and accounts</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {members.map(member => (
                    <div key={member.member_id} className="border border-border rounded-lg p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-semibold">{member.name}</h3>
                          <p className="text-muted-foreground">{member.email}</p>
                          {member.phone && <p className="text-sm text-muted-foreground">{member.phone}</p>}
                        </div>
                        <Badge variant="outline">
                          {borrowRecords.filter(r => r.member_id === member.member_id && !r.return_date).length} borrowed
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Loan Records Tab */}
          <TabsContent value="loans">
            <Card className="gradient-card">
              <CardHeader>
                <CardTitle>Borrow Records</CardTitle>
                <CardDescription>Track all borrowing and return activities</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {borrowRecords.map(record => (
                    <div key={record.record_id} className="border border-border rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h3 className="font-semibold">{record.book?.title}</h3>
                          <p className="text-muted-foreground">Borrowed by {record.member?.name}</p>
                        </div>
                        <Badge variant={record.return_date ? "default" : isAfter(new Date(), new Date(record.due_date)) ? "destructive" : "outline"}>
                          {record.return_date ? "Returned" : isAfter(new Date(), new Date(record.due_date)) ? "Overdue" : "Active"}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          Issued: {format(new Date(record.issue_date), 'MMM dd, yyyy')}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          Due: {format(new Date(record.due_date), 'MMM dd, yyyy')}
                        </span>
                        {record.return_date && (
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            Returned: {format(new Date(record.return_date), 'MMM dd, yyyy')}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default LibrarianPanel;