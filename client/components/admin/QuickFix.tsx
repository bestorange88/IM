import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Wrench, Download, RotateCcw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface QuickFixProps {
  onFixComplete: () => void;
}

export default function QuickFix({ onFixComplete }: QuickFixProps) {
  const [isFixing, setIsFixing] = useState(false);
  const [isRestarting, setIsRestarting] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const { toast } = useToast();

  const handleAutoFix = async () => {
    setIsFixing(true);
    try {
      const response = await apiRequest('/api/fix/database', {
        method: 'POST',
      });
      
      if (response.success) {
        toast({
          title: "修复成功",
          description: response.message,
        });
        onFixComplete();
      } else {
        toast({
          title: "修复失败",
          description: response.message,
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "修复失败",
        description: error instanceof Error ? error.message : "未知错误",
        variant: "destructive",
      });
    } finally {
      setIsFixing(false);
    }
  };

  const handleDownloadConfigs = async () => {
    setIsDownloading(true);
    try {
      const response = await apiRequest('/api/fix/download');
      
      if (response.success && response.files) {
        // Create and download files
        Object.entries(response.files).forEach(([filename, content]) => {
          const blob = new Blob([content as string], { type: 'text/plain' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = filename;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
        });
        
        toast({
          title: "下载成功",
          description: "配置文件已生成并开始下载",
        });
      } else {
        toast({
          title: "生成失败",
          description: "无法生成配置文件",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "下载失败",
        description: error instanceof Error ? error.message : "未知错误",
        variant: "destructive",
      });
    } finally {
      setIsDownloading(false);
    }
  };

  const handleRestartContainers = async () => {
    setIsRestarting(true);
    try {
      const response = await apiRequest('/api/fix/restart', {
        method: 'POST',
      });
      
      if (response.success) {
        toast({
          title: "重启成功",
          description: response.message,
        });
        onFixComplete();
      } else {
        toast({
          title: "重启失败",
          description: response.message,
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "重启失败",
        description: error instanceof Error ? error.message : "未知错误",
        variant: "destructive",
      });
    } finally {
      setIsRestarting(false);
    }
  };

  return (
    <Card className="bg-gray-800 border-gray-700">
      <CardHeader>
        <CardTitle className="text-white flex items-center">
          <Wrench className="mr-2 text-green-500" />
          一键修复
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          <Button 
            onClick={handleAutoFix}
            disabled={isFixing}
            className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-3 transition-colors"
          >
            <Wrench className="mr-2 w-4 h-4" />
            {isFixing ? "正在修复..." : "自动修复数据库配置"}
          </Button>
          
          <Button 
            onClick={handleDownloadConfigs}
            disabled={isDownloading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium transition-colors"
          >
            <Download className="mr-2 w-4 h-4" />
            {isDownloading ? "生成中..." : "生成修复后的配置文件"}
          </Button>
          
          <Button 
            onClick={handleRestartContainers}
            disabled={isRestarting}
            className="w-full bg-yellow-600 hover:bg-yellow-700 text-white font-medium transition-colors"
          >
            <RotateCcw className="mr-2 w-4 h-4" />
            {isRestarting ? "重启中..." : "重新启动所有容器"}
          </Button>
        </div>

        <div className="mt-4 p-3 bg-blue-900/20 border border-blue-500/30 rounded-lg">
          <h4 className="font-medium text-blue-400 mb-2">修复步骤预览：</h4>
          <ol className="text-sm text-gray-300 space-y-1">
            <li>1. 停止现有容器</li>
            <li>2. 更新初始化SQL脚本</li>
            <li>3. 重建应用镜像</li>
            <li>4. 启动MySQL服务</li>
            <li>5. 验证数据库连接</li>
            <li>6. 启动应用服务</li>
          </ol>
        </div>
      </CardContent>
    </Card>
  );
}