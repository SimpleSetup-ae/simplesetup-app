class JwtService
  # Token expiration times (in seconds)
  ACCESS_TOKEN_EXPIRY = 48.hours.to_i  # 48 hours as requested
  REFRESH_TOKEN_EXPIRY = 30.days.to_i  # 30 days for refresh tokens

  class << self
    def encode(payload)
      # Add standard JWT claims
      payload = payload.merge({
        exp: Time.current.to_i + ACCESS_TOKEN_EXPIRY,
        iat: Time.current.to_i,
        jti: SecureRandom.uuid # Token ID for revocation
      })

      JWT.encode(payload, jwt_secret, 'HS256')
    end

    def decode(token)
      payload = JWT.decode(token, jwt_secret, true, algorithm: 'HS256')[0]
      HashWithIndifferentAccess.new(payload)
    rescue JWT::DecodeError, JWT::ExpiredSignature => e
      Rails.logger.error "JWT Decode Error: #{e.message}"
      nil
    end

    def valid?(token)
      decode(token).present?
    rescue
      false
    end

    def refresh_token_payload(user)
      {
        user_id: user.id,
        email: user.email,
        type: 'refresh',
        exp: Time.current.to_i + REFRESH_TOKEN_EXPIRY,
        iat: Time.current.to_i
      }
    end

    def access_token_payload(user)
      {
        user_id: user.id,
        email: user.email,
        type: 'access',
        exp: Time.current.to_i + ACCESS_TOKEN_EXPIRY,
        iat: Time.current.to_i,
        jti: SecureRandom.uuid
      }
    end

    private

    def jwt_secret
      Rails.application.secret_key_base
    end
  end
end
