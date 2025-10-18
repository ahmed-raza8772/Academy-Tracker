import EduMetrics from "../../components/ecommerce/EduMetrics";
import StudentPerformanceChart from "../../components/ecommerce/StudentPerformanceChart";
import StatisticsChart from "../../components/ecommerce/StatisticsChart";
import MonthlyTarget from "../../components/ecommerce/MonthlyTarget";
import RecentActivity from "../../components/ecommerce/RecentActivity";
import DemographicCard from "../../components/ecommerce/DemographicCard";
import PageMeta from "../../components/common/PageMeta";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import Footer from "../../components/footer/Footer";

export default function Home() {
  return (
    <>
      <PageMeta
        title="AE EduTrack | A Comprehensive Application to track your academics"
        description="Admin dashboard for monitoring student performance, attendance, and institutional analytics"
      />
      <PageBreadcrumb pageTitle="Dashboard" />
      <div className="grid grid-cols-12 gap-4 md:gap-6">
        <div className="col-span-12 space-y-6 xl:col-span-7">
          <EduMetrics />
          <StudentPerformanceChart />
        </div>

        <div className="col-span-12 xl:col-span-5">
          <MonthlyTarget />
        </div>

        <div className="col-span-12">
          <StatisticsChart />
        </div>

        <div className="col-span-12 xl:col-span-5">
          <DemographicCard />
        </div>

        <div className="col-span-12 xl:col-span-7">
          <RecentActivity />
        </div>
      </div>
      <Footer />
    </>
  );
}
