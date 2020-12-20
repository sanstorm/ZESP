#! /bin/sh
echo "0" > /tmp/mibutton
## to check events "type,code,value":
#evtest /dev/input/event0-1-2-3-4, etc
#
device='/dev/input/event1'
ON='*type 1 (EV_KEY), code 115 (KEY_VOLUMEUP), value 1*'
OFF='*type 1 (EV_KEY), code 115 (KEY_VOLUMEUP), value 0*'
evtest "$device" | while read line; do
    case $line in
        ($ON)      echo "1" > /tmp/mibutton;;
        ($OFF)     echo "0" > /tmp/mibutton;;
    esac
done