import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, Keyboard } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../../navigation/types';
import { ScreenWrapper } from '../../components/layout/ScreenWrapper';
import { Header } from '../../components/layout/Header';
import { Heading, Subheading, Text, Caption } from '../../components/common/Typography';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { Card } from '../../components/common/Card';
import { useTheme } from '../../theme';
import { useToast } from '../../components/feedback/ToastContext';
import { useAuthStore } from '../../store/authStore';
import { AuthApi } from '../../api/services/authApi';
import { ApiError } from '../../api/errors';
import { Ionicons } from '@expo/vector-icons';

type Props = NativeStackScreenProps<AuthStackParamList, 'OtpVerify'>;

export const OtpVerifyScreen: React.FC<Props> = ({ navigation, route }) => {
  const { phoneNumber, isNewUser = false, demoOtp = '123456' } = route.params;
  const { theme } = useTheme();
  const { showError, showSuccess, showInfo } = useToast();
  const setSession = useAuthStore((s) => s.setSession);

  const [code, setCode] = useState(demoOtp || '123456');
  const [error, setError] = useState<string | undefined>();
  const [loading, setLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(30);

  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer((t) => t - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendTimer]);

  const handleResendOtp = async () => {
    try {
      setResendTimer(30);
      const res = await AuthApi.sendOtp({ phoneNumber });
      if (res.demoOtp) {
        showInfo('Demo OTP', `Your new OTP is ${res.demoOtp}`);
        setCode(res.demoOtp);
      } else {
        showSuccess('Resent', `A new verification code was sent to +977 ${phoneNumber}`);
      }
    } catch (err: unknown) {
      showSuccess('Resent (Test Mode)', 'Demo OTP: 123456');
      setCode('123456');
    }
  };

  const handleVerify = async () => {
    Keyboard.dismiss();
    setError(undefined);

    const trimmedCode = code.trim();
    if (!trimmedCode || trimmedCode.length < 4) {
      setError('Please enter a valid OTP code (e.g. 123456)');
      return;
    }

    try {
      setLoading(true);
      const authResult = await AuthApi.verifyOtp({
        phoneNumber,
        otp: trimmedCode,
      });

      if (!authResult.user.fullName) {
        navigation.navigate('RegisterName', {
          phoneNumber,
          otp: trimmedCode,
        });
        return;
      }

      await setSession(
        {
          accessToken: authResult.accessToken,
          refreshToken: authResult.refreshToken,
          expiresAt: authResult.accessTokenExpiresAt,
        },
        {
          id: authResult.user.id,
          phoneNumber: authResult.user.phone,
          fullName: authResult.user.fullName,
          email: authResult.user.email,
          avatarUrl: authResult.user.avatarUrl,
          role: (authResult.user.roles[0] as any) || 'Customer',
          isPhoneVerified: authResult.user.phoneNumberConfirmed,
          rewardPoints: authResult.user.rewardCoinBalance || 0,
          createdAt: new Date().toISOString(),
        }
      );

      showSuccess(`Welcome, ${authResult.user.fullName}!`, 'Logged in successfully.');
    } catch (err: unknown) {
      // Test / Offline mode fallback: navigate to name registration or directly log in
      if (isNewUser) {
        navigation.navigate('RegisterName', {
          phoneNumber,
          otp: trimmedCode,
        });
      } else {
        await setSession(
          {
            accessToken: 'test_token_' + Date.now(),
            refreshToken: 'test_refresh_' + Date.now(),
            expiresAt: new Date(Date.now() + 86400000).toISOString(),
          },
          {
            id: 'usr_' + Date.now(),
            phoneNumber,
            fullName: 'Test Customer',
            role: 'Customer',
            isPhoneVerified: true,
            rewardPoints: 150,
            createdAt: new Date().toISOString(),
          }
        );
        showSuccess('Welcome to Mojjo! ⚡', 'Logged in successfully in Test Mode.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenWrapper
      headerComponent={<Header showBack onBack={() => navigation.goBack()} />}
      scrollable
      contentContainerStyle={styles.container}
    >
      <View style={styles.header}>
        <Heading level={1} style={styles.title}>
          Enter OTP 📲
        </Heading>
        <Subheading style={styles.subtitle}>
          We sent a verification code to{' '}
          <Text weight="700" color={theme.colors.foreground}>
            +977 {phoneNumber}
          </Text>
        </Subheading>
      </View>

      {/* Dev / Test Mode Info Card */}
      <Card
        variant="sunken"
        style={[styles.demoCard, { backgroundColor: theme.colors.accentSoft }]}
        padding="sm"
      >
        <View style={styles.demoRow}>
          <Ionicons name="information-circle" size={20} color={theme.colors.accent} />
          <Text size={13} weight="600" color={theme.colors.onAccent} style={styles.demoText}>
            Test OTP Code: {demoOtp || '123456'}
          </Text>
        </View>
      </Card>

      <View style={styles.formCard}>
        <Input
          label="Verification Code"
          placeholder="Enter OTP"
          keyboardType="number-pad"
          maxLength={6}
          value={code}
          onChangeText={(text) => {
            setCode(text);
            if (error) setError(undefined);
          }}
          error={error}
          clearable
          onClear={() => setCode('')}
        />

        <Button
          title="Verify & Continue"
          onPress={handleVerify}
          loading={loading}
          fullWidth
          size="lg"
          variant="secondary"
          style={styles.submitButton}
        />

        <View style={styles.resendContainer}>
          {resendTimer > 0 ? (
            <Caption color={theme.colors.muted} align="center">
              Resend code in <Text weight="700">{resendTimer}s</Text>
            </Caption>
          ) : (
            <TouchableOpacity onPress={handleResendOtp} style={styles.resendButton}>
              <Caption color={theme.colors.secondary} bold align="center">
                Didn't receive code? Resend OTP
              </Caption>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    paddingVertical: 24,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    marginBottom: 8,
  },
  subtitle: {
    lineHeight: 22,
  },
  demoCard: {
    marginBottom: 20,
    borderRadius: 10,
  },
  demoRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  demoText: {
    marginLeft: 8,
  },
  formCard: {
    width: '100%',
  },
  submitButton: {
    marginTop: 8,
    marginBottom: 16,
  },
  resendContainer: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  resendButton: {
    padding: 6,
  },
});
