# Database Schema Optimization Audit

**Date**: 2025-09-22
**Branch**: `feature/database-optimization`
**Status**: 🔄 **IN PROGRESS**

## Executive Summary

Comprehensive audit of database schema for optimization opportunities. The current schema is functional but has several areas for improvement in performance, data integrity, and maintainability.

## Current Schema Analysis

### Database Size & Performance
- **Total Tables**: 25+ tables
- **Largest Tables**: `documents`, `companies`, `people`, `users`
- **Key Relationships**: Company-centric with extensive document and workflow management
- **JSONB Usage**: Heavy use of JSONB fields for flexible data storage

### Current Index Analysis
- **Good Coverage**: Most primary keys and foreign keys have indexes
- **Missing Indexes**: Several compound indexes for common query patterns
- **Redundant Indexes**: Some duplicate or unnecessary indexes

## Issues Identified

### 1. 🔍 **Missing Compound Indexes**
**Problem**: Queries often filter by multiple columns but lack compound indexes

**Affected Tables**:
- `companies`: Missing index on `(status, submitted_at)`
- `documents`: Missing index on `(company_id, document_type, verified)`
- `payments`: Missing index on `(company_id, status, paid_at)`
- `visa_applications`: Missing index on `(company_id, person_id, status)`

### 2. 🔍 **JSONB Field Optimization**
**Problem**: Heavy JSONB usage without proper indexing

**Affected Fields**:
- `companies.metadata` - frequently queried but no GIN index
- `documents.extracted_data` - large JSONB field with GIN index but could be optimized
- `people.contact_info` - could be normalized for better querying

### 3. 🔍 **Foreign Key Optimization**
**Problem**: Some cascade behaviors could be improved

**Affected Relationships**:
- `documents` → `companies`: Hard delete could be problematic
- `people` → `companies`: Missing cascade behavior for company deletion
- `payments` → `companies`: Missing proper cascade handling

### 4. 🔍 **Data Normalization Opportunities**
**Problem**: Some JSONB fields contain structured data that could be normalized

**Candidates for Normalization**:
- `companies.countries_of_operation` (array field)
- `companies.name_options` (array field)
- `people.contact_info` (JSONB with phone/email data)
- `documents.extracted_data` (passport/identity data)

## Proposed Optimizations

### Phase 1: Index Optimization
```sql
-- Add missing compound indexes
CREATE INDEX CONCURRENTLY index_companies_on_status_submitted
ON companies(status, submitted_at);

CREATE INDEX CONCURRENTLY index_documents_on_company_type_verified
ON documents(company_id, document_type, verified);

CREATE INDEX CONCURRENTLY index_payments_on_company_status_paid
ON payments(company_id, status, paid_at);

-- Add GIN indexes for JSONB queries
CREATE INDEX CONCURRENTLY index_companies_metadata ON companies
USING GIN (metadata);

CREATE INDEX CONCURRENTLY index_documents_extracted_data ON documents
USING GIN (extracted_data);
```

### Phase 2: Data Normalization
**Questions for Business Logic**:
1. **Countries of Operation**: How frequently do companies operate in multiple countries? Is this data used for filtering/reporting?
2. **Contact Information**: Are phone numbers and contact details frequently queried separately, or always as a complete set?
3. **Name Options**: Are these used actively in the application, or just stored for reference?
4. **Document Data**: How critical is the extracted passport/identity data for reporting and analytics?

### Phase 3: Foreign Key Improvements
**Questions for Business Logic**:
1. **Document Deletion**: When a company is deleted, should all associated documents be deleted immediately, or should they be archived first?
2. **Payment Records**: Should payment records be preserved when a company is deleted for audit purposes?
3. **User Associations**: How should user-company relationships be handled when users are deleted?

### Phase 4: Query Performance
**Current Slow Queries** (identified from logs):
- Company dashboard queries with multiple JOINs
- Document search with JSONB operations
- Payment status queries
- User permission checks

## Implementation Strategy

### 1. **Non-Breaking Changes First**
- Add new indexes concurrently
- Add new GIN indexes for JSONB
- Improve existing foreign key constraints

### 2. **Data Migration Strategy**
- Create new normalized tables alongside existing JSONB fields
- Migrate data gradually during low-traffic periods
- Maintain backward compatibility during transition

### 3. **Performance Testing**
- Benchmark queries before and after changes
- Monitor index usage and query performance
- Test with realistic data volumes

## Migration Plan

### Migration 1: Index Optimization
- Add compound indexes for common query patterns
- Add GIN indexes for JSONB fields
- Remove redundant indexes

### Migration 2: Foreign Key Improvements
- Update cascade behaviors based on business requirements
- Add missing foreign key constraints

### Migration 3: Data Normalization (if approved)
- Create new tables for normalized data
- Add migration scripts for data transfer
- Update application code to use normalized data

## Business Logic Questions

**Please provide guidance on the following:**

1. **Data Retention Policies**:
   - How long should documents be retained after company deletion?
   - Should payment records be archived or deleted with companies?
   - What's the data retention policy for user data?

2. **Normalization Requirements**:
   - Are countries of operation frequently filtered or reported on?
   - Do you need to search documents by specific extracted data fields?
   - Are contact details queried independently?

3. **Performance Priorities**:
   - Which queries are most critical for user experience?
   - What's acceptable query response time for dashboard loading?
   - Are there specific slow pages that need optimization?

4. **Data Integrity Requirements**:
   - Should document references be maintained if companies are deleted?
   - How important is referential integrity for historical data?
   - Are there legal requirements for data retention?

## Next Steps

1. **Await Business Logic Clarification** - Need answers to questions above
2. **Create Migration Files** - Based on approved optimization plan
3. **Performance Testing** - Benchmark before/after changes
4. **Gradual Rollout** - Apply changes during low-traffic periods

**Current Status**: Awaiting business logic clarification before proceeding with database schema changes.
