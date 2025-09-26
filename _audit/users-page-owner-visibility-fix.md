# Users Page - Company Owner Visibility Fix

## Problem Statement
When logged in as a client (james.o.campion+test77@gmail.com), the Users page at `http://localhost:3000/users` was not displaying the company owner in the team members list. The owner should appear as part of their company's team.

## Root Cause
The `company_memberships` controller was only fetching records from the `company_memberships` table, but company owners might not have an explicit membership record. The owner relationship is stored directly on the `companies` table via the `owner_id` field.

Data Model:
```
Company:
  - owner_id → User (the owner)
  - has_many :company_memberships

CompanyMembership:
  - belongs_to :company
  - belongs_to :user
  - role: owner/admin/accountant/viewer
```

## Security Consideration
- **Data Isolation**: Ensured clients can only see users for their own companies
- **Authorization**: Maintained existing authorization checks via `can_access_company?`

## Solution Implemented

### 1. Modified CompanyMembershipsController#index
Added logic to include the company owner as a virtual membership if they don't have an explicit membership record:

```ruby
# Build members array including the owner if they don't have a membership record
members = []

# Add the owner as a virtual membership if they exist and don't have a membership
if @company.owner && !@memberships.exists?(user: @company.owner)
  owner_membership = serialize_owner_as_membership(@company)
  members << owner_membership if owner_membership
end

# Add all existing memberships
members += @memberships.map { |membership| serialize_membership(membership) }
```

### 2. Added serialize_owner_as_membership Method
Created a new private method to serialize the company owner as a virtual membership object:

```ruby
def serialize_owner_as_membership(company)
  return nil unless company.owner
  
  {
    id: "owner-#{company.owner.id}",
    role: 'owner',
    accepted: true,
    accepted_at: company.created_at.iso8601,
    created_at: company.created_at.iso8601,
    user: {
      id: company.owner.id,
      email: company.owner.email,
      full_name: company.owner.full_name,
      # ... other user fields
    },
    company: {
      id: company.id,
      name: company.name
    }
  }
end
```

### 3. Optimized Database Query
Added `.includes(:owner)` to the company query to prevent N+1 queries:

```ruby
accessible_companies = Company.includes(:owner).where(
  'owner_id = ? OR id IN (SELECT company_id FROM company_memberships WHERE user_id = ?)', 
  current_user.id, current_user.id
)
```

## Security & Data Isolation

### Existing Authorization Maintained
- The `authorize_membership_access` method continues to enforce access control
- Users can only view memberships for companies they have access to
- The `can_access_company?` check ensures proper data isolation

### No Cross-Company Data Leakage
- Each user only sees team members for their own companies
- The query filters companies by ownership OR membership
- No changes to the authorization logic were needed

## Result
✅ Company owners now appear in their company's team members list
✅ Data isolation is maintained - clients only see their own company's users
✅ No duplicate entries if owner also has a membership record
✅ Backward compatible with existing membership records
✅ Consistent UI/UX - owners show with "owner" role badge

## Testing Scenarios
1. **Owner without membership**: Owner appears in team list
2. **Owner with membership**: No duplicate, membership record takes precedence
3. **Member viewing**: Can see all team members including owner
4. **Non-member viewing**: Cannot access the company's members (403 Forbidden)

## Technical Debt Avoided
- Used virtual membership pattern instead of creating database records
- Maintained consistency with existing serialization format
- Avoided modifying database schema
- Kept authorization logic intact
