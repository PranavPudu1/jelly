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
        "plugins": ["expo-font"]
    }
};
