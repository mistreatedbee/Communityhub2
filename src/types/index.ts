export type UserRole = 'public' | 'member' | 'employee' | 'supervisor' | 'admin' | 'owner' | 'super_admin';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  organizationId: string;
  joinedAt: string;
  status: 'active' | 'inactive' | 'pending';
  lastActiveAt?: string;
}

export interface Organization {
  id: string;
  name: string;
  slug?: string;
  logo?: string;
  primaryColor: string;
  secondaryColor: string;
  description?: string;
  contactEmail?: string;
  address?: string;
  category?: string;
  location?: string;
  isPublic?: boolean;
  status?: 'active' | 'pending' | 'suspended';
}

export interface Plan {
  id: string;
  name: string;
  price: number;
  billingCycle: 'monthly' | 'yearly';
  features: string[];
  maxMembers: number;
  maxAdmins?: number;
  maxStorageMB?: number;
  maxPosts?: number;
  maxResources?: number;
  isActive: boolean;
}

export interface OrganizationWithPlan extends Organization {
  planId: string;
  status: 'active' | 'suspended' | 'trial';
  createdAt: string;
  adminCount: number;
  memberCount: number;
  planName?: string; // Helper for display
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  date: string;
  isPinned: boolean;
  author: string;
  category: 'general' | 'urgent' | 'news';
  visibility: 'public' | 'members' | 'leaders';
}

export interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  isOnline: boolean;
  meetingLink?: string;
  imageUrl?: string;
  attendees: number;
  category: 'social' | 'workshop' | 'meeting';
}

export interface NewsArticle {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  date: string;
  author: string;
  imageUrl?: string;
  category: string;
}

export interface Group {
  id: string;
  name: string;
  description: string;
  memberCount: number;
  isPrivate: boolean;
  imageUrl?: string;
}

export interface NavItem {
  label: string;
  href: string;
  icon?: any; // Lucide icon
  roles?: UserRole[];
}

export interface Application {
  id: string;
  userId: string; // Potentially temporary ID if not yet a user
  applicantName: string;
  applicantEmail: string;
  status: 'pending' | 'approved' | 'rejected' | 'info_requested';
  submittedAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
  personalInfo: Record<string, any>;
  contactInfo: Record<string, any>;
  background: Record<string, any>;
  notes?: string;
}

export interface Session {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  duration: number; // minutes
  meetingLink: string;
  hostId: string;
  isRecorded: boolean;
  recordingUrl?: string;
  attendees: number;
  accessLevel: 'all' | 'members' | 'leaders';
}

export interface FormField {
  id: string;
  type: 'text' | 'textarea' | 'select' | 'checkbox' | 'radio' | 'date';
  label: string;
  required: boolean;
  options?: string[];
}

export interface Form {
  id: string;
  title: string;
  description: string;
  fields: FormField[];
  createdAt: string;
  isActive: boolean;
  responseCount: number;
}

export interface FormResponse {
  id: string;
  formId: string;
  userId: string;
  submittedAt: string;
  responses: Record<string, any>;
}