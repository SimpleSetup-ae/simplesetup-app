class Api::V1::BusinessActivitiesController < Api::V1::BaseController
  skip_before_action :authenticate_user!, only: [:search, :index, :show, :filters]
  skip_jwt_auth :search, :index, :show, :filters
  before_action :set_business_activity, only: [:show]

  # GET /api/v1/business_activities
  def index
    @business_activities = BusinessActivity.all
    
    # Apply filters
    @business_activities = @business_activities.by_freezone(params[:freezone]) if params[:freezone].present?
    @business_activities = @business_activities.by_type(params[:activity_type]) if params[:activity_type].present?
    @business_activities = @business_activities.regulated if params[:regulated] == 'true'
    @business_activities = @business_activities.non_regulated if params[:regulated] == 'false'
    
    # Apply fuzzy search with ranking
    if params[:search].present?
      search_term = params[:search].strip
      
      # Use fuzzy search with ranking for better results
      @business_activities = @business_activities
        .select(
          ActiveRecord::Base.sanitize_sql_array([
            "business_activities.*,
            CASE
              WHEN activity_name ILIKE ? THEN 1
              WHEN activity_name ILIKE ? THEN 2
              WHEN activity_name ILIKE ? THEN 3
              WHEN activity_description ILIKE ? THEN 4
              WHEN activity_code ILIKE ? THEN 5
              ELSE 6
            END AS search_rank",
            search_term,
            "#{search_term}%",
            "%#{search_term}%",
            "%#{search_term}%",
            "%#{search_term}%"
          ])
        )
        .where(
          'activity_name ILIKE ? OR activity_description ILIKE ? OR activity_code ILIKE ?',
          "%#{search_term}%", "%#{search_term}%", "%#{search_term}%"
        )
        .order('search_rank ASC, activity_name ASC')
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

    # Use fuzzy/similarity search with PostgreSQL trigram extension
    # First try exact matches, then partial matches, then fuzzy matches
    search_term = params[:q].strip
    freezone = params[:freezone] || 'IFZA'
    
    # Build query with ranking (using safe parameterization)
    @business_activities = BusinessActivity
      .where(freezone: freezone)
      .select(
        BusinessActivity.sanitize_sql_array([
          "business_activities.*,
          CASE
            WHEN activity_name ILIKE ? THEN 1
            WHEN activity_name ILIKE ? THEN 2
            WHEN activity_name ILIKE ? THEN 3
            WHEN activity_description ILIKE ? THEN 4
            WHEN activity_code ILIKE ? THEN 5
            ELSE 6
          END AS search_rank",
          search_term,
          "#{search_term}%",
          "%#{search_term}%",
          "%#{search_term}%",
          "%#{search_term}%"
        ])
      )
      .where(
        'activity_name ILIKE ? OR activity_description ILIKE ? OR activity_code ILIKE ?',
        "%#{search_term}%", "%#{search_term}%", "%#{search_term}%"
      )
      .order('search_rank ASC, activity_name ASC')
      .limit(20)

    render json: {
      success: true,
      data: @business_activities.map { |activity| 
        BusinessActivitySerializer.new(activity).as_json.merge(
          is_free: BusinessActivity.is_free_activity?(activity.activity_code)
        )
      }
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
