package com.attendanceplanner

import android.os.Bundle // ✅ Import Bundle
import com.facebook.react.ReactActivity
import com.facebook.react.ReactActivityDelegate
import com.facebook.react.defaults.DefaultNewArchitectureEntryPoint.fabricEnabled
import com.facebook.react.defaults.DefaultReactActivityDelegate
import org.devio.rn.splashscreen.SplashScreen
import com.google.firebase.FirebaseApp

class MainActivity : ReactActivity() {

    override fun getMainComponentName(): String = "AttendancePlanner" // ✅ getMainComponentName properly overridden  // ✅ getMainComponentName properly overridden

    override fun createReactActivityDelegate(): ReactActivityDelegate =
        DefaultReactActivityDelegate(this, mainComponentName, fabricEnabled)

    override fun onCreate(savedInstanceState: Bundle?) { // ✅ onCreate properly overridden
        super.onCreate(savedInstanceState)
        SplashScreen.show(this)
        FirebaseApp.initializeApp(this)
    }
}
