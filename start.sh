#! /bin/sh

echo ----------------------------------------------------------------------
echo "                           start GW                               "
echo ---------------------------------------------------------------------- 

# 0 close watchdog
killall key_rgb
killall tb.sh
/opt/app/util/tb.sh &
sleep 1
echo "echo 0 -->> dev/watchdog"
echo 0 > /dev/watchdog
echo -n V > /dev/watchdog

killall gw
#./control_light.sh &
killall test_ota
sleep 1

while true ; do 
node go.js zesp.jsc

done

