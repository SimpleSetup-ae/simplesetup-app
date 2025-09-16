// TypeScript interfaces for form configuration and state
// Designed for optimal UX with simple, clear data structures

export interface FreezoneInfo {
  code: string;
  name: string;
  tagline?: string;
}

export interface FormStep {
  id: string;
  title: string;
  subtitle: string;
  icon: string;
  component: string;
}

export interface BusinessRules {
  activities: {
    free_count: number;
    max_count: number;
  };
  share_capital: {
    min_amount: number;
    max_without_bank_letter: number;
    partner_visa_multiplier: number;
  };
  visas: {
    min_package: number;
    max_package: number;
    establishment_card_required: boolean;
  };
}

export interface ValidationRules {
  banned_words: {
    tokens: string[];
    case_sensitive: boolean;
  };
  name_restrictions: {
    single_word_min_length: number;
    banned_patterns: string[];
  };
  pep_policy: {
    hard_block: boolean;
    log_reason: string;
  };
  file_upload: {
    accepted_types: string[];
    max_file_size: number | null;
  };
}

export interface FormConfig {
  freezone: FreezoneInfo;
  steps: FormStep[];
  components: Record<string, ComponentConfig>;
  business_rules: BusinessRules;
  validation_rules: ValidationRules;
  internal_fields: string[];
  meta: {
    loaded_at: string;
    version: string;
  };
}

export interface ComponentConfig {
  title: string;
  type: string;
  help?: string;
  fields?: FieldConfig[];
  sections?: SectionConfig[];
  search_placeholder?: string;
  max_free?: number;
  data_source?: string;
  filters?: Record<string, any>;
}

export interface FieldConfig {
  name: string;
  type: string;
  label: string;
  required: boolean;
  validation?: string;
  help_text?: string;
  options?: OptionConfig[];
  conditional?: string;
  default?: any;
  placeholder?: string;
  min?: number;
  max?: number;
}

export interface SectionConfig {
  name: string;
  title: string;
  help?: string;
  fields: FieldConfig[];
}

export interface OptionConfig {
  value: string | number;
  label: string;
}

// Form state interfaces
export interface FormState {
  currentStep: string;
  stepData: Record<string, any>;
  completedSteps: string[];
  validationErrors: Record<string, string[]>;
  isLoading: boolean;
  isSaving: boolean;
  lastSaved?: Date;
  hasUnsavedChanges: boolean;
}

export interface BusinessActivity {
  id: number;
  activity_code: string;
  activity_name: string;
  activity_description: string;
  activity_type: 'Professional' | 'Commercial';
  regulation_type: 'Regulated' | 'Non-Regulated';
  freezone: string;
}

export interface SelectedActivity {
  id: number;
  activity_code: string;
  activity_name: string;
  is_main: boolean;
  is_free: boolean;
}

export interface CompanyFormData {
  // Business Activities Step
  business_activities?: SelectedActivity[];
  main_activity_id?: number;
  custom_activity_request?: boolean;
  custom_activity_description?: string;

  // Company Details Step
  company_names?: string[];
  license_years?: number;
  visa_count?: number;
  partner_visa_count?: number;
  share_capital?: number;
  share_value?: number;
  establishment_card?: boolean;

  // People & Ownership Step
  shareholders?: Person[];
  directors?: Person[];
  signatories?: Person[];
  voting_rights_proportional?: boolean;
  voting_rights_notes?: string;

  // Documents Step
  uploaded_documents?: UploadedDocument[];
  uploaded_files?: any[]; // For the DocumentUploadStep
  documents_uploaded?: boolean;

  // Internal tracking
  formation_step?: string;
  completion_percentage?: number;
}

export interface Person {
  id?: string;
  type: 'Individual' | 'Corporate';
  first_name?: string;
  middle_name?: string;
  last_name?: string;
  email: string;
  mobile: string;
  is_pep: boolean;
  roles: string[];
  
  // Individual specific
  gender?: 'Male' | 'Female';
  date_of_birth?: string;
  passport_number?: string;
  passport_issue_date?: string;
  passport_expiry_date?: string;
  nationality?: string;
  is_uae_resident?: boolean;
  address?: Address;
  
  // Corporate specific
  legal_name?: string;
  jurisdiction?: string;
  registration_number?: string;
  
  // Document references
  documents?: PersonDocument[];
}

export interface Address {
  line1: string;
  city: string;
  country: string;
}

export interface PersonDocument {
  type: string;
  filename: string;
  url: string;
  uploaded_at: string;
}

export interface UploadedDocument {
  id: string;
  filename: string;
  type: string;
  url: string;
  size: number;
  uploaded_at: string;
  person_id?: string;
}

export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings?: string[];
  requires_bank_letter?: boolean;
}

export interface AutoSaveResult {
  auto_saved: boolean;
  last_auto_save_at: string;
  form_completion_percentage: number;
  current_step: string;
}

// API response interfaces
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  details?: string;
}

export interface FormConfigResponse {
  data: FormConfig;
}

export interface BusinessActivitiesResponse {
  data: BusinessActivity[];
  meta: {
    current_page: number;
    total_pages: number;
    total_count: number;
    per_page: number;
  };
}

export interface ValidationResponse {
  data: ValidationResult;
}
