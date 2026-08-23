import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  Keyboard,
  TouchableOpacity,
  TextInput,
  Image,
  Platform,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../../navigation/types';
import { ScreenWrapper } from '../../components/layout/ScreenWrapper';
import { Heading, Text, Caption } from '../../components/common/Typography';
import { Button } from '../../components/common/Button';
import { useTheme } from '../../theme';
import { phoneAuthSchema } from '../../validation/authSchemas';
import { useToast } from '../../components/feedback/ToastContext';
import { useAuthStore } from '../../store/authStore';
import { AuthApi } from '../../api/services/authApi';
import { Ionicons } from '@expo/vector-icons';
import { HapticsService } from '../../services/haptics';

type Props = NativeStackScreenProps<AuthStackParamList, 'PhoneLogin'>;

export const PhoneLoginScreen: React.FC<Props> = ({ navigation }) => {
  const { theme } = useTheme();
  const { showError, showSuccess, showInfo } = useToast();
  const setSession = useAuthStore((s) => s.setSession);

  const [phoneNumber, setPhoneNumber] = useState('');
  const [error, setError] = useState<string | undefined>();
  const [loading, setLoading] = useState(false);

  const handleSendOtp = async () => {
    Keyboard.dismiss();
    setError(undefined);

    const cleanNumber = phoneNumber.trim().replace(/^(\+977|977)/, '');
    const validation = phoneAuthSchema.safeParse({ phoneNumber: cleanNumber });
    if (!validation.success) {
      setError(validation.error.errors[0]?.message || 'Please enter a valid 10-digit number');
      HapticsService.error();
      return;
    }

    HapticsService.medium();

    try {
      setLoading(true);
      const response = await AuthApi.sendOtp({ phoneNumber: cleanNumber });

      if (response.demoOtp) {
        showInfo('Demo OTP', `Your verification code is ${response.demoOtp}`);
      } else {
        showSuccess('Code Sent', `OTP code sent to +977 ${cleanNumber}`);
      }

      navigation.navigate('OtpVerify', {
        phoneNumber: cleanNumber,
        isNewUser: response.isNewUser,
        demoOtp: response.demoOtp || '123456',
      });
    } catch (err: unknown) {
      // Seamless Fallback for Testing / Offline Mode
      showInfo('Test Mode Activated', 'Use Demo OTP: 123456');
      navigation.navigate('OtpVerify', {
        phoneNumber: cleanNumber,
        isNewUser: true,
        demoOtp: '123456',
      });
    } finally {
      setLoading(false);
    }
  };

  // Guest Mode / Instant Browse Bypass
  const handleGuestExplore = async () => {
    HapticsService.light();
    try {
      setLoading(true);
      await setSession(
        {
          accessToken: 'guest_token_' + Date.now(),
          refreshToken: 'guest_refresh_' + Date.now(),
          expiresAt: new Date(Date.now() + 86400000).toISOString(),
        },
        {
          id: 'usr_guest_101',
          phoneNumber: '9825849434',
          fullName: 'Guest Explorer',
          role: 'Customer',
          isPhoneVerified: true,
          rewardPoints: 100,
          createdAt: new Date().toISOString(),
        }
      );
      showSuccess('Welcome to Mojjo! ⚡', 'Browsing Kathmandu catalog');
    } catch (err) {
      showError('Error', 'Could not open catalog');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenWrapper scrollable contentContainerStyle={styles.container}>
      <View style={styles.contentWrapper}>
        {/* 1. Luxury Circular Mojjo Brand Badge */}
        <View style={styles.badgeWrapper}>
          <View
            style={[
              styles.logoCircle,
              {
                backgroundColor: theme.colors.primary,
                borderColor: theme.colors.secondary,
              },
            ]}
          >
            <Text weight="900" size={32} color="#FFFFFF" style={styles.brandText}>
              Mojjo
            </Text>
            <View style={styles.deliveryBadge}>
              <Text weight="800" size={10} color="#0B1F2A">
                in 45 mins
              </Text>
            </View>
          </View>
        </View>

        {/* 2. Headline & Subtitle */}
        <View style={styles.header}>
          <Heading level={2} align="center" style={styles.title}>
            Login or Sign Up
          </Heading>
          <Caption align="center" color={theme.colors.muted} style={styles.subtitle}>
            Enter your mobile number to get started
          </Caption>
        </View>

        {/* 3. Mobile Number Input Card */}
        <View style={styles.formContainer}>
          <Text weight="700" size={12} color={theme.colors.muted} style={styles.inputLabel}>
            Mobile Number
          </Text>

          <View
            style={[
              styles.inputBox,
              {
                backgroundColor: theme.colors.surfaceRaised,
                borderColor: error ? theme.colors.error : theme.colors.border,
              },
            ]}
          >
            <View style={styles.countryCodePill}>
              <Text size={14}>🇳🇵</Text>
              <Text weight="700" size={14} color={theme.colors.foreground} style={styles.prefixText}>
                +977
              </Text>
            </View>

            <View style={[styles.inputDivider, { backgroundColor: theme.colors.border }]} />

            <TextInput
              style={[
                styles.textInput,
                { color: theme.colors.foreground },
              ]}
              placeholder="98XXXXXXXX"
              placeholderTextColor={theme.colors.subtle}
              keyboardType="phone-pad"
              maxLength={10}
              value={phoneNumber}
              onChangeText={(text) => {
                setPhoneNumber(text);
                if (error) setError(undefined);
              }}
              returnKeyType="done"
              onSubmitEditing={handleSendOtp}
              autoFocus
            />

            {phoneNumber.length > 0 && (
              <TouchableOpacity
                onPress={() => setPhoneNumber('')}
                style={styles.clearBtn}
              >
                <Ionicons name="close-circle" size={18} color={theme.colors.subtle} />
              </TouchableOpacity>
            )}
          </View>

          {error && (
            <Caption color={theme.colors.error} style={styles.errorText}>
              {error}
            </Caption>
          )}

          {/* 4. Continue Button */}
          <Button
            title="Continue"
            onPress={handleSendOtp}
            loading={loading}
            fullWidth
            size="lg"
            variant="secondary"
            style={styles.continueBtn}
          />

          {/* 5. Check the App / Guest Mode Button */}
          <TouchableOpacity
            onPress={handleGuestExplore}
            activeOpacity={0.7}
            style={styles.checkAppBtn}
          >
            <Text weight="700" size={14} color={theme.colors.secondary}>
              Check the App ➔
            </Text>
          </TouchableOpacity>
        </View>

        {/* 6. Footer Trust Badges */}
        <View style={styles.footer}>
          <View style={styles.trustRow}>
            <Ionicons name="shield-checkmark" size={14} color={theme.colors.secondary} />
            <Caption color={theme.colors.muted} size={11}>
              100% Safe & Secure • Kathmandu Licensed Stores
            </Caption>
          </View>
          <Caption align="center" color={theme.colors.subtle} size={10} style={styles.termsText}>
            By continuing, you agree to Mojjo's Terms of Service & Privacy Policy.
          </Caption>
        </View>
      </View>
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 24,
  },
  contentWrapper: {
    maxWidth: 420,
    width: '100%',
    alignSelf: 'center',
    alignItems: 'center',
  },
  badgeWrapper: {
    marginBottom: 20,
    alignItems: 'center',
  },
  logoCircle: {
    width: 110,
    height: 110,
    borderRadius: 55,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2.5,
    shadowColor: '#0F766E',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 8,
    position: 'relative',
  },
  brandText: {
    letterSpacing: -0.5,
    marginTop: -4,
  },
  deliveryBadge: {
    position: 'absolute',
    bottom: -6,
    backgroundColor: '#F59E0B',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FFFFFF',
  },
  header: {
    marginBottom: 28,
    alignItems: 'center',
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 13,
  },
  formContainer: {
    width: '100%',
  },
  inputLabel: {
    marginBottom: 6,
    letterSpacing: 0.3,
  },
  inputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 52,
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 12,
    marginBottom: 4,
  },
  countryCodePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingRight: 6,
  },
  prefixText: {
    fontSize: 14,
  },
  inputDivider: {
    width: 1,
    height: 22,
    marginHorizontal: 8,
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    height: '100%',
    padding: 0,
    borderWidth: 0,
    backgroundColor: 'transparent',
    ...(Platform.OS === 'web'
      ? ({
          outlineStyle: 'none',
          outlineWidth: 0,
          boxShadow: 'none',
        } as any)
      : {}),
  },
  clearBtn: {
    padding: 4,
  },
  errorText: {
    marginTop: 4,
    marginBottom: 8,
    marginLeft: 2,
  },
  continueBtn: {
    marginTop: 14,
    borderRadius: 14,
    height: 50,
  },
  checkAppBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    marginTop: 4,
  },
  footer: {
    marginTop: 32,
    alignItems: 'center',
    gap: 6,
  },
  trustRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  termsText: {
    paddingHorizontal: 16,
    lineHeight: 14,
  },
});
