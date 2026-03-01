<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

const step = ref(0)
const TOTAL_STEPS = 6
const STEP_DURATION = 1000
const PAUSE_AT_END = 1500

let timeoutId: number | undefined

const animateSequence = () => {
    if (step.value === 0) {
        timeoutId = window.setTimeout(() => {
            step.value = 1
            animateSequence()
        }, 500)
    } else if (step.value <= TOTAL_STEPS) {
        const isLastStep = step.value === TOTAL_STEPS
        const delay = isLastStep ? PAUSE_AT_END : STEP_DURATION

        timeoutId = window.setTimeout(() => {
            if (isLastStep) {
                step.value = 0
            } else {
                step.value++
            }
            animateSequence()
        }, delay)
    }
}

onMounted(() => {
    animateSequence()
})

onUnmounted(() => {
    if (timeoutId) clearTimeout(timeoutId)
})

const getNodeClass = (nodeStep: number) => {
    if (step.value === nodeStep) return "flow-node active"
    if (step.value > nodeStep) return "flow-node completed"
    return "flow-node"
}


</script>

<template>
    <div class="flowchart-container">
        <div class="flowchart flowchart-dual">
            <!-- Level 1: Kodingin -->
            <div class="flow-level level-1">
                <div :class="getNodeClass(1)">
                    <div class="flow-icon">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
                        </svg>
                    </div>
                    <div class="flow-label">
                        <span class="flow-title">kodingin</span>
                        <span class="flow-desc">Start Here</span>
                    </div>
                </div>
            </div>

            <!-- Connector: Kodingin branches to Building and Automation -->
            <div :class="['flow-connector connector-dual-branch', step === 1 ? 'active' : step > 1 ? 'completed' : '']">
                <svg class="dual-branch-lines" viewBox="0 0 400 35" preserveAspectRatio="none">
                    <path d="M 200 0 C 200 20, 100 20, 100 35" fill="none" stroke="currentColor" stroke-width="2" stroke-dasharray="4 4" />
                    <path d="M 200 0 C 200 20, 300 20, 300 35" fill="none" stroke="currentColor" stroke-width="2" stroke-dasharray="4 4" />
                </svg>
            </div>

            <!-- Level 2: Building and Automation side by side -->
            <div class="flow-level level-2 flow-dual-row">
                <!-- Building -->
                <div :class="getNodeClass(2)">
                    <div class="flow-icon">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
                        </svg>
                    </div>
                    <div class="flow-label">
                        <span class="flow-title">Building</span>
                        <span class="flow-desc">Craft Vision</span>
                    </div>
                </div>
                <!-- Automation -->
                <div :class="getNodeClass(2)">
                    <div class="flow-icon icon-automation">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M12 2a4 4 0 0 1 4 4v1a4 4 0 0 1-8 0V6a4 4 0 0 1 4-4z" />
                            <path d="M16 10a4 4 0 0 1 4 4v1a4 4 0 0 1-8 0v-1a4 4 0 0 1 4-4z" />
                            <path d="M8 10a4 4 0 0 1 4 4v1a4 4 0 0 1-8 0v-1a4 4 0 0 1 4-4z" />
                            <path d="M12 17v5M8 22h8" />
                        </svg>
                    </div>
                    <div class="flow-label">
                        <span class="flow-title">Automation</span>
                        <span class="flow-desc">AI Workflows</span>
                    </div>
                </div>
            </div>

            <!-- Two parallel columns for the branches -->
            <div class="flow-dual-columns">
                <!-- Left Column: Building path -->
                <div class="flow-column flow-column-left">
                    <!-- Connector: Building to 3 technologies -->
                    <div :class="['flow-connector connector-branch', step === 2 ? 'active' : step > 2 ? 'completed' : '']">
                        <svg class="branch-lines" viewBox="0 0 200 35" preserveAspectRatio="none">
                            <path d="M 100 0 C 100 20, 33 20, 33 35" fill="none" stroke="currentColor" stroke-width="2" stroke-dasharray="4 4" />
                            <path d="M 100 0 L 100 35" fill="none" stroke="currentColor" stroke-width="2" stroke-dasharray="4 4" />
                            <path d="M 100 0 C 100 20, 167 20, 167 35" fill="none" stroke="currentColor" stroke-width="2" stroke-dasharray="4 4" />
                        </svg>
                    </div>

                    <!-- Level 3: Technology Branches -->
                    <div class="flow-level level-3 flow-branches-small">
                        <!-- Next.js -->
                        <div :class="[getNodeClass(3), 'flow-node-small']">
                            <div class="flow-icon icon-tech">
                                <svg viewBox="0 0 150 90" fill="currentColor">
                                    <path d="M34.992 23.495h27.855v2.219H37.546v16.699h23.792v2.219H37.546v18.334h25.591v2.219H34.992v-41.69zm30.35 0h2.96l13.115 18.334 13.405-18.334L113.055.207 83.1 43.756l15.436 21.429H95.46L81.417 45.683 67.316 65.185h-3.018L79.85 43.756 65.343 23.495zm34.297 2.219v-2.219h31.742v2.219h-14.623v39.47h-2.554v-39.47H99.64zM.145 23.495h3.192l44.011 66.003L29.16 65.185 2.814 26.648l-.116 38.537H.145v-41.69zm130.98 38.801c-.523 0-.914-.405-.914-.928 0-.524.391-.929.913-.929.528 0 .913.405.913.929 0 .524.405.929.914.929.523 0 .913-.405.913-.929z" />
                                </svg>
                            </div>
                            <div class="flow-label">
                                <span class="flow-title">Next.js</span>
                            </div>
                        </div>
                        <!-- PHP -->
                        <div :class="[getNodeClass(3), 'flow-node-small']">
                            <div class="flow-icon icon-tech">
                                <svg viewBox="0 0 256 135" fill="currentColor" transform="scale(1.1)">
                                    <path d="M152.9,87.5c0,0,6.1-31.4,6.1-31.4c1.4-7.1,0.2-12.4-3.4-15.7c-3.5-3.2-9.5-4.8-18.3-4.8h-10.6l3-15.6c0.1-0.6,0-1.2-0.4-1.7c-0.4-0.5-0.9-0.7-1.5-0.7h-14.6c-1,0-1.8,0.7-2,1.6l-6.5,33.3c-0.6-3.8-2-7-4.4-9.6c-4.3-4.9-11-7.4-20.1-7.4H52.1c-1,0-1.8,0.7-2,1.6L37,104.7c-0.1,0.6,0,1.2,0.4,1.7c0.4,0.5,0.9,0.7,1.5,0.7h14.7c1,0,1.8-0.7,2-1.6l3.2-16.3h10.9c5.7,0,10.6-0.6,14.3-1.8c3.9-1.3,7.4-3.4,10.5-6.3c2.5-2.3,4.6-4.9,6.2-7.7l-2.6,13.5c-0.1,0.6,0,1.2,0.4,1.7s0.9,0.7,1.5,0.7h14.6c1,0,1.8-0.7,2-1.6l7.2-37h10c4.3,0,5.5,0.8,5.9,1.2c0.3,0.3,0.9,1.5,0.2,5.2l-5.8,29.9c-0.1,0.6,0,1.2,0.4,1.7c0.4,0.5,0.9,0.7,1.5,0.7H151C151.9,89.1,152.7,88.4,152.9,87.5z M85.3,61.5c-0.9,4.7-2.6,8.1-5.1,10c-2.5,1.9-6.6,2.9-12,2.9h-6.5l4.7-24.2h8.4c6.2,0,8.7,1.3,9.7,2.4C85.8,54.2,86.1,57.3,85.3,61.5z M215.3,42.9c-4.3-4.9-11-7.4-20.1-7.4h-28.3c-1,0-1.8,0.7-2,1.6l-13.1,67.5c-0.1,0.6,0,1.2,0.4,1.7c0.4,0.5,0.9,0.7,1.5,0.7h14.7c1,0,1.8-0.7,2-1.6l3.2-16.3h10.9c5.7,0,10.6-0.6,14.3-1.8c3.9-1.3,7.4-3.4,10.5-6.3c2.6-2.4,4.8-5.1,6.4-8c1.6-2.9,2.8-6.1,3.5-9.6C220.9,54.7,219.6,47.9,215.3,42.9z M200,61.5c-0.9,4.7-2.6,8.1-5.1,10c-2.5,1.9-6.6,2.9-12,2.9h-6.5l4.7-24.2h8.4c6.2,0,8.7,1.3,9.7,2.4C200.6,54.2,200.9,57.3,200,61.5z" />
                                </svg>
                            </div>
                            <div class="flow-label">
                                <span class="flow-title">PHP</span>
                            </div>
                        </div>
                        <!-- SQL -->
                        <div :class="[getNodeClass(3), 'flow-node-small']">
                            <div class="flow-icon icon-tech">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <path d="M12 2.5c5.523 0 10 2.015 10 4.5s-4.477 4.5-10 4.5S2 9.485 2 7 6.477 2.5 12 2.5z" />
                                    <path d="M2 7v10c0 2.485 4.477 4.5 10 4.5s10-2.015 10-4.5V7" />
                                    <path d="M2 12c0 2.485 4.477 4.5 10 4.5s10-2.015 10-4.5" />
                                </svg>
                            </div>
                            <div class="flow-label">
                                <span class="flow-title">SQL</span>
                            </div>
                        </div>
                    </div>

                    <!-- Connector: Merge from tech to WWW -->
                    <div :class="['flow-connector connector-merge', step === 3 ? 'active' : step > 3 ? 'completed' : '']">
                        <svg class="merge-lines" viewBox="0 0 200 35" preserveAspectRatio="none">
                            <path d="M 33 0 C 33 20, 100 20, 100 35" fill="none" stroke="currentColor" stroke-width="2" stroke-dasharray="4 4" />
                            <path d="M 100 0 L 100 35" fill="none" stroke="currentColor" stroke-width="2" stroke-dasharray="4 4" />
                            <path d="M 167 0 C 167 20, 100 20, 100 35" fill="none" stroke="currentColor" stroke-width="2" stroke-dasharray="4 4" />
                        </svg>
                    </div>

                    <!-- WWW -->
                    <div class="flow-level level-4">
                        <div :class="getNodeClass(4)">
                            <div class="flow-icon">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <circle cx="12" cy="12" r="10" />
                                    <line x1="2" y1="12" x2="22" y2="12" />
                                    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                                </svg>
                            </div>
                            <div class="flow-label">
                                <span class="flow-title">WWW</span>
                                <span class="flow-desc">Deploy</span>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Right Column: Automation -> n8n -->
                <div class="flow-column flow-column-right">
                    <!-- Spacer + long connector to push n8n down to WWW level -->
                    <div :class="['flow-connector connector-long', step === 2 ? 'active' : step > 2 ? 'completed' : '']">
                        <div class="long-connector-line">
                            <svg viewBox="0 0 2 100" preserveAspectRatio="none" style="width: 2px; height: 100%">
                                <path d="M 1 0 L 1 100" fill="none" stroke="currentColor" stroke-width="2" stroke-dasharray="4 4" />
                            </svg>
                        </div>
                    </div>

                    <!-- n8n Node - aligned with WWW -->
                    <div class="flow-level level-4">
                        <div :class="getNodeClass(4)">
                            <div class="flow-icon icon-n8n">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <rect x="3" y="3" width="7" height="7" rx="1" />
                                    <rect x="14" y="3" width="7" height="7" rx="1" />
                                    <rect x="3" y="14" width="7" height="7" rx="1" />
                                    <rect x="14" y="14" width="7" height="7" rx="1" />
                                    <path d="M10 6.5h4M6.5 10v4M17.5 10v4M10 17.5h4" />
                                </svg>
                            </div>
                            <div class="flow-label">
                                <span class="flow-title">n8n</span>
                                <span class="flow-desc">Automation</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Connector: WWW and n8n merge to Online -->
            <div :class="['flow-connector connector-dual-merge', step === 4 ? 'active' : step > 4 ? 'completed' : '']">
                <svg class="dual-merge-lines" viewBox="0 0 400 40" preserveAspectRatio="none">
                    <path d="M 100 2 C 100 22, 200 22, 200 38" fill="none" stroke="currentColor" stroke-width="2" stroke-dasharray="4 4" />
                    <path d="M 300 2 C 300 22, 200 22, 200 38" fill="none" stroke="currentColor" stroke-width="2" stroke-dasharray="4 4" />
                </svg>
            </div>

            <!-- Level 5: Online -->
            <div class="flow-level level-5">
                <div :class="getNodeClass(5)">
                    <div class="flow-icon icon-success">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                            <polyline points="22 4 12 14.01 9 11.01" />
                        </svg>
                    </div>
                    <div class="flow-label">
                        <span class="flow-title">Online!</span>
                    </div>
                </div>
            </div>

        </div>
    </div>
</template>

<style scoped>
/* ========================================
   Branching Flowchart Styles
======================================== */
.flowchart-container {
  display: flex;
  justify-content: center;
  align-items: center;
}

.flowchart {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0;
  transform: scale(0.85);
  transform-origin: center center;
}

.flow-split-layout {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0;
  width: 100%;
}

.flow-root-level {
  display: flex;
  justify-content: center;
  width: 100%;
}

.flow-branches-container {
  display: flex;
  justify-content: center;
  gap: 60px;
  width: 100%;
}

.flow-branch-column {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0;
}

.flow-level {
  display: flex;
  justify-content: center;
  width: 100%;
}

.flow-branches {
  display: flex;
  justify-content: space-between;
  width: 300px;
  gap: 0;
}

.flow-node {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 14px;
  background: rgba(0, 0, 0, 0.04); /* Light theme: subtle dark grey */
  border: 1px solid rgba(0, 0, 0, 0.15); /* Light theme: visible border */
  border-radius: var(--radius-md);
  backdrop-filter: blur(20px);
  transition: all 0.4s ease;
  opacity: 0.6;
}

:global(.dark) .flow-node {
  background: rgba(138, 43, 226, 0.06); /* Dark theme: subtle purple neon background, replacing white */
  border: 1px solid rgba(138, 43, 226, 0.2);
  opacity: 0.5;
}

.flow-node.active {
  opacity: 1;
  background: rgba(138, 43, 226, 0.15); /* Light theme: visible purple */
  border-color: #8a2be2;
  box-shadow: 0 0 15px rgba(138, 43, 226, 0.2);
}

:global(.dark) .flow-node.active {
  background: rgba(138, 43, 226, 0.25); /* Dark theme: strong purple neon */
  box-shadow: 0 0 25px rgba(138, 43, 226, 0.6);
}

.flow-node.completed {
  opacity: 0.9;
  background: rgba(34, 197, 94, 0.15); /* Light theme: darker green */
  border-color: rgba(34, 197, 94, 0.5); /* Light theme: distinct green border */
}

:global(.dark) .flow-node.completed {
  background: rgba(34, 197, 94, 0.1);
  border-color: rgba(34, 197, 94, 0.4);
}

.flow-icon {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.05); /* Light theme: dark icon bg */
  border: 1px solid rgba(0, 0, 0, 0.1);
  border-radius: var(--radius-sm);
  transition: all 0.4s ease;
}

:global(.dark) .flow-icon {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid var(--border-color);
}

.flow-icon svg {
  width: 16px;
  height: 16px;
  color: #64748b; /* Light theme: dark grey slate */
  transition: all 0.4s ease;
}

:global(.dark) .flow-icon svg {
  color: var(--muted-foreground, #a1a1aa);
}

.flow-node.active .flow-icon {
  background: #8a2be2;
  border-color: transparent;
}

.flow-node.active .flow-icon svg {
  color: white;
}

.flow-node.completed .flow-icon {
  background: rgba(34, 197, 94, 0.2);
  border-color: rgba(34, 197, 94, 0.5);
}

:global(.dark) .flow-node.completed .flow-icon {
  background: rgba(34, 197, 94, 0.15);
  border-color: rgba(34, 197, 94, 0.3);
}

.flow-node.completed .flow-icon svg {
  color: #16a34a; /* Light theme: darker green text */
}

:global(.dark) .flow-node.completed .flow-icon svg {
  color: #22c55e;
}

.icon-tech {
  background: rgba(0, 0, 0, 0.05);
}

:global(.dark) .icon-tech {
  background: var(--bg-tertiary);
}

.tech-label {
  font-size: 14px;
  font-weight: 700;
  color: #475569; /* Light theme: dark slate */
}

:global(.dark) .tech-label {
  color: var(--muted-foreground, #a1a1aa);
}

.flow-node.active .tech-label {
  color: #8a2be2;
}

:global(.dark) .flow-node.active .tech-label {
  color: white;
}

.flow-node.completed .tech-label {
  color: #16a34a;
}

:global(.dark) .flow-node.completed .tech-label {
  color: #22c55e;
}

.icon-success {
  background: linear-gradient(135deg, #22c55e, #16a34a) !important;
  border-color: transparent !important;
}

.icon-success svg {
  color: white !important;
}

.flow-label {
  display: flex;
  flex-direction: column;
  gap: 1px;
}

.flow-title {
  font-size: 12px;
  font-weight: 600;
  color: #334155; /* Light theme */
}

:global(.dark) .flow-title {
  color: var(--foreground, #fff);
}

.flow-desc {
  font-size: 10px;
  color: #64748b; /* Light theme */
}

:global(.dark) .flow-desc {
  color: var(--muted-foreground, #a1a1aa);
}

.flow-node.active .flow-title {
  color: #8a2be2;
}

/* Connectors */
.flow-connector {
  display: flex;
  justify-content: center;
  color: rgba(0, 0, 0, 0.25); /* Light theme connector */
  opacity: 0.8;
  transition: all 0.5s ease;
}

:global(.dark) .flow-connector {
  color: rgba(138, 43, 226, 0.3); /* Dark theme connector uses neon purple base */
  opacity: 0.6;
}

.flow-connector.active {
  opacity: 1;
  color: #8a2be2;
}

.flow-connector.completed {
  opacity: 1;
  color: #22c55e;
}

.connector-single {
  height: 24px;
  width: 2px;
}

.connector-single svg {
  width: 2px;
  height: 100%;
}

.connector-long {
  height: 113px;
  width: 2px;
}

.long-connector-line {
  height: 100%;
  width: 2px;
}

.long-connector-line svg {
  width: 2px;
  height: 100%;
}

.connector-branch,
.connector-merge {
  height: 28px;
  width: 200px;
}

.connector-dual-branch,
.connector-dual-merge {
  height: 35px;
  width: 400px;
}

.dual-branch-lines,
.dual-merge-lines {
  width: 100%;
  height: 100%;
}

.branch-lines,
.merge-lines {
  width: 100%;
  height: 100%;
}

/* Dual-column layout */
.flowchart-dual {
  width: 400px;
  transform: scale(1.1);
  transform-origin: center top;
}

.flow-dual-row {
  display: flex;
  justify-content: space-between;
  width: 400px;
  gap: 0;
}

.flow-dual-columns {
  display: flex;
  justify-content: space-between;
  width: 400px;
  gap: 0;
}

.flow-column {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0;
}

.flow-column-left {
  width: 200px;
}

.flow-column-right {
  width: 200px;
}

.flow-column-spacer {
  height: 95px;
}

/* Adjust branches width for left column */
.flow-column-left .flow-branches,
.flow-column-left .flow-branches-small {
  width: 200px;
}

.flow-column-left .connector-branch,
.flow-column-left .connector-merge {
  width: 200px;
}

/* Small node styling for tech stack */
.flow-branches-small {
  display: flex;
  justify-content: space-between;
  width: 200px;
  gap: 4px;
}

.flow-node-small {
  padding: 6px 8px;
  gap: 6px;
}

.flow-node-small .flow-icon {
  width: 24px;
  height: 24px;
}

.flow-node-small .flow-icon svg {
  width: 12px;
  height: 12px;
}

.flow-node-small .flow-label {
  display: none;
}

.flow-node-small .flow-title {
  font-size: 9px;
}

/* Icon styles for new nodes */
.icon-automation {
  background: rgba(236, 72, 153, 0.15);
  border-color: rgba(236, 72, 153, 0.3);
}

.icon-automation svg {
  color: #ec4899;
}

.icon-n8n {
  background: rgba(239, 68, 68, 0.15);
  border-color: rgba(239, 68, 68, 0.3);
}

.icon-n8n svg {
  color: #ef4444;
}

/* Animation for connectors */
.flow-connector.active svg line,
.flow-connector.active svg path {
  stroke-dasharray: 4 4;
  animation: flowLine 1.5s linear infinite;
}

@keyframes flowLine {
  0% {
    stroke-dashoffset: 0;
  }

  100% {
    stroke-dashoffset: -16;
  }
}
</style>
