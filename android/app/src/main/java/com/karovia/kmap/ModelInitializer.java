package com.karovia.kmap;

import android.content.Context;
import android.content.SharedPreferences;
import android.util.Log;
import android.widget.Toast;

import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;

public class ModelInitializer {
    private static final String TAG = "ModelInitializer";
    private static final String PREFS_NAME = "KmapPrefs";
    private static final String KEY_MODELS_INITIALIZED = "models_initialized";
    private static final String ASSETS_MODEL_DIR = "models";
    private static final String APP_MODEL_DIR = "models";

    private final Context context;
    private OnInitializationListener listener;

    public interface OnInitializationListener {
        void onSuccess();
        void onProgress(String message, int progress);
        void onError(String error);
    }

    public ModelInitializer(Context context) {
        this.context = context;
    }

    public void setListener(OnInitializationListener listener) {
        this.listener = listener;
    }

    public boolean isModelsInitialized() {
        SharedPreferences prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE);
        return prefs.getBoolean(KEY_MODELS_INITIALIZED, false);
    }

    public void initializeModels() {
        new Thread(() -> {
            try {
                // Create app model directory
                File appDir = new File(context.getFilesDir(), APP_MODEL_DIR);
                if (!appDir.exists()) {
                    appDir.mkdirs();
                }

                // Copy Qwen2 model
                updateProgress("正在复制语言模型...", 20);
                copyAssetFolder(ASSETS_MODEL_DIR + "/qwen2", appDir.getAbsolutePath() + "/qwen2");

                // Copy BGE model
                updateProgress("正在复制向量模型...", 60);
                copyAssetFolder(ASSETS_MODEL_DIR + "/bge", appDir.getAbsolutePath() + "/bge");

                // Mark as initialized
                SharedPreferences.Editor editor = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE).edit();
                editor.putBoolean(KEY_MODELS_INITIALIZED, true);
                editor.apply();

                updateProgress("初始化完成", 100);

                if (listener != null) {
                    listener.onSuccess();
                }

                // Show success toast
                ((MainActivity) context).runOnUiThread(() -> {
                    Toast.makeText(context, "基础功能已初始化，可离线使用", Toast.LENGTH_LONG).show();
                });

            } catch (Exception e) {
                Log.e(TAG, "Model initialization failed", e);
                if (listener != null) {
                    listener.onError("模型初始化失败: " + e.getMessage());
                }
            }
        }).start();
    }

    private void updateProgress(String message, int progress) {
        if (listener != null) {
            ((MainActivity) context).runOnUiThread(() -> {
                listener.onProgress(message, progress);
            });
        }
    }

    private void copyAssetFolder(String sourcePath, String destPath) throws IOException {
        String[] files = context.getAssets().list(sourcePath);
        if (files == null) return;

        File destDir = new File(destPath);
        if (!destDir.exists()) {
            destDir.mkdirs();
        }

        for (String file : files) {
            String srcFile = sourcePath + "/" + file;
            String destFile = destPath + "/" + file;

            if (context.getAssets().list(srcFile).length > 0) {
                // It's a directory, recurse
                copyAssetFolder(srcFile, destFile);
            } else {
                // It's a file, copy
                copyAssetFile(srcFile, destFile);
            }
        }
    }

    private void copyAssetFile(String sourcePath, String destPath) throws IOException {
        InputStream in = context.getAssets().open(sourcePath);
        OutputStream out = new FileOutputStream(destPath);

        byte[] buffer = new byte[1024];
        int length;
        while ((length = in.read(buffer)) > 0) {
            out.write(buffer, 0, length);
        }

        in.close();
        out.flush();
        out.close();
    }

    public static String getModelDir(Context context) {
        return context.getFilesDir().getAbsolutePath() + "/" + APP_MODEL_DIR;
    }

    public static void resetInitialization(Context context) {
        SharedPreferences.Editor editor = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE).edit();
        editor.putBoolean(KEY_MODELS_INITIALIZED, false);
        editor.apply();
    }
}
