#!/bin/env ruby
# frozen_string_literal: true

require 'csv'
require 'pry'
require 'scraped'
require 'wikidata_ids_decorator'

require 'open-uri/cached'

class RemoveReferences < Scraped::Response::Decorator
  def body
    Nokogiri::HTML(super).tap do |doc|
      doc.css('sup.reference').remove
    end.to_s
  end
end

class MembersPage < Scraped::HTML
  decorator WikidataIdsDecorator::Links

  field :members do
    member_rows.flat_map { |tr| tr.css('td').each_slice(3).each_with_index.map { |tds, i| 
      constituency =  tr.xpath('preceding::tr[th[@colspan]]/th')[i]
      fragment({tds: tds, constituency: constituency} => Member)
    } }.reject(&:empty?).map(&:to_h)
  end

  private

  def member_rows
    table.xpath('.//tr[td[2]]')
  end

  def table
    noko.xpath('//h1/following::table[1]')
  end
end

class Member < Scraped::HTML
  def empty?
    tds.map(&:text).reject(&:empty?).empty?
  end

  field :item do
    name_link&.attr('wikidata')
  end

  field :name do
    name_link&.text&.tidy
  end

  field :group do
    party_link.attr('wikidata')
  end

  field :groupname do
    party_link.text.tidy
  end

  field :district do
    district_link.attr('wikidata')
  end

  field :districtname do
    district_link.text.tidy
  end

  private

  def tds
    noko[:tds]
  end

  def name_link
    tds[1].css('a').first
  end

  def district_link
    noko[:constituency].css('a').first
  end

  def party_link
    tds[1].xpath('a[span]').first
  end
end

url = 'https://is.wikipedia.org/wiki/Kj%C3%B6rnir_al%C3%BEingismenn_2021'
data = MembersPage.new(response: Scraped::Request.new(url: url).response).members

header = data.first.keys.to_csv
rows = data.map { |row| row.values.to_csv }
abort 'No results' if rows.count.zero?

puts header + rows.join
