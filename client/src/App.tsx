import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import ScanDashboard from "./pages/ScanDashboard";
import PainPoints from "./pages/PainPoints";
import Solutions from "./pages/Solutions";
import Marketplace from "./pages/Marketplace";
import ProductDetail from "./pages/ProductDetail";
import Analytics from "./pages/Analytics";
import AdminPanel from "./pages/AdminPanel";
import Download from "./pages/Download";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/scan" component={ScanDashboard} />
      <Route path="/pain-points" component={PainPoints} />
      <Route path="/solutions" component={Solutions} />
      <Route path="/marketplace" component={Marketplace} />
      <Route path="/marketplace/:id" component={ProductDetail} />
      <Route path="/analytics" component={Analytics} />
      <Route path="/admin" component={AdminPanel} />
      <Route path="/download/:token" component={Download} />
      <Route path="/404" component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="dark">
        <TooltipProvider>
          <Toaster theme="dark" />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
