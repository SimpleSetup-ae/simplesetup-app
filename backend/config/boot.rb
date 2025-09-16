ENV["BUNDLE_GEMFILE"] ||= File.expand_path("../Gemfile", __dir__)

require "bundler/setup" # Set up gems listed in the Gemfile.

# Load dotenv in development and test environments
if %w[development test].include?(ENV['RAILS_ENV']) || ENV['RAILS_ENV'].nil?
  require 'dotenv'
  Dotenv.load(File.expand_path('../../.env', __dir__))
end
