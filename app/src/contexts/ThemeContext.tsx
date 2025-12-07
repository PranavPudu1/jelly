import { createContext, PropsWithChildren, useState, useEffect, useContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppColors } from '../theme/colors';
import { DarkColors } from '../theme/darkColors';

const THEME_PREFERENCE_KEY = '@theme_preference';

type ThemeMode = 'light' | 'dark';

interface ThemeContextType {
    isDarkMode: boolean;
    colors: typeof AppColors;
    toggleTheme: () => void;
    setTheme: (mode: ThemeMode) => void;
}

export const ThemeContext = createContext<ThemeContextType>({
    isDarkMode: false,
    colors: AppColors,
    toggleTheme: () => {},
    setTheme: () => {},
});

export function useTheme() {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme must be used within ThemeProvider');
    }
    return context;
}

export default function ThemeProvider({ children }: PropsWithChildren) {
    const [isDarkMode, setIsDarkMode] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    // Load theme preference from AsyncStorage on mount
    useEffect(() => {
        loadThemePreference();
    }, []);

    async function loadThemePreference() {
        try {
            const saved = await AsyncStorage.getItem(THEME_PREFERENCE_KEY);
            if (saved) {
                setIsDarkMode(saved === 'dark');
            }
            // Default is light mode (false) if nothing saved
        }
        catch (error) {
            console.error('Error loading theme preference:', error);
        }
        finally {
            setIsLoading(false);
        }
    }

    async function setTheme(mode: ThemeMode) {
        try {
            const newIsDark = mode === 'dark';
            setIsDarkMode(newIsDark);
            await AsyncStorage.setItem(THEME_PREFERENCE_KEY, mode);
        }
        catch (error) {
            console.error('Error saving theme preference:', error);
        }
    }

    function toggleTheme() {
        const newMode = isDarkMode ? 'light' : 'dark';
        setTheme(newMode);
    }

    // Get current color palette based on theme
    const colors = isDarkMode ? DarkColors : AppColors;

    // Don't render children until theme is loaded
    if (isLoading) {
        return null;
    }

    return (
        <ThemeContext.Provider value={ { isDarkMode, colors, toggleTheme, setTheme } }>
            { children }
        </ThemeContext.Provider>
    );
}
