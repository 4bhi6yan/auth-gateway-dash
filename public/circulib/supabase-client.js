// CircuLib — Supabase client + auth + books helpers (shared across all pages)
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.4";

const SUPABASE_URL = "https://stvcoljoqguqxxtflqjv.supabase.co";
const SUPABASE_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN0dmNvbGpvcWd1cXh4dGZscWp2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkyMDAwNDgsImV4cCI6MjA5NDc3NjA0OH0.AaKBi3WqyBtxeh2KANwb_jagU83hoHJnFNPBxac7XcA";

export const sb = createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: { persistSession: true, autoRefreshToken: true, storage: localStorage },
});
window.sb = sb;

const DASH = {
  student: "/circulib/student-dashboard.html",
  faculty: "/circulib/faculty-dashboard.html",
  librarian: "/circulib/librarian-dashboard.html",
  publisher: "/circulib/publisher-dashboard.html",
};

export async function currentRole() {
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return { user: null, role: null, profile: null };
  const [{ data: rolesRow }, { data: profile }] = await Promise.all([
    sb.from("user_roles").select("role").eq("user_id", user.id).maybeSingle(),
    sb.from("profiles").select("*").eq("id", user.id).maybeSingle(),
  ]);
  return { user, role: rolesRow?.role || "student", profile };
}

export function dashboardUrl(role) {
  return DASH[role] || DASH.student;
}

export function toast(msg, isError = false) {
  let el = document.getElementById("__cl_toast");
  if (!el) {
    el = document.createElement("div");
    el.id = "__cl_toast";
    el.style.cssText =
      "position:fixed;bottom:24px;left:50%;transform:translateX(-50%);background:#111;color:#fff;padding:12px 20px;border-radius:12px;font-family:Inter,sans-serif;font-size:14px;z-index:99999;box-shadow:0 8px 32px rgba(0,0,0,.4);max-width:90vw;text-align:center;transition:opacity .3s;";
    document.body.appendChild(el);
  }
  el.style.background = isError ? "#b00020" : "#111";
  el.textContent = msg;
  el.style.opacity = "1";
  clearTimeout(el._t);
  el._t = setTimeout(() => (el.style.opacity = "0"), 3200);
}

// --- AUTH ACTIONS ---
export async function signUpWithRole({ email, password, fullName, role }) {
  const { data, error } = await sb.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${window.location.origin}/circulib/index.html`,
      data: { full_name: fullName, role },
    },
  });
  if (error) throw error;
  return data;
}

export async function signIn({ email, password }) {
  const { data, error } = await sb.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data;
}

export async function signInOAuth(provider) {
  const { data, error } = await sb.auth.signInWithOAuth({
    provider,
    options: { redirectTo: `${window.location.origin}/circulib/index.html` },
  });
  if (error) throw error;
  return data;
}

export async function signOut() {
  await sb.auth.signOut();
  window.location.href = "/circulib/index.html";
}

export async function redirectAfterLogin(roleHint) {
  const { role } = await currentRole();
  const target = roleHint && DASH[roleHint] ? DASH[roleHint] : dashboardUrl(role);
  window.location.href = target;
}

// --- ROUTE GUARD for dashboards ---
export async function requireRole(expected) {
  const { user, role, profile } = await currentRole();
  if (!user) {
    window.location.href = "/circulib/index.html#login";
    return null;
  }
  if (role !== expected) {
    window.location.href = dashboardUrl(role);
    return null;
  }
  return { user, role, profile };
}

// --- BOOKS API ---
export async function listBooks() {
  const { data, error } = await sb.from("books").select("*").order("created_at", { ascending: false });
  if (error) throw error;
  return data;
}
export async function addBook(book) {
  const { data: { user } } = await sb.auth.getUser();
  const payload = { ...book, added_by: user.id };
  const { data, error } = await sb.from("books").insert(payload).select().single();
  if (error) throw error;
  return data;
}
export async function deleteBook(id) {
  const { error } = await sb.from("books").delete().eq("id", id);
  if (error) throw error;
}
export async function updateBook(id, patch) {
  const { error } = await sb.from("books").update(patch).eq("id", id);
  if (error) throw error;
}
export async function requestBorrow(bookId) {
  const { data: { user } } = await sb.auth.getUser();
  if (!user) throw new Error("Login required");
  const due = new Date(Date.now() + 14 * 86400000).toISOString();
  const { data, error } = await sb.from("borrow_records").insert({
    book_id: bookId, user_id: user.id, status: "requested", due_date: due,
  }).select().single();
  if (error) throw error;
  return data;
}
export async function myBorrows() {
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return [];
  const { data, error } = await sb.from("borrow_records")
    .select("*, books(*)").eq("user_id", user.id)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data || [];
}
export async function allBorrows() {
  const { data, error } = await sb.from("borrow_records")
    .select("*, books(*), profiles:user_id(full_name,email)")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data || [];
}
export async function setBorrowStatus(id, status) {
  const patch = { status };
  if (status === "issued") patch.borrowed_at = new Date().toISOString();
  if (status === "returned") patch.returned_at = new Date().toISOString();
  const { error } = await sb.from("borrow_records").update(patch).eq("id", id);
  if (error) throw error;
}
