package com.karovia.kmap;

public class TestApp {
    private String message;

    public TestApp() {
        this.message = "Test App Initialized";
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public static void main(String[] args) {
        TestApp app = new TestApp();
        System.out.println(app.getMessage());
    }
}
