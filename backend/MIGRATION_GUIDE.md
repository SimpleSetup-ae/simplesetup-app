# Migration Guide: Database Constraints and Data Compliance

## Overview
This guide helps you safely apply the performance indexes and constraints migration to your database.

## Issue
The migration `20250922083326_add_performance_indexes_and_constraints.rb` adds several constraints that may fail if existing data doesn't comply with the new rules.

## Solution Approach

### 1. Data Cleanup Migration
We've created a cleanup migration (`20250922083325_cleanup_data_for_constraints.rb`) that runs BEFORE the constraints migration. This ensures all data is compliant.

### 2. Constraint Requirements

#### Check Constraints (Status Values)
- **payments.status**: Must be one of: `pending`, `processing`, `paid`, `failed`, `refunded`, `cancelled`
- **visa_applications.status**: Must be one of: `entry_permit`, `medical`, `eid_appointment`, `stamping`, `completed`, `rejected`
- **documents.ocr_status**: Must be one of: `pending`, `processing`, `completed`, `failed`
- **workflow_instances.status**: Must be one of: `pending`, `in_progress`, `completed`, `failed`, `cancelled`
- **workflow_steps.status**: Must be one of: `pending`, `in_progress`, `completed`, `failed`, `cancelled`
- **requests.status**: Must be one of: `pending`, `in_progress`, `completed`, `rejected`, `cancelled`

#### NOT NULL Constraints
The following fields cannot be NULL:
- **companies**: name, free_zone, status
- **documents**: name, file_name, content_type, storage_path
- **people**: type, first_name, last_name
- **users**: email
- **workflow_steps**: step_number, step_type, title

## Migration Steps

### Option 1: Fresh Database (Recommended for Test/Development)

```bash
# Navigate to backend directory
cd /workspace/backend

# Use the reset script
./reset_and_seed.sh

# Or manually:
bundle exec rails db:drop DISABLE_DATABASE_ENVIRONMENT_CHECK=1
bundle exec rails db:create
bundle exec rails db:migrate
bundle exec rails db:seed
```

### Option 2: Existing Database with Data

```bash
# Navigate to backend directory
cd /workspace/backend

# First, backup your database (if important)
pg_dump your_database_name > backup_$(date +%Y%m%d_%H%M%S).sql

# Run the migrations (cleanup will run first)
bundle exec rails db:migrate

# If migration fails, check the error and:
# 1. Rollback: bundle exec rails db:rollback STEP=2
# 2. Fix the data manually or adjust the cleanup migration
# 3. Try again: bundle exec rails db:migrate
```

### Option 3: Manual Data Cleanup

If you need to manually fix data before migration:

```ruby
# Rails console commands
bundle exec rails console

# Check for NULL values that will cause issues
Company.where(name: nil).count
Company.where(free_zone: nil).count
Company.where(status: nil).count

Document.where(name: nil).count
Document.where(file_name: nil).count
Document.where(content_type: nil).count
Document.where(storage_path: nil).count

Person.where(type: nil).count
Person.where(first_name: nil).count
Person.where(last_name: nil).count

User.where(email: nil).count

WorkflowStep.where(step_number: nil).count
WorkflowStep.where(step_type: nil).count
WorkflowStep.where(title: nil).count

# Check for invalid status values
Payment.where.not(status: ['pending', 'processing', 'paid', 'failed', 'refunded', 'cancelled']).count
VisaApplication.where.not(status: ['entry_permit', 'medical', 'eid_appointment', 'stamping', 'completed', 'rejected']).count
Document.where.not(ocr_status: ['pending', 'processing', 'completed', 'failed']).count
WorkflowInstance.where.not(status: ['pending', 'in_progress', 'completed', 'failed', 'cancelled']).count
WorkflowStep.where.not(status: ['pending', 'in_progress', 'completed', 'failed', 'cancelled']).count
Request.where.not(status: ['pending', 'in_progress', 'completed', 'rejected', 'cancelled']).count

# Fix any issues found
# Example: Company.where(name: nil).update_all(name: 'Unnamed Company')
```

## Verification

After migration, verify everything worked:

```bash
bundle exec rails runner "
  puts 'Database Statistics:'
  puts '  Companies: ' + Company.count.to_s
  puts '  Users: ' + User.count.to_s
  puts '  Documents: ' + Document.count.to_s
  
  puts '\nConstraint Verification:'
  puts '  All companies have names: ' + Company.where(name: nil).count.to_s + ' nulls'
  puts '  All documents have names: ' + Document.where(name: nil).count.to_s + ' nulls'
  puts '  All users have emails: ' + User.where(email: nil).count.to_s + ' nulls'
"
```

## Troubleshooting

### Migration Fails with Constraint Violation
1. Note which constraint failed
2. Rollback: `bundle exec rails db:rollback STEP=2`
3. Fix the data using the cleanup migration or manually
4. Retry: `bundle exec rails db:migrate`

### Index Already Exists
- The migration now checks for existing constraints before adding them
- If you still get errors, you may need to manually drop the index first

### Performance Issues
- The migration adds many indexes which may take time on large databases
- Consider running during off-peak hours
- Monitor database performance after migration

## Seeds Compliance
All seed files have been reviewed and are compliant with the new constraints:
- ✅ All required fields are populated
- ✅ All status values match the allowed values
- ✅ No NULL values in NOT NULL fields

## Contact
If you encounter any issues, please check the existing data first using the verification queries above.