// Mock API for testing form components without backend
// This allows us to test the elegant UX and design consistency

export const mockFormConfig = {
  freezone: {
    code: "IFZA",
    name: "IFZA", 
    tagline: "Set up your Dubai company in minutes"
  },
  components: {},
  internal_fields: [],
  meta: {
    loaded_at: new Date().toISOString(),
    version: "1.0.0"
  },
  steps: [
    {
      id: "business_activities",
      title: "What does your company do?",
      subtitle: "Choose your business activities",
      icon: "briefcase",
      component: "business_activities"
    },
    {
      id: "company_details",
      title: "Company details", 
      subtitle: "Name, structure, and visa needs",
      icon: "building",
      component: "company_setup"
    },
    {
      id: "people_ownership",
      title: "People & ownership",
      subtitle: "Who's involved and who owns what", 
      icon: "users",
      component: "people_management"
    },
    {
      id: "documents",
      title: "Upload documents",
      subtitle: "Passport and supporting documents",
      icon: "upload", 
      component: "document_upload"
    }
  ],
  business_rules: {
    activities: {
      free_count: 3,
      max_count: 10
    },
    share_capital: {
      min_amount: 1000,
      max_without_bank_letter: 150000,
      partner_visa_multiplier: 48000
    },
    visas: {
      min_package: 1,
      max_package: 9,
      establishment_card_required: true
    }
  },
  validation_rules: {
    banned_words: {
      tokens: ["dubai", "emirates"],
      case_sensitive: false
    },
    name_restrictions: {
      single_word_min_length: 2,
      banned_patterns: []
    },
    pep_policy: {
      hard_block: true,
      log_reason: "PEP detected - application blocked per policy"
    },
    file_upload: {
      accepted_types: ["image/jpeg", "image/png", "application/pdf"],
      max_file_size: 10485760
    }
  }
};

export const mockBusinessActivities = [
  {
    id: 1,
    activity_code: "112231504",
    activity_name: "IT Support Services",
    activity_description: "IT solutions & support for established businesses",
    activity_type: "Professional" as const,
    regulation_type: "Non-Regulated" as const,
    freezone: "IFZA"
  },
  {
    id: 2,
    activity_code: "1122352",
    activity_name: "Ecommerce",
    activity_description: "The activity of electronically buying or selling of products on online services or over the Internet",
    activity_type: "Commercial" as const,
    regulation_type: "Non-Regulated" as const,
    freezone: "IFZA"
  },
  {
    id: 3,
    activity_code: "6201001",
    activity_name: "Computer Systems & Communication Equipment Software Design",
    activity_description: "Includes firms specialized in computer systems software design, implementation, operation and maintenance",
    activity_type: "Professional" as const,
    regulation_type: "Non-Regulated" as const,
    freezone: "IFZA"
  },
  {
    id: 4,
    activity_code: "7020003",
    activity_name: "Management Consultancies",
    activity_description: "Providing administrative consultancies and studies to organizations to help them improve their performance",
    activity_type: "Professional" as const,
    regulation_type: "Non-Regulated" as const,
    freezone: "IFZA"
  },
  {
    id: 5,
    activity_code: "7310005",
    activity_name: "Distribution of Advertising Materials & Samples",
    activity_description: "Distributing promotional materials such as pamphlets, catalogs, posters and gifts",
    activity_type: "Professional" as const,
    regulation_type: "Non-Regulated" as const,
    freezone: "IFZA"
  }
];

// Mock validation functions
export const mockValidateCompanyName = async (name: string) => {
  await new Promise(resolve => setTimeout(resolve, 500)); // Simulate API delay
  
  const errors: string[] = [];
  
  if (name.length < 2) {
    errors.push("Company name must be at least 2 characters");
  }
  
  if (name.toLowerCase().includes('dubai') || name.toLowerCase().includes('emirates')) {
    errors.push("Company name cannot contain 'Dubai' or 'Emirates'");
  }
  
  const words = name.trim().split(/\s+/);
  if (words.length === 1 && words[0].length < 2) {
    errors.push("Single word names must be at least 2 characters");
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
};

export const mockValidateShareCapital = async (amount: number, partnerVisaCount: number = 0) => {
  await new Promise(resolve => setTimeout(resolve, 300)); // Simulate API delay
  
  const errors: string[] = [];
  
  if (amount < 1000) {
    errors.push("Minimum share capital is 1,000 AED");
  }
  
  const requiredCapital = partnerVisaCount * 48000;
  if (partnerVisaCount > 0 && amount < requiredCapital) {
    errors.push(`Partner visas require minimum ${requiredCapital.toLocaleString()} AED share capital`);
  }
  
  return {
    valid: errors.length === 0,
    errors,
    requires_bank_letter: amount > 150000
  };
};
