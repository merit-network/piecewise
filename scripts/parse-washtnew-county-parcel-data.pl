#!/usr/bin/env perl

use Modern::Perl;
use Class::CSV;
use Getopt::Long qw(HelpMessage);;

my $res_headers = [
    qw(
      jurisdicti
      pelnumber
      onername1
      onername2
      pssnumber
      pdressapt
      pdressdir
      pssstreet
      setsuffix
      presscity
      pdresszip
      prtyclass
      pqualifag
      p_percent
      tax
      bldg_footprint
      longitude_
      latitude_1
      tractce10
      blockce10
      geoid
      )
];

my $comm_headers = [
    qw(
      jurisdiction
      pelnumber
      onername1
      onername2
      pssnumber
      pdressapt
      pdressdir
      pssstreet
      setsuffix
      presscity
      pdresszip
      prtyclass
      p_percent
      tax
      bldg_footprint
      longitude_
      latitude_1
      tractce10
      blockce10
      geoid
      )
];

my $prop_type_map = {
  residential => $res_headers,
  commericial => $comm_headers,
};

my $output_type_map = {
  sql  => \&_output_sql,
  json => \&_output_json,
  csv  => \&_output_csv,
}; 

my ($file, $type, $output);

GetOptions(
  'file|f=s'   => sub {
      $file = $_[1];
      unless (-e $file and -r _) {
        say "File, $file, does not exist or is not readable";
        HelpMessage(1);
      }
  },
  'type|t=s'   => sub {
    $type = $_[1];
    unless (exists $prop_type_map->{$type}) {
      say "Property type, $type, is not valid. Possible values are (commericial|residential).";
      HelpMessage(1);
    }

  },
  'output|o' => sub {
    $output = $_[1];
    unless (exists $output_type_map->{$output}) {
      say "Output format, $output, is not valid. Possible values are (sql|json|csv).";
      HelpMessage(1);
    }
  },
  'h|help' => sub {
    HelpMessage()
  } ,
)
or HelpMessage(1);

__END__

=head1 NAME

parse-washtenaw-county-parcel-data.pl - Script to parse Washtenaw County Parcel Data

=head1 SYNOPSIS

parse-washtenaw-county-parcel-data.pl [OPTIONS]

  Options:

    -f, --file    CSV file to parse
    -t, --type    The type of data in the csv [commercial|residential]
    -o, --output  Output format [sql|json|csv]

=head1 DESCRIPTION

This script is used to parse the washtenaw county parcel data and export to a specified format.

=head1 VERSION

0.1

=cut
