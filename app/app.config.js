import 'dotenv/config';

export default {
    "expo": {
        "name": "Jelly",
        "slug": "jelly",
        "version": "1.0.0",
        "orientation": "portrait",
        "icon": "./assets/Logo.png",
        "userInterfaceStyle": "dark",
        "splash": {
            "image": "./assets/Logo.png",
            "resizeMode": "contain",
            "backgroundColor": "#FEE0DE"
        },
        "assetBundlePatterns": ["**/*"],
        "ios": {
            "supportsTablet": true,
            "bundleIdentifier": "com.jelly.restaurantapp"
        },
        "android": {
            "adaptiveIcon": {
                "foregroundImage": "./assets/Logo.png",
                "backgroundColor": "#FEE0DE"
            },
            "package": "com.jelly.app"
        },
        "web": {
            "favicon": "./assets/Logo.png"
        },
        "plugins": ["expo-font"],
        "extra": {
            "supabaseUrl": process.env.SUPABASE_URL || "https://ituiifzbivdpssfxtgmq.supabase.co",
            "supabaseAnonKey": process.env.SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml0dWlpZnpiaXZkcHNzZnh0Z21xIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI3Mjg5ODMsImV4cCI6MjA3ODMwNDk4M30.CDeEAV0ttVxJpnwpLTdHrOCv_sIFlZoGjQfET3kGeLM"
        }
    }
};
