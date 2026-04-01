import { useCallback, useEffect, useMemo, useState } from "react";
import Joyride, { EVENTS, STATUS, type CallBackProps } from "react-joyride";
import { useLocation } from "react-router";
import { useIsLgUp } from "../components/ui/use-mobile";
import { markRouteTourDone, isRouteTourDone } from "./onboardingStorage";
import { OnboardingTooltip } from "./OnboardingTooltip";
import { getOnboardingKey } from "./routeKeys";
import { getStepsForRoute } from "./stepsByRoute";
import { appJoyrideLocale, appJoyrideStyles } from "./joyrideUi";
import { useOnboardingReset } from "./OnboardingResetContext";

export function OnboardingHost() {
  const location = useLocation();
  const isLgUp = useIsLgUp();
  const { revision } = useOnboardingReset();
  const [layoutReady, setLayoutReady] = useState(false);

  useEffect(() => {
    setLayoutReady(true);
  }, []);

  const routeKey = useMemo(
    () => getOnboardingKey(location.pathname),
    [location.pathname],
  );

  const includeMobileMenuStep = layoutReady && !isLgUp;

  const steps = useMemo(() => {
    if (!routeKey) return [];
    return getStepsForRoute(routeKey, { includeMobileMenuStep });
  }, [routeKey, includeMobileMenuStep]);

  const completed = routeKey ? isRouteTourDone(routeKey) : true;
  const [run, setRun] = useState(false);

  useEffect(() => {
    if (!routeKey || steps.length === 0 || completed) {
      setRun(false);
      return;
    }
    setRun(false);
    const t = window.setTimeout(() => setRun(true), 280);
    return () => window.clearTimeout(t);
  }, [routeKey, location.key, revision, completed, steps.length]);

  const handleCallback = useCallback(
    (data: CallBackProps) => {
      if (!routeKey) return;
      const { status, type } = data;
      if (status === STATUS.FINISHED || status === STATUS.SKIPPED) {
        markRouteTourDone(routeKey);
        setRun(false);
        return;
      }
      if (type === EVENTS.TARGET_NOT_FOUND) {
        markRouteTourDone(routeKey);
        setRun(false);
      }
    },
    [routeKey],
  );

  if (!routeKey || steps.length === 0 || completed) {
    return null;
  }

  return (
    <Joyride
      steps={steps}
      run={run}
      continuous
      showProgress
      showSkipButton
      hideCloseButton
      scrollOffset={80}
      spotlightPadding={8}
      disableOverlayClose
      callback={handleCallback}
      tooltipComponent={OnboardingTooltip}
      locale={appJoyrideLocale}
      styles={appJoyrideStyles}
      floaterProps={{
        styles: {
          floater: { zIndex: 10055 },
        },
      }}
    />
  );
}
