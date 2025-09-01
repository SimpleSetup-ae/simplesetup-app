class ApplicationRecord < ActiveRecord::Base
  primary_abstract_class
  
  # Enable UUID primary keys by default
  self.implicit_order_column = :created_at
end
