#!/usr/bin/env perl

use Class::CSV;
use DB_File;
use File::Path qw(make_path);
use File::Spec;
use Getopt::Long qw(HelpMessage);
use List::MoreUtils qw(uniq);
use Modern::Perl;
use String::Random qw(random_regex);

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

my $merged_headers = [
  grep {!/^jurisdicti$/}
  uniq('jurisdiction', 'participant_id', 'parcel_type', @{$res_headers}, @{$comm_headers})
];

my $prop_type_map = {
  residential => $res_headers,
  commercial  => $comm_headers,
};

my $parcel_cache_dir = File::Spec->catfile($ENV{HOME}, '.local', 'share', 'piecewise');
my $parcel_cache_file = File::Spec->catfile($parcel_cache_dir, 'parcel_cache.db');

unless (-e $parcel_cache_dir) {
  make_path($parcel_cache_dir);
}

my ($file, $type);
GetOptions(
  'file|f=s' => sub {
    $file = $_[1];
    unless (-e $file and -r _) {
      say "File, $file, does not exist or is not readable";
      HelpMessage(1);
    }
  },
  'type|t=s' => sub {
    $type = $_[1];
    unless (exists $prop_type_map->{$type}) {
      say "Property type, $type, is not valid. Possible values are (commericial|residential).";
      HelpMessage(1);
    }
  },
  'cache|c=s' => sub {
    $parcel_cache_file = $_[1] if -e $_[1] and -w _;
  },
  'headers' => \(my $show_headers = undef),
  'h|help' => sub {
    HelpMessage();
  },
  )
  or HelpMessage(1);

my %parcel_id_cache = ();
tie %parcel_id_cache, 'DB_File', $parcel_cache_file; ## no critic (ProhibitTies)

my $headers = $prop_type_map->{$type};
my $out_csv = Class::CSV->new(fields => $merged_headers);
my $in_csv  = Class::CSV->parse(filename => $file, fields => $headers);

my @lines = @{$in_csv->lines()};
shift @lines;

if ($show_headers) {
  $out_csv->add_line({map {$_ => $_} @{$merged_headers}});
}

for my $line (@lines) {
  my $new_line = {map {$_ => $line->$_} @{$headers}};

  $new_line->{participant_id} = _generate_unique_parcel_id();
  $new_line->{parcel_type} = $type;

  if (exists $new_line->{jurisdicti}) {
    $new_line->{jurisdiction} = delete $new_line->{jurisdicti};
  }

  $out_csv->add_line($new_line);
}

$out_csv->print;

sub _generate_unique_parcel_id {
  my $id;

  {
    $id = random_regex('\d\d\d\d\d');
    redo if exists $parcel_id_cache{$id};
    $parcel_id_cache{$id}++;
  }

  return $id;
}

exit;

__END__

=head1 NAME

parse-washtenaw-county-parcel-data.pl - Script to parse Washtenaw County Parcel Data

=head1 SYNOPSIS

parse-washtenaw-county-parcel-data.pl [OPTIONS]

  Options:

    -f, --file   CSV file to parse
    -t, --type   The type of data in the csv [commercial|residential]
    -c, --cache  Full path to DBM cache file for unique parcel ids

    --headers    Include column header line (default no headers)

=head1 DESCRIPTION

This script is used to parse the washtenaw county parcel data and export to a specified format.

=head1 VERSION

0.1

=cut
