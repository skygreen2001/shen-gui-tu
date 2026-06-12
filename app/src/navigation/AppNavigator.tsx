import React from 'react';
import { Text, StyleSheet } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { colors } from '../styles/theme';

// 导入实际页面组件
import Welcome from '../screens/Welcome';
import Dashboard from '../screens/Dashboard';
import CheckIn from '../screens/CheckIn';
import Crisis from '../screens/Crisis';
import CBTCourse from '../screens/CBTCourse';
import WRAPPlan from '../screens/WRAPPlan';
import MedicationMain from '../screens/Medication/MedicationMain';
import MedKnowledge from '../screens/Medication/MedKnowledge';
import SideEffectTracker from '../screens/Medication/SideEffectTracker';
import ResourcesMain from '../screens/Resources/ResourcesMain';

// ========================
// 类型定义
// ========================

export type RootStackParamList = {
  Welcome: undefined;
  MainTabs: undefined;
  Crisis: undefined;
};

type DashboardStackParamList = {
  Dashboard: undefined;
  CheckIn: undefined;
  WRAPPlan: undefined;
};

type TherapyStackParamList = {
  CBTCourse: undefined;
};

type ResourcesStackParamList = {
  ResourcesMain: undefined;
};

type GrowthStackParamList = {
  MedicationMain: undefined;
  MedKnowledge: undefined;
  SideEffectTracker: undefined;
};

type MainTabParamList = {
  DashboardTab: undefined;
  TherapyTab: undefined;
  ResourcesTab: undefined;
  GrowthTab: undefined;
};

// ========================
// Stack Navigators
// ========================

const DashboardStack = createNativeStackNavigator<DashboardStackParamList>();
const TherapyStack = createNativeStackNavigator<TherapyStackParamList>();
const ResourcesStack = createNativeStackNavigator<ResourcesStackParamList>();
const GrowthStack = createNativeStackNavigator<GrowthStackParamList>();

function DashboardStackNavigator() {
  return (
    <DashboardStack.Navigator screenOptions={{ headerShown: false }}>
      <DashboardStack.Screen name="Dashboard" component={Dashboard} />
      <DashboardStack.Screen
        name="CheckIn"
        component={CheckIn}
        options={{ headerShown: true, title: '每日签到' }}
      />
      <DashboardStack.Screen
        name="WRAPPlan"
        component={WRAPPlan}
        options={{ headerShown: true, title: 'WRAP 计划' }}
      />
    </DashboardStack.Navigator>
  );
}

function TherapyStackNavigator() {
  return (
    <TherapyStack.Navigator screenOptions={{ headerShown: false }}>
      <TherapyStack.Screen name="CBTCourse" component={CBTCourse} />
    </TherapyStack.Navigator>
  );
}

function ResourcesStackNavigator() {
  return (
    <ResourcesStack.Navigator screenOptions={{ headerShown: false }}>
      <ResourcesStack.Screen name="ResourcesMain" component={ResourcesMain} />
    </ResourcesStack.Navigator>
  );
}

function GrowthStackNavigator() {
  return (
    <GrowthStack.Navigator screenOptions={{ headerShown: false }}>
      <GrowthStack.Screen name="MedicationMain" component={MedicationMain} />
      <GrowthStack.Screen
        name="MedKnowledge"
        component={MedKnowledge}
        options={{ headerShown: true, title: '药物知识库' }}
      />
      <GrowthStack.Screen
        name="SideEffectTracker"
        component={SideEffectTracker}
        options={{ headerShown: true, title: '副作用周报' }}
      />
    </GrowthStack.Navigator>
  );
}

// ========================
// Bottom Tab Navigator
// ========================

const MainTab = createBottomTabNavigator<MainTabParamList>();

function MainTabs() {
  return (
    <MainTab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ focused }) => {
          let icon = '';
          switch (route.name) {
            case 'DashboardTab': icon = '🏠'; break;
            case 'TherapyTab': icon = '💊'; break;
            case 'ResourcesTab': icon = '🏥'; break;
            case 'GrowthTab': icon = '🧘'; break;
          }
          return (
            <Text style={[styles.tabIcon, focused ? styles.tabIconFocused : styles.tabIconUnfocused]}>
              {icon}
            </Text>
          );
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textHint,
        tabBarStyle: styles.tabBar,
        tabBarLabelStyle: styles.tabLabel,
      })}
    >
      <MainTab.Screen name="DashboardTab" component={DashboardStackNavigator} options={{ tabBarLabel: '首页' }} />
      <MainTab.Screen name="TherapyTab" component={GrowthStackNavigator} options={{ tabBarLabel: '疗愈' }} />
      <MainTab.Screen name="ResourcesTab" component={ResourcesStackNavigator} options={{ tabBarLabel: '服务' }} />
      <MainTab.Screen name="GrowthTab" component={TherapyStackNavigator} options={{ tabBarLabel: '成长' }} />
    </MainTab.Navigator>
  );
}

// ========================
// Root Stack Navigator
// ========================

const RootStack = createNativeStackNavigator<RootStackParamList>();

export default function AppNavigator() {
  return (
    <RootStack.Navigator
      initialRouteName="Welcome"
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
    >
      <RootStack.Screen name="Welcome" component={Welcome} />
      <RootStack.Screen name="MainTabs" component={MainTabs} />
      <RootStack.Screen
        name="Crisis"
        component={Crisis}
        options={{
          presentation: 'modal',
          headerShown: true,
          title: '危机干预',
          headerTintColor: colors.surface,
          headerStyle: { backgroundColor: colors.danger },
        }}
      />
    </RootStack.Navigator>
  );
}

// ========================
// 样式
// ========================

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: colors.surface,
    borderTopColor: colors.border,
    borderTopWidth: 1,
    height: 56,
    paddingBottom: 4,
    paddingTop: 4,
  },
  tabIcon: {
    fontSize: 22,
  },
  tabIconFocused: {
    opacity: 1,
  },
  tabIconUnfocused: {
    opacity: 0.5,
  },
  tabLabel: {
    fontSize: 11,
    fontFamily: '-apple-system, BlinkMacSystemFont, PingFang SC, Helvetica Neue, Microsoft YaHei, sans-serif',
  },
});
