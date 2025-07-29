import { Switch, Route } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import {
  Landing, DaoPage, ChatEnhanced, ChatNewPage,
  ActivityPage, ArticlePage, ContactsPage, CallsPage,
  ProfilePage, SettingsPage, WalletPage, AccountSettingsPage,
  PrivacyPage, NotificationsPage, HelpPage, BadgesPage,
  RecordsPage, ConversationPage, ChatHistoryPage, NotFound
} from "@/pages";
import { useAuth, AuthProvider } from "@/hooks/useAuth";

function ProtectedRoute({ component: Component, ...props }: { component: React.FC }) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-amber-200 rounded-full animate-pulse flex items-center justify-center mx-auto mb-4">🏮</div>
          <p className="text-amber-600">正在验证登录状态...</p>
        </div>
      </div>
    );
  }

  return user ? <Component {...props} /> : <Landing />;
}

function Router() {
  const { user, isLoading } = useAuth();

  return (
    <Switch>
      <Route path="/" component={() => (
        isLoading ? (
          <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 flex items-center justify-center">
            <div className="text-center">
              <div className="w-16 h-16 bg-amber-200 rounded-full animate-pulse flex items-center justify-center mx-auto mb-4">🏮</div>
              <p className="text-amber-600">正在验证登录状态...</p>
            </div>
          </div>
        ) : (user ? <DaoPage /> : <Landing />)
      )} />

      {/* 所有受保护路由 */}
      {[
        ["/dao", DaoPage],
        ["/chat-enhanced", ChatEnhanced],
        ["/chat-new", ChatNewPage],
        ["/activity/:type", ActivityPage],
        ["/article/:id", ArticlePage],
        ["/contacts", ContactsPage],
        ["/calls", CallsPage],
        ["/profile", ProfilePage],
        ["/settings", SettingsPage],
        ["/wallet", WalletPage],
        ["/account-settings", AccountSettingsPage],
        ["/privacy", PrivacyPage],
        ["/notifications", NotificationsPage],
        ["/help", HelpPage],
        ["/badges", BadgesPage],
        ["/records", RecordsPage],
        ["/chat-history", ChatHistoryPage],
        ["/chat", ConversationPage],
        ["/conversation", ConversationPage]
      ].map(([path, Component]) => (
        <Route key={path} path={path} component={() => <ProtectedRoute component={Component} />} />
      ))}

      {/* 调试页面 */}
      <Route path="/debug" component={() => {
        return (
          <div className="p-4 bg-white min-h-screen">
            <h1 className="text-2xl font-bold mb-4">登录状态调试</h1>
            <div className="space-y-4">
              <div>
                <h2 className="font-semibold">用户信息:</h2>
                <pre className="bg-gray-100 p-2 rounded text-xs overflow-auto">
                  {JSON.stringify(useAuth().user, null, 2)}
                </pre>
              </div>
              <div>
                <h2 className="font-semibold">Token:</h2>
                <p className="bg-gray-100 p-2 rounded text-xs break-all">
                  {localStorage.getItem("auth-token") || "无Token"}
                </p>
              </div>
              <div>
                <h2 className="font-semibold">当前路径:</h2>
                <p className="bg-gray-100 p-2 rounded">{window.location.pathname}</p>
              </div>
              <button
                onClick={() => window.location.href = "/dao"}
                className="bg-blue-500 text-white px-4 py-2 rounded"
              >
                跳转到道页面
              </button>
            </div>
          </div>
        );
      }} />

      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
