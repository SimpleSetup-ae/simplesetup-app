#!/usr/bin/env ruby

require 'net/http'
require 'uri'
require 'json'
require 'base64'

# Load environment variables
require 'dotenv'
Dotenv.load('../.env')

# Check if OpenAI API key is set
if ENV['OPENAI_API_KEY'].nil? || ENV['OPENAI_API_KEY'].empty?
  puts "❌ OPENAI_API_KEY not found in environment"
  exit 1
end

puts "✅ OPENAI_API_KEY found: #{ENV['OPENAI_API_KEY'][0..20]}..."

# Create a simple test image (1x1 pixel PNG as placeholder)
test_image_data = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg=="

# Test direct OpenAI API call
uri = URI('https://api.openai.com/v1/chat/completions')
http = Net::HTTP.new(uri.host, uri.port)
http.use_ssl = true
http.read_timeout = 60

request = Net::HTTP::Post.new(uri)
request['Authorization'] = "Bearer #{ENV['OPENAI_API_KEY']}"
request['Content-Type'] = 'application/json'

# Use GPT-4 Vision (using gpt-4-turbo which supports vision)
request.body = {
  model: "gpt-4-turbo",
  messages: [
    {
      role: "system",
      content: "You are a passport extraction expert. Extract any visible text from the image."
    },
    {
      role: "user",
      content: [
        {
          type: "text",
          text: "What do you see in this image? If it's a passport, extract the information. If not, just describe what you see."
        },
        {
          type: "image_url",
          image_url: {
            url: "data:image/png;base64,#{test_image_data}",
            detail: "high"
          }
        }
      ]
    }
  ],
  max_tokens: 500,
  temperature: 0.1
}.to_json

puts "\n📤 Sending request to OpenAI API..."
puts "   Model: gpt-4-turbo"
puts "   Image: Test image (1x1 PNG)"

begin
  response = http.request(request)
  
  puts "\n📥 Response Status: #{response.code}"
  
  if response.code == '200'
    result = JSON.parse(response.body)
    content = result.dig('choices', 0, 'message', 'content')
    puts "✅ Success! OpenAI Response:"
    puts "-" * 50
    puts content
    puts "-" * 50
  else
    puts "❌ Error Response:"
    puts response.body
    
    # Parse error if JSON
    begin
      error = JSON.parse(response.body)
      if error['error']
        puts "\nError Type: #{error['error']['type']}"
        puts "Error Message: #{error['error']['message']}"
        
        # Check for common issues
        if error['error']['message'].include?('does not exist')
          puts "\n⚠️  Model Issue: The model 'gpt-5' does not exist."
          puts "   Available vision models: gpt-4-vision-preview, gpt-4-turbo"
        elsif error['error']['message'].include?('API key')
          puts "\n⚠️  API Key Issue: Check your OPENAI_API_KEY"
        end
      end
    rescue JSON::ParserError
      # Not JSON error response
    end
  end
  
rescue => e
  puts "❌ Exception: #{e.message}"
  puts e.backtrace.first(5).join("\n")
end

puts "\n" + "=" * 60
puts "Test Complete!"
puts "=" * 60
