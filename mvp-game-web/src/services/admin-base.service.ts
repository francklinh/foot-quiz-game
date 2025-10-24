// src/services/admin-base.service.ts
import { supabase } from '../lib/supabase';
import { ERROR_MESSAGES, LIMITS, QUERY_OPTIONS } from './admin-constants';

// Base types
export interface BaseEntity {
  id: string;
  created_at: string;
  updated_at: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

export interface BulkOperationResult {
  success_count: number;
  error_count: number;
  errors: string[];
}

export interface BulkUpdateResult extends BulkOperationResult {
  updated_count: number;
}

export interface BulkDeleteResult extends BulkOperationResult {
  deleted_count: number;
}

// Base Admin Service Class
export abstract class BaseAdminService {
  protected readonly supabase = supabase;
  protected readonly errorMessages = ERROR_MESSAGES;
  protected readonly limits = LIMITS;
  protected readonly queryOptions = QUERY_OPTIONS;

  // Common validation methods
  protected validateId(id: string, fieldName: string = 'ID'): void {
    if (!id || id.trim() === '') {
      throw new Error(`${fieldName} est requis`);
    }
  }

  protected validateRequired(data: any, requiredFields: string[]): void {
    const errors: string[] = [];
    
    for (const field of requiredFields) {
      if (!data[field] || (typeof data[field] === 'string' && data[field].trim() === '')) {
        errors.push(`${field} est requis`);
      }
    }
    
    if (errors.length > 0) {
      throw new Error(errors.join(', '));
    }
  }

  protected validateEnum<T extends string>(
    value: string, 
    validValues: readonly T[], 
    fieldName: string
  ): void {
    if (!validValues.includes(value as T)) {
      throw new Error(`${fieldName} invalide. Valeurs acceptées: ${validValues.join(', ')}`);
    }
  }

  protected validateRange(
    value: number, 
    min: number, 
    max: number, 
    fieldName: string
  ): void {
    if (value < min || value > max) {
      throw new Error(`${fieldName} doit être entre ${min} et ${max}`);
    }
  }

  protected validateStringLength(
    value: string, 
    minLength: number, 
    maxLength: number, 
    fieldName: string
  ): void {
    if (value.length < minLength || value.length > maxLength) {
      throw new Error(`${fieldName} doit contenir entre ${minLength} et ${maxLength} caractères`);
    }
  }

  // Common database operations
  protected async executeQuery<T>(
    queryBuilder: any,
    operation: string = 'query'
  ): Promise<T> {
    try {
      const { data, error } = await queryBuilder;
      
      if (error) {
        console.error(`Database error in ${operation}:`, error);
        throw new Error(this.errorMessages.DATABASE_ERROR);
      }
      
      return data;
    } catch (error: any) {
      if (error.message === this.errorMessages.DATABASE_ERROR) {
        throw error;
      }
      console.error(`Unexpected error in ${operation}:`, error);
      throw new Error(this.errorMessages.DATABASE_ERROR);
    }
  }

  protected async executeInsert<T>(
    tableName: string,
    data: any,
    selectFields: string = '*'
  ): Promise<T> {
    const queryBuilder = this.supabase
      .from(tableName)
      .insert([data])
      .select(selectFields)
      .single();
    
    return this.executeQuery<T>(queryBuilder, `insert into ${tableName}`);
  }

  protected async executeUpdate<T>(
    tableName: string,
    id: string,
    updates: any,
    selectFields: string = '*'
  ): Promise<T> {
    const queryBuilder = this.supabase
      .from(tableName)
      .update(updates)
      .eq('id', id)
      .select(selectFields)
      .single();
    
    return this.executeQuery<T>(queryBuilder, `update ${tableName}`);
  }

  protected async executeDelete(
    tableName: string,
    id: string
  ): Promise<boolean> {
    const queryBuilder = this.supabase
      .from(tableName)
      .delete()
      .eq('id', id);
    
    await this.executeQuery(queryBuilder, `delete from ${tableName}`);
    return true;
  }

  protected async executeSelect<T>(
    tableName: string,
    filters: Record<string, any> = {},
    orderBy: string = 'created_at',
    orderDirection: 'asc' | 'desc' = 'desc',
    selectFields: string = '*'
  ): Promise<T[]> {
    let queryBuilder = this.supabase
      .from(tableName)
      .select(selectFields);
    
    // Apply filters
    for (const [key, value] of Object.entries(filters)) {
      if (value !== undefined && value !== null) {
        queryBuilder = queryBuilder.eq(key, value);
      }
    }
    
    // Apply ordering
    queryBuilder = queryBuilder.order(orderBy, { ascending: orderDirection === 'asc' });
    
    const data = await this.executeQuery<T[]>(queryBuilder, `select from ${tableName}`);
    return data || [];
  }

  protected async executeSelectSingle<T>(
    tableName: string,
    id: string,
    selectFields: string = '*'
  ): Promise<T> {
    const queryBuilder = this.supabase
      .from(tableName)
      .select(selectFields)
      .eq('id', id)
      .single();
    
    return this.executeQuery<T>(queryBuilder, `select single from ${tableName}`);
  }

  // Common bulk operations
  protected async executeBulkOperation<T>(
    items: T[],
    operation: (item: T) => Promise<any>,
    operationName: string
  ): Promise<BulkOperationResult> {
    const result: BulkOperationResult = {
      success_count: 0,
      error_count: 0,
      errors: []
    };

    for (const item of items) {
      try {
        await operation(item);
        result.success_count++;
      } catch (error: any) {
        result.error_count++;
        result.errors.push(`${operationName} failed: ${error.message}`);
      }
    }

    return result;
  }

  // Common search functionality
  protected async executeSearch<T>(
    tableName: string,
    searchField: string,
    searchTerm: string,
    additionalFilters: Record<string, any> = {},
    selectFields: string = '*'
  ): Promise<T[]> {
    if (!searchTerm || searchTerm.length < this.limits.MIN_SEARCH_LENGTH) {
      return [];
    }

    let queryBuilder = this.supabase
      .from(tableName)
      .select(selectFields)
      .ilike(searchField, `%${searchTerm}%`);
    
    // Apply additional filters
    for (const [key, value] of Object.entries(additionalFilters)) {
      if (value !== undefined && value !== null) {
        queryBuilder = queryBuilder.eq(key, value);
      }
    }
    
    queryBuilder = queryBuilder.order(searchField, { ascending: true });
    
    const data = await this.executeQuery<T[]>(queryBuilder, `search in ${tableName}`);
    return data || [];
  }

  // Common statistics calculation
  protected calculateStatistics<T>(
    data: T[],
    groupByField: keyof T
  ): Record<string, number> {
    return data.reduce((acc: Record<string, number>, item) => {
      const key = String(item[groupByField]);
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {});
  }

  // Common performance metrics calculation
  protected calculatePerformanceMetrics(
    results: Array<{ score: number; time_taken: number; is_completed: boolean }>
  ) {
    const totalResults = results.length;
    const completedResults = results.filter(r => r.is_completed);
    const completionRate = totalResults > 0 ? completedResults.length / totalResults : 0;
    
    const averageScore = completedResults.length > 0 
      ? completedResults.reduce((sum, r) => sum + r.score, 0) / completedResults.length 
      : 0;
    
    const averageTime = completedResults.length > 0 
      ? completedResults.reduce((sum, r) => sum + r.time_taken, 0) / completedResults.length 
      : 0;
    
    const successRate = completedResults.length > 0 
      ? completedResults.filter(r => r.score > 0).length / completedResults.length 
      : 0;

    return {
      completion_rate: completionRate,
      average_score: averageScore,
      average_time: averageTime,
      success_rate: successRate
    };
  }
}
