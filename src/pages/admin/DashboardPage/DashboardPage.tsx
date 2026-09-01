import { useState, useEffect, useCallback } from "react";
import DashboardHeader from "./components/DashboardHeader";
import StatCards from "./components/StatCards";
import InterviewTrendChart from "./components/InterviewTrendChart";
import PositionPieChart from "./components/PositionPieChart";
import RevenueBarChart from "./components/RevenueBarChart";
import ActivityLog from "./components/ActivityLog";
import adminDashboardService from "../../../services/admin/adminDashboardService";
import type {
  TimeFilter,
  LevelFilter,
  ActionTypeFilter,
  OverviewData,
  PositionItem,
  PaginatedActivities,
} from "../../../services/admin/adminDashboardService";

const DashboardPage = () => {
  // ── Filters ──
  const [timeFilter, setTimeFilter] = useState<TimeFilter>("MONTH");
  const [levelFilter, setLevelFilter] = useState<LevelFilter>("--");
  const [actionTypeFilter, setActionTypeFilter] = useState<ActionTypeFilter>("--");
  const [activitiesPage, setActivitiesPage] = useState(1);

  // ── Data ──
  const [overviewData, setOverviewData] = useState<OverviewData | null>(null);
  const [positionData, setPositionData] = useState<PositionItem[]>([]);
  const [activitiesData, setActivitiesData] = useState<PaginatedActivities | null>(null);

  // ── Loading states ──
  const [isOverviewLoading, setIsOverviewLoading] = useState(true);
  const [isPositionsLoading, setIsPositionsLoading] = useState(true);
  const [isActivitiesLoading, setIsActivitiesLoading] = useState(true);

  // ── Fetch: Overview ──
  const fetchOverview = useCallback(async (filter: TimeFilter) => {
    setIsOverviewLoading(true);
    try {
      const res = await adminDashboardService.getOverview({ timeFilter: filter });
      setOverviewData(res.data.data);
    } catch (err) {
      console.error("Failed to fetch overview:", err);
    } finally {
      setIsOverviewLoading(false);
    }
  }, []);

  // ── Fetch: Positions ──
  const fetchPositions = useCallback(
    async (filter: TimeFilter, level: LevelFilter) => {
      setIsPositionsLoading(true);
      try {
        const res = await adminDashboardService.getPositions({
          timeFilter: filter,
          level,
        });
        setPositionData(res.data.data);
      } catch (err) {
        console.error("Failed to fetch positions:", err);
      } finally {
        setIsPositionsLoading(false);
      }
    },
    []
  );

  // ── Fetch: Activities ──
  const fetchActivities = useCallback(
    async (type: ActionTypeFilter, page: number) => {
      setIsActivitiesLoading(true);
      try {
        const res = await adminDashboardService.getActivities({
          actionType: type,
          page,
        });
        setActivitiesData(res.data.data);
      } catch (err) {
        console.error("Failed to fetch activities:", err);
      } finally {
        setIsActivitiesLoading(false);
      }
    },
    []
  );

  // ── Initial load ──
  useEffect(() => {
    fetchOverview(timeFilter);
    fetchPositions(timeFilter, levelFilter);
    fetchActivities(actionTypeFilter, activitiesPage);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Time filter change → reload overview + positions ──
  const handleTimeFilterChange = (filter: TimeFilter) => {
    setTimeFilter(filter);
    fetchOverview(filter);
    fetchPositions(filter, levelFilter);
  };

  // ── Level filter change → reload positions only ──
  const handleLevelFilterChange = (level: LevelFilter) => {
    setLevelFilter(level);
    fetchPositions(timeFilter, level);
  };

  // ── Action type filter change → reload activities (reset to page 1) ──
  const handleActionTypeChange = (type: ActionTypeFilter) => {
    setActionTypeFilter(type);
    setActivitiesPage(1);
    fetchActivities(type, 1);
  };

  // ── Activities page change ──
  const handleActivitiesPageChange = (page: number) => {
    setActivitiesPage(page);
    fetchActivities(actionTypeFilter, page);
  };

  // ── Refresh activities only ──
  const handleRefreshActivities = () => {
    fetchActivities(actionTypeFilter, activitiesPage);
  };

  // ── Reload all 3 APIs ──
  const handleReloadAll = () => {
    fetchOverview(timeFilter);
    fetchPositions(timeFilter, levelFilter);
    fetchActivities(actionTypeFilter, activitiesPage);
  };

  const isAnyLoading = isOverviewLoading || isPositionsLoading || isActivitiesLoading;

  return (
    <section className="space-y-6">
      {/* Header with time filter + reload */}
      <DashboardHeader
        timeFilter={timeFilter}
        onTimeFilterChange={handleTimeFilterChange}
        onReloadAll={handleReloadAll}
        isLoading={isAnyLoading}
      />

      {/* 4 Stat Cards */}
      <StatCards data={overviewData} isLoading={isOverviewLoading} />

      {/* Interview Trends Chart (Full width) */}
      <div>
        <InterviewTrendChart
          data={overviewData?.interviewTrends}
          timeFilter={timeFilter}
          isLoading={isOverviewLoading}
        />
      </div>

      {/* Middle Row: Revenue Bar Chart (Left) + Position Pie Chart (Right) */}
      <div className="grid gap-4 lg:grid-cols-5">
        <div className="lg:col-span-3">
          <RevenueBarChart
            data={overviewData?.revenueTrends ?? []}
            timeFilter={timeFilter}
            isLoading={isOverviewLoading}
          />
        </div>
        <div className="lg:col-span-2">
          <PositionPieChart
            data={positionData}
            levelFilter={levelFilter}
            onLevelFilterChange={handleLevelFilterChange}
            isLoading={isPositionsLoading}
          />
        </div>
      </div>

      {/* Bottom Row: Activity Log (Single separate full-width row) */}
      <div>
        <ActivityLog
          data={activitiesData}
          actionTypeFilter={actionTypeFilter}
          onActionTypeChange={handleActionTypeChange}
          onRefresh={handleRefreshActivities}
          onPageChange={handleActivitiesPageChange}
          currentPage={activitiesPage}
          isLoading={isActivitiesLoading}
        />
      </div>
    </section>
  );
};

export default DashboardPage;