require 'net/http'
require 'uri'
require 'json'

class PassportExtractionService
  class << self
    def extract(file_url)
      Rails.logger.info "[PassportExtraction] Starting extraction for URL: #{file_url}"
      
      # Try OpenAI GPT-5 first
      result = extract_with_openai(file_url)
      Rails.logger.info "[PassportExtraction] OpenAI result: #{result[:success] ? 'Success' : 'Failed'}"
      
      # Fallback to Google Gemini if OpenAI fails
      if !result[:success] && result[:should_fallback]
        Rails.logger.warn "[PassportExtraction] Falling back to Google Gemini for passport extraction"
        result = extract_with_gemini(file_url)
        Rails.logger.info "[PassportExtraction] Gemini result: #{result[:success] ? 'Success' : 'Failed'}"
      end
      
      Rails.logger.info "[PassportExtraction] Final result: #{result.inspect}"
      result
    end
    
    private
    
    def extract_with_openai(file_url)
      api_key = ENV['OPENAI_API_KEY']
      
      if api_key.blank?
        Rails.logger.error "[PassportExtraction] OpenAI API key not configured"
        return { success: false, should_fallback: true, error: 'OpenAI API key missing' }
      end
      
      Rails.logger.info "[PassportExtraction] Using OpenAI GPT-5 for extraction"
      Rails.logger.debug "[PassportExtraction] API Key present: #{api_key[0..10]}..."
      
      begin
        uri = URI('https://api.openai.com/v1/chat/completions')
        http = Net::HTTP.new(uri.host, uri.port)
        http.use_ssl = true
        http.read_timeout = 30
        
        request = Net::HTTP::Post.new(uri)
        request['Authorization'] = "Bearer #{api_key}"
        request['Content-Type'] = 'application/json'
        
        prompt = <<~PROMPT
          You are analyzing a passport image. Extract all visible information and return it as a JSON object.
          
          Required JSON structure:
          {
            "first_name": "string",
            "middle_name": "string",
            "last_name": "string",
            "gender": "Male or Female",
            "date_of_birth": "YYYY-MM-DD",
            "passport_number": "string",
            "passport_issue_date": "YYYY-MM-DD",
            "passport_expiry_date": "YYYY-MM-DD",
            "passport_issue_country": "3-letter code",
            "passport_issue_place": "string",
            "nationality": "string",
            "mrz_line_1": "string",
            "mrz_line_2": "string"
          }
          
          Instructions:
          1. Extract text from the passport image
          2. Use Latin characters only for names
          3. Convert gender M→Male, F→Female
          4. Format all dates as YYYY-MM-DD
          5. Use empty string "" for missing fields
          6. Return ONLY the JSON object, no explanations
        PROMPT
        
        request.body = {
          model: 'gpt-5',
          messages: [
            {
              role: 'system',
              content: 'You are a passport OCR extraction system. Analyze the image and return structured JSON data exactly as requested.'
            },
            {
              role: 'user',
              content: [
                { type: 'text', text: prompt },
                { type: 'image_url', image_url: { url: file_url, detail: 'high' } }
              ]
            }
          ],
          reasoning_effort: 'minimal',
          verbosity: 'high',
          max_completion_tokens: 2000
        }.to_json
        
        Rails.logger.info "[PassportExtraction] Sending request to OpenAI GPT-5..."
        Rails.logger.debug "[PassportExtraction] Request body: #{request.body[0..500]}..."
        
        response = http.request(request)
        Rails.logger.info "[PassportExtraction] OpenAI response code: #{response.code}"
        
        if response.code == '200'
          Rails.logger.info "[PassportExtraction] Successful response from OpenAI"
          result = JSON.parse(response.body)
          extracted_text = result.dig('choices', 0, 'message', 'content')
          
          # Parse the JSON response
          extracted_data = JSON.parse(extracted_text)
          
          # Clean and validate the data
          cleaned_data = clean_passport_data(extracted_data)
          
          {
            success: true,
            data: cleaned_data,
            confidence: calculate_confidence(cleaned_data),
            service: 'openai_gpt5'
          }
        else
          Rails.logger.error "[PassportExtraction] OpenAI API error: #{response.code}"
          Rails.logger.error "[PassportExtraction] Response body: #{response.body}"
          { success: false, should_fallback: true, error: "OpenAI API error: #{response.code}" }
        end
      rescue JSON::ParserError => e
        Rails.logger.error "[PassportExtraction] Failed to parse OpenAI response: #{e.message}"
        Rails.logger.error "[PassportExtraction] Raw response: #{response&.body}"
        { success: false, should_fallback: true, error: 'Invalid response format' }
      rescue => e
        Rails.logger.error "[PassportExtraction] OpenAI extraction error: #{e.class.name}: #{e.message}"
        Rails.logger.error "[PassportExtraction] Backtrace: #{e.backtrace.first(5).join("\n")}"
        { success: false, should_fallback: true, error: e.message }
      end
    end
    
    def extract_with_gemini(file_url)
      api_key = ENV['GOOGLE_GEMINI_API_KEY']
      
      if api_key.blank?
        Rails.logger.error "Google Gemini API key not configured"
        return { success: false, error: 'Gemini not configured' }
      end
      
      begin
        # Gemini Pro Vision API endpoint
        uri = URI("https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-pro:generateContent?key=#{api_key}")
        http = Net::HTTP.new(uri.host, uri.port)
        http.use_ssl = true
        http.read_timeout = 30
        
        request = Net::HTTP::Post.new(uri)
        request['Content-Type'] = 'application/json'
        
        # Download image and convert to base64 for Gemini
        image_data = download_and_encode_image(file_url)
        
        prompt = <<~PROMPT
          Extract passport information from this image.
          Return ONLY a JSON object with these exact fields:
          {
            "first_name": "extracted first name or empty string",
            "middle_name": "extracted middle name or empty string",
            "last_name": "extracted last name or empty string",
            "gender": "Male or Female",
            "date_of_birth": "YYYY-MM-DD format",
            "passport_number": "passport number",
            "passport_issue_date": "YYYY-MM-DD format",
            "passport_expiry_date": "YYYY-MM-DD format",
            "passport_issue_country": "3-letter country code",
            "passport_issue_place": "city/place of issue",
            "nationality": "nationality",
            "mrz_line_1": "first MRZ line if visible",
            "mrz_line_2": "second MRZ line if visible"
          }
        PROMPT
        
        request.body = {
          contents: [
            {
              parts: [
                { text: prompt },
                {
                  inline_data: {
                    mime_type: 'image/jpeg',
                    data: image_data
                  }
                }
              ]
            }
          ],
          generationConfig: {
            temperature: 0,
            maxOutputTokens: 500
          }
        }.to_json
        
        response = http.request(request)
        
        if response.code == '200'
          result = JSON.parse(response.body)
          extracted_text = result.dig('candidates', 0, 'content', 'parts', 0, 'text')
          
          # Clean the response to get just JSON
          json_match = extracted_text.match(/\{[^}]+\}/)
          if json_match
            extracted_data = JSON.parse(json_match[0])
            cleaned_data = clean_passport_data(extracted_data)
            
            {
              success: true,
              data: cleaned_data,
              confidence: calculate_confidence(cleaned_data),
              service: 'google_gemini'
            }
          else
            { success: false, error: 'Could not extract JSON from Gemini response' }
          end
        else
          Rails.logger.error "Gemini API error: #{response.code} - #{response.body}"
          { success: false, error: "Gemini API error: #{response.code}" }
        end
      rescue => e
        Rails.logger.error "Gemini extraction error: #{e.message}"
        { success: false, error: e.message }
      end
    end
    
    def download_and_encode_image(url)
      uri = URI(url)
      response = Net::HTTP.get_response(uri)
      
      if response.code == '200'
        Base64.strict_encode64(response.body)
      else
        raise "Failed to download image: #{response.code}"
      end
    end
    
    def clean_passport_data(data)
      cleaned = {}
      
      # Clean and standardize each field
      cleaned[:first_name] = clean_name(data['first_name'] || data['first'] || '')
      cleaned[:middle_name] = clean_name(data['middle_name'] || data['middle'] || '')
      cleaned[:last_name] = clean_name(data['last_name'] || data['last'] || data['surname'] || '')
      cleaned[:gender] = standardize_gender(data['gender'] || data['sex'] || '')
      cleaned[:date_of_birth] = parse_date(data['date_of_birth'] || data['dob'] || '')
      cleaned[:passport_number] = clean_passport_number(data['passport_number'] || '')
      cleaned[:passport_issue_date] = parse_date(data['passport_issue_date'] || data['issue_date'] || '')
      cleaned[:passport_expiry_date] = parse_date(data['passport_expiry_date'] || data['expiry_date'] || '')
      cleaned[:passport_issue_country] = clean_country_code(data['passport_issue_country'] || '')
      cleaned[:passport_issue_place] = clean_text(data['passport_issue_place'] || data['issue_place'] || '')
      cleaned[:nationality] = clean_text(data['nationality'] || '')
      
      cleaned
    end
    
    def clean_name(name)
      name.to_s.strip.upcase
    end
    
    def clean_text(text)
      text.to_s.strip
    end
    
    def clean_passport_number(number)
      number.to_s.gsub(/[^A-Z0-9]/i, '').upcase
    end
    
    def clean_country_code(code)
      code.to_s.strip.upcase.slice(0, 3)
    end
    
    def standardize_gender(gender)
      gender_str = gender.to_s.downcase.strip
      case gender_str
      when 'm', 'male', 'homme', 'masculin'
        'Male'
      when 'f', 'female', 'femme', 'feminin'
        'Female'
      else
        ''
      end
    end
    
    def parse_date(date_str)
      return '' if date_str.blank?
      
      # Try various date formats
      formats = ['%Y-%m-%d', '%d/%m/%Y', '%m/%d/%Y', '%d-%m-%Y', '%Y/%m/%d']
      
      formats.each do |format|
        begin
          date = Date.strptime(date_str.to_s.strip, format)
          return date.strftime('%Y-%m-%d')
        rescue
          next
        end
      end
      
      # Try parsing naturally
      begin
        date = Date.parse(date_str.to_s)
        return date.strftime('%Y-%m-%d')
      rescue
        ''
      end
    end
    
    def calculate_confidence(data)
      # Calculate confidence based on how many fields were extracted
      total_fields = 11
      filled_fields = data.values.count { |v| v.present? }
      
      confidence = (filled_fields.to_f / total_fields * 100).round
      [confidence, 100].min
    end
  end
end