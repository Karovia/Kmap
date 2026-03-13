package com.karovia.kmap;

import android.util.Log;

import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

import org.json.JSONArray;
import org.json.JSONException;

import ai.onnxruntime.OnnxTensor;
import ai.onnxruntime.OrtException;
import ai.onnxruntime.OrtSession;

import java.nio.FloatBuffer;
import java.nio.LongBuffer;
import java.util.HashMap;
import java.util.Map;

@CapacitorPlugin(name = "LocalInference")
public class LocalInferencePlugin extends Plugin {
    private static final String TAG = "LocalInferencePlugin";

    @PluginMethod
    public void isAvailable(PluginCall call) {
        JSObject ret = new JSObject();
        ret.put("available", InferenceService.getInstance().isInitialized());
        call.resolve(ret);
    }

    @PluginMethod
    public void chat(PluginCall call) {
        String message = call.getString("message", "");

        if (message.isEmpty()) {
            call.reject("Message is required");
            return;
        }

        if (!InferenceService.getInstance().isInitialized()) {
            call.reject("Inference service not initialized");
            return;
        }

        // Run inference in background thread
        getActivity().runOnUiThread(() -> {
            new Thread(() -> {
                try {
                    String response = runQwen2Inference(message);
                    JSObject ret = new JSObject();
                    ret.put("response", response);
                    call.resolve(ret);
                } catch (Exception e) {
                    Log.e(TAG, "Chat inference failed", e);
                    call.reject("Inference failed: " + e.getMessage());
                }
            }).start();
        });
    }

    @PluginMethod
    public void embed(PluginCall call) {
        String text = call.getString("text", "");

        if (text.isEmpty()) {
            call.reject("Text is required");
            return;
        }

        if (!InferenceService.getInstance().isInitialized()) {
            call.reject("Inference service not initialized");
            return;
        }

        // Run embedding in background thread
        getActivity().runOnUiThread(() -> {
            new Thread(() -> {
                try {
                    float[] embedding = runBgeEmbedding(text);
                    JSObject ret = new JSObject();
                    ret.put("embedding", new JSONArray(embedding));
                    call.resolve(ret);
                } catch (Exception e) {
                    Log.e(TAG, "Embedding failed", e);
                    call.reject("Embedding failed: " + e.getMessage());
                }
            }).start();
        });
    }

    private String runQwen2Inference(String input) throws OrtException {
        OrtSession session = InferenceService.getInstance().getQwen2Session();
        OrtSession.Result result = null;

        try {
            // Tokenize input (simplified - in production use proper tokenizer)
            long[] inputIds = tokenizeSimple(input);

            // Create input tensor
            long[] shape = new long[]{1, inputIds.length};
            OnnxTensor inputTensor = OnnxTensor.createTensor(
                InferenceService.getInstance().getEnvironment(),
                LongBuffer.wrap(inputIds),
                shape
            );

            // Run inference
            Map<String, OnnxTensor> inputs = new HashMap<>();
            inputs.put("input_ids", inputTensor);
            result = session.run(inputs);

            // Get output and decode (simplified)
            OnnxTensor outputTensor = (OnnxTensor) result.get(0);
            long[] outputIds = outputTensor.getLongBuffer().array();

            return detokenizeSimple(outputIds);

        } finally {
            if (result != null) {
                result.close();
            }
        }
    }

    private float[] runBgeEmbedding(String text) throws OrtException {
        OrtSession session = InferenceService.getInstance().getBgeSession();
        OrtSession.Result result = null;

        try {
            // Tokenize input (simplified)
            long[] inputIds = tokenizeSimple(text);

            // Create input tensor
            long[] shape = new long[]{1, inputIds.length};
            OnnxTensor inputTensor = OnnxTensor.createTensor(
                InferenceService.getInstance().getEnvironment(),
                LongBuffer.wrap(inputIds),
                shape
            );

            // Run inference
            Map<String, OnnxTensor> inputs = new HashMap<>();
            inputs.put("input_ids", inputTensor);
            result = session.run(inputs);

            // Get embedding output
            OnnxTensor outputTensor = (OnnxTensor) result.get(0);
            FloatBuffer buffer = outputTensor.getFloatBuffer();
            float[] embedding = new float[buffer.remaining()];
            buffer.get(embedding);

            return embedding;

        } finally {
            if (result != null) {
                result.close();
            }
        }
    }

    // Simplified tokenizer - replace with proper implementation
    private long[] tokenizeSimple(String text) {
        // This is a placeholder - in production, use proper tokenizer
        char[] chars = text.toCharArray();
        long[] tokens = new long[chars.length];
        for (int i = 0; i < chars.length; i++) {
            tokens[i] = (long) chars[i];
        }
        return tokens;
    }

    // Simplified detokeni - replace with proper implementation
    private String detokenizeSimple(long[] tokens) {
        // This is a placeholder - in production, use proper detokenizer
        StringBuilder sb = new StringBuilder();
        for (long token : tokens) {
            if (token > 0 && token < 128) {
                sb.append((char) token);
            }
        }
        return sb.toString();
    }
}
