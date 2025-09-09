class Api::V1::BusinessActivitiesController < ApplicationController
  before_action :set_business_activity, only: [:show]

  # GET /api/v1/business_activities
  def index
    @business_activities = BusinessActivity.all
    
    # Apply filters
    @business_activities = @business_activities.by_freezone(params[:freezone]) if params[:freezone].present?
    @business_activities = @business_activities.by_type(params[:activity_type]) if params[:activity_type].present?
    @business_activities = @business_activities.regulated if params[:regulated] == 'true'
    @business_activities = @business_activities.non_regulated if params[:regulated] == 'false'
    
    # Apply search
    if params[:search].present?
      search_term = params[:search]
      @business_activities = @business_activities.where(
        'activity_name ILIKE ? OR activity_description ILIKE ?', 
        "%#{search_term}%", 
        "%#{search_term}%"
      )
    end
    
    # Apply pagination
    page = params[:page] || 1
    per_page = params[:per_page] || 50
    @business_activities = @business_activities.page(page).per(per_page)
    
    render json: {
      data: ActiveModelSerializers::SerializableResource.new(
        @business_activities, 
        each_serializer: BusinessActivitySerializer
      ).as_json,
      meta: {
        current_page: @business_activities.current_page,
        total_pages: @business_activities.total_pages,
        total_count: @business_activities.total_count,
        per_page: per_page.to_i
      }
    }
  end

  # GET /api/v1/business_activities/:id
  def show
    render json: {
      data: ActiveModelSerializers::SerializableResource.new(
        @business_activity, 
        serializer: BusinessActivitySerializer
      ).as_json
    }
  end

  # GET /api/v1/business_activities/search
  def search
    if params[:q].blank?
      render json: { data: [], message: 'Search query is required' }, status: :bad_request
      return
    end

    @business_activities = BusinessActivity.where(
      'activity_name ILIKE ? OR activity_description ILIKE ? OR activity_code ILIKE ?',
      "%#{params[:q]}%", "%#{params[:q]}%", "%#{params[:q]}%"
    ).limit(20)

    render json: {
      data: ActiveModelSerializers::SerializableResource.new(
        @business_activities, 
        each_serializer: BusinessActivitySerializer
      ).as_json
    }
  end

  # GET /api/v1/business_activities/filters
  def filters
    render json: {
      data: {
        freezones: BusinessActivity.distinct.pluck(:freezone).compact.sort,
        activity_types: BusinessActivity.distinct.pluck(:activity_type).compact.sort,
        regulation_types: BusinessActivity.distinct.pluck(:regulation_type).compact.sort,
        classifications: BusinessActivity.distinct.pluck(:classification).compact.reject(&:blank?).sort
      }
    }
  end

  private

  def set_business_activity
    @business_activity = BusinessActivity.find(params[:id])
  rescue ActiveRecord::RecordNotFound
    render json: { error: 'Business activity not found' }, status: :not_found
  end
end
