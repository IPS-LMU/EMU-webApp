#!/bin/bash

INK=/Applications/Inkscape.app/Contents/Resources/bin/inkscape

if [[ -z "$1" ]] 
then
	echo "SVG file needed."
	exit;
fi

BASE=`basename "$1" .svg`
SVG="$1"

ATI="apple-touch-icon"

FI="favicon"

MST="mstile"

#######################
## apple touch icons

# iPhone App iOS 5,6 57pt
$INK -z -D -e "$ATI-57x57.png" -f 	$SVG -w 57 -h 57
$INK -z -D -e "$ATI-114x114.png" -f 	$SVG -w 114 -h 114

# iPad App iOS 5,6 72pt
$INK -z -D -e "$ATI-72x72.png" -f 	$SVG -w 72 -h 72
$INK -z -D -e "$ATI-144x144.png" -f 	$SVG -w 144 -h 144

# iPhone App iOS 7 60pt
$INK -z -D -e "$ATI-60x60.png" -f 	$SVG -w 60 -h 60
$INK -z -D -e "$ATI-120x120.png" -f 	$SVG -w 120 -h 120

# iPad App iOS 7  76pt
$INK -z -D -e "$ATI-76x76.png" -f 	$SVG -w 76 -h 76 
$INK -z -D -e "$ATI-152x152.png" -f 	$SVG -w 152 -h 152

# iPhone 6 Plus 180pt
$INK -z -D -e "$ATI-180x180.png" -f 	$SVG -w 180 -h 180

#####################
## favicons

$INK -z -D -e "$FI-192x192.png" -f 	$SVG -w 192 -h 192
$INK -z -D -e "$FI-160x160.png" -f 	$SVG -w 160 -h 160
$INK -z -D -e "$FI-96x96.png" -f 	$SVG -w 96 -h 96
$INK -z -D -e "$FI-16x16.png" -f 	$SVG -w 16 -h 16
$INK -z -D -e "$FI-32x32.png" -f 	$SVG -w 32 -h 32

####################
## mstile
$INK -z -D -e "$MST-144x144.png" -f 	$SVG -w 144 -h 144


####################
## generate favicon.ico file in dir above

# missing png size
$INK -z -D -e "$FI-48x48.png" -f 	$SVG -w 48 -h 48

# gen. favicon
png2ico ../favicon.ico favicon-16x16.png favicon-32x32.png favicon-48x48.png

# remove otherwise unneeded 48x48 png
rm "$FI-48x48.png"
