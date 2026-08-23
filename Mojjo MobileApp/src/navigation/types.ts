import { NavigatorScreenParams } from '@react-navigation/native';
import { Product } from '../types/product';
import { Order } from '../types/order';
import { Address } from '../types/address';

export type AuthStackParamList = {
  PhoneLogin: undefined;
  OtpVerify: {
    phoneNumber: string;
    isNewUser?: boolean;
    demoOtp?: string;
  };
  RegisterName: {
    phoneNumber: string;
    otp: string;
  };
};

export type MainTabParamList = {
  HomeTab: undefined;
  CategoriesTab: { initialCategoryId?: string } | undefined;
  CartTab: undefined;
  OrdersTab: undefined;
  ProfileTab: undefined;
};

export type RootStackParamList = {
  MainTabs: NavigatorScreenParams<MainTabParamList>;
  Auth: NavigatorScreenParams<AuthStackParamList>;
  ProductDetail: { product: Product } | { productId: string };
  CategoryDetail: { categoryId: string; categoryName: string };
  Search: undefined;
  Checkout: undefined;
  OrderTracking: { orderId: string; initialOrder?: Order };
  Rewards: undefined;
  SavedAddresses: undefined;
  AddEditAddress: { addressToEdit?: Address } | undefined;
  Wishlist: undefined;
};

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}
