
-- Role enum
CREATE TYPE public.app_role AS ENUM ('student','faculty','librarian','publisher');

-- Profiles
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  email TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- User roles (separate table — security best practice)
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL,
  UNIQUE(user_id, role)
);
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

CREATE OR REPLACE FUNCTION public.get_user_role(_user_id UUID)
RETURNS app_role LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT role FROM public.user_roles WHERE user_id = _user_id LIMIT 1
$$;

-- Books
CREATE TABLE public.books (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  author TEXT NOT NULL,
  isbn TEXT,
  category TEXT,
  description TEXT,
  cover_url TEXT,
  total_copies INT NOT NULL DEFAULT 1,
  available_copies INT NOT NULL DEFAULT 1,
  publisher_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  added_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.books ENABLE ROW LEVEL SECURITY;

-- Borrow records
CREATE TYPE public.borrow_status AS ENUM ('requested','issued','returned','overdue','rejected');

CREATE TABLE public.borrow_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  book_id UUID NOT NULL REFERENCES public.books(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status borrow_status NOT NULL DEFAULT 'requested',
  borrowed_at TIMESTAMPTZ,
  due_date TIMESTAMPTZ,
  returned_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.borrow_records ENABLE ROW LEVEL SECURITY;

-- RLS: profiles
CREATE POLICY "profiles viewable by authenticated"
  ON public.profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY "users update own profile"
  ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id);
CREATE POLICY "users insert own profile"
  ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);

-- RLS: user_roles
CREATE POLICY "users view own roles"
  ON public.user_roles FOR SELECT TO authenticated USING (auth.uid() = user_id);

-- RLS: books
CREATE POLICY "books viewable by all authenticated"
  ON public.books FOR SELECT TO authenticated USING (true);
CREATE POLICY "librarians publishers can insert books"
  ON public.books FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(),'librarian') OR public.has_role(auth.uid(),'publisher'));
CREATE POLICY "librarians publishers update books"
  ON public.books FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(),'librarian') OR public.has_role(auth.uid(),'publisher'));
CREATE POLICY "librarians publishers delete books"
  ON public.books FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(),'librarian') OR public.has_role(auth.uid(),'publisher'));

-- RLS: borrow_records
CREATE POLICY "users view own borrows"
  ON public.borrow_records FOR SELECT TO authenticated
  USING (auth.uid() = user_id OR public.has_role(auth.uid(),'librarian'));
CREATE POLICY "users request own borrow"
  ON public.borrow_records FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);
CREATE POLICY "librarians update borrows"
  ON public.borrow_records FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(),'librarian'));

-- Trigger: auto-create profile + role on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_role app_role;
  v_role_text TEXT;
BEGIN
  v_role_text := COALESCE(NEW.raw_user_meta_data->>'role', 'student');
  BEGIN
    v_role := v_role_text::app_role;
  EXCEPTION WHEN others THEN
    v_role := 'student';
  END;

  INSERT INTO public.profiles (id, full_name, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', split_part(NEW.email,'@',1)),
    NEW.email
  )
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, v_role)
  ON CONFLICT (user_id, role) DO NOTHING;

  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
