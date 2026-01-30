import { memo } from 'react';
import { View, ScrollView, Image, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native';
import { DASHBOARD_STYLE_CONSTANTS } from '../constants/dashboardStyles';
import { commonStyles, colors } from '../../../shared/styles/commonStyles';
import { AIAnalysisCard, TodayEmissionStatus, MonthlyCalendar, CategoryReport, DayDetailCard, TabSelector } from '../components';
import { ErrorBoundary, UnifiedHeader } from '../../../shared/components';
import { useDashboardScreen } from '../hooks/useDashboardScreen';

const DashboardScreen = memo(() => {
  const {
    scrollViewRef,
    refreshing,
    onRefresh,
    activeTab,
    showDetailCard,
    selectedDay,
    aiCardRefreshKey,
    cocoGif,
    handleTabChange,
  } = useDashboardScreen();





  return (
    <ErrorBoundary>
      <SafeAreaView style={commonStyles.safeContainer}>
          <ScrollView
            ref={scrollViewRef}
            style={commonStyles.scrollView}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={commonStyles.scrollContent}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                tintColor={colors.primary}
                colors={[colors.primary]}
              />
            }
          >

        <UnifiedHeader title="대시보드" />

        {/* AI 분석 결과 */}
        <View style={[commonStyles.section, { marginBottom: DASHBOARD_STYLE_CONSTANTS.SECTION_MARGINS.AI_ANALYSIS_BOTTOM }]}>
          <AIAnalysisCard key={aiCardRefreshKey} />
        </View>

        {/* Coco GIF */}
        <View style={[commonStyles.section, {
          paddingVertical: DASHBOARD_STYLE_CONSTANTS.SECTION_PADDING.VERTICAL,
          marginTop: DASHBOARD_STYLE_CONSTANTS.SECTION_MARGINS.COCO_GIF_TOP
        }]}>
          <Image
            source={cocoGif}
            style={{
              width: DASHBOARD_STYLE_CONSTANTS.COCO_GIF.WIDTH,
              height: DASHBOARD_STYLE_CONSTANTS.COCO_GIF.HEIGHT,
              alignSelf: 'center',
            }}
            resizeMode="contain"
          />
        </View>

        {/* 오늘 탄소 배출 현황 */}
        <View style={[commonStyles.section, { marginTop: DASHBOARD_STYLE_CONSTANTS.SECTION_MARGINS.TODAY_EMISSION_TOP }]}>
          <TodayEmissionStatus />
        </View>

        {/* 탭 형태로 합쳐진 분석 섹션 */}
        <View style={commonStyles.section}>
          <View style={commonStyles.card}>
            {/* 탭 헤더 */}
            <TabSelector
              activeTab={activeTab}
              onTabChange={handleTabChange}
              tabs={['일별', '카테고리별']}
            />

            {/* 탭 컨텐츠 */}
            {activeTab === 0 ? (
              <MonthlyCalendar />
            ) : (
              <CategoryReport />
            )}
          </View>
        </View>

        {/* 날짜 상세 카드 */}
        {showDetailCard && selectedDay && (
          <DayDetailCard />
        )}

        </ScrollView>
      </SafeAreaView>
    </ErrorBoundary>
  );
});

DashboardScreen.displayName = 'DashboardScreen';


export default DashboardScreen;