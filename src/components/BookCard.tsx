import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { BookOpen, Calendar, User, Trash2 } from "lucide-react";

interface BookCardProps {
  book: {
    book_id: string;
    title: string;
    author: string;
    category: string;
    availability_status: boolean;
    isbn?: string;
    published_year?: number;
    description?: string;
  };
  onBorrow?: (bookId: string) => void;
  onReturn?: (bookId: string) => void;
  onDelete?: (bookId: string) => void;
  showActions?: boolean;
  showDelete?: boolean;
}

const BookCard: React.FC<BookCardProps> = ({ 
  book, 
  onBorrow, 
  onReturn, 
  onDelete,
  showActions = true,
  showDelete = false
}) => {
  return (
    <Card className="gradient-card hover:shadow-lg transition-all duration-300 hover:scale-105">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg font-semibold text-foreground line-clamp-2">
              {book.title}
            </CardTitle>
            <CardDescription className="flex items-center mt-1">
              <User className="h-4 w-4 mr-1" />
              {book.author}
            </CardDescription>
          </div>
          <Badge 
            variant={book.availability_status ? "default" : "destructive"}
            className={book.availability_status ? "bg-success" : ""}
          >
            {book.availability_status ? "✅ Available" : "❌ Borrowed"}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span className="flex items-center">
              <BookOpen className="h-4 w-4 mr-1" />
              {book.category}
            </span>
            {book.published_year && (
              <span className="flex items-center">
                <Calendar className="h-4 w-4 mr-1" />
                {book.published_year}
              </span>
            )}
          </div>
          
          {book.description && (
            <p className="text-sm text-muted-foreground line-clamp-2">
              {book.description}
            </p>
          )}
          
          {book.isbn && (
            <p className="text-xs text-muted-foreground">
              ISBN: {book.isbn}
            </p>
          )}
          
          {showActions && (
            <div className="pt-2 space-y-2">
              {book.availability_status ? (
                onBorrow && (
                  <Button 
                    onClick={() => onBorrow(book.book_id)}
                    className="w-full bg-primary hover:bg-primary/90"
                    size="sm"
                  >
                    Borrow Book
                  </Button>
                )
              ) : (
                onReturn && (
                  <Button 
                    onClick={() => onReturn(book.book_id)}
                    variant="outline"
                    className="w-full"
                    size="sm"
                  >
                    Return Book
                  </Button>
                )
              )}
              
              {showDelete && onDelete && (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button 
                      variant="destructive"
                      size="sm"
                      className="w-full"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete Book
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete Book</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to delete "{book.title}"? This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => onDelete(book.book_id)}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default BookCard;