export type UserRole = "member" | "admin" | "super_admin";
export type UserStatus = "pending" | "approved" | "rejected";
export type ProjectStatus = "active" | "completed" | "archived";
export type TaskStatus = "todo" | "in_progress" | "ready_for_you" | "done";
export type AttachmentKind = "google_doc" | "google_sheet" | "link";
export type InvoiceStatus = "draft" | "sent" | "paid";
export type AppCurrency = "USD" | "PKR";
export type BlogPostStatus = "draft" | "published";

export const APP_CURRENCIES: AppCurrency[] = ["USD", "PKR"];

export const BLOG_AD_SLOT_KEYS = [
  "listing_banner",
  "post_sidebar",
  "post_inline",
  "post_bottom",
] as const;

export type BlogAdSlotKey = (typeof BLOG_AD_SLOT_KEYS)[number];

export const EXPENSE_CATEGORIES = [
  "rent",
  "utilities",
  "software",
  "equipment",
  "marketing",
  "travel",
  "meals",
  "contractor",
  "general",
  "other",
] as const;

export type ExpenseCategory = (typeof EXPENSE_CATEGORIES)[number];

export interface Profile {
  id: string;
  email: string;
  full_name: string;
  phone: string | null;
  cnic: string | null;
  role: UserRole;
  status: UserStatus;
  avatar_url: string | null;
  created_at: string;
}

export interface StickyNote {
  id: string;
  user_id: string;
  content: string;
  color: string;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface Client {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  company: string | null;
  address: string | null;
  notes: string | null;
  created_by: string;
  created_at: string;
}

export interface Project {
  id: string;
  title: string;
  description: string | null;
  status: ProjectStatus;
  client_id: string | null;
  created_by: string;
  created_at: string;
  client?: Client | null;
}

export interface ProjectMember {
  id: string;
  project_id: string;
  user_id: string;
  created_at: string;
  profile?: Profile;
}

export interface Task {
  id: string;
  project_id: string | null;
  title: string;
  description: string | null;
  assigned_to: string | null;
  created_by: string;
  status: TaskStatus;
  due_date: string | null;
  created_at: string;
  assignee?: Profile | null;
  project?: Project | null;
}

export interface Message {
  id: string;
  project_id: string;
  user_id: string;
  body: string;
  created_at: string;
  profile?: Profile;
  attachments?: MessageAttachment[];
}

export interface MessageAttachment {
  id: string;
  message_id: string;
  label: string;
  url: string;
  kind: AttachmentKind;
}

export interface InvoiceItem {
  title: string;
  description: string;
  quantity: number;
  unit_price: number;
}

export interface Invoice {
  id: string;
  invoice_number: string;
  client_id: string | null;
  client_name: string;
  client_email: string | null;
  issue_date: string;
  due_date: string | null;
  items: InvoiceItem[];
  notes: string | null;
  status: InvoiceStatus;
  currency: AppCurrency | string;
  created_by: string;
  created_at: string;
  client?: Client | null;
}

export interface Salary {
  id: string;
  user_id: string;
  amount: number;
  tax_deduction: number;
  loan_deduction: number;
  currency: AppCurrency;
  period_year: number;
  period_month: number;
  paid_on: string;
  transfer_screenshot_path: string | null;
  notes: string | null;
  created_by: string;
  created_at: string;
  profile?: Profile;
}

export interface Expense {
  id: string;
  title: string;
  category: string;
  amount: number;
  currency: AppCurrency;
  expense_date: string;
  notes: string | null;
  created_by: string;
  created_at: string;
}

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  featured_image_path: string | null;
  status: BlogPostStatus;
  fiverr_url: string | null;
  upwork_url: string | null;
  published_at: string | null;
  created_by: string;
  created_at: string;
  updated_at: string;
  meta_title: string | null;
  meta_description: string | null;
  focus_keyword: string | null;
  image_alt: string | null;
  source_topic: string | null;
  ai_generated: boolean;
}

export interface BlogAiRun {
  id: string;
  status: "running" | "success" | "partial" | "failed";
  trigger: "manual" | "schedule";
  articles_requested: number;
  articles_published: number;
  log: unknown[];
  error: string | null;
  created_by: string | null;
  created_at: string;
  finished_at: string | null;
}

export interface BlogAiSettings {
  id: number;
  enabled: boolean;
  schedule_hour_utc: number;
  daily_article_count: number;
  ai_topic_count: number;
  last_scheduled_run_on: string | null;
  updated_at: string;
}

export interface BlogAdSlot {
  slot_key: BlogAdSlotKey | string;
  label: string;
  ad_code: string;
  updated_at: string;
}

export interface BlogRedirect {
  slug: string;
  target: string;
  created_at: string;
}

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: Partial<Profile> & { id: string; email: string; full_name: string };
        Update: Partial<Profile>;
      };
      sticky_notes: {
        Row: StickyNote;
        Insert: Omit<StickyNote, "id" | "created_at" | "updated_at"> & { id?: string };
        Update: Partial<StickyNote>;
      };
      projects: {
        Row: Project;
        Insert: Omit<Project, "id" | "created_at" | "client"> & { id?: string };
        Update: Partial<Project>;
      };
      clients: {
        Row: Client;
        Insert: Omit<Client, "id" | "created_at"> & { id?: string };
        Update: Partial<Client>;
      };
      project_members: {
        Row: ProjectMember;
        Insert: Omit<ProjectMember, "id" | "created_at" | "profile"> & { id?: string };
        Update: Partial<ProjectMember>;
      };
      tasks: {
        Row: Task;
        Insert: Omit<Task, "id" | "created_at" | "assignee" | "project"> & { id?: string };
        Update: Partial<Task>;
      };
      messages: {
        Row: Message;
        Insert: Omit<Message, "id" | "created_at" | "profile" | "attachments"> & { id?: string };
        Update: Partial<Message>;
      };
      message_attachments: {
        Row: MessageAttachment;
        Insert: Omit<MessageAttachment, "id"> & { id?: string };
        Update: Partial<MessageAttachment>;
      };
      invoices: {
        Row: Invoice;
        Insert: Omit<Invoice, "id" | "created_at" | "client"> & { id?: string };
        Update: Partial<Invoice>;
      };
      salaries: {
        Row: Salary;
        Insert: Omit<Salary, "id" | "created_at" | "profile"> & { id?: string };
        Update: Partial<Salary>;
      };
      expenses: {
        Row: Expense;
        Insert: Omit<Expense, "id" | "created_at"> & { id?: string };
        Update: Partial<Expense>;
      };
      blog_posts: {
        Row: BlogPost;
        Insert: Omit<
          BlogPost,
          | "id"
          | "created_at"
          | "updated_at"
          | "meta_title"
          | "meta_description"
          | "focus_keyword"
          | "image_alt"
          | "source_topic"
          | "ai_generated"
        > & {
          id?: string;
          created_at?: string;
          updated_at?: string;
          meta_title?: string | null;
          meta_description?: string | null;
          focus_keyword?: string | null;
          image_alt?: string | null;
          source_topic?: string | null;
          ai_generated?: boolean;
        };
        Update: Partial<BlogPost>;
      };
      blog_ad_slots: {
        Row: BlogAdSlot;
        Insert: BlogAdSlot;
        Update: Partial<BlogAdSlot>;
      };
      blog_ai_runs: {
        Row: BlogAiRun;
        Insert: Omit<BlogAiRun, "id" | "created_at"> & { id?: string; created_at?: string };
        Update: Partial<BlogAiRun>;
      };
      blog_ai_settings: {
        Row: BlogAiSettings;
        Insert: Partial<BlogAiSettings> & { id?: number };
        Update: Partial<BlogAiSettings>;
      };
      blog_redirects: {
        Row: BlogRedirect;
        Insert: Omit<BlogRedirect, "created_at"> & { created_at?: string };
        Update: Partial<BlogRedirect>;
      };
    };
  };
}
