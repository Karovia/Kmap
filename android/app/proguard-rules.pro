# Add project specific ProGuard rules here.
# You can control the set of applied configuration files using the
# proguardFiles setting in build.gradle.
#
# For more details, see
#   http://developer.android.com/guide/developing/tools/proguard.html

# If your project uses WebView with JS, uncomment the following
# and specify the fully qualified class name to the JavaScript interface
# class:
#-keepclassmembers class fqcn.of.javascript.interface.for.webview {
#   public *;
#}

# Uncomment this to preserve the line number information for
# debugging stack traces.
#-keepattributes SourceFile,LineNumberTable

# If you keep the line number information, uncomment this to
# hide the original source file name.
#-renamesourcefileattribute SourceFile

# Capacitor rules
-keep class com.getcapacitor.** { *; }
-keep class com.getcapacitor.community.** { *; }
-keep class org.apache.cordova.** { *; }

# ONNX Runtime rules
-keep class ai.onnxruntime.** { *; }
-keep class com.microsoft.onnxruntime.** { *; }
-dontwarn ai.onnxruntime.**
-dontwarn com.microsoft.onnxruntime.**

# AndroidX WorkManager rules
-keep class androidx.work.** { *; }
-dontwarn androidx.work.**

# Material Design rules
-keep class com.google.android.material.** { *; }
-dontwarn com.google.android.material.**

# Gson rules (if used)
-keep class com.google.gson.** { *; }
-dontwarn com.google.gson.**

# Keep model initializer and inference service
-keep class com.karovia.kmap.ModelInitializer { *; }
-keep class com.karovia.kmap.InferenceService { *; }
-keep class com.karovia.kmap.MainActivity { *; }

# Keep native methods
-keepclasseswithmembernames class * {
    native <methods>;
}

# Keep JavaScript interface methods
-keepclassmembers class * {
    @android.webkit.JavascriptInterface <methods>;
}
