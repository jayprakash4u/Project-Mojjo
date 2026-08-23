import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Modal,
  TextInput,
  Alert,
  Linking,
  Platform,
} from 'react-native';
import { ScreenWrapper } from '../../components/layout/ScreenWrapper';
import { Header } from '../../components/layout/Header';
import { Heading, Text, Caption } from '../../components/common/Typography';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { useTheme } from '../../theme';
import { useAuthStore } from '../../store/authStore';
import { Ionicons } from '@expo/vector-icons';
import { useToast } from '../../components/feedback/ToastContext';
import { useNavigation } from '@react-navigation/native';
import { HapticsService } from '../../services/haptics';
import { useWishlistStore } from '../../store/wishlistStore';

interface MenuItemProps {
  icon: keyof typeof Ionicons.glyphMap;
  iconColor?: string;
  iconBgColor?: string;
  title: string;
  subtitle?: string;
  badge?: string;
  badgeVariant?: 'primary' | 'secondary' | 'accent' | 'success' | 'error';
  onPress: () => void;
  isLast?: boolean;
}

const MenuItem: React.FC<MenuItemProps> = ({
  icon,
  iconColor,
  iconBgColor,
  title,
  subtitle,
  badge,
  badgeVariant = 'secondary',
  onPress,
  isLast = false,
}) => {
  const { theme } = useTheme();

  return (
    <>
      <TouchableOpacity
        style={styles.menuItemRow}
        onPress={() => {
          HapticsService.selection();
          onPress();
        }}
        activeOpacity={0.7}
      >
        <View
          style={[
            styles.menuIconBox,
            {
              backgroundColor: iconBgColor || theme.colors.surfaceSunken,
            },
          ]}
        >
          <Ionicons
            name={icon}
            size={20}
            color={iconColor || theme.colors.secondary}
          />
        </View>

        <View style={styles.menuTextContainer}>
          <Text weight="700" size={14} color={theme.colors.foreground}>
            {title}
          </Text>
          {subtitle ? (
            <Caption size={11} color={theme.colors.muted}>
              {subtitle}
            </Caption>
          ) : null}
        </View>

        <View style={styles.menuRightContainer}>
          {badge ? (
            <Badge
              label={badge}
              variant={badgeVariant}
              size="sm"
              style={styles.menuBadge}
            />
          ) : null}
          <Ionicons
            name="chevron-forward"
            size={18}
            color={theme.colors.subtle}
          />
        </View>
      </TouchableOpacity>
      {!isLast && (
        <View
          style={[
            styles.menuDivider,
            { backgroundColor: theme.colors.border },
          ]}
        />
      )}
    </>
  );
};

export const ProfileScreen: React.FC = () => {
  const { theme, mode, setMode } = useTheme();
  const navigation = useNavigation<any>();
  const { showSuccess, showInfo } = useToast();
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const wishlistCount = useWishlistStore((s) => s.items.length);

  // Modal States
  const [suggestModalVisible, setSuggestModalVisible] = useState(false);
  const [suggestInput, setSuggestInput] = useState('');
  const [suggestBrand, setSuggestBrand] = useState('');

  const [supportModalVisible, setSupportModalVisible] = useState(false);
  const [linkDeviceModalVisible, setLinkDeviceModalVisible] = useState(false);
  const [paymentOptionsVisible, setPaymentOptionsVisible] = useState(false);

  const handleToggleTheme = () => {
    HapticsService.selection();
    const nextMode = mode === 'dark' ? 'light' : 'dark';
    setMode(nextMode);
    showSuccess('Appearance Updated', `Switched to ${nextMode} mode`);
  };

  const handleLogout = async () => {
    HapticsService.medium();
    if (Platform.OS === 'web') {
      const confirmed = typeof window !== 'undefined' ? window.confirm('Are you sure you want to log out of your Mojjo account?') : true;
      if (confirmed) {
        await logout();
        showSuccess('Logged Out', 'See you again soon!');
      }
      return;
    }

    Alert.alert(
      'Log Out',
      'Are you sure you want to log out of your Mojjo account?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Log Out',
          style: 'destructive',
          onPress: async () => {
            await logout();
            showSuccess('Logged Out', 'See you again soon!');
          },
        },
      ]
    );
  };

  const handleSubmitSuggestion = () => {
    if (!suggestInput.trim()) {
      Alert.alert('Please enter a product name');
      return;
    }
    setSuggestModalVisible(false);
    setSuggestInput('');
    setSuggestBrand('');
    showSuccess(
      'Suggestion Received! 🚀',
      'Our Kathmandu catalog team will review and source this product.'
    );
  };

  const handleCallSupport = () => {
    Linking.openURL('tel:+9779800000000').catch(() => {
      showInfo('Helpline', 'Call us at +977-9800000000');
    });
  };

  const handleWhatsAppSupport = () => {
    Linking.openURL('https://wa.me/9779800000000?text=Hello%20Mojjo%20Support').catch(() => {
      showInfo('WhatsApp', 'Chat with us at +977-9800000000');
    });
  };

  const userName = user?.fullName || 'Hari Mohan';
  const userPhone = user?.phoneNumber || '9825849434';

  return (
    <ScreenWrapper
      headerComponent={
        <Header
          title="Account & Settings"
          subtitle="Manage your profile, orders & preferences"
        />
      }
      scrollable
      contentContainerStyle={styles.container}
    >
      {/* 1. Header Profile Banner Card */}
      <Card
        style={[
          styles.profileBannerCard,
          {
            backgroundColor: theme.colors.surfaceRaised,
            borderColor: theme.colors.border,
          },
        ]}
        padding="md"
      >
        <View style={styles.profileRow}>
          <View
            style={[
              styles.avatarContainer,
              { backgroundColor: theme.colors.primary },
            ]}
          >
            <Ionicons name="person" size={28} color={theme.colors.onPrimary} />
            <View
              style={[
                styles.verifiedBadge,
                { backgroundColor: theme.colors.success },
              ]}
            >
              <Ionicons name="checkmark" size={10} color="#FFFFFF" />
            </View>
          </View>

          <View style={styles.profileDetails}>
            <Heading level={3} numberOfLines={1}>
              {userName}
            </Heading>
            <Caption color={theme.colors.muted} style={styles.phoneText}>
              +977 {userPhone}
            </Caption>
            <View style={styles.tagRow}>
              <Badge label="⚡ Mojjo VIP" variant="accent" size="sm" />
              <Badge label="Kathmandu Club" variant="secondary" size="sm" />
            </View>
          </View>
        </View>

        {/* Mojjo Coin Loyalty Banner */}
        <View
          style={[
            styles.coinBanner,
            {
              backgroundColor: theme.colors.surfaceSunken,
              borderColor: theme.colors.border,
            },
          ]}
        >
          <View style={styles.coinLeft}>
            <Text weight="800" size={13} color="#C08B32">
              🪙 120 Mojjo Coins
            </Text>
            <Caption size={11} color={theme.colors.muted}>
              Worth रू 120 instant savings on next order
            </Caption>
          </View>
          <TouchableOpacity
            style={[
              styles.coinHistoryBtn,
              { backgroundColor: theme.colors.surfaceRaised },
            ]}
            onPress={() =>
              showInfo('Rewards Club', 'Earn 1 coin for every रू 100 spent!')
            }
          >
            <Text size={11} weight="700" color={theme.colors.secondary}>
              History ➔
            </Text>
          </TouchableOpacity>
        </View>
      </Card>

      {/* 2. SECTION: My Activity */}
      <Text
        weight="800"
        size={11}
        color={theme.colors.subtle}
        style={styles.sectionHeader}
      >
        MY ACTIVITY
      </Text>
      <Card style={styles.menuCard} padding="none">
        <MenuItem
          icon="bag-handle-outline"
          iconColor={theme.colors.secondary}
          iconBgColor={theme.colors.secondarySoft}
          title="Orders"
          subtitle="Past deliveries & live order tracking"
          badge="Live Tracker"
          badgeVariant="accent"
          onPress={() =>
            navigation.navigate('MainTabs', { screen: 'OrdersTab' })
          }
        />
        <MenuItem
          icon="heart-outline"
          iconColor="#B93B3B"
          iconBgColor="#FBE9E9"
          title="Wishlist"
          subtitle="Saved bottles, snacks & favorites"
          badge={wishlistCount > 0 ? `${wishlistCount} Saved` : undefined}
          badgeVariant="secondary"
          onPress={() => navigation.navigate('Wishlist')}
        />
        <MenuItem
          icon="bulb-outline"
          iconColor="#D97706"
          iconBgColor="#FEF3C7"
          title="Suggest Products"
          subtitle="Can't find a brand? Ask us to stock it"
          onPress={() => setSuggestModalVisible(true)}
          isLast
        />
      </Card>

      {/* 3. SECTION: Manage & Details */}
      <Text
        weight="800"
        size={11}
        color={theme.colors.subtle}
        style={styles.sectionHeader}
      >
        MANAGE & DETAILS
      </Text>
      <Card style={styles.menuCard} padding="none">
        <MenuItem
          icon="location-outline"
          iconColor="#0F766E"
          iconBgColor="#E6F2F0"
          title="Address"
          subtitle="Saved home, office & party delivery spots"
          badge="45m ETA"
          badgeVariant="secondary"
          onPress={() => navigation.navigate('SavedAddresses')}
        />
        <MenuItem
          icon="person-outline"
          iconColor="#7C3AED"
          iconBgColor="#EDE9FE"
          title="Profile"
          subtitle="Edit name, phone number & email"
          onPress={() =>
            showInfo(
              'Profile',
              `Logged in as ${userName} (${userPhone})`
            )
          }
        />
        <MenuItem
          icon="card-outline"
          iconColor="#059669"
          iconBgColor="#D1FAE5"
          title="Payment Options"
          subtitle="eSewa, Khalti & Cash on Delivery"
          onPress={() => setPaymentOptionsVisible(true)}
          isLast
        />
      </Card>

      {/* 4. SECTION: Preferences & Support */}
      <Text
        weight="800"
        size={11}
        color={theme.colors.subtle}
        style={styles.sectionHeader}
      >
        PREFERENCES & SUPPORT
      </Text>
      <Card style={styles.menuCard} padding="none">
        <MenuItem
          icon="chatbubbles-outline"
          iconColor="#2563EB"
          iconBgColor="#DBEAFE"
          title="Customer Support & FAQ"
          subtitle="24/7 Kathmandu Valley delivery assistance"
          onPress={() => setSupportModalVisible(true)}
        />
        <MenuItem
          icon="notifications-outline"
          iconColor="#EA580C"
          iconBgColor="#FFEDD5"
          title="Notifications"
          subtitle="Order status, OTPs & midnight deals"
          badge="Active"
          badgeVariant="success"
          onPress={() =>
            showInfo('Notifications Enabled', 'Instant delivery alerts are on.')
          }
        />
        <MenuItem
          icon="color-palette-outline"
          iconColor="#4B5563"
          iconBgColor="#F3F4F6"
          title="Settings"
          subtitle={`Appearance: ${mode === 'dark' ? 'Dark Theme' : 'Light Theme'}`}
          onPress={handleToggleTheme}
        />
        <MenuItem
          icon="link-outline"
          iconColor="#6B7280"
          iconBgColor="#F3F4F6"
          title="Link Device"
          subtitle="Scan QR to sign in on web / desktop"
          onPress={() => setLinkDeviceModalVisible(true)}
          isLast
        />
      </Card>

      {/* 5. Logout Action */}
      <View style={styles.logoutWrapper}>
        <Button
          title="Log Out"
          variant="outline"
          size="md"
          fullWidth
          onPress={handleLogout}
          style={styles.logoutButton}
        />
        <Caption
          align="center"
          color={theme.colors.subtle}
          style={styles.versionText}
        >
          App Version 2.1.2090 • Mojjo Quick Commerce Kathmandu
        </Caption>
      </View>

      {/* ============================================================ */}
      {/* MODAL 1: SUGGEST PRODUCTS */}
      {/* ============================================================ */}
      <Modal
        visible={suggestModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setSuggestModalVisible(false)}
      >
        <View style={styles.modalBackdrop}>
          <View
            style={[
              styles.modalSheet,
              {
                backgroundColor: theme.colors.surfaceRaised,
                borderColor: theme.colors.border,
              },
            ]}
          >
            <View style={styles.modalHeader}>
              <View>
                <Heading level={3}>Suggest Products</Heading>
                <Caption color={theme.colors.muted}>
                  Tell us what drinks, snacks or essentials you want!
                </Caption>
              </View>
              <TouchableOpacity
                onPress={() => setSuggestModalVisible(false)}
                style={styles.modalCloseBtn}
              >
                <Ionicons name="close" size={22} color={theme.colors.muted} />
              </TouchableOpacity>
            </View>

            <View style={styles.inputGroup}>
              <Text weight="700" size={12} color={theme.colors.subtle}>
                PRODUCT NAME *
              </Text>
              <TextInput
                style={[
                  styles.textInput,
                  {
                    backgroundColor: theme.colors.surfaceSunken,
                    borderColor: theme.colors.border,
                    color: theme.colors.foreground,
                  },
                ]}
                placeholder="e.g. Blue Ribbon Gin, Doritos Cool Ranch"
                placeholderTextColor={theme.colors.subtle}
                value={suggestInput}
                onChangeText={setSuggestInput}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text weight="700" size={12} color={theme.colors.subtle}>
                BRAND / VOLUME (OPTIONAL)
              </Text>
              <TextInput
                style={[
                  styles.textInput,
                  {
                    backgroundColor: theme.colors.surfaceSunken,
                    borderColor: theme.colors.border,
                    color: theme.colors.foreground,
                  },
                ]}
                placeholder="e.g. 750ml, Pack of 6"
                placeholderTextColor={theme.colors.subtle}
                value={suggestBrand}
                onChangeText={setSuggestBrand}
              />
            </View>

            <Button
              title="Submit Request"
              variant="secondary"
              size="md"
              fullWidth
              onPress={handleSubmitSuggestion}
              style={styles.modalSubmitBtn}
            />
          </View>
        </View>
      </Modal>

      {/* ============================================================ */}
      {/* MODAL 2: CUSTOMER SUPPORT & FAQ */}
      {/* ============================================================ */}
      <Modal
        visible={supportModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setSupportModalVisible(false)}
      >
        <View style={styles.modalBackdrop}>
          <View
            style={[
              styles.modalSheet,
              {
                backgroundColor: theme.colors.surfaceRaised,
                borderColor: theme.colors.border,
              },
            ]}
          >
            <View style={styles.modalHeader}>
              <View>
                <Heading level={3}>Customer Support & FAQ</Heading>
                <Caption color={theme.colors.muted}>
                  We are online 24/7 across Kathmandu & Lalitpur
                </Caption>
              </View>
              <TouchableOpacity
                onPress={() => setSupportModalVisible(false)}
                style={styles.modalCloseBtn}
              >
                <Ionicons name="close" size={22} color={theme.colors.muted} />
              </TouchableOpacity>
            </View>

            <View style={styles.supportOptions}>
              <TouchableOpacity
                style={[
                  styles.supportBtn,
                  { backgroundColor: '#25D366' },
                ]}
                onPress={handleWhatsAppSupport}
              >
                <Ionicons name="logo-whatsapp" size={20} color="#FFFFFF" />
                <Text weight="700" color="#FFFFFF" style={styles.supportBtnText}>
                  Chat on WhatsApp
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.supportBtn,
                  { backgroundColor: theme.colors.secondary },
                ]}
                onPress={handleCallSupport}
              >
                <Ionicons name="call" size={20} color="#FFFFFF" />
                <Text weight="700" color="#FFFFFF" style={styles.supportBtnText}>
                  Direct Phone Call (+977 9800000000)
                </Text>
              </TouchableOpacity>
            </View>

            <View
              style={[
                styles.faqBox,
                {
                  backgroundColor: theme.colors.surfaceSunken,
                  borderColor: theme.colors.border,
                },
              ]}
            >
              <Text weight="700" size={13}>
                ⚡ How fast is 45-Minute Delivery?
              </Text>
              <Caption color={theme.colors.muted} style={styles.faqAnswer}>
                Orders placed from Jhamsikhel, Baneshwor, Baluwatar, or Patan are
                dispatched immediately via dedicated thermal riders.
              </Caption>

              <Text weight="700" size={13} style={styles.faqQ2}>
                💳 Which payments are accepted?
              </Text>
              <Caption color={theme.colors.muted} style={styles.faqAnswer}>
                We accept eSewa, Khalti, Cash on Delivery, and all major cards.
              </Caption>
            </View>
          </View>
        </View>
      </Modal>

      {/* ============================================================ */}
      {/* MODAL 3: PAYMENT OPTIONS */}
      {/* ============================================================ */}
      <Modal
        visible={paymentOptionsVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setPaymentOptionsVisible(false)}
      >
        <View style={styles.modalBackdrop}>
          <View
            style={[
              styles.modalSheet,
              {
                backgroundColor: theme.colors.surfaceRaised,
                borderColor: theme.colors.border,
              },
            ]}
          >
            <View style={styles.modalHeader}>
              <View>
                <Heading level={3}>Payment Options</Heading>
                <Caption color={theme.colors.muted}>
                  Active digital wallets & doorstep settlement
                </Caption>
              </View>
              <TouchableOpacity
                onPress={() => setPaymentOptionsVisible(false)}
                style={styles.modalCloseBtn}
              >
                <Ionicons name="close" size={22} color={theme.colors.muted} />
              </TouchableOpacity>
            </View>

            <View style={styles.paymentList}>
              <View
                style={[
                  styles.paymentItem,
                  {
                    backgroundColor: theme.colors.surfaceSunken,
                    borderColor: theme.colors.border,
                  },
                ]}
              >
                <Ionicons name="wallet-outline" size={22} color="#60BB46" />
                <View style={styles.paymentDetails}>
                  <Text weight="700" size={14}>
                    eSewa Digital Wallet
                  </Text>
                  <Caption color={theme.colors.muted}>
                    Instant QR scan & 1-tap checkout
                  </Caption>
                </View>
                <Badge label="Connected" variant="success" size="sm" />
              </View>

              <View
                style={[
                  styles.paymentItem,
                  {
                    backgroundColor: theme.colors.surfaceSunken,
                    borderColor: theme.colors.border,
                  },
                ]}
              >
                <Ionicons name="wallet-outline" size={22} color="#5C2D91" />
                <View style={styles.paymentDetails}>
                  <Text weight="700" size={14}>
                    Khalti Wallet & Banking
                  </Text>
                  <Caption color={theme.colors.muted}>
                    Connect mobile banking & Khalti ID
                  </Caption>
                </View>
                <Badge label="Active" variant="secondary" size="sm" />
              </View>

              <View
                style={[
                  styles.paymentItem,
                  {
                    backgroundColor: theme.colors.surfaceSunken,
                    borderColor: theme.colors.border,
                  },
                ]}
              >
                <Ionicons
                  name="cash-outline"
                  size={22}
                  color={theme.colors.accent}
                />
                <View style={styles.paymentDetails}>
                  <Text weight="700" size={14}>
                    Cash on Delivery (COD)
                  </Text>
                  <Caption color={theme.colors.muted}>
                    Pay cash or Fonepay QR upon handover
                  </Caption>
                </View>
                <Badge label="Default" variant="primary" size="sm" />
              </View>
            </View>

            <Button
              title="Done"
              variant="secondary"
              size="md"
              fullWidth
              onPress={() => setPaymentOptionsVisible(false)}
            />
          </View>
        </View>
      </Modal>

      {/* ============================================================ */}
      {/* MODAL 4: LINK DEVICE */}
      {/* ============================================================ */}
      <Modal
        visible={linkDeviceModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setLinkDeviceModalVisible(false)}
      >
        <View style={styles.modalBackdrop}>
          <View
            style={[
              styles.modalSheet,
              {
                backgroundColor: theme.colors.surfaceRaised,
                borderColor: theme.colors.border,
              },
            ]}
          >
            <View style={styles.modalHeader}>
              <View>
                <Heading level={3}>Link Device</Heading>
                <Caption color={theme.colors.muted}>
                  Sync your basket across website & tablet
                </Caption>
              </View>
              <TouchableOpacity
                onPress={() => setLinkDeviceModalVisible(false)}
                style={styles.modalCloseBtn}
              >
                <Ionicons name="close" size={22} color={theme.colors.muted} />
              </TouchableOpacity>
            </View>

            <View style={styles.qrContainer}>
              <View
                style={[
                  styles.qrPlaceholder,
                  {
                    backgroundColor: '#FFFFFF',
                    borderColor: theme.colors.border,
                  },
                ]}
              >
                <Ionicons name="qr-code" size={140} color={theme.colors.primary} />
              </View>
              <Text weight="700" size={14} style={styles.qrText}>
                Device ID: MOJJO-KTM-{Math.floor(100000 + Math.random() * 900000)}
              </Text>
              <Caption align="center" color={theme.colors.muted}>
                Open Mojjo Web on your computer, click "Link Device" and scan this code.
              </Caption>
            </View>

            <Button
              title="Close"
              variant="secondary"
              size="md"
              fullWidth
              onPress={() => setLinkDeviceModalVisible(false)}
            />
          </View>
        </View>
      </Modal>
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingBottom: 40,
    paddingHorizontal: 12,
  },
  profileBannerCard: {
    borderRadius: 20,
    marginTop: 4,
    marginBottom: 16,
    borderWidth: 1,
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  verifiedBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },
  profileDetails: {
    flex: 1,
    marginLeft: 14,
  },
  phoneText: {
    marginTop: 2,
    marginBottom: 6,
  },
  tagRow: {
    flexDirection: 'row',
    gap: 6,
  },
  coinBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 14,
    padding: 10,
    borderRadius: 12,
    borderWidth: 1,
  },
  coinLeft: {
    flex: 1,
    gap: 1,
  },
  coinHistoryBtn: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  sectionHeader: {
    letterSpacing: 0.6,
    marginBottom: 8,
    marginTop: 12,
    paddingHorizontal: 4,
  },
  menuCard: {
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 4,
  },
  menuItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 13,
    paddingHorizontal: 14,
  },
  menuIconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuTextContainer: {
    flex: 1,
    marginLeft: 12,
  },
  menuRightContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  menuBadge: {
    marginRight: 2,
  },
  menuDivider: {
    height: StyleSheet.hairlineWidth,
    marginLeft: 62,
  },
  logoutWrapper: {
    marginTop: 24,
    marginBottom: 20,
    paddingHorizontal: 4,
  },
  logoutButton: {
    marginBottom: 12,
    borderColor: '#B93B3B',
  },
  versionText: {
    fontSize: 11,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.65)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    borderTopWidth: 1,
    maxHeight: '85%',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  modalCloseBtn: {
    padding: 4,
  },
  inputGroup: {
    marginBottom: 14,
  },
  textInput: {
    height: 48,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 14,
    fontSize: 14,
    marginTop: 6,
  },
  modalSubmitBtn: {
    marginTop: 10,
  },
  supportOptions: {
    gap: 10,
    marginBottom: 16,
  },
  supportBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 48,
    borderRadius: 12,
    gap: 8,
  },
  supportBtnText: {
    fontSize: 14,
  },
  faqBox: {
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    gap: 4,
  },
  faqAnswer: {
    lineHeight: 16,
    marginBottom: 8,
  },
  faqQ2: {
    marginTop: 4,
  },
  paymentList: {
    gap: 10,
    marginBottom: 16,
  },
  paymentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    gap: 12,
  },
  paymentDetails: {
    flex: 1,
  },
  qrContainer: {
    alignItems: 'center',
    paddingVertical: 14,
    gap: 10,
  },
  qrPlaceholder: {
    padding: 16,
    borderRadius: 20,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  qrText: {
    marginTop: 6,
  },
});
