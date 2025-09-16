import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

// Fallback data from CSV for when Supabase isn't configured yet
function loadBusinessActivitiesFromCSV() {
  try {
    const csvPath = path.join(process.cwd(), '..', 'IFZA Business Activities - Sheet1.csv');
    const csvContent = fs.readFileSync(csvPath, 'utf-8');
    
    const lines = csvContent.split('\n');
    const activities = [];
    
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;
      
      // Simple CSV parsing for quoted fields
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
      fields.push(currentField.trim());
      
      if (fields.length >= 5 && fields[1] && fields[2]) {
        activities.push({
          id: i,
          freezone: fields[0] || 'IFZA',
          activity_code: fields[1],
          activity_name: fields[2],
          activity_description: fields[3] || '',
          activity_type: fields[4] === 'Commercial' ? 'Commercial' : 'Professional',
          property_requirements: fields[5] || '',
          notes: fields[6] || '',
          classification: fields[7] || '',
          regulation_type: fields[8] === 'Regulated' ? 'Regulated' : 'Non-Regulated',
          approving_entity_1: fields[9] || '',
          approving_entity_2: fields[10] || ''
        });
      }
    }
    
    return activities;
  } catch (error) {
    console.error('Error loading CSV:', error);
    return [];
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const freezone = searchParams.get('freezone') || '';
    const activityType = searchParams.get('activity_type') || '';
    const page = parseInt(searchParams.get('page') || '1');
    const perPage = parseInt(searchParams.get('per_page') || '50');

    // For now, use CSV data directly until Supabase is configured
    let activities = loadBusinessActivitiesFromCSV();
    
    // Apply filters
    if (freezone) {
      activities = activities.filter((activity: any) => 
        activity.freezone.toLowerCase() === freezone.toLowerCase()
      );
    }

    if (activityType) {
      activities = activities.filter((activity: any) => 
        activity.activity_type.toLowerCase() === activityType.toLowerCase()
      );
    }

    if (search) {
      const searchTerm = search.toLowerCase();
      activities = activities.filter((activity: any) =>
        activity.activity_name.toLowerCase().includes(searchTerm) ||
        activity.activity_description.toLowerCase().includes(searchTerm) ||
        activity.activity_code.toLowerCase().includes(searchTerm)
      );
    }

    // Apply pagination
    const total = activities.length;
    const totalPages = Math.ceil(total / perPage);
    const startIndex = (page - 1) * perPage;
    const endIndex = startIndex + perPage;
    const paginatedActivities = activities.slice(startIndex, endIndex);

    return NextResponse.json({
      data: paginatedActivities,
      meta: {
        current_page: page,
        total_pages: totalPages,
        total_count: total,
        per_page: perPage
      }
    });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: 'Failed to load business activities' },
      { status: 500 }
    );
  }
}
