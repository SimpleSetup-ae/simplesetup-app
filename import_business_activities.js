const fs = require('fs');
const path = require('path');

// Read the CSV file
const csvPath = path.join(__dirname, 'IFZA Business Activities - Sheet1.csv');
const csvContent = fs.readFileSync(csvPath, 'utf-8');

// Parse CSV manually (simple approach)
const lines = csvContent.split('\n');
const headers = lines[0].split(',');

console.log('CSV Headers:', headers);

// Create SQL for table creation
let sql = `-- Create business_activities table in Supabase
-- Based on IFZA Business Activities CSV structure

-- Drop table if exists (for clean recreation)
DROP TABLE IF EXISTS business_activities;

-- Create the business_activities table
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

-- Create indexes for better performance
CREATE INDEX idx_business_activities_freezone ON business_activities(freezone);
CREATE INDEX idx_business_activities_activity_type ON business_activities(activity_type);
CREATE INDEX idx_business_activities_regulation_type ON business_activities(regulation_type);
CREATE INDEX idx_business_activities_activity_name ON business_activities USING gin(to_tsvector('english', activity_name));
CREATE INDEX idx_business_activities_activity_description ON business_activities USING gin(to_tsvector('english', activity_description));
CREATE INDEX idx_business_activities_freezone_type ON business_activities(freezone, activity_type);

-- Enable Row Level Security
ALTER TABLE business_activities ENABLE ROW LEVEL SECURITY;

-- Create policy to allow read access to all users (public data)
CREATE POLICY "Allow public read access to business activities" 
ON business_activities FOR SELECT 
TO PUBLIC 
USING (true);

-- Add a trigger to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_business_activities_updated_at 
    BEFORE UPDATE ON business_activities 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Insert all business activities data
`;

// Function to escape SQL strings
function escapeSqlString(str) {
    if (!str) return '';
    return str.replace(/'/g, "''");
}

// Parse CSV and generate INSERT statements
const insertValues = [];

for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    // Simple CSV parsing - handle quoted fields
    const fields = [];
    let currentField = '';
    let inQuotes = false;
    
    for (let j = 0; j < line.length; j++) {
        const char = line[j];
        
        if (char === '"') {
            inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
            fields.push(currentField.trim());
            currentField = '';
        } else {
            currentField += char;
        }
    }
    fields.push(currentField.trim()); // Add the last field

    if (fields.length >= 11) {
        const freezone = escapeSqlString(fields[0]);
        const activityCode = escapeSqlString(fields[1]);
        const activityName = escapeSqlString(fields[2]);
        const activityDescription = escapeSqlString(fields[3]);
        const activityType = fields[4] === 'Commercial' ? 'Commercial' : 'Professional';
        const propertyRequirements = escapeSqlString(fields[5]);
        const notes = escapeSqlString(fields[6]);
        const classification = escapeSqlString(fields[7]);
        const regulationType = fields[8] === 'Regulated' ? 'Regulated' : 'Non-Regulated';
        const approvingEntity1 = escapeSqlString(fields[9]);
        const approvingEntity2 = escapeSqlString(fields[10]);

        if (activityCode && activityName) {
            insertValues.push(`('${freezone}', '${activityCode}', '${activityName}', '${activityDescription}', '${activityType}', '${propertyRequirements}', '${notes}', '${classification}', '${regulationType}', '${approvingEntity1}', '${approvingEntity2}')`);
        }
    }
}

sql += `
INSERT INTO business_activities (
    freezone, activity_code, activity_name, activity_description, activity_type,
    property_requirements, notes, classification, regulation_type, 
    approving_entity_1, approving_entity_2
) VALUES 
${insertValues.join(',\n')};

-- Grant necessary permissions
GRANT SELECT ON business_activities TO anon;
GRANT SELECT ON business_activities TO authenticated;
`;

// Write the complete SQL file
fs.writeFileSync(path.join(__dirname, 'complete_business_activities.sql'), sql);

console.log(`Generated SQL file with ${insertValues.length} business activities`);
console.log('File saved as: complete_business_activities.sql');
console.log('You can now run this SQL in Supabase to create the table and import all data.');
