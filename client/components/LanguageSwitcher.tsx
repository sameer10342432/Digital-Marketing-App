import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Modal, StyleSheet, Pressable } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useLanguage, Language } from '../contexts/LanguageContext';
import { useTheme } from '../hooks/useTheme';
import { Spacing, Colors } from '../constants/theme';

interface LanguageSwitcherProps {
  compact?: boolean;
}

export function LanguageSwitcher({ compact = false }: LanguageSwitcherProps) {
  const { language, setLanguage, languages, currentLanguage, t } = useLanguage();
  const { theme } = useTheme();
  const [modalVisible, setModalVisible] = useState(false);

  const handleLanguageSelect = async (lang: Language) => {
    await setLanguage(lang);
    setModalVisible(false);
  };

  if (compact) {
    return (
      <TouchableOpacity
        onPress={() => setModalVisible(true)}
        style={[styles.compactButton, { backgroundColor: theme.backgroundDefault }]}
      >
        <Feather name="globe" size={20} color={Colors.primary} />
        <Text style={[styles.compactText, { color: theme.text, marginLeft: Spacing.xs }]}>
          {currentLanguage.code.toUpperCase()}
        </Text>
        <Modal
          animationType="fade"
          transparent={true}
          visible={modalVisible}
          onRequestClose={() => setModalVisible(false)}
        >
          <Pressable
            style={styles.modalOverlay}
            onPress={() => setModalVisible(false)}
          >
            <View style={[styles.modalContent, { backgroundColor: theme.backgroundRoot }]}>
              <Text style={[styles.modalTitle, { color: theme.text }]}>
                {t('settings.selectLanguage')}
              </Text>
              {languages.map((lang) => (
                <TouchableOpacity
                  key={lang.code}
                  style={[
                    styles.languageOption,
                    { borderBottomColor: theme.border },
                    language === lang.code && { backgroundColor: Colors.primary + '15' }
                  ]}
                  onPress={() => handleLanguageSelect(lang.code)}
                >
                  <View style={styles.languageInfo}>
                    <Text style={[styles.languageName, { color: theme.text }]}>
                      {lang.name}
                    </Text>
                    <Text style={[styles.nativeName, { color: theme.textSecondary }]}>
                      {lang.nativeName}
                    </Text>
                  </View>
                  {language === lang.code && (
                    <Feather name="check" size={20} color={Colors.primary} />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </Pressable>
        </Modal>
      </TouchableOpacity>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={[styles.label, { color: theme.textSecondary }]}>
        {t('settings.language')}
      </Text>
      <TouchableOpacity
        style={[styles.selector, { backgroundColor: theme.backgroundDefault, borderColor: theme.border }]}
        onPress={() => setModalVisible(true)}
      >
        <View style={styles.selectedLanguage}>
          <Feather name="globe" size={20} color={Colors.primary} />
          <View style={styles.languageTextContainer}>
            <Text style={[styles.languageName, { color: theme.text }]}>
              {currentLanguage.name}
            </Text>
            <Text style={[styles.nativeName, { color: theme.textSecondary }]}>
              {currentLanguage.nativeName}
            </Text>
          </View>
        </View>
        <Feather name="chevron-down" size={20} color={theme.textSecondary} />
      </TouchableOpacity>

      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setModalVisible(false)}
        >
          <View style={[styles.modalContent, { backgroundColor: theme.backgroundRoot }]}>
            <Text style={[styles.modalTitle, { color: theme.text }]}>
              {t('settings.selectLanguage')}
            </Text>
            {languages.map((lang) => (
              <TouchableOpacity
                key={lang.code}
                style={[
                  styles.languageOption,
                  { borderBottomColor: theme.border },
                  language === lang.code && { backgroundColor: Colors.primary + '15' }
                ]}
                onPress={() => handleLanguageSelect(lang.code)}
              >
                <View style={styles.languageInfo}>
                  <Text style={[styles.languageName, { color: theme.text }]}>
                    {lang.name}
                  </Text>
                  <Text style={[styles.nativeName, { color: theme.textSecondary }]}>
                    {lang.nativeName}
                  </Text>
                </View>
                {language === lang.code && (
                  <Feather name="check" size={20} color={Colors.primary} />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  label: {
    fontSize: 14,
    marginBottom: 8,
  },
  selector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  selectedLanguage: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  languageTextContainer: {
    marginLeft: 12,
  },
  compactButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  compactText: {
    fontSize: 14,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '80%',
    maxWidth: 320,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
    textAlign: 'center',
  },
  languageOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderRadius: 8,
    marginBottom: 4,
  },
  languageInfo: {
    flex: 1,
  },
  languageName: {
    fontSize: 16,
    fontWeight: '500',
  },
  nativeName: {
    fontSize: 14,
    marginTop: 2,
  },
});
