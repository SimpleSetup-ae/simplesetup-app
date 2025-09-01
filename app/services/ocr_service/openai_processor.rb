require 'net/http'
require 'json'
require 'base64'

module OcrService
  class OpenaiProcessor
    OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions'
    
    def initialize
      @api_key = ENV['OPENAI_API_KEY']
      raise 'OpenAI API key not configured' unless @api_key
    end
    
    def extract_from_image(image_data, document_type)
      # Encode image to base64
      base64_image = Base64.strict_encode64(image_data)
      
      # Create prompt based on document type
      prompt = create_extraction_prompt(document_type)
      
      # Call OpenAI API
      response = call_openai_api(prompt, base64_image)
      
      parse_openai_response(response, document_type)
    end
    
    def extract_from_pdf(pdf_data, document_type)
      # For PDFs with OpenAI, we'd need to convert to images first
      # This is a simplified implementation
      prompt = create_extraction_prompt(document_type)
      
      # For now, return a placeholder response
      {
        extracted_text: "PDF processing with OpenAI requires image conversion",
        extracted_fields: { document_type: document_type },
        confidence_score: 0.0,
        note: "PDF processing not yet implemented for OpenAI"
      }
    end
    
    private
    
    def create_extraction_prompt(document_type)
      base_prompt = <<~PROMPT
        You are an expert document processing AI. Extract information from this document image and return ONLY a valid JSON object.
        
        Analyze the image carefully and extract all visible text and relevant data fields.
        
        Return the response in this exact JSON format:
        {
          "extracted_text": "Full text content visible in the image",
          "extracted_fields": {
            "document_type": "#{document_type}",
            "fields": {}
          },
          "confidence_score": 0.95
        }
      PROMPT
      
      case document_type
      when 'passport'
        base_prompt + "\n\nFor passport documents, extract: full_name, passport_number, nationality, date_of_birth, place_of_birth, date_of_issue, date_of_expiry, issuing_authority, gender"
      when 'emirates_id'
        base_prompt + "\n\nFor Emirates ID documents, extract: full_name, emirates_id_number, nationality, date_of_birth, date_of_expiry, gender"
      when 'utility_bill'
        base_prompt + "\n\nFor utility bills, extract: account_holder_name, service_address, bill_date, due_date, amount, utility_company, account_number"
      else
        base_prompt + "\n\nExtract any relevant information you can identify from this document."
      end
    end
    
    def call_openai_api(prompt, base64_image)
      uri = URI(OPENAI_API_URL)
      
      request_body = {
        model: "gpt-4o",
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: prompt
              },
              {
                type: "image_url",
                image_url: {
                  url: "data:image/jpeg;base64,#{base64_image}",
                  detail: "high"
                }
              }
            ]
          }
        ],
        max_tokens: 4096,
        temperature: 0.1
      }
      
      http = Net::HTTP.new(uri.host, uri.port)
      http.use_ssl = true
      
      request = Net::HTTP::Post.new(uri)
      request['Content-Type'] = 'application/json'
      request['Authorization'] = "Bearer #{@api_key}"
      request.body = request_body.to_json
      
      response = http.request(request)
      
      unless response.code == '200'
        raise "OpenAI API error: #{response.code} - #{response.body}"
      end
      
      JSON.parse(response.body)
    rescue => e
      Rails.logger.error "OpenAI API call failed: #{e.message}"
      raise e
    end
    
    def parse_openai_response(response, document_type)
      # Extract the generated text from OpenAI response
      generated_text = response.dig('choices', 0, 'message', 'content')
      
      unless generated_text
        raise 'No generated content in OpenAI response'
      end
      
      # Parse JSON from the generated text
      begin
        # Clean the response (remove markdown code blocks if present)
        json_text = generated_text.gsub(/```json\n?/, '').gsub(/```\n?/, '').strip
        
        parsed_data = JSON.parse(json_text)
        
        # Validate required fields
        unless parsed_data['extracted_text'] && parsed_data['extracted_fields']
          raise 'Missing required fields in OpenAI response'
        end
        
        {
          extracted_text: parsed_data['extracted_text'],
          extracted_fields: parsed_data['extracted_fields'] || {},
          confidence_score: parsed_data['confidence_score'] || 0.8,
          raw_response: generated_text
        }
        
      rescue JSON::ParserError => e
        Rails.logger.error "Failed to parse OpenAI JSON response: #{e.message}"
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
