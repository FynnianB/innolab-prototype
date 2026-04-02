import { createBrowserRouter } from "react-router";
import { Layout } from "./components/layout/Layout";
import { Dashboard } from "./pages/Dashboard";
import { StoryGenerator } from "./pages/StoryGenerator";
import { LegacyGuidelinesRouteRedirect } from "./components/LegacyGuidelinesRouteRedirect";
import { GuidelinesChecker } from "./pages/GuidelinesChecker";
import { LegacyComplianceRouteRedirect } from "./components/LegacyComplianceRouteRedirect";
import { RuleManagement } from "./pages/RuleManagement";
import { Projects } from "./pages/Projects";
import { LegacyStoriesRouteRedirect } from "./components/LegacyStoriesRouteRedirect";
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
      { path: "projects/:projectId/story-generator", Component: StoryGenerator },
      { path: "projects/:projectId/compliance-check", Component: GuidelinesChecker },
      { path: "projects/:projectId/stories", Component: StoryAnalysis },
      { path: "projects/:projectId/customer-journey", Component: CustomerJourney },
      { path: "projects/:projectId/rules", Component: RuleManagement },
      { path: "story-generator", Component: StoryGenerator },
      { path: "compliance-check", Component: GuidelinesChecker },
      { path: "guidelines", Component: LegacyGuidelinesRouteRedirect },
      { path: "compliance", Component: LegacyComplianceRouteRedirect },
      { path: "rules", Component: RuleManagement },
      { path: "projects/:projectId?", Component: Projects },
      { path: "stories", Component: StoryAnalysis },
      {
        path: "story-analysis",
        Component: LegacyStoriesRouteRedirect,
      },
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