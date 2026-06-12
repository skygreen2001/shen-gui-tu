import { useCallback } from 'react';
import useAsyncStorage from './useAsyncStorage';
import { formatDate } from '../utils/dateUtils';

// ========================
// 类型定义
// ========================

export interface TaperStep {
  weekNumber: number;
  dosage: string;
  startDate: string;
  endDate: string;
  isCompleted: boolean;
  note?: string;
}

export interface TaperPlan {
  id: string;
  medicationId: string;
  medicationName: string;
  currentDosage: string;
  targetDosage: string;
  startDate: string;
  estimatedEndDate: string;
  totalWeeks: number;
  steps: TaperStep[];
  currentStep: number;
  isActive: boolean;
  createdAt: number;
  updatedAt: number;
}

// ========================
// Hook
// ========================

export default function useTaperPlan() {
  const [taperPlans, setTaperPlans] = useAsyncStorage<TaperPlan[]>(
    'sgt-taper-plans',
    [],
  );

  /** 创建减药计划 */
  const createTaperPlan = useCallback(
    (params: {
      medicationId: string;
      medicationName: string;
      currentDosage: string;
      targetDosage: string;
      startDate?: string;
      totalWeeks: number;
      weeklyReduction?: string;
    }): TaperPlan => {
      const startDate = params.startDate || formatDate();
      const steps: TaperStep[] = [];

      for (let i = 0; i < params.totalWeeks; i++) {
        const stepStart = new Date(startDate);
        stepStart.setDate(stepStart.getDate() + i * 7);
        const stepEnd = new Date(stepStart);
        stepEnd.setDate(stepEnd.getDate() + 6);

        steps.push({
          weekNumber: i + 1,
          dosage: '', // 将由具体逻辑计算
          startDate: formatDate(stepStart),
          endDate: formatDate(stepEnd),
          isCompleted: false,
        });
      }

      const estimatedEnd = new Date(startDate);
      estimatedEnd.setDate(estimatedEnd.getDate() + params.totalWeeks * 7);

      const plan: TaperPlan = {
        id: `taper-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        medicationId: params.medicationId,
        medicationName: params.medicationName,
        currentDosage: params.currentDosage,
        targetDosage: params.targetDosage,
        startDate,
        estimatedEndDate: formatDate(estimatedEnd),
        totalWeeks: params.totalWeeks,
        steps,
        currentStep: 0,
        isActive: true,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      setTaperPlans((prev) => [...prev, plan]);
      return plan;
    },
    [setTaperPlans],
  );

  /** 更新减药计划 */
  const updateTaperPlan = useCallback(
    (id: string, updates: Partial<TaperPlan>) => {
      setTaperPlans((prev) =>
        prev.map((p) =>
          p.id === id
            ? { ...p, ...updates, updatedAt: Date.now() }
            : p,
        ),
      );
    },
    [setTaperPlans],
  );

  /** 完成当前步骤 */
  const completeCurrentStep = useCallback(
    (planId: string) => {
      setTaperPlans((prev) =>
        prev.map((p) => {
          if (p.id !== planId) return p;
          const updatedSteps = [...p.steps];
          if (updatedSteps[p.currentStep]) {
            updatedSteps[p.currentStep] = {
              ...updatedSteps[p.currentStep],
              isCompleted: true,
            };
          }
          const nextStep = p.currentStep + 1;
          const isActive = nextStep < p.totalWeeks;
          return {
            ...p,
            steps: updatedSteps,
            currentStep: isActive ? nextStep : p.currentStep,
            isActive,
            updatedAt: Date.now(),
          };
        }),
      );
    },
    [setTaperPlans],
  );

  /** 停用减药计划 */
  const deactivateTaperPlan = useCallback(
    (id: string) => {
      setTaperPlans((prev) =>
        prev.map((p) =>
          p.id === id
            ? { ...p, isActive: false, updatedAt: Date.now() }
            : p,
        ),
      );
    },
    [setTaperPlans],
  );

  /** 删除减药计划 */
  const deleteTaperPlan = useCallback(
    (id: string) => {
      setTaperPlans((prev) => prev.filter((p) => p.id !== id));
    },
    [setTaperPlans],
  );

  /** 获取活跃的减药计划 */
  const getActiveTaperPlan = useCallback((): TaperPlan | undefined => {
    return taperPlans.find((p) => p.isActive);
  }, [taperPlans]);

  /** 获取指定药物的减药计划 */
  const getTaperPlanByMedication = useCallback(
    (medicationId: string): TaperPlan | undefined => {
      return taperPlans.find(
        (p) => p.medicationId === medicationId && p.isActive,
      );
    },
    [taperPlans],
  );

  /** 获取减药计划进度百分比 */
  const getTaperProgress = useCallback(
    (planId: string): number => {
      const plan = taperPlans.find((p) => p.id === planId);
      if (!plan) return 0;
      const completedSteps = plan.steps.filter((s) => s.isCompleted).length;
      return Math.round((completedSteps / plan.totalWeeks) * 100);
    },
    [taperPlans],
  );

  /** 获取当前步骤信息 */
  const getCurrentStepInfo = useCallback(
    (planId: string): TaperStep | undefined => {
      const plan = taperPlans.find((p) => p.id === planId);
      if (!plan) return undefined;
      return plan.steps[plan.currentStep];
    },
    [taperPlans],
  );

  return {
    taperPlans,
    createTaperPlan,
    updateTaperPlan,
    completeCurrentStep,
    deactivateTaperPlan,
    deleteTaperPlan,
    getActiveTaperPlan,
    getTaperPlanByMedication,
    getTaperProgress,
    getCurrentStepInfo,
  };
}
