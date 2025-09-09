// Company Formation Form - Clean, elegant, and maintainable
// 
// This replaces the 564-line monolithic component with:
// - High-level design abstractions that maintain existing beauty
// - YAML-driven configuration for multiple freezones  
// - Auto-save functionality with elegant UX
// - Component-based architecture for maintainability

export { CompanyFormationWizard } from './CompanyFormationWizard'

// Export individual components for reuse
export { FormLayout } from './components/FormLayout'
export { FormStep } from './components/FormStep'
export { SelectionCard } from './components/SelectionCard'
export { SearchableSelector } from './components/SearchableSelector'
export { NumberStepper } from './components/NumberStepper'

// Export step components
export { BusinessActivitiesStep } from './steps/BusinessActivitiesStep'
export { CompanyDetailsStep } from './steps/CompanyDetailsStep'

// Export hooks
export { useFormState } from './hooks/useFormState'
export { useFormConfig } from './hooks/useFormConfig'

// Export types
export type * from './types/FormConfig'
