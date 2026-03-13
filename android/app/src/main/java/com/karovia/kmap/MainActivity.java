package com.karovia.kmap;

import android.app.AlertDialog;
import android.app.ProgressDialog;
import android.os.Bundle;
import android.util.Log;

import com.getcapacitor.BridgeActivity;

import ai.onnxruntime.OrtException;

public class MainActivity extends BridgeActivity {
    private static final String TAG = "MainActivity";
    private ModelDownloader modelDownloader;
    private ProgressDialog progressDialog;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        // Register local inference plugin
        registerPlugin(LocalInferencePlugin.class);

        // 不再在启动时强制下载模型，让用户在设置页面主动选择
        // 如果已有模型，尝试初始化推理服务
        modelDownloader = new ModelDownloader(this);
        if (modelDownloader.isModelsDownloaded()) {
            initializeInferenceService();
        }
    }

    private void initializeInferenceService() {
        new Thread(() -> {
            try {
                InferenceService.getInstance().initialize(this);
                Log.i(TAG, "Inference service initialized successfully");
            } catch (OrtException e) {
                Log.e(TAG, "Failed to initialize inference service", e);
                runOnUiThread(() -> {
                    new AlertDialog.Builder(this)
                            .setTitle("警告")
                            .setMessage("本地推理服务初始化失败，部分功能可能无法使用。")
                            .setPositiveButton("确定", null)
                            .show();
                });
            }
        }).start();
    }

    @Override
    public void onDestroy() {
        super.onDestroy();
        // Shutdown inference service to release resources
        InferenceService.getInstance().shutdown();
    }
}

