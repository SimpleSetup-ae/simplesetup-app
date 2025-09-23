require 'countries'
class Api::V1::CountriesController < Api::V1::BaseController
  skip_before_action :authenticate_user!, only: [:index]
  skip_jwt_auth :index

  # GET /api/v1/countries
  # Params:
  #   q: search string (optional)
  #   include_continents: boolean (default true)
  def index
    query = (params[:q] || '').to_s.strip.downcase
    include_continents = params[:include_continents].to_s != 'false'

    countries = ISO3166::Country.all.select(&:translations)

    results = countries.map do |c|
      {
        code: c.alpha2,
        name: c.translations['en'] || c.name,
        continent: c.continent&.titleize,
        region: c.region,
      }
    end

    if query.present?
      q = Regexp.escape(query)
      results = results.select do |r|
        r[:name].downcase.match?(/\b#{q}/) ||
          r[:code].downcase == query ||
          (include_continents && r[:continent].to_s.downcase.start_with?(query))
      end
    end

    # Add continent suggestions if requested and query matches
    continents = []
    if include_continents
      continents = ISO3166::Country::CONTINENTS.values.map { |name| name.titleize }
      if query.present?
        continents = continents.select { |c| c.downcase.start_with?(query) }
      end
      continents = continents.map { |c| { code: nil, name: c, continent: c } }
    end

    render json: { success: true, data: (results + continents).uniq { |r| [r[:code], r[:name]] }.first(20) }
  end
end


