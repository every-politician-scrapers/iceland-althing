#!/bin/env ruby
# frozen_string_literal: true

require 'every_politician_scraper/comparison'

class Comparison < EveryPoliticianScraper::Comparison
  def xcolumns
    %w[name group district]
  end
end

diff = Comparison.new('wikidata/results/current-members-iswiki.csv', 'data/wikipedia.csv').diff
puts diff.sort_by { |r| [r.first, r[1].to_s] }.reverse.map(&:to_csv)
