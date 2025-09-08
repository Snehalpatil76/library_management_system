-- Create categories table
CREATE TABLE public.categories (
  category_id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  category_name TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create books table
CREATE TABLE public.books (
  book_id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  author TEXT NOT NULL,
  category UUID NOT NULL REFERENCES public.categories(category_id),
  availability_status BOOLEAN NOT NULL DEFAULT true,
  isbn TEXT,
  published_year INTEGER,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create members table
CREATE TABLE public.members (
  member_id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  phone TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create borrow_records table
CREATE TABLE public.borrow_records (
  record_id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  book_id UUID NOT NULL REFERENCES public.books(book_id) ON DELETE CASCADE,
  member_id UUID NOT NULL REFERENCES public.members(member_id) ON DELETE CASCADE,
  issue_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  due_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (now() + INTERVAL '7 days'),
  return_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create librarian_actions table (optional)
CREATE TABLE public.librarian_actions (
  action_id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  book_id UUID REFERENCES public.books(book_id) ON DELETE SET NULL,
  action_type TEXT NOT NULL,
  details TEXT,
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security (though not needed without auth, it's good practice)
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.books ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.borrow_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.librarian_actions ENABLE ROW LEVEL SECURITY;

-- Create policies to allow all operations (since no auth required)
CREATE POLICY "Allow all on categories" ON public.categories FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on books" ON public.books FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on members" ON public.members FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on borrow_records" ON public.borrow_records FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on librarian_actions" ON public.librarian_actions FOR ALL USING (true) WITH CHECK (true);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_books_updated_at
  BEFORE UPDATE ON public.books
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_members_updated_at
  BEFORE UPDATE ON public.members
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_borrow_records_updated_at
  BEFORE UPDATE ON public.borrow_records
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Insert sample categories
INSERT INTO public.categories (category_name) VALUES
  ('Fiction'),
  ('Non-Fiction'),
  ('Science & Technology');

-- Insert sample members
INSERT INTO public.members (name, email, phone) VALUES
  ('John Smith', 'john.smith@email.com', '+1-555-0101'),
  ('Emily Johnson', 'emily.johnson@email.com', '+1-555-0102'),
  ('Michael Brown', 'michael.brown@email.com', '+1-555-0103'),
  ('Sarah Davis', 'sarah.davis@email.com', '+1-555-0104'),
  ('David Wilson', 'david.wilson@email.com', '+1-555-0105');

-- Insert sample books
INSERT INTO public.books (title, author, category, availability_status, isbn, published_year, description) VALUES
  ('The Great Gatsby', 'F. Scott Fitzgerald', (SELECT category_id FROM public.categories WHERE category_name = 'Fiction'), true, '978-0-7432-7356-5', 1925, 'A classic American novel set in the Jazz Age'),
  ('To Kill a Mockingbird', 'Harper Lee', (SELECT category_id FROM public.categories WHERE category_name = 'Fiction'), false, '978-0-06-112008-4', 1960, 'A powerful story of racial injustice and childhood innocence'),
  ('1984', 'George Orwell', (SELECT category_id FROM public.categories WHERE category_name = 'Fiction'), true, '978-0-452-28423-4', 1949, 'A dystopian novel about totalitarian control'),
  ('Pride and Prejudice', 'Jane Austen', (SELECT category_id FROM public.categories WHERE category_name = 'Fiction'), true, '978-0-14-143951-8', 1813, 'A romantic novel about society and manners'),
  ('The Catcher in the Rye', 'J.D. Salinger', (SELECT category_id FROM public.categories WHERE category_name = 'Fiction'), false, '978-0-316-76948-0', 1951, 'A coming-of-age story in New York City'),
  ('A Brief History of Time', 'Stephen Hawking', (SELECT category_id FROM public.categories WHERE category_name = 'Science & Technology'), true, '978-0-553-38016-3', 1988, 'An exploration of cosmology and black holes'),
  ('Sapiens', 'Yuval Noah Harari', (SELECT category_id FROM public.categories WHERE category_name = 'Non-Fiction'), true, '978-0-06-231609-7', 2014, 'A brief history of humankind'),
  ('The Immortal Life of Henrietta Lacks', 'Rebecca Skloot', (SELECT category_id FROM public.categories WHERE category_name = 'Science & Technology'), false, '978-1-4000-5217-2', 2010, 'The story of HeLa cells and medical ethics'),
  ('Educated', 'Tara Westover', (SELECT category_id FROM public.categories WHERE category_name = 'Non-Fiction'), true, '978-0-399-59050-4', 2018, 'A memoir about education and family'),
  ('The Power of Habit', 'Charles Duhigg', (SELECT category_id FROM public.categories WHERE category_name = 'Non-Fiction'), true, '978-0-8129-8160-8', 2012, 'The science of habit formation');

-- Insert sample borrow records
INSERT INTO public.borrow_records (book_id, member_id, issue_date, due_date, return_date) VALUES
  ((SELECT book_id FROM public.books WHERE title = 'To Kill a Mockingbird'), (SELECT member_id FROM public.members WHERE name = 'John Smith'), now() - INTERVAL '3 days', now() + INTERVAL '4 days', NULL),
  ((SELECT book_id FROM public.books WHERE title = 'The Catcher in the Rye'), (SELECT member_id FROM public.members WHERE name = 'Emily Johnson'), now() - INTERVAL '5 days', now() + INTERVAL '2 days', NULL),
  ((SELECT book_id FROM public.books WHERE title = 'The Immortal Life of Henrietta Lacks'), (SELECT member_id FROM public.members WHERE name = 'Michael Brown'), now() - INTERVAL '10 days', now() - INTERVAL '3 days', NULL),
  ((SELECT book_id FROM public.books WHERE title = 'The Great Gatsby'), (SELECT member_id FROM public.members WHERE name = 'Sarah Davis'), now() - INTERVAL '15 days', now() - INTERVAL '8 days', now() - INTERVAL '2 days');

-- Insert sample librarian actions
INSERT INTO public.librarian_actions (book_id, action_type, details) VALUES
  ((SELECT book_id FROM public.books WHERE title = 'The Great Gatsby'), 'BOOK_ADDED', 'New book added to the library'),
  ((SELECT book_id FROM public.books WHERE title = 'To Kill a Mockingbird'), 'BOOK_BORROWED', 'Book borrowed by John Smith'),
  ((SELECT book_id FROM public.books WHERE title = 'The Great Gatsby'), 'BOOK_RETURNED', 'Book returned by Sarah Davis'),
  (NULL, 'SYSTEM_BACKUP', 'Daily system backup completed');