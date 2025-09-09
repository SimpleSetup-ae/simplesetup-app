require 'base64'

class PassportExtractionService
  SYSTEM_PROMPT = <<~PROMPT
    You are a document-forensics LLM specialized in ICAO Doc 9303 machine-readable travel documents. You will extract fields from PASSPORT IMAGES and return a single, strictly valid JSON object. Be conservative: never infer; mark unknowns as null. Validate MRZ checksums and internal consistency. Include quality and tamper indicators.

    TASK:
    1) Normalize images (auto-rotate; consider all pages).
    2) Detect if the data page is fully visible; identify MRZ (TD3/TD2 as applicable).
    3) Parse MRZ; compute and report all check digits; verify against ICAO 9303.
    4) Read visible text (VIZ) fields; reconcile with MRZ (name order, dates, doc number).
    5) Extract and score imaging quality and capture completeness.
    6) Identify visible security features (as seen in RGB only; do not assume UV/IR).
    7) Flag plausible tampering indicators (non-destructive cues only).
    8) Produce JSON with confidence scores in [0,1]. Use null where not observable. Use ISO 8601 dates (YYYY-MM-DD). Use BCP-47 uppercase codes where applicable.

    Return ONLY valid JSON matching the specified schema, no explanations.
  PROMPT

  def initialize(document)
    @document = document
    @client = OpenAI::Client.new(
      access_token: ENV['OPENAI_API_KEY'],
      request_timeout: 240,
      log_errors: true
    )
  end

  def extract
    image_data = prepare_image_data
    
    response = @client.chat(
      parameters: {
        model: "gpt-4-turbo",
        messages: [
          {
            role: "system",
            content: SYSTEM_PROMPT
          },
          {
            role: "user",
            content: [
              {
                type: "text",
                text: "Extract passport information from this image and return JSON only."
              },
              {
                type: "image_url",
                image_url: {
                  url: "data:#{@document.content_type};base64,#{image_data}",
                  detail: "high"
                }
              }
            ]
          }
        ],
        max_tokens: 4096,
        temperature: 0.1
      }
    )
    
    # Parse the JSON response
    json_response = response.dig("choices", 0, "message", "content")
    parsed_data = JSON.parse(json_response)
    
    # Ensure we have the expected structure
    passport_data = parsed_data["passport"] || parsed_data
    
    # Add processing metadata
    passport_data["processing"] ||= {}
    passport_data["processing"]["version"] = "passport_extractor_v1"
    passport_data["processing"]["processed_at"] = Time.current.iso8601
    passport_data["processing"]["model"] = "gpt-4-turbo"
    
    passport_data
    
  rescue JSON::ParserError => e
    Rails.logger.error "Failed to parse OpenAI response: #{e.message}"
    raise StandardError, "Invalid response from AI model"
  rescue StandardError => e
    Rails.logger.error "Passport extraction failed: #{e.message}"
    raise
  end
  
  private
  
  def prepare_image_data
    # Get file data based on storage method
    if @document.file_data.present?
      # If file_data is already a base64 string, return it
      # If it's raw data, encode it
      if @document.file_data.is_a?(String) && @document.file_data.match?(/^data:/)
        # Remove data URL prefix if present
        @document.file_data.sub(/^data:[^;]+;base64,/, '')
      elsif @document.file_data.is_a?(String) && @document.file_data.match?(/^[A-Za-z0-9+\/=]+$/)
        # Already base64
        @document.file_data
      else
        # Raw data, need to encode
        Base64.strict_encode64(@document.file_data)
      end
    elsif @document.file_path.present?
      # If stored as file
      file_content = File.read(@document.file_path)
      Base64.strict_encode64(file_content)
    else
      # If using Active Storage or similar
      file_blob = @document.file.download
      Base64.strict_encode64(file_blob)
    end
  end
  
  def expected_json_schema
    {
      passport: {
        document_number: { value: nil, confidence: 0.0 },
        check_digits: {
          document_number: { value: nil, valid: false },
          date_of_birth: { value: nil, valid: false },
          expiry_date: { value: nil, valid: false },
          composite: { value: nil, valid: false }
        },
        issuing_country: { value: nil, confidence: 0.0 },
        nationality: { value: nil, confidence: 0.0 },
        passport_type: { value: nil, confidence: 0.0 },
        passport_subtype: { value: nil, confidence: 0.0 },
        names: {
          surname: { mrz: nil, viz: nil, final: nil, agreement: false, confidence: 0.0 },
          given_names: { mrz: nil, viz: nil, final: nil, agreement: false, confidence: 0.0 }
        },
        personal_information: {
          gender: { value: nil, confidence: 0.0 },
          date_of_birth: { mrz: nil, viz: nil, final: nil, agreement: false, confidence: 0.0 },
          place_of_birth: { value: nil, confidence: 0.0 },
          personal_number: { value: nil, confidence: 0.0 }
        },
        validity: {
          issue_date: { value: nil, confidence: 0.0 },
          expiry_date: { mrz: nil, viz: nil, final: nil, agreement: false, confidence: 0.0 },
          issuing_authority: { value: nil, confidence: 0.0 }
        },
        machine_readable_zone: {
          format: { value: nil },
          line1: nil,
          line2: nil,
          parsed: {
            doc_type: nil,
            issuing_country: nil,
            surname: nil,
            given_names: nil,
            document_number: nil,
            nationality: nil,
            date_of_birth: nil,
            sex: nil,
            expiry_date: nil,
            optional_data: nil
          }
        },
        biometric_information: {
          chip_present: { observed: "unknown" },
          chip_data_read: { observed: "unknown" },
          face_image_hash: { value: nil }
        },
        photo_analysis: {
          quality_score: 0.0,
          illumination_score: 0.0,
          blur_score: 0.0,
          occlusion_detected: false,
          full_face_visible: true,
          pose_compliance: true,
          face_bbox_ratio: 0.0,
          notes: nil
        },
        document_integrity: {
          tampering_signs: {
            photo_substitution: { flag: false, evidence: nil },
            data_page_replacement: { flag: false, evidence: nil },
            laminate_damage: { flag: false, evidence: nil },
            chip_tampering: { flag: false, evidence: nil },
            microprint_disruption: { flag: false, evidence: nil },
            edge_inconsistencies: { flag: false, evidence: nil }
          },
          security_features_seen_rgb_only: {
            hologram_presence: { observed: "unknown" },
            optically_variable_ink: { observed: "unknown" },
            microtext_visible: { observed: "unknown" }
          }
        },
        image_capture_metadata: {
          full_document_in_frame: true,
          document_angle_degrees: 0,
          glare_detected: false,
          background_uniformity: true,
          crop_completeness_ratio: 1.0,
          resolution_ppi_estimate: 0,
          notes: nil
        },
        consistency_checks: {
          mrz_viz_name_match: { pass: true, distance: 0.0 },
          mrz_viz_dates_match: { pass: true },
          age_at_issue_years: { value: 0.0, plausible: true }
        },
        fraud_assessment: {
          risk_score: 0.0,
          risk_band: "low",
          top_factors: []
        },
        processing: {
          version: "passport_extractor_v1",
          warnings: [],
          errors: []
        }
      }
    }
  end
end
