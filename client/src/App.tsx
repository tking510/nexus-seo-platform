import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import KeywordIntelligence from "./pages/KeywordIntelligence";
import DomainExplorer from "./pages/DomainExplorer";
import RankTracking from "./pages/RankTracking";

function Router() {
  return (
    <Switch>
      <Route path={"/"} component={Home} />
      <Route path={"/keywords"} component={KeywordIntelligence} />
      <Route path={"/domains"} component={DomainExplorer} />
      <Route path={"/rank-tracking"} component={RankTracking} />
      <Route path={"/404"} component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="dark">
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
