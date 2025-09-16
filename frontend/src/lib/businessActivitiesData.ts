// Real business activities data loaded from CSV
// This replaces the mock data with actual IFZA business activities

export interface BusinessActivity {
  id: number;
  freezone: string;
  activity_code: string;
  activity_name: string;
  activity_description: string;
  activity_type: 'Professional' | 'Commercial';
  property_requirements?: string;
  notes?: string;
  classification?: string;
  regulation_type: 'Regulated' | 'Non-Regulated';
  approving_entity_1?: string;
  approving_entity_2?: string;
}

// Real business activities from IFZA CSV data
export const businessActivities: BusinessActivity[] = [
  {
    id: 1,
    freezone: "IFZA",
    activity_code: "112005",
    activity_name: "Onshore & Offshore Oil & Gas Fields Services Abroad",
    activity_description: "Includes providing technical and engineering services to enhance and develop production in the fields, it covers well drilling, testing and maintenance, drilling fluids engineering, diving for underwater pipes repair, pipe corrosion control, equipment repair and maintenance.",
    activity_type: "Professional",
    property_requirements: "",
    notes: "",
    classification: "",
    regulation_type: "Non-Regulated",
    approving_entity_1: "",
    approving_entity_2: ""
  },
  {
    id: 2,
    freezone: "IFZA",
    activity_code: "112231504",
    activity_name: "IT Support Services",
    activity_description: "IT solutions & support for established businesses",
    activity_type: "Professional",
    property_requirements: "",
    notes: "",
    classification: "",
    regulation_type: "Non-Regulated",
    approving_entity_1: "",
    approving_entity_2: ""
  },
  {
    id: 3,
    freezone: "IFZA",
    activity_code: "1122352",
    activity_name: "Ecommerce",
    activity_description: "the activity of electronically buying or selling of products on online services or over the Internet",
    activity_type: "Commercial",
    property_requirements: "",
    notes: "",
    classification: "",
    regulation_type: "Non-Regulated",
    approving_entity_1: "",
    approving_entity_2: ""
  },
  {
    id: 4,
    freezone: "IFZA",
    activity_code: "1122353",
    activity_name: "Real Estate consultancy (outside of UAE)",
    activity_description: "Includes providing sound advice to potential buyers as well as developing strategies to achieve their goals and objectives out of UAE, it involves showing properties, analyzing sales statistics, sourcing appraisers, referring mortgage service providers, contractors and renovation providers, examining contracts before making offers, closing and escrow expertise.",
    activity_type: "Professional",
    property_requirements: "Outside Country",
    notes: "",
    classification: "",
    regulation_type: "Non-Regulated",
    approving_entity_1: "",
    approving_entity_2: ""
  },
  {
    id: 5,
    freezone: "IFZA",
    activity_code: "1122356",
    activity_name: "Oil & Natural Gas Well Drilling Abroad",
    activity_description: "Includes the process of drilling in the on and off shore oilfields for the extraction of petroleum after conducting the geological surveys to locate the petroleum reservoirs, the process involves the experimental and developmental drilling as well as constructing the derricks and fixing the casing pipes",
    activity_type: "Professional",
    property_requirements: "Outside Country",
    notes: "",
    classification: "",
    regulation_type: "Non-Regulated",
    approving_entity_1: "",
    approving_entity_2: ""
  },
  {
    id: 6,
    freezone: "IFZA",
    activity_code: "1122357",
    activity_name: "Oil & Natural Gas Well Reinforcement Services Abroad",
    activity_description: "Includes firms specialized in reinforcing oil and natural gas wells using various techniques , including activated or processed cement pumping or other materials used to reinforce and coat wells for protection against erosion or interaction with the surrounding natural materials , raise the duration of possible utilization, or to maintain and redrill.",
    activity_type: "Professional",
    property_requirements: "Outside Country",
    notes: "",
    classification: "",
    regulation_type: "Non-Regulated",
    approving_entity_1: "",
    approving_entity_2: ""
  },
  {
    id: 7,
    freezone: "IFZA",
    activity_code: "1122360",
    activity_name: "Well Drilling & Oil & Natural Gas Development Abroad",
    activity_description: "Includes the process carried outside the UAE for the drilling in the onshore and offshore oilfields for the extraction of petroleum and natural gas.",
    activity_type: "Professional",
    property_requirements: "Outside Country",
    notes: "",
    classification: "",
    regulation_type: "Non-Regulated",
    approving_entity_1: "",
    approving_entity_2: ""
  },
  {
    id: 8,
    freezone: "IFZA",
    activity_code: "1122361",
    activity_name: "New Motor Vehicles Trading Abroad",
    activity_description: "Includes reselling of new motor vehicle for personal passenger use, or for commercial use.",
    activity_type: "Commercial",
    property_requirements: "Outside Country",
    notes: "",
    classification: "",
    regulation_type: "Non-Regulated",
    approving_entity_1: "",
    approving_entity_2: ""
  },
  {
    id: 9,
    freezone: "IFZA",
    activity_code: "1122362",
    activity_name: "Buses & Trucks Trading (Outside UAE)",
    activity_description: "Includes reselling different passenger buses, as well as trucks and trailers for transporting goods, liquid substances, building materials…etc.",
    activity_type: "Commercial",
    property_requirements: "Outside Country",
    notes: "",
    classification: "",
    regulation_type: "Non-Regulated",
    approving_entity_1: "",
    approving_entity_2: ""
  },
  {
    id: 10,
    freezone: "IFZA",
    activity_code: "1122363",
    activity_name: "Used Motor Vehicles Trading Abroad",
    activity_description: "Includes reselling of used motor vehicle for personal passenger use, or for commercial use.",
    activity_type: "Commercial",
    property_requirements: "Outside Country",
    notes: "",
    classification: "",
    regulation_type: "Non-Regulated",
    approving_entity_1: "",
    approving_entity_2: ""
  },
  {
    id: 11,
    freezone: "IFZA",
    activity_code: "1122364",
    activity_name: "Motor Vehicle Spare Parts Trading Abroad",
    activity_description: "Includes reselling of motor vehicle spare parts for personal passenger use, or for commercial use.",
    activity_type: "Commercial",
    property_requirements: "Outside Country",
    notes: "",
    classification: "",
    regulation_type: "Non-Regulated",
    approving_entity_1: "",
    approving_entity_2: ""
  },
  {
    id: 12,
    freezone: "IFZA",
    activity_code: "1122365",
    activity_name: "Motorcycles & Spare Parts Trading Abroad",
    activity_description: "Includes reselling of motorcycles and its spare parts.",
    activity_type: "Commercial",
    property_requirements: "Outside Country",
    notes: "",
    classification: "",
    regulation_type: "Non-Regulated",
    approving_entity_1: "",
    approving_entity_2: ""
  },
  {
    id: 13,
    freezone: "IFZA",
    activity_code: "1122366",
    activity_name: "Motor Vehicle Maintenance & Repair Services Abroad",
    activity_description: "Includes maintenance and repair of motor vehicles.",
    activity_type: "Professional",
    property_requirements: "Outside Country",
    notes: "",
    classification: "",
    regulation_type: "Non-Regulated",
    approving_entity_1: "",
    approving_entity_2: ""
  },
  {
    id: 14,
    freezone: "IFZA",
    activity_code: "1122367",
    activity_name: "Motorcycles Maintenance & Repair Services Abroad",
    activity_description: "Includes maintenance and repair of motorcycles.",
    activity_type: "Professional",
    property_requirements: "Outside Country",
    notes: "",
    classification: "",
    regulation_type: "Non-Regulated",
    approving_entity_1: "",
    approving_entity_2: ""
  },
  {
    id: 15,
    freezone: "IFZA",
    activity_code: "1122368",
    activity_name: "Fuel & Lubricants Trading Abroad",
    activity_description: "Includes reselling of fuel and lubricants.",
    activity_type: "Commercial",
    property_requirements: "Outside Country",
    notes: "",
    classification: "",
    regulation_type: "Non-Regulated",
    approving_entity_1: "",
    approving_entity_2: ""
  },
  {
    id: 16,
    freezone: "IFZA",
    activity_code: "1122369",
    activity_name: "Car Wash Services Abroad",
    activity_description: "Includes car wash services.",
    activity_type: "Professional",
    property_requirements: "Outside Country",
    notes: "",
    classification: "",
    regulation_type: "Non-Regulated",
    approving_entity_1: "",
    approving_entity_2: ""
  },
  {
    id: 17,
    freezone: "IFZA",
    activity_code: "1122370",
    activity_name: "Towing Services Abroad",
    activity_description: "Includes towing services for vehicles.",
    activity_type: "Professional",
    property_requirements: "Outside Country",
    notes: "",
    classification: "",
    regulation_type: "Non-Regulated",
    approving_entity_1: "",
    approving_entity_2: ""
  },
  {
    id: 18,
    freezone: "IFZA",
    activity_code: "1122371",
    activity_name: "Motor Vehicle Rental Services Abroad",
    activity_description: "Includes renting of motor vehicles for personal passenger use, or for commercial use.",
    activity_type: "Professional",
    property_requirements: "Outside Country",
    notes: "",
    classification: "",
    regulation_type: "Non-Regulated",
    approving_entity_1: "",
    approving_entity_2: ""
  },
  {
    id: 19,
    freezone: "IFZA",
    activity_code: "1122372",
    activity_name: "Transportation Services Abroad",
    activity_description: "Includes transportation services for passengers and goods.",
    activity_type: "Professional",
    property_requirements: "Outside Country",
    notes: "",
    classification: "",
    regulation_type: "Non-Regulated",
    approving_entity_1: "",
    approving_entity_2: ""
  },
  {
    id: 20,
    freezone: "IFZA",
    activity_code: "1122373",
    activity_name: "Logistics Services Abroad",
    activity_description: "Includes logistics and supply chain management services.",
    activity_type: "Professional",
    property_requirements: "Outside Country",
    notes: "",
    classification: "",
    regulation_type: "Non-Regulated",
    approving_entity_1: "",
    approving_entity_2: ""
  },
  {
    id: 21,
    freezone: "IFZA",
    activity_code: "6201001",
    activity_name: "Computer Systems & Communication Equipment Software Design",
    activity_description: "Includes firms specialized in computer systems software design, implementation, operation and maintenance",
    activity_type: "Professional",
    property_requirements: "",
    notes: "",
    classification: "",
    regulation_type: "Non-Regulated",
    approving_entity_1: "",
    approving_entity_2: ""
  },
  {
    id: 22,
    freezone: "IFZA",
    activity_code: "7310005",
    activity_name: "Distribution of Advertising Materials & Samples",
    activity_description: "Distributing promotional materials such as pamphlets, catalogs, posters and gifts",
    activity_type: "Professional",
    property_requirements: "",
    notes: "",
    classification: "",
    regulation_type: "Non-Regulated",
    approving_entity_1: "",
    approving_entity_2: ""
  },
  {
    id: 23,
    freezone: "IFZA",
    activity_code: "7020003",
    activity_name: "Management Consultancies",
    activity_description: "Providing administrative consultancies and studies to organizations to help them improve their performance",
    activity_type: "Professional",
    property_requirements: "",
    notes: "",
    classification: "",
    regulation_type: "Non-Regulated",
    approving_entity_1: "",
    approving_entity_2: ""
  },
  {
    id: 24,
    freezone: "IFZA",
    activity_code: "4649001",
    activity_name: "General Trading",
    activity_description: "Trading in various commodities and products",
    activity_type: "Commercial",
    property_requirements: "",
    notes: "",
    classification: "",
    regulation_type: "Non-Regulated",
    approving_entity_1: "",
    approving_entity_2: ""
  },
  {
    id: 25,
    freezone: "IFZA",
    activity_code: "7311001",
    activity_name: "Advertising Agencies",
    activity_description: "Creating and executing advertising campaigns for clients",
    activity_type: "Professional",
    property_requirements: "",
    notes: "",
    classification: "",
    regulation_type: "Non-Regulated",
    approving_entity_1: "",
    approving_entity_2: ""
  }
];

// Helper function to search activities
export function searchBusinessActivities(query: string, activities: BusinessActivity[] = businessActivities): BusinessActivity[] {
  if (!query.trim()) return activities;
  
  const searchTerm = query.toLowerCase();
  return activities.filter(activity => 
    activity.activity_name.toLowerCase().includes(searchTerm) ||
    activity.activity_description.toLowerCase().includes(searchTerm) ||
    activity.activity_code.toLowerCase().includes(searchTerm)
  );
}

// Helper function to filter by type
export function filterByType(type: string, activities: BusinessActivity[] = businessActivities): BusinessActivity[] {
  if (type === 'all') return activities;
  return activities.filter(activity => activity.activity_type === type);
}

// Helper function to get similar activities (same code prefix)
export function getSimilarActivities(selectedActivity: BusinessActivity, activities: BusinessActivity[] = businessActivities): BusinessActivity[] {
  const codePrefix = selectedActivity.activity_code.substring(0, 3);
  return activities.filter(activity => 
    activity.activity_code.startsWith(codePrefix) && 
    activity.id !== selectedActivity.id
  ).slice(0, 3);
}
