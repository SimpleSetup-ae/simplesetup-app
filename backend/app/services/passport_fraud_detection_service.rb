class PassportFraudDetectionService
  # Fraud scoring configuration based on the provided schema
  WEIGHTS = {
    document_integrity: 0.45,
    security_features: 0.15,
    mrz_consistency: 0.12,
    chip_authentication: 0.10,
    photo_liveness_match: 0.10,
    capture_quality: 0.08
  }.freeze

  RISK_BANDS = [
    { label: 'low', min: 0.00, max: 0.25 },
    { label: 'medium', min: 0.25, max: 0.60 },
    { label: 'high', min: 0.60, max: 0.80 },
    { label: 'critical', min: 0.80, max: 1.00 }
  ].freeze

  def initialize(passport_data, document = nil)
    @passport_data = passport_data.deep_symbolize_keys
    @document = document
    @metrics = {}
    @top_factors = []
  end

  def analyze
    calculate_metrics
    overall_score = calculate_overall_score
    risk_band = determine_risk_band(overall_score)
    
    {
      risk_score: overall_score.round(3),
      risk_band: risk_band,
      top_factors: @top_factors.first(3),
      detailed_metrics: @metrics,
      recommendations: generate_recommendations(risk_band, @top_factors)
    }
  end

  private

  def calculate_metrics
    @metrics[:document_integrity] = calculate_document_integrity
    @metrics[:security_features] = calculate_security_features
    @metrics[:mrz_consistency] = calculate_mrz_consistency
    @metrics[:chip_authentication] = calculate_chip_authentication
    @metrics[:photo_liveness_match] = calculate_photo_liveness_match
    @metrics[:capture_quality] = calculate_capture_quality
  end

  def calculate_document_integrity
    integrity = @passport_data.dig(:document_integrity, :tampering_signs) || {}
    
    penalties = {
      photo_substitution: 1.00,
      data_page_replacement: 0.80,
      laminate_damage: 0.60,
      chip_tampering: 0.70,
      microprint_disruption: 0.65,
      edge_inconsistencies: 0.40
    }
    
    score = 0.0
    
    penalties.each do |feature, penalty|
      if integrity.dig(feature, :flag) == true
        score = 1 - ((1 - score) * (1 - penalty))
        evidence = integrity.dig(feature, :evidence)
        @top_factors << "#{feature.to_s.humanize}: #{evidence || 'detected'}"
      end
    end
    
    score
  end

  def calculate_security_features
    features = @passport_data.dig(:document_integrity, :security_features_seen_rgb_only) || {}
    
    penalties = {
      hologram_presence: 0.50,
      optically_variable_ink: 0.40,
      microtext_visible: 0.35
    }
    
    total_penalty = 0.0
    max_penalty = penalties.values.sum
    
    penalties.each do |feature, penalty|
      observed = features.dig(feature, :observed)
      if observed == 'unlikely' || observed == 'no'
        total_penalty += penalty
        @top_factors << "Missing security feature: #{feature.to_s.humanize}"
      end
    end
    
    max_penalty > 0 ? (total_penalty / max_penalty) : 0.0
  end

  def calculate_mrz_consistency
    checks = {
      format_valid: 0.25,
      check_digits_match: 0.35,
      fields_match_viz: 0.30,
      icao_doc_type_country: 0.10
    }
    
    total_weight = checks.values.sum
    failed_weight = 0.0
    
    # Check MRZ format
    mrz_format = @passport_data.dig(:machine_readable_zone, :format, :value)
    if mrz_format.nil? || !['TD3', 'TD2'].include?(mrz_format)
      failed_weight += checks[:format_valid]
      @top_factors << "Invalid MRZ format"
    end
    
    # Check digit validation
    check_digits = @passport_data.dig(:check_digits) || {}
    [:document_number, :date_of_birth, :expiry_date, :composite].each do |digit_type|
      if check_digits.dig(digit_type, :valid) == false
        failed_weight += checks[:check_digits_match] / 4
        @top_factors << "Invalid #{digit_type.to_s.humanize} check digit"
      end
    end
    
    # Check MRZ-VIZ consistency
    consistency = @passport_data.dig(:consistency_checks) || {}
    if consistency.dig(:mrz_viz_name_match, :pass) == false
      failed_weight += checks[:fields_match_viz] / 2
      distance = consistency.dig(:mrz_viz_name_match, :distance) || 0
      @top_factors << "Name mismatch between MRZ and visual zone (distance: #{distance})"
    end
    
    if consistency.dig(:mrz_viz_dates_match, :pass) == false
      failed_weight += checks[:fields_match_viz] / 2
      @top_factors << "Date mismatch between MRZ and visual zone"
    end
    
    total_weight > 0 ? (failed_weight / total_weight) : 0.0
  end

  def calculate_chip_authentication
    chip_present = @passport_data.dig(:biometric_information, :chip_present, :observed)
    
    # If chip is not present in modern passport, that's suspicious
    if chip_present == 'false' || chip_present == false
      @top_factors << "No biometric chip detected in passport"
      return 0.50
    end
    
    # If we can't determine chip presence, assume medium risk
    if chip_present == 'unknown'
      return 0.30
    end
    
    # Chip is present but we can't read it in RGB scan
    0.0
  end

  def calculate_photo_liveness_match
    # In this implementation, we don't have liveness data
    # This would be populated if we had facial recognition/liveness detection
    # Return neutral score
    0.0
  end

  def calculate_capture_quality
    quality_weights = {
      quality_score: 0.20,
      illumination_score: 0.12,
      blur_score: 0.18,
      occlusion_detected: 0.12,
      full_document_in_frame: 0.18,
      glare_detected: 0.10,
      document_angle: 0.10
    }
    
    photo = @passport_data.dig(:photo_analysis) || {}
    capture = @passport_data.dig(:image_capture_metadata) || {}
    
    score = 0.0
    
    # Quality scores (inverted - lower quality = higher risk)
    quality_score = photo[:quality_score] || 0.5
    score += (1 - quality_score) * quality_weights[:quality_score]
    
    illumination_score = photo[:illumination_score] || 0.5
    score += (1 - illumination_score) * quality_weights[:illumination_score]
    
    # Blur score (direct - higher blur = higher risk)
    blur_score = photo[:blur_score] || 0.0
    score += blur_score * quality_weights[:blur_score]
    
    # Binary checks
    if photo[:occlusion_detected] == true
      score += quality_weights[:occlusion_detected]
      @top_factors << "Face occlusion detected in photo"
    end
    
    if capture[:full_document_in_frame] == false
      score += quality_weights[:full_document_in_frame]
      @top_factors << "Document not fully in frame"
    end
    
    if capture[:glare_detected] == true
      score += quality_weights[:glare_detected]
      @top_factors << "Glare detected on document"
    end
    
    # Document angle
    angle = capture[:document_angle_degrees] || 0
    angle_score = [angle.abs / 20.0, 1.0].min
    score += angle_score * quality_weights[:document_angle]
    
    if angle.abs > 15
      @top_factors << "Document significantly tilted (#{angle}°)"
    end
    
    score
  end

  def calculate_overall_score
    overall = 0.0
    
    WEIGHTS.each do |metric, weight|
      metric_score = @metrics[metric] || 0.0
      overall += weight * metric_score
    end
    
    # Ensure score is between 0 and 1
    [[overall, 0.0].max, 1.0].min
  end

  def determine_risk_band(score)
    RISK_BANDS.find { |band| score >= band[:min] && score < band[:max] }&.dig(:label) || 'unknown'
  end

  def generate_recommendations(risk_band, factors)
    recommendations = []
    
    case risk_band
    when 'critical'
      recommendations << "Manual review required - do not proceed automatically"
      recommendations << "Request additional verification documents"
      recommendations << "Consider requesting video verification call"
    when 'high'
      recommendations << "Request high-resolution rescan of passport"
      recommendations << "Verify passport number with issuing authority if possible"
      recommendations << "Request additional supporting documents"
    when 'medium'
      recommendations << "Review flagged issues before proceeding"
      recommendations << "Consider requesting better quality scan if image issues detected"
    when 'low'
      recommendations << "Document appears authentic - proceed with standard verification"
    end
    
    # Add specific recommendations based on top factors
    if factors.any? { |f| f.include?('glare') || f.include?('blur') }
      recommendations << "Request new scan with better lighting and focus"
    end
    
    if factors.any? { |f| f.include?('chip') }
      recommendations << "If possible, perform chip authentication at physical verification"
    end
    
    if factors.any? { |f| f.include?('MRZ') }
      recommendations << "Manually verify MRZ data against visual zone"
    end
    
    recommendations.uniq
  end
end


