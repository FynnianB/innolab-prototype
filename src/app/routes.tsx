import { createBrowserRouter } from "react-router";
import { Layout } from "./components/layout/Layout";
import { Dashboard } from "./pages/Dashboard";
import { StoryGenerator } from "./pages/StoryGenerator";
import { ComplianceChecker } from "./pages/ComplianceChecker";
import { RuleManagement } from "./pages/RuleManagement";
import { Projects } from "./pages/Projects";
import { StoryAnalysis } from "./pages/StoryAnalysis";
import { CustomerJourney } from "./pages/CustomerJourney";
import { StoryDetail } from "./pages/StoryDetail";

const basename = (import.meta.env.BASE_URL ?? "/").replace(/\/$/, "") || undefined;

export const router = createBrowserRouter(
  [
  {
    path: "/",
    Component: Layout,
    children: [
      { index: true, Component: Dashboard },
      { path: "story-generator", Component: StoryGenerator },
      { path: "compliance", Component: ComplianceChecker },
      { path: "rules", Component: RuleManagement },
      { path: "projects/:projectId?", Component: Projects },
      { path: "story-analysis", Component: StoryAnalysis },
      { path: "customer-journey", Component: CustomerJourney },
      { path: "story/:id", Component: StoryDetail },
      { path: "settings", Component: Dashboard },
      { path: "help", Component: Dashboard },
      { path: "*", Component: Dashboard },
    ],
  },
],
  { basename }
);