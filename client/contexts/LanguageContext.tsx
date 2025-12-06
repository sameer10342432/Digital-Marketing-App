import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { I18nManager, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Updates from 'expo-updates';

import en from '../locales/en.json';
import ur from '../locales/ur.json';
import romanUr from '../locales/roman-ur.json';

export type Language = 'en' | 'ur' | 'roman-ur';

export interface LanguageOption {
  code: Language;
  name: string;
  nativeName: string;
  direction: 'ltr' | 'rtl';
}

export const LANGUAGES: LanguageOption[] = [
  { code: 'en', name: 'English', nativeName: 'English', direction: 'ltr' },
  { code: 'ur', name: 'Urdu', nativeName: 'اردو', direction: 'rtl' },
  { code: 'roman-ur', name: 'Roman Urdu', nativeName: 'Roman Urdu', direction: 'ltr' },
];

const translations: Record<Language, typeof en> = {
  en,
  ur,
  'roman-ur': romanUr,
};

type TranslationKey = string;

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => Promise<void>;
  t: (key: TranslationKey, fallback?: string) => string;
  isRTL: boolean;
  languages: LanguageOption[];
  currentLanguage: LanguageOption;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const LANGUAGE_STORAGE_KEY = '@app_language';

interface LanguageProviderProps {
  children: ReactNode;
}

export function LanguageProvider({ children }: LanguageProviderProps) {
  const [language, setLanguageState] = useState<Language>('en');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadStoredLanguage();
  }, []);

  const loadStoredLanguage = async () => {
    try {
      const storedLanguage = await AsyncStorage.getItem(LANGUAGE_STORAGE_KEY);
      if (storedLanguage && (storedLanguage === 'en' || storedLanguage === 'ur' || storedLanguage === 'roman-ur')) {
        setLanguageState(storedLanguage as Language);
        
        const langOption = LANGUAGES.find(l => l.code === storedLanguage) || LANGUAGES[0];
        const shouldBeRTL = langOption.direction === 'rtl';
        if (I18nManager.isRTL !== shouldBeRTL) {
          I18nManager.allowRTL(shouldBeRTL);
          I18nManager.forceRTL(shouldBeRTL);
        }
      }
    } catch (error) {
      console.error('Failed to load language preference:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const setLanguage = async (lang: Language) => {
    try {
      await AsyncStorage.setItem(LANGUAGE_STORAGE_KEY, lang);
      
      const newLanguageOption = LANGUAGES.find(l => l.code === lang) || LANGUAGES[0];
      const shouldBeRTL = newLanguageOption.direction === 'rtl';
      const isCurrentlyRTL = I18nManager.isRTL;
      
      if (shouldBeRTL !== isCurrentlyRTL) {
        I18nManager.allowRTL(shouldBeRTL);
        I18nManager.forceRTL(shouldBeRTL);
        
        if (Platform.OS !== 'web') {
          try {
            await Updates.reloadAsync();
          } catch (e) {
            console.log('Reload not available in development');
          }
        }
      }
      
      setLanguageState(lang);
    } catch (error) {
      console.error('Failed to save language preference:', error);
    }
  };

  const t = useCallback((key: TranslationKey, fallback?: string): string => {
    const keys = key.split('.');
    let result: unknown = translations[language];
    
    for (const k of keys) {
      if (result && typeof result === 'object' && k in result) {
        result = (result as Record<string, unknown>)[k];
      } else {
        return fallback || key;
      }
    }
    
    return typeof result === 'string' ? result : (fallback || key);
  }, [language]);

  const currentLanguage = LANGUAGES.find(l => l.code === language) || LANGUAGES[0];
  const isRTL = currentLanguage.direction === 'rtl';

  if (isLoading) {
    return null;
  }

  return (
    <LanguageContext.Provider value={{
      language,
      setLanguage,
      t,
      isRTL,
      languages: LANGUAGES,
      currentLanguage,
    }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
