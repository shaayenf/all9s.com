/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Header } from './components/common/Header';
import { QuickActionBar } from './components/common/QuickActionBar';
import { DashboardHub } from './components/dashboard/DashboardHub';
import { RevisionVault } from './components/vault/RevisionVault';
import { LinguaTerminal } from './components/lingua/LinguaTerminal';
import { ExamSimulatorArena } from './components/exam/ExamSimulatorArena';
import { RewardsQuestsHub } from './components/rewards/RewardsQuestsHub';
import { SettingsView } from './components/settings/SettingsView';
import { UserProfile } from './components/profile/UserProfile';
import { AuthGateway } from './components/auth/AuthGateway';
import { OpencodeDrawer } from './components/ai/OpencodeDrawer';

const AppContent: React.FC = () => {
  const { activeView, setActiveView } = useApp();

  return (
    <div className="min-h-screen flex flex-col theme-page overflow-x-hidden w-full transition-colors duration-200">
      {/* Top Header */}
      <Header />

      {/* Main App Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Quick Action Navigation Bar */}
        <QuickActionBar />

        {/* Dynamic Viewports */}
        {activeView === 'dashboard' && <DashboardHub />}
        {activeView === 'vault' && <RevisionVault />}
        {activeView === 'lingua' && <LinguaTerminal />}
        {activeView === 'exam' && <ExamSimulatorArena />}
        {activeView === 'rewards' && <RewardsQuestsHub />}
        {activeView === 'profile' && <UserProfile />}
        {activeView === 'settings' && <SettingsView />}
      </main>

      {/* Opencode AI Companion Drawer (Global) */}
      <OpencodeDrawer />

      {/* Footer */}
      <footer className="border-t theme-border theme-card py-8 text-xs font-mono theme-text-secondary">
        <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-bold theme-text-primary">All9s</span>
            <span>·</span>
            <span>Edexcel IGCSE Revision Terminal</span>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4 text-xs">
            <button
              onClick={() => setActiveView('dashboard')}
              className="hover:opacity-100 opacity-75 transition-opacity cursor-pointer"
            >
              Dashboard
            </button>
            <button
              onClick={() => setActiveView('vault')}
              className="hover:opacity-100 opacity-75 transition-opacity cursor-pointer"
            >
              Revision Vault
            </button>
            <button
              onClick={() => setActiveView('lingua')}
              className="hover:opacity-100 opacity-75 transition-opacity cursor-pointer"
            >
              LinguaTerminal
            </button>
            <button
              onClick={() => setActiveView('exam')}
              className="hover:opacity-100 opacity-75 transition-opacity cursor-pointer"
            >
              Exam Arena
            </button>
            <button
              onClick={() => setActiveView('rewards')}
              className="hover:opacity-100 opacity-75 transition-opacity cursor-pointer"
            >
              O/L Leaderboard
            </button>
            <button
              onClick={() => setActiveView('profile')}
              className="hover:opacity-100 opacity-75 transition-opacity cursor-pointer"
            >
              Profile
            </button>
            <button
              onClick={() => setActiveView('settings')}
              className="hover:opacity-100 opacity-75 transition-opacity cursor-pointer"
            >
              Settings
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <AuthGateway>
        <AppContent />
      </AuthGateway>
    </AppProvider>
  );
}
