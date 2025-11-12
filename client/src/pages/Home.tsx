import { useAuth } from "@/_core/hooks/useAuth";
import WuxiaGameV3 from "@/components/WuxiaGameV3";
import { Button } from "@/components/ui/button";
import { getLoginUrl } from "@/const";

export default function Home() {
  const { user, loading, isAuthenticated } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">加载中...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 to-gray-800">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-white mb-4">江湖墨世录</h1>
          <p className="text-gray-300 mb-8">请先登录以开始游戏</p>
          <Button
            onClick={() => window.location.href = getLoginUrl()}
            size="lg"
            className="bg-blue-600 hover:bg-blue-700"
          >
            登录游戏
          </Button>
        </div>
      </div>
    );
  }

  return <WuxiaGameV3 />;
}
