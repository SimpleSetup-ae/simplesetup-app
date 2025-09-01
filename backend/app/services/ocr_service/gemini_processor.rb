require 'net/http'
require 'json'
require 'base64'

module OcrService
  class GeminiProcessor
    GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent'
    
    def initialize
      @api_key = ENV['GOOGLE_GEMINI_API_KEY']
      raise 'Google Gemini API key not configured' unless @api_key
    end
    
    def extract_from_image(image_data, document_type)
      # Encode image to base64
      base64_image = Base64.strict_encode64(image_data)
      
      # Create prompt based on document type
      prompt = create_extraction_prompt(document_type)
      
      # Call Gemini API
      response = call_gemini_api(prompt, base64_image, 'image/jpeg')
      
      parse_gemini_response(response, document_type)
    end
    
    def extract_from_pdf(pdf_data, document_type)
      # For PDFs, we would typically convert to images first
      # For now, treat as text extraction
      prompt = create_extraction_prompt(document_type)
      
      # Convert PDF to base64
      base64_pdf = Base64.strict_encode64(pdf_data)
      
      # Call Gemini API
      response = call_gemini_api(prompt, base64_pdf, 'application/pdf')
      
      parse_gemini_response(response, document_type)
    end
    
    private
    
    def create_extraction_prompt(document_type)
      base_prompt = <<~PROMPT
        You are an expert document processing AI. Extract information from this document and return ONLY a valid JSON object.
        
        Please extract all visible text and relevant data fields. Pay special attention to:
        - Names, dates, numbers, and official identifiers
        - Government-issued document numbers
        - Personal information like nationality, date of birth
        - Address information
        - Signatures and official stamps
        
        Return the response in this exact JSON format:
        {
          "extracted_text": "Full text content of the document",
          "extracted_fields": {
            "document_type": "#{document_type}",
            "fields": {}
          },
          "confidence_score": 0.95
        }
      PROMPT
      
      case document_type
      when 'passport'
        base_prompt + <<~PASSPORT_PROMPT
          
          For passport documents, extract these specific fields in the "fields" object:
          - "full_name": Full name as written
          - "passport_number": Passport number
          - "nationality": Nationality
          - "date_of_birth": Date of birth (YYYY-MM-DD format)
          - "place_of_birth": Place of birth
          - "date_of_issue": Issue date
          - "date_of_expiry": Expiry date
          - "issuing_authority": Issuing authority
          - "gender": Gender (M/F)
        PASSPORT_PROMPT
        
      when 'emirates_id'
        base_prompt + <<~EMIRATES_ID_PROMPT
          
          For Emirates ID documents, extract these specific fields in the "fields" object:
          - "full_name": Full name as written
          - "emirates_id_number": Emirates ID number (784-XXXX-XXXXXXX-X format)
          - "nationality": Nationality
          - "date_of_birth": Date of birth (YYYY-MM-DD format)
          - "date_of_expiry": Expiry date
          - "gender": Gender (M/F)
        EMIRATES_ID_PROMPT
        
      when 'utility_bill'
        base_prompt + <<~UTILITY_BILL_PROMPT
          
          For utility bill documents, extract these specific fields in the "fields" object:
          - "account_holder_name": Name on the bill
          - "service_address": Service address
          - "bill_date": Bill date
          - "due_date": Due date
          - "amount": Bill amount
          - "utility_company": Utility company name
          - "account_number": Account number
        UTILITY_BILL_PROMPT
        
      when 'bank_statement'
        base_prompt + <<~BANK_STATEMENT_PROMPT
          
          For bank statement documents, extract these specific fields in the "fields" object:
          - "account_holder_name": Account holder name
          - "bank_name": Bank name
          - "account_number": Account number (partially masked for privacy)
          - "statement_period": Statement period
          - "opening_balance": Opening balance
          - "closing_balance": Closing balance
          - "currency": Currency
        BANK_STATEMENT_PROMPT
        
      else
        base_prompt + <<~GENERAL_PROMPT
          
          For this document, extract any relevant fields you can identify in the "fields" object:
          - "document_title": Title or header of the document
          - "issuing_organization": Organization that issued the document
          - "document_number": Any reference or document numbers
          - "date": Any relevant dates
          - "names": Any person or company names
          - "addresses": Any addresses mentioned
        GENERAL_PROMPT
      end
    end
    
    def call_gemini_api(prompt, base64_data, mime_type)
      uri = URI("#{GEMINI_API_URL}?key=#{@api_key}")
      
      request_body = {
        contents: [{
          parts: [
            { text: prompt },
            { 
              inline_data: {
                mime_type: mime_type,
                data: base64_data
              }
            }
          ]
        }],
        generationConfig: {
          temperature: 0.1,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 8192,
        }
      }
      
      http = Net::HTTP.new(uri.host, uri.port)
      http.use_ssl = true
      
      request = Net::HTTP::Post.new(uri)
      request['Content-Type'] = 'application/json'
      request.body = request_body.to_json
      
      response = http.request(request)
      
      unless response.code == '200'
        raise "Gemini API error: #{response.code} - #{response.body}"
      end
      
      JSON.parse(response.body)
    rescue => e
      Rails.logger.error "Gemini API call failed: #{e.message}"
      raise e
    end
    
    def parse_gemini_response(response, document_type)
      # Extract the generated text from Gemini response
      generated_text = response.dig('candidates', 0, 'content', 'parts', 0, 'text')
      
      unless generated_text
        raise 'No generated text in Gemini response'
      end
      
      # Parse JSON from the generated text
      begin
        # Clean the response (remove markdown code blocks if present)
        json_text = generated_text.gsub(/```json\n?/, '').gsub(/```\n?/, '').strip
        
        parsed_data = JSON.parse(json_text)
        
        # Validate required fields
        unless parsed_data['extracted_text'] && parsed_data['extracted_fields']
          raise 'Missing required fields in Gemini response'
        end
        
        {
          extracted_text: parsed_data['extracted_text'],
          extracted_fields: parsed_data['extracted_fields'] || {},
          confidence_score: parsed_data['confidence_score'] || 0.8,
          raw_response: generated_text
        }
        
      rescue JSON::ParserError => e
        Rails.logger.error "Failed to parse Gemini JSON response: #{e.message}"
        Rails.logger.error "Raw response: #{generated_text}"
        
        # Return raw text if JSON parsing fails
        {
          extracted_text: generated_text,
          extracted_fields: { raw_response: generated_text },
          confidence_score: 0.5,
          parsing_error: e.message
        }
      end
    end
  end
end
