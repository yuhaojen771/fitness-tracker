import { Metadata } from "next";

export const metadata: Metadata = {
  title: "管理後台 - Fitness Tracker",
  description: "管理員後台：管理用戶訂閱和查看用戶列表",
  robots: {
    index: false,
    follow: false
  }
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return children;
}



