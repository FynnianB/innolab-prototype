import { CheckCircle2 } from "lucide-react";

interface Step {
  label: string;
  shortLabel?: string;
}

interface WorkflowStepperProps {
  steps: Step[];
  currentStep: number;
  className?: string;
}

export function WorkflowStepper({ steps, currentStep, className = "" }: WorkflowStepperProps) {
  return (
    <div className={`flex items-center gap-1 ${className}`}>
      {steps.map((step, i) => {
        const isCompleted = i < currentStep;
        const isCurrent = i === currentStep;
        return (
          <div key={i} className="flex items-center gap-1">
            <div className="flex items-center gap-1.5">
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-300 ${
                  isCompleted
                    ? "bg-[#10b981]"
                    : isCurrent
                    ? "bg-[#4f46e5] ring-4 ring-[#4f46e5]/15"
                    : "bg-[#e2e8f0]"
                }`}
              >
                {isCompleted ? (
                  <CheckCircle2 className="w-4 h-4 text-white" />
                ) : (
                  <span
                    className={`text-[11px] ${
                      isCurrent ? "text-white" : "text-[#94a3b8]"
                    }`}
                    style={{ fontWeight: 600 }}
                  >
                    {i + 1}
                  </span>
                )}
              </div>
              <span
                className={`text-[12px] whitespace-nowrap ${
                  isCompleted
                    ? "text-[#10b981]"
                    : isCurrent
                    ? "text-[#4f46e5]"
                    : "text-[#94a3b8]"
                }`}
                style={{ fontWeight: isCurrent ? 600 : 500 }}
              >
                {step.shortLabel || step.label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div
                className={`w-8 h-[2px] rounded-full mx-1 transition-all duration-300 ${
                  i < currentStep ? "bg-[#10b981]" : "bg-[#e2e8f0]"
                }`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
