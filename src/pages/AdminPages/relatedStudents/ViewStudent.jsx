import PageBreadcrumb from "../../../components/common/PageBreadCrumb";
import PageMeta from "../../../components/common/PageMeta";
import UserMetaCard from "../../../components/StudentProfile/UserMetaCard";
import UserInfoCard from "../../../components/StudentProfile/UserInfoCard";
import UserAddressCard from "../../../components/StudentProfile/UserAddressCard";
import { ChevronLeftIcon } from "../../../icons";
import { Link } from "react-router";
import { useParams } from "react-router";

export default function ViewStudent() {
  const { id } = useParams();
  return (
    <div>
      <PageMeta
        title="React.js Blank Dashboard | TailAdmin - Next.js Admin Dashboard Template"
        description="This is React.js Blank Dashboard page for TailAdmin - React.js Tailwind CSS Admin Dashboard Template"
      />
      <PageBreadcrumb pageTitle="Student" />

      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] lg:p-6">
        <Link
          className="inline-flex items-center text-sm text-gray-500 transition-colors hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 mb-5"
          onClick={() => window.history.back()}
        >
          <ChevronLeftIcon className="size-5" />
          Back
        </Link>
        <h3 className="mb-5 text-lg font-semibold text-gray-800 dark:text-white/90 lg:mb-7">
          Profile
        </h3>

        <div className="space-y-6">
          <UserMetaCard id={id} />
          <UserInfoCard id={id} />
          <UserAddressCard id={id} />
        </div>
      </div>
    </div>
  );
}
