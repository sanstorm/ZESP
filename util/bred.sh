#!/bin/sh

echo "********************************"
echo " ready slow blink red"
echo "********************************"

slow_blink_red()
{
    echo 0 > /sys/class/backlight/lumi_r/brightness
    echo 0 > /sys/class/backlight/lumi_g/brightness
    echo 25 > /sys/class/backlight/lumi_b/brightness
    sleep 0.2
    echo 0 > /sys/class/backlight/lumi_r/brightness
    echo 0 > /sys/class/backlight/lumi_g/brightness
    echo 0 > /sys/class/backlight/lumi_b/brightness
    sleep 0.4
}
while [ 0 -eq 0 ]
do
    slow_blink_red
done

