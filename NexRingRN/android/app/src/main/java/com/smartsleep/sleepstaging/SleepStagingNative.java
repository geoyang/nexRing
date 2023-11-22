package com.smartsleep.sleepstaging;

import java.util.List;

public class SleepStagingNative {
    // static {
    //     System.loadLibrary("sleepstaging");
    // }
    public static native SleepStagingResult analysis(List<HealthData> data);
    public static native void setSampleInterval(int interval);
    public static native int getSampleInterval();

    // public static SleepStagingResult getHealthData(List<HealthData> data){
    //     return analysis(data);
    // }
}
