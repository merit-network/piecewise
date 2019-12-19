#!/usr/bin/env perl

use Class::CSV;
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

my $merged_headers = [uniq(@{$res_headers}, @{$comm_headers}, 'participant_id')];

my $prop_type_map = {
  residential => $res_headers,
  commericial => $comm_headers,
};

my ($file, $type, $parcel_ids);
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
  'h|help' => sub {
    HelpMessage();
  },
  )
  or HelpMessage(1);

my $headers = $prop_type_map->{$type};
my $out_csv = Class::CSV->new(fields => $merged_headers);
my $in_csv  = Class::CSV->parse(filename => $file, fields => $headers);

my @lines = @{$in_csv->lines()};
shift @lines;

$out_csv->add_line({map {$_ => $_} @{$merged_headers}});
for my $line (@lines) {
  my $new_line = {map {$_ => $line->$_} @{$headers}};
  $new_line->{participant_id} = _generate_unique_parcel_id();
  $out_csv->add_line($new_line);
}

$out_csv->print;

sub _generate_unique_parcel_id {
  my $id = random_regex('\d\d\d\d\d');
  return $id unless $parcel_ids->{$id};

  {
    $id = random_regex('\d\d\d\d\d');
    redo if exists $parcel_ids->{$id};
    $parcel_ids->{$id}++;
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

=head1 DESCRIPTION

This script is used to parse the washtenaw county parcel data and export to a specified format.

=head1 VERSION

0.1

=cut
