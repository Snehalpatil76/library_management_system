import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface Book {
  book_id: string;
  title: string;
  author: string;
  category: string;
  availability_status: boolean;
  isbn?: string;
  published_year?: number;
  description?: string;
  category_name?: string;
}

export interface Member {
  member_id: string;
  name: string;
  email: string;
  phone?: string;
}

export interface BorrowRecord {
  record_id: string;
  book_id: string;
  member_id: string;
  issue_date: string;
  due_date: string;
  return_date?: string;
  book?: Book;
  member?: Member;
}

export interface Category {
  category_id: string;
  category_name: string;
}

export const useLibrary = () => {
  const [books, setBooks] = useState<Book[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [borrowRecords, setBorrowRecords] = useState<BorrowRecord[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchBooks = async () => {
    try {
      const { data, error } = await supabase
        .from('books')
        .select(`
          *,
          categories!inner(category_name)
        `);
      
      if (error) throw error;
      
      const booksWithCategoryName = data?.map(book => ({
        ...book,
        category_name: book.categories.category_name,
        category: book.categories.category_name
      })) || [];
      
      setBooks(booksWithCategoryName);
    } catch (error) {
      console.error('Error fetching books:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to fetch books"
      });
    }
  };

  const fetchMembers = async () => {
    try {
      const { data, error } = await supabase
        .from('members')
        .select('*');
      
      if (error) throw error;
      setMembers(data || []);
    } catch (error) {
      console.error('Error fetching members:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to fetch members"
      });
    }
  };

  const fetchBorrowRecords = async () => {
    try {
      const { data, error } = await supabase
        .from('borrow_records')
        .select(`
          *,
          books!inner(*,
            categories!inner(category_name)
          ),
          members!inner(*)
        `);
      
      if (error) throw error;
      
      const recordsWithDetails = data?.map(record => ({
        ...record,
        book: {
          ...record.books,
          category: record.books.categories.category_name,
          category_name: record.books.categories.category_name
        },
        member: record.members
      })) || [];
      
      setBorrowRecords(recordsWithDetails);
    } catch (error) {
      console.error('Error fetching borrow records:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to fetch borrow records"
      });
    }
  };

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*');
      
      if (error) throw error;
      setCategories(data || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to fetch categories"
      });
    }
  };

  const borrowBook = async (bookId: string, memberId: string) => {
    try {
      // Update book availability
      const { error: bookError } = await supabase
        .from('books')
        .update({ availability_status: false })
        .eq('book_id', bookId);

      if (bookError) throw bookError;

      // Create borrow record
      const { error: recordError } = await supabase
        .from('borrow_records')
        .insert({
          book_id: bookId,
          member_id: memberId,
        });

      if (recordError) throw recordError;

      // Log librarian action
      await supabase
        .from('librarian_actions')
        .insert({
          book_id: bookId,
          action_type: 'BOOK_BORROWED',
          details: `Book borrowed by member ${memberId}`
        });

      await Promise.all([fetchBooks(), fetchBorrowRecords()]);
      
      toast({
        title: "Success",
        description: "Book borrowed successfully!"
      });
    } catch (error) {
      console.error('Error borrowing book:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to borrow book"
      });
    }
  };

  const returnBook = async (bookId: string) => {
    try {
      // Update book availability
      const { error: bookError } = await supabase
        .from('books')
        .update({ availability_status: true })
        .eq('book_id', bookId);

      if (bookError) throw bookError;

      // Update borrow record
      const { error: recordError } = await supabase
        .from('borrow_records')
        .update({ return_date: new Date().toISOString() })
        .eq('book_id', bookId)
        .is('return_date', null);

      if (recordError) throw recordError;

      // Log librarian action
      await supabase
        .from('librarian_actions')
        .insert({
          book_id: bookId,
          action_type: 'BOOK_RETURNED',
          details: `Book returned`
        });

      await Promise.all([fetchBooks(), fetchBorrowRecords()]);
      
      toast({
        title: "Success",
        description: "Book returned successfully!"
      });
    } catch (error) {
      console.error('Error returning book:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to return book"
      });
    }
  };

  const addBook = async (bookData: Omit<Book, 'book_id' | 'availability_status'>) => {
    try {
      const { error } = await supabase
        .from('books')
        .insert({
          title: bookData.title,
          author: bookData.author,
          category: bookData.category,
          isbn: bookData.isbn,
          published_year: bookData.published_year,
          description: bookData.description
        });

      if (error) throw error;

      await fetchBooks();
      
      toast({
        title: "Success",
        description: "Book added successfully!"
      });
    } catch (error) {
      console.error('Error adding book:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to add book"
      });
    }
  };

  const addMember = async (memberData: Omit<Member, 'member_id'>) => {
    try {
      const { error } = await supabase
        .from('members')
        .insert(memberData);

      if (error) throw error;

      await fetchMembers();
      
      toast({
        title: "Success",
        description: "Member added successfully!"
      });
    } catch (error) {
      console.error('Error adding member:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to add member"
      });
    }
  };

  const deleteBook = async (bookId: string) => {
    try {
      // Check if book is currently borrowed
      const { data: borrowRecords, error: checkError } = await supabase
        .from('borrow_records')
        .select('*')
        .eq('book_id', bookId)
        .is('return_date', null);

      if (checkError) throw checkError;

      if (borrowRecords && borrowRecords.length > 0) {
        toast({
          variant: "destructive",
          title: "Cannot Delete",
          description: "Book is currently borrowed and cannot be deleted"
        });
        return;
      }

      // Delete the book
      const { error } = await supabase
        .from('books')
        .delete()
        .eq('book_id', bookId);

      if (error) throw error;

      // Log librarian action
      await supabase
        .from('librarian_actions')
        .insert({
          book_id: bookId,
          action_type: 'BOOK_DELETED',
          details: 'Book deleted from library'
        });

      await fetchBooks();
      
      toast({
        title: "Success",
        description: "Book deleted successfully!"
      });
    } catch (error) {
      console.error('Error deleting book:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete book"
      });
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([
        fetchBooks(),
        fetchMembers(),
        fetchBorrowRecords(),
        fetchCategories()
      ]);
      setLoading(false);
    };

    loadData();

    // Set up real-time subscriptions for live updates
    const booksSubscription = supabase
      .channel('books_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'books' }, () => {
        fetchBooks();
      })
      .subscribe();

    const borrowSubscription = supabase
      .channel('borrow_records_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'borrow_records' }, () => {
        fetchBorrowRecords();
      })
      .subscribe();

    const membersSubscription = supabase
      .channel('members_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'members' }, () => {
        fetchMembers();
      })
      .subscribe();

    // Set up periodic refresh for real-time stats
    const intervalId = setInterval(() => {
      Promise.all([fetchBooks(), fetchBorrowRecords()]);
    }, 10000); // Update every 10 seconds

    return () => {
      clearInterval(intervalId);
      supabase.removeChannel(booksSubscription);
      supabase.removeChannel(borrowSubscription);
      supabase.removeChannel(membersSubscription);
    };
  }, []);

  return {
    books,
    members,
    borrowRecords,
    categories,
    loading,
    borrowBook,
    returnBook,
    addBook,
    addMember,
    deleteBook,
    refetch: () => Promise.all([fetchBooks(), fetchMembers(), fetchBorrowRecords(), fetchCategories()])
  };
};