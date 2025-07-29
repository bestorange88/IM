import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertCircle, Home } from "lucide-react";
import { useLocation } from "wouter";

export default function NotFound() {
  const [, navigate] = useLocation();

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50">
      <Card className="w-full max-w-md mx-4 border-amber-200">
        <CardContent className="pt-6 text-center">
          <AlertCircle className="h-16 w-16 text-amber-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-amber-900 mb-2">页面未找到</h1>
          <p className="text-amber-600 mb-6">
            抱歉，您访问的页面不存在或已被移动
          </p>
          <Button 
            onClick={() => navigate("/")}
            className="bg-amber-600 hover:bg-amber-700 text-white"
          >
            <Home className="w-4 h-4 mr-2" />
            返回首页
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}