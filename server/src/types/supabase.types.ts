/**
 * Supabase Type Definitions
 * Type-safe Supabase client with database schema
 *
 * This file provides TypeScript types for Supabase queries
 * ensuring type safety when interacting with the database
 */

import { Database } from './database.schema';

export type { Database };

// Convenience type exports for common patterns
export type Tables<T extends keyof Database['public']['Tables']> =
    Database['public']['Tables'][T]['Row'];

export type TablesInsert<T extends keyof Database['public']['Tables']> =
    Database['public']['Tables'][T]['Insert'];

export type TablesUpdate<T extends keyof Database['public']['Tables']> =
    Database['public']['Tables'][T]['Update'];

export type Enums<T extends keyof Database['public']['Enums']> =
    Database['public']['Enums'][T];

// View types
export type Views<T extends keyof Database['public']['Views']> =
    Database['public']['Views'][T]['Row'];

// Function types
export type Functions<T extends keyof Database['public']['Functions']> =
    Database['public']['Functions'][T];
