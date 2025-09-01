require 'jwt'
require 'net/http'
require 'json'

class ClerkService
  CLERK_SECRET_KEY = ENV['CLERK_SECRET_KEY']
  CLERK_WEBHOOK_SECRET = ENV['CLERK_WEBHOOK_SECRET']
  
  class << self
    def verify_token(token)
      # Get Clerk's public keys
      jwks = fetch_jwks
      
      # Decode and verify JWT
      JWT.decode(token, nil, true, {
        algorithms: ['RS256'],
        jwks: jwks,
        verify_iss: true,
        iss: "https://#{clerk_frontend_api_url}",
        verify_aud: true,
        aud: clerk_frontend_api_url
      }).first
    end
    
    def verify_webhook(payload, signature, timestamp, webhook_id)
      # Implement Svix webhook verification
      # This is a simplified version - use the actual Svix library in production
      expected_signature = generate_webhook_signature(payload, timestamp, webhook_id)
      
      unless signature == expected_signature
        raise 'Invalid webhook signature'
      end
      
      # Check timestamp to prevent replay attacks
      current_time = Time.now.to_i
      webhook_time = timestamp.to_i
      
      if (current_time - webhook_time).abs > 300 # 5 minutes tolerance
        raise 'Webhook timestamp too old'
      end
      
      true
    end
    
    private
    
    def fetch_jwks
      uri = URI("https://#{clerk_frontend_api_url}/.well-known/jwks.json")
      response = Net::HTTP.get_response(uri)
      
      if response.code == '200'
        JSON.parse(response.body)
      else
        raise "Failed to fetch JWKS: #{response.code}"
      end
    end
    
    def clerk_frontend_api_url
      # Extract from publishable key or use environment variable
      ENV['CLERK_FRONTEND_API_URL'] || 'your-clerk-frontend-api.clerk.accounts.dev'
    end
    
    def generate_webhook_signature(payload, timestamp, webhook_id)
      # Simplified webhook signature generation
      # In production, use the actual Svix library
      data = "#{webhook_id}.#{timestamp}.#{payload}"
      Base64.encode64(OpenSSL::HMAC.digest('sha256', CLERK_WEBHOOK_SECRET, data)).strip
    end
  end
end
