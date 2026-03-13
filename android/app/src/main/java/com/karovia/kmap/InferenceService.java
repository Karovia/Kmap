package com.karovia.kmap;

import android.content.Context;
import android.util.Log;

import ai.onnxruntime.OrtEnvironment;
import ai.onnxruntime.OrtException;
import ai.onnxruntime.OrtSession;

public class InferenceService {
    private static final String TAG = "InferenceService";
    private static InferenceService instance;

    private OrtEnvironment env;
    private OrtSession qwen2Session;
    private OrtSession bgeSession;
    private boolean isInitialized = false;

    private InferenceService() {
        // Private constructor for singleton
    }

    public static synchronized InferenceService getInstance() {
        if (instance == null) {
            instance = new InferenceService();
        }
        return instance;
    }

    public void initialize(Context context) throws OrtException {
        if (isInitialized) {
            return;
        }

        String modelDir = ModelDownloader.getModelDir(context);

        // Initialize ONNX Runtime environment
        env = OrtEnvironment.getEnvironment();

        // Load Qwen2 model
        String qwen2ModelPath = modelDir + "/qwen2/model.onnx";
        OrtSession.SessionOptions qwen2Options = new OrtSession.SessionOptions();
        qwen2Options.setIntraOpNumThreads(4);
        qwen2Options.setInterOpNumThreads(2);
        qwen2Options.setOptimizationLevel(OrtSession.SessionOptions.OptLevel.ALL_OPT);
        // Enable NNAPI for hardware acceleration if available
        try {
            qwen2Options.addNnapi();
            Log.i(TAG, "NNAPI acceleration enabled for Qwen2");
        } catch (OrtException e) {
            Log.w(TAG, "NNAPI not supported, falling back to CPU", e);
        }
        qwen2Session = env.createSession(qwen2ModelPath, qwen2Options);

        // Load BGE model
        String bgeModelPath = modelDir + "/bge/model.onnx";
        OrtSession.SessionOptions bgeOptions = new OrtSession.SessionOptions();
        bgeOptions.setIntraOpNumThreads(2);
        bgeOptions.setInterOpNumThreads(1);
        bgeOptions.setOptimizationLevel(OrtSession.SessionOptions.OptLevel.ALL_OPT);
        try {
            bgeOptions.addNnapi();
            Log.i(TAG, "NNAPI acceleration enabled for BGE");
        } catch (OrtException e) {
            Log.w(TAG, "NNAPI not supported for BGE, falling back to CPU", e);
        }
        bgeSession = env.createSession(bgeModelPath, bgeOptions);

        isInitialized = true;
        Log.i(TAG, "Inference service initialized successfully");
    }

    public boolean isInitialized() {
        return isInitialized;
    }

    public OrtSession getQwen2Session() {
        return qwen2Session;
    }

    public OrtSession getBgeSession() {
        return bgeSession;
    }

    public OrtEnvironment getEnvironment() {
        return env;
    }

    public void shutdown() {
        try {
            if (qwen2Session != null) {
                qwen2Session.close();
            }
            if (bgeSession != null) {
                bgeSession.close();
            }
            if (env != null) {
                env.close();
            }
            isInitialized = false;
        } catch (OrtException e) {
            Log.e(TAG, "Error shutting down inference service", e);
        }
    }
}
