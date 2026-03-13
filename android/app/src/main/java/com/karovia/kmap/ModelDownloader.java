package com.karovia.kmap;

import android.content.Context;
import android.content.SharedPreferences;
import android.util.Log;

import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.net.HttpURLConnection;
import java.net.URL;

public class ModelDownloader {
    private static final String TAG = "ModelDownloader";
    private static final String PREFS_NAME = "KmapPrefs";
    private static final String KEY_MODELS_DOWNLOADED = "models_downloaded";

    // 模型下载URL - 使用Hugging Face托管的量化ONNX模型
    // Qwen2-0.5B-Instruct 4bit量化版本
    private static final String QWEN2_MODEL_URL = "https://huggingface.co/Qwen/Qwen2-0.5B-Instruct-ONNX/resolve/main/onnx/model_q4.onnx";
    // BGE-small-zh-v1.5 量化版本
    private static final String BGE_MODEL_URL = "https://huggingface.co/BAAI/bge-small-zh-v1.5/resolve/main/onnx/model_quantized.onnx";

    private final Context context;
    private OnDownloadListener listener;

    public interface OnDownloadListener {
        void onSuccess();
        void onProgress(String message, int progress);
        void onError(String error);
    }

    public ModelDownloader(Context context) {
        this.context = context;
    }

    public void setListener(OnDownloadListener listener) {
        this.listener = listener;
    }

    public boolean isModelsDownloaded() {
        SharedPreferences prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE);
        return prefs.getBoolean(KEY_MODELS_DOWNLOADED, false);
    }

    public void downloadModels() {
        new Thread(() -> {
            try {
                // 初始化进度为0%
                updateProgress("准备下载...", 0);

                File modelDir = new File(context.getFilesDir(), "models");
                if (!modelDir.exists()) {
                    modelDir.mkdirs();
                }

                // 下载Qwen2模型
                updateProgress("正在下载语言模型...", 5);
                File qwen2Dir = new File(modelDir, "qwen2");
                qwen2Dir.mkdirs();
                downloadFile(QWEN2_MODEL_URL, new File(qwen2Dir, "model.onnx"), 5, 50);

                // 下载BGE模型
                updateProgress("正在下载向量模型...", 55);
                File bgeDir = new File(modelDir, "bge");
                bgeDir.mkdirs();
                downloadFile(BGE_MODEL_URL, new File(bgeDir, "model.onnx"), 55, 95);

                // 标记为已下载
              updateProgress("正在完成...", 98);
                SharedPreferences.Editor editor = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE).edit();
                editor.putBoolean(KEY_MODELS_DOWNLOADED, true);
                editor.apply();

                updateProgress("下载完成", 100);

                if (listener != null) {
                    listener.onSuccess();
                }

            } catch (Exception e) {
                Log.e(TAG, "Model download failed", e);
                if (listener != null) {
                    listener.onError("模型下载失败: " + e.getMessage());
                }
            }
        }).start();
    }

    private void downloadFile(String urlString, File destFile, int progressStart, int progressEnd) throws IOException {
        URL url = new URL(urlString);
        HttpURLConnection connection = null;

        try {
            connection = (HttpURLConnection) url.openConnection();
            connection.setRequestMethod("GET");
            connection.setConnectTimeout(30000);
            connection.setReadTimeout(30000);
            connection.setInstanceFollowRedirects(true);

            // 检查响应码
            int responseCode = connection.getResponseCode();
            if (responseCode != HttpURLConnection.HTTP_OK) {
                throw new IOException("下载失败: HTTP " + responseCode + " - " +
                    (responseCode == 404 ? "文件不存在，URL可能已失效" :
                     responseCode == 403 ? "访问被拒绝" :
                     responseCode >= 500 ? "服务器错误" : "请求失败"));
            }

            long fileSize = connection.getContentLength();
            if (fileSize <= 0) {
                throw new IOException("无法获取文件大小，URL可能无效");
            }

            try (InputStream in = connection.getInputStream();
                 FileOutputStream out = new FileOutputStream(destFile)) {

                byte[] buffer = new byte[8192];
                int bytesRead;
                long totalBytesRead = 0;
                long lastUpdateTime = System.currentTimeMillis();

                while ((bytesRead = in.read(buffer)) != -1) {
                    out.write(buffer, 0, bytesRead);
                    totalBytesRead += bytesRead;

                    // 限制更新频率，避免UI卡顿
                    long currentTime = System.currentTimeMillis();
                    if (currentTime - lastUpdateTime > 500 || totalBytesRead == fileSize) {
                        double fileProgress = (double) totalBytesRead / fileSize;
                        int overallProgress = progressStart + (int) (fileProgress * (progressEnd - progressStart));

                        updateProgress("下载中: " + (totalBytesRead / 1024 / 1024) + "MB / " +
                                     (fileSize / 1024 / 1024) + "MB", overallProgress);
                        lastUpdateTime = currentTime;
                    }
                }
            }
        } catch (java.net.UnknownHostException e) {
            throw new IOException("网络连接失败，请检查网络设置", e);
        } catch (java.net.SocketTimeoutException e) {
            throw new IOException("下载超时，请检查网络连接", e);
        } catch (java.net.MalformedURLException e) {
            throw new IOException("URL格式错误: " + urlString, e);
        } finally {
            if (connection != null) {
                connection.disconnect();
            }
        }
    }

    private void updateProgress(String message, int progress) {
        if (listener != null) {
            ((MainActivity) context).runOnUiThread(() -> {
                listener.onProgress(message, progress);
            });
        }
    }

    public static String getModelDir(Context context) {
        return context.getFilesDir().getAbsolutePath() + "/models";
    }
}
