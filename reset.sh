#!/bin/sh


killall node && /opt/app/start.sh
sleep 3
echo ----------------------------------------------------------------------
echo "                           start GW                               "
echo ---------------------------------------------------------------------- 

# 0 close watchdog
killall key_rgb
sleep 1
echo "echo 0 -->> dev/watchdog"
echo 0 > /dev/watchdog
echo -n V > /dev/watchdog

killall gw
#./control_light.sh &
killall test_ota
sleep 1



