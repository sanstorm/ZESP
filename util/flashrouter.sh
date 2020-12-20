#! /bin/sh

echo ----------------------------------------------------------------------
echo "                           update jn5169                                "
echo ---------------------------------------------------------------------- 

# 0 close watchdog
killall key_rgb
killall start.sh && killall node
sleep 1
echo "echo 0 -->> dev/watchdog"
echo 0 > /dev/watchdog
echo -n V > /dev/watchdog

killall gw
killall flash
    echo 25 > /sys/class/backlight/lumi_b/brightness
sleep 1
echo "write"
./flash ./ZESProuter.bin
    echo 0 > /sys/class/backlight/lumi_b/brightness
    echo 25 > /sys/class/backlight/lumi_g/brightness
