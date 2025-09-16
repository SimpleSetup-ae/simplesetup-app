# Supabase Business Activities Table Setup

## Overview
This guide will help you create the `business_activities` table in Supabase and import all 852 business activities from the CSV file.

## Step 1: Run the SQL Script

1. Open your Supabase dashboard
2. Go to the SQL Editor
3. Copy and paste the contents of `complete_business_activities.sql` into the editor
4. Click "Run" to execute the script

This will:
- Create the `business_activities` table with proper schema
- Set up indexes for performance
- Enable Row Level Security (RLS)
- Create a public read policy
- Import all 852 business activities from the CSV

## Step 2: Verify the Import

After running the SQL, verify the import by running this query:

```sql
SELECT 
    COUNT(*) as total_activities,
    COUNT(CASE WHEN activity_type = 'Professional' THEN 1 END) as professional_count,
    COUNT(CASE WHEN activity_type = 'Commercial' THEN 1 END) as commercial_count,
    COUNT(CASE WHEN regulation_type = 'Regulated' THEN 1 END) as regulated_count,
    COUNT(CASE WHEN regulation_type = 'Non-Regulated' THEN 1 END) as non_regulated_count
FROM business_activities;
```

Expected results:
- Total activities: 852
- Mix of Professional and Commercial activities
- Mix of Regulated and Non-Regulated activities

## Step 3: Test the API

Once the table is created, you can test the API endpoints:

### Frontend API (Next.js)
- `GET /api/business-activities` - Get all activities with pagination
- `GET /api/business-activities?search=oil` - Search activities
- `GET /api/business-activities?activity_type=Professional` - Filter by type
- `GET /api/business-activities?freezone=IFZA` - Filter by freezone

### Example API Response
```json
{
  "data": [
    {
      "id": "uuid",
      "freezone": "IFZA",
      "activity_code": "112005",
      "activity_name": "Onshore & Offshore Oil & Gas Fields Services Abroad",
      "activity_description": "Includes providing technical and engineering services...",
      "activity_type": "Professional",
      "property_requirements": "",
      "notes": "",
      "classification": "",
      "regulation_type": "Non-Regulated",
      "approving_entity_1": "",
      "approving_entity_2": "",
      "created_at": "2024-01-01T00:00:00Z",
      "updated_at": "2024-01-01T00:00:00Z"
    }
  ],
  "meta": {
    "current_page": 1,
    "total_pages": 18,
    "total_count": 852,
    "per_page": 50
  }
}
```

## Step 4: Environment Variables

Make sure you have these environment variables set in your `.env.local` file:

```env
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

## Step 5: Test the Frontend

After setting up the table and environment variables:

1. The demo form at `http://localhost:3001/demo-form` will now show all 852 real business activities
2. The business activities page at `http://localhost:3001/business-activities` will display the complete directory
3. Search functionality will work across all activities
4. Filtering by Professional/Commercial will work properly

## Table Schema

```sql
CREATE TABLE business_activities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    freezone VARCHAR(50) NOT NULL,
    activity_code VARCHAR(50) NOT NULL UNIQUE,
    activity_name TEXT NOT NULL,
    activity_description TEXT,
    activity_type VARCHAR(20) NOT NULL CHECK (activity_type IN ('Professional', 'Commercial')),
    property_requirements TEXT,
    notes TEXT,
    classification TEXT,
    regulation_type VARCHAR(20) NOT NULL DEFAULT 'Non-Regulated' CHECK (regulation_type IN ('Regulated', 'Non-Regulated')),
    approving_entity_1 TEXT,
    approving_entity_2 TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

## Features Enabled

✅ **852 Real Business Activities** - Complete IFZA directory
✅ **Full-Text Search** - Search across names, descriptions, and codes  
✅ **Type Filtering** - Professional vs Commercial
✅ **Regulation Filtering** - Regulated vs Non-Regulated
✅ **Performance Optimized** - Proper indexes and RLS
✅ **Public Access** - Read-only access for frontend
✅ **CSV Export** - Download filtered results
✅ **Similar Activity Suggestions** - Based on activity code prefixes
