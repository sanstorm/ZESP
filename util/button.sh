#!/bin/bash
start=$SECONDS
duration=-1
echo 0 > /sys/class/backlight/lumi_r/brightness
echo 0 > /sys/class/backlight/lumi_g/brightness
echo 0 > /sys/class/backlight/lumi_b/brightness

## to check events "type,code,value":
#evtest /dev/input/event0-1-2-3-4, etc
#
device='/dev/input/event1'
ON='*type 1 (EV_KEY), code 115 (KEY_VOLUMEUP), value 1*'
OFF='*type 1 (EV_KEY), code 115 (KEY_VOLUMEUP), value 0*'
evtest "$device" | while read line; do
    case $line in
        ($ON)      echo 100 > /sys/class/backlight/lumi_r/brightness; start=$SECONDS;;
        ($OFF)     echo 0 > /sys/class/backlight/lumi_r/brightness;echo duration=$(( SECONDS - start ));duration=$(( SECONDS - start )) ;;
    esac
#duration=$(( SECONDS - start ));

if [ "$duration" -gt "9" ]
then
  echo ">10"
  duration=-1
fi
if [ "$duration" -gt "4" ] && [ "$duration" -lt "9" ]
then
  echo "5<x<10"
  duration=-1
fi
if [ "$duration" -gt "0" ] && [ "$duration" -lt "4" ]
then
  echo "x<5"
  duration=-1
fi
if [ "$duration" = "0" ]
then
  echo "x<1"
brightness=cat /sys/class/backlight/lumi_b/brightness
 case "$brightness" in
  "0") echo 100 > /sys/class/backlight/lumi_b/brightness;echo 100 > /sys/class/backlight/lumi_g/brightness;;
  *   ) echo 0 > /sys/class/backlight/lumi_b/brightness;echo 0 > /sys/class/backlight/lumi_g/brightness;;
  esac
  duration=-1
fi
done
