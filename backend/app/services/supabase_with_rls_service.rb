# Service to handle Supabase queries with proper RLS context
# This ensures that Row Level Security policies work correctly with Devise/JWT authentication
class SupabaseWithRlsService
  include Singleton

  def initialize
    @client = Supabase::Client.new(
      url: ENV['SUPABASE_URL'],
      key: ENV['SUPABASE_SERVICE_KEY'] # Use service key since we control access in Rails
    )
  end

  # Execute a query with user context for RLS
  # This sets the current user ID in the database session so RLS policies can use it
  def with_user_context(user_id, &block)
    return yield(@client) if user_id.nil?

    begin
      # Set the user context for this database session
      # This makes get_current_user_id() return the correct user ID in RLS policies
      execute_sql("SELECT set_current_user_id('#{user_id}'::uuid)")
      
      # Execute the block with the client
      yield(@client)
    ensure
      # Clear the context after the operation to prevent leakage
      execute_sql("SELECT set_current_user_id(NULL)")
    end
  end

  # Execute a query without user context (admin operations)
  def without_context(&block)
    yield(@client)
  end

  # Direct SQL execution helper
  def execute_sql(sql)
    @client.rpc('query', { query: sql }).execute
  rescue => e
    Rails.logger.error "Supabase SQL execution error: #{e.message}"
    raise
  end

  # Convenience methods for common operations with RLS

  def get_user_companies(user_id)
    with_user_context(user_id) do |client|
      client.from('companies')
            .select('*')
            .execute
    end
  end

  def get_company_documents(user_id, company_id)
    with_user_context(user_id) do |client|
      client.from('documents')
            .select('*')
            .eq('company_id', company_id)
            .execute
    end
  end

  def create_company(user_id, company_data)
    with_user_context(user_id) do |client|
      client.from('companies')
            .insert(company_data.merge(owner_id: user_id))
            .execute
    end
  end

  # Admin operations that bypass RLS
  def admin_get_all_companies
    without_context do |client|
      client.from('companies')
            .select('*')
            .execute
    end
  end

  def admin_update_company_status(company_id, status)
    without_context do |client|
      client.from('companies')
            .update({ status: status })
            .eq('id', company_id)
            .execute
    end
  end

  private

  def client
    @client
  end
end

# Usage example in controllers:
#
# class Api::V1::CompaniesController < ApplicationController
#   def index
#     result = SupabaseWithRlsService.instance.get_user_companies(current_user.id)
#     render json: result.data
#   end
#
#   def create
#     result = SupabaseWithRlsService.instance.create_company(
#       current_user.id,
#       company_params
#     )
#     render json: result.data
#   end
# end