require 'countries'
class Api::V1::CountriesController < Api::V1::BaseController
  skip_before_action :authenticate_user!, only: [:index]
  skip_jwt_auth :index

  # GET /api/v1/countries
  # Params:
  #   q: search string (optional)
  #   include_continents: boolean (default true)
  #   limit: integer (default 20)
  def index
    query = (params[:q] || '').to_s.strip.downcase
    include_continents = params[:include_continents].to_s != 'false'
    limit = (params[:limit] || 20).to_i.clamp(1, 100)

    countries = ISO3166::Country.all

    results = countries.map do |c|
      name = c.translations['en'] || c.name
      {
        code: c.alpha2,
        name: name,
        continent: c.continent,
        region: c.region,
      }
    end

    if query.present?
      results = results.select do |r|
        r[:name].to_s.downcase.start_with?(query) ||
          r[:code].to_s.downcase == query ||
          (include_continents && r[:continent].to_s.downcase.start_with?(query))
      end
    end

    continents = []
    if include_continents
      continents = countries.map(&:continent).compact.uniq
      if query.present?
        continents = continents.select { |c| c.to_s.downcase.start_with?(query) }
      end
      continents = continents.map { |c| { code: nil, name: c, continent: c } }
    end

    data = (results + continents).uniq { |r| [r[:code], r[:name]] }
    data = data.sort_by { |r| [r[:code].nil? ? 1 : 0, r[:name].to_s] }.first(limit)

    render json: { success: true, data: data }
  end
end


