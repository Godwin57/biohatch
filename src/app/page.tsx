"use client";

import useSWR from "swr";

const BIOHATCH_CONFIG = {
  DEVICE_ID: "BH_UNIZIK_001",
  TARGET_TEMP_MIN: 37.0,
  TARGET_TEMP_MAX: 38.0,
  REFRESH_INTERVAL: 2000,
};

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function LiveMonitor() {
  const { data, error, isLoading } = useSWR("/api/telemetry", fetcher, {
    refreshInterval: BIOHATCH_CONFIG.REFRESH_INTERVAL,
  });

  if (isLoading || !data) {
    return (
      <div className="min-h-screen flex items-center justify-center font-['Plus_Jakarta_Sans'] text-[#064e3b]">
        Connecting to BioHatch...
      </div>
    );
  }

  const { currentDay, waterTemp, chamberHumid, gasFlowPct, status } = data;

  const progressPercentage = Math.min((currentDay / 21) * 100, 100);
  const isLockdown = currentDay >= 18;
  const isTempCritical =
    waterTemp < BIOHATCH_CONFIG.TARGET_TEMP_MIN ||
    waterTemp > BIOHATCH_CONFIG.TARGET_TEMP_MAX;

  return (
    <div className="font-['Plus_Jakarta_Sans'] text-[#191c1b] antialiased min-h-screen pb-24 md:pb-0 bg-[#f0fdf4]">
      {/* TopAppBar Component */}
      <header className="docked full-width top-0 border-b-2 border-emerald-100 bg-white shadow-sm flex justify-between items-center w-full px-4 md:px-6 py-3 max-w-full z-40 sticky">
        <div className="flex items-center gap-2">
          <span
            className="material-symbols-outlined text-emerald-900"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            science
          </span>
          <span className="font-semibold text-base md:text-[18px] font-black uppercase tracking-[0.05em] text-emerald-900 truncate">
            INCUBATOR-X
          </span>
        </div>
        <div className="flex items-center gap-2 md:gap-6">
          <button className="bg-[#064e3b] text-[#80bea6] px-3 md:px-4 py-2 rounded-lg text-[14px] md:text-[16px] font-bold leading-[1] tracking-[0.02em] flex items-center gap-2 hover:bg-emerald-50 hover:text-[#064e3b] transition-colors active:scale-95 duration-150 border border-transparent">
            <span className="material-symbols-outlined text-sm">warning</span>
            <span className="hidden sm:inline">EMERGENCY LOCKDOWN</span>
            <span className="sm:hidden">LOCKDOWN</span>
          </button>
          <div className="hidden md:flex items-center gap-4">
            <button className="text-emerald-600/60 hover:bg-emerald-50 transition-colors active:scale-95 duration-150 p-2 rounded-full">
              <span className="material-symbols-outlined">
                notifications_active
              </span>
            </button>
            <button className="text-emerald-600/60 hover:bg-emerald-50 transition-colors active:scale-95 duration-150 p-2 rounded-full">
              <span className="material-symbols-outlined">settings</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-[1440px] mx-auto px-4 md:px-[32px] py-6 md:py-[40px] flex flex-col gap-8 md:gap-[64px]">
        {/* Top Section: Alert & Status */}
        <section className="flex flex-col gap-4 md:gap-[24px]">
          {/* Critical Alert Banner */}
          {isLockdown ? (
            <div className="bg-[#be123c] text-white p-4 rounded-lg shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-2 border-[#9f1239]">
              <div className="flex items-center gap-4">
                <span
                  className="material-symbols-outlined text-[32px]"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  error
                </span>
                <div>
                  <h2 className="text-[20px] md:text-[24px] font-bold leading-[1.3] tracking-[0.01em]">
                    Lockdown Active
                  </h2>
                  <p className="text-[14px] md:text-[16px] font-medium leading-[1.5] tracking-[0.01em] text-white/90">
                    Incubation Phase Critical - Hatching Imminent
                  </p>
                </div>
              </div>
              <div className="flex gap-4">
                <button className="w-full sm:w-auto bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded text-[16px] font-bold leading-[1] tracking-[0.02em] transition-colors">
                  Acknowledge
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-white text-[#064e3b] p-4 rounded-lg shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4 border border-[#dcfce7]">
              <div className="flex items-center gap-4">
                <span
                  className="material-symbols-outlined text-[32px] text-[#0ea5e9]"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  info
                </span>
                <div>
                  <h2 className="text-[20px] md:text-[24px] font-bold leading-[1.3] tracking-[0.01em]">
                    Incubating
                  </h2>
                  <p className="text-[14px] md:text-[16px] font-medium leading-[1.5] tracking-[0.01em] text-black/60">
                    Nominal Operation
                  </p>
                </div>
              </div>
              <div className="flex gap-4">
                <button className="w-full sm:w-auto bg-emerald-50 hover:bg-emerald-100 text-[#064e3b] px-4 py-2 rounded text-[16px] font-bold leading-[1] tracking-[0.02em] transition-colors">
                  View Details
                </button>
              </div>
            </div>
          )}

          {/* Unit Status Header */}
          <div className="flex flex-col sm:flex-row justify-between sm:items-end gap-4 sm:gap-0 border-b border-[#dcfce7] pb-4">
            <div>
              <p className="text-[12px] font-bold tracking-[0.06em] text-[#404944] uppercase mb-2">
                Active Module
              </p>
              <h1 className="text-[32px] md:text-[48px] font-bold text-[#003527] leading-[1.2] tracking-[0.02em]">
                Incubator Unit 04-A
              </h1>
            </div>
            <div className="text-left sm:text-right">
              <p className="text-[12px] font-bold tracking-[0.06em] text-[#404944] uppercase mb-2">
                Cycle Progress
              </p>
              <div className="text-[24px] md:text-[32px] font-bold text-[#003527] leading-[1.2] tracking-[0.02em]">
                Day {currentDay}
                <span className="text-[#707974]">/21</span>
              </div>
            </div>
          </div>

          {/* Progress Indicator */}
          <div className="w-full bg-[#e7e9e5] h-4 rounded-full overflow-hidden border border-[#dcfce7]">
            <div
              className="bg-[#003527] h-full transition-all duration-500 ease-in-out"
              style={{ width: `${progressPercentage}%` }}
            ></div>
          </div>
        </section>

        {/* Center Section: Bento Grid Metrics */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-[24px]">
          {/* Temperature Card */}
          <div
            className={`${isTempCritical ? "bg-red-50 border-red-200" : "bg-white border-[#dcfce7]"} rounded-[16px] shadow-sm border p-[24px] flex flex-col gap-[16px] relative overflow-hidden group transition-colors duration-300`}
          >
            <div
              className={`absolute top-0 right-0 w-32 h-32 opacity-5 rounded-bl-full transition-opacity group-hover:opacity-10 ${isTempCritical ? "bg-[#be123c]" : "bg-[#f59e0b]"}`}
            ></div>
            <div className="flex justify-between items-start z-10">
              <p
                className={`text-[12px] font-bold tracking-[0.06em] uppercase leading-[1.2] ${isTempCritical ? "text-[#be123c]" : "text-[#404944]"}`}
              >
                Core Temperature
              </p>
              <span
                className={`material-symbols-outlined ${isTempCritical ? "text-[#be123c]" : "text-[#f59e0b]"}`}
              >
                device_thermostat
              </span>
            </div>
            <div className="mt-auto z-10">
              <div
                className={`text-[48px] font-bold leading-[1.2] tracking-[0.02em] ${isTempCritical ? "text-[#be123c]" : "text-[#064e3b]"}`}
              >
                {waterTemp.toFixed(1)}
                <span className="text-[24px] text-[#707974] ml-2 leading-[1.3]">
                  °C
                </span>
              </div>
              <div
                className={`flex items-center gap-1 mt-2 text-[16px] font-medium leading-[1.5] tracking-[0.01em] ${isTempCritical ? "text-[#be123c]" : "text-[#064e3b]"}`}
              >
                <span className="material-symbols-outlined text-[16px]">
                  {waterTemp > BIOHATCH_CONFIG.TARGET_TEMP_MAX
                    ? "arrow_upward"
                    : waterTemp < BIOHATCH_CONFIG.TARGET_TEMP_MIN
                      ? "arrow_downward"
                      : "check_circle"}
                </span>
                <span>
                  {waterTemp > BIOHATCH_CONFIG.TARGET_TEMP_MAX
                    ? "Above Target"
                    : waterTemp < BIOHATCH_CONFIG.TARGET_TEMP_MIN
                      ? "Below Target"
                      : "Optimal Range"}
                </span>
              </div>
            </div>
          </div>

          {/* Humidity Card */}
          <div className="bg-white rounded-[16px] shadow-sm border border-[#dcfce7] p-[24px] flex flex-col gap-[16px] relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#0ea5e9] opacity-5 rounded-bl-full transition-opacity group-hover:opacity-10"></div>
            <div className="flex justify-between items-start z-10">
              <p className="text-[12px] font-bold tracking-[0.06em] leading-[1.2] text-[#404944] uppercase">
                Ambient Humidity
              </p>
              <span className="material-symbols-outlined text-[#0ea5e9]">
                water_drop
              </span>
            </div>
            <div className="mt-auto z-10">
              <div className="text-[48px] font-bold leading-[1.2] tracking-[0.02em] text-[#0ea5e9]">
                {chamberHumid.toFixed(0)}
                <span className="text-[24px] text-[#707974] ml-2 leading-[1.3]">
                  %
                </span>
              </div>
              <div className="flex items-center gap-1 mt-2 text-[#064e3b] text-[16px] font-medium leading-[1.5] tracking-[0.01em]">
                <span className="material-symbols-outlined text-[16px]">
                  check_circle
                </span>
                <span>Optimal Range</span>
              </div>
            </div>
          </div>

          {/* Gas Level Card */}
          <div className="bg-white rounded-[16px] shadow-sm border border-[#dcfce7] p-[24px] flex flex-col gap-[16px] relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#f59e0b] opacity-5 rounded-bl-full transition-opacity group-hover:opacity-10"></div>
            <div className="flex justify-between items-start z-10">
              <p className="text-[12px] font-bold tracking-[0.06em] leading-[1.2] text-[#404944] uppercase">
                Gas Level (CO2)
              </p>
              <span className="material-symbols-outlined text-[#f59e0b]">
                co2
              </span>
            </div>
            <div className="mt-auto z-10">
              <div className="text-[48px] font-bold leading-[1.2] tracking-[0.02em] text-[#f59e0b]">
                {gasFlowPct}
                <span className="text-[24px] text-[#707974] ml-2 leading-[1.3]">
                  ppm
                </span>
              </div>
              <div className="flex items-center gap-1 mt-2 text-[#064e3b] text-[16px] font-medium leading-[1.5] tracking-[0.01em]">
                <span className="material-symbols-outlined text-[16px]">
                  check_circle
                </span>
                <span>Normal Levels</span>
              </div>
            </div>
          </div>
        </section>

        {/* Bottom Section: System Heartbeat List */}
        <section className="bg-white rounded-[16px] shadow-sm border border-[#dcfce7] p-[24px] flex flex-col gap-[16px]">
          <div className="flex items-center gap-4 pb-2 border-b border-[#dcfce7]">
            <span className="material-symbols-outlined text-[#003527]">
              monitor_heart
            </span>
            <h3 className="text-[24px] font-bold leading-[1.3] tracking-[0.01em] text-[#003527]">
              System Heartbeat
            </h3>
          </div>
          <div className="flex flex-col">
            <div className="flex justify-between items-center py-2 border-b border-[#dcfce7] last:border-0">
              <div className="flex items-center gap-4">
                <div className="w-2 h-2 rounded-full bg-[#064e3b]"></div>
                <span className="text-[16px] font-medium leading-[1.5] tracking-[0.01em] text-[#191c1b]">
                  Status: {status}
                </span>
              </div>
              <span className="text-[12px] font-bold tracking-[0.06em] leading-[1.2] text-[#404944]">
                CURRENT
              </span>
            </div>
          </div>
        </section>

        {/* Lockdown Emergency Banner */}
        {isLockdown && (
          <section className="w-full">
            <div className="bg-[#be123c] text-white font-bold text-center py-4 rounded-lg shadow-md animate-pulse">
              <span className="text-xl md:text-2xl tracking-widest uppercase">
                DO NOT OPEN LID - EMERGENCY PROTOCOL ACTIVE
              </span>
            </div>
          </section>
        )}
      </main>

      {/* BottomNavBar Component - Hidden on desktop */}
      <nav className="fixed bottom-0 w-full z-50 border-t-2 border-emerald-100 bg-white shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] md:hidden">
        <div className="w-full flex justify-around items-center px-4 py-2">
          <button className="flex flex-col items-center justify-center bg-emerald-100 text-emerald-900 rounded-lg py-1 px-4 active:scale-90 duration-200">
            <span className="material-symbols-outlined">dashboard</span>
            <span className="text-[10px] font-bold uppercase mt-1">
              Monitor
            </span>
          </button>
          <button className="flex flex-col items-center justify-center text-emerald-600 py-1 px-4 hover:bg-emerald-50 transition-all active:scale-90 duration-200">
            <span className="material-symbols-outlined">
              precision_manufacturing
            </span>
            <span className="text-[10px] font-bold uppercase mt-1">
              Sensors
            </span>
          </button>
          <button className="flex flex-col items-center justify-center text-emerald-600 py-1 px-4 hover:bg-emerald-50 transition-all active:scale-90 duration-200">
            <span className="material-symbols-outlined">monitor_heart</span>
            <span className="text-[10px] font-bold uppercase mt-1">Logs</span>
          </button>
          <button className="flex flex-col items-center justify-center text-emerald-600 py-1 px-4 hover:bg-emerald-50 transition-all active:scale-90 duration-200">
            <span className="material-symbols-outlined">settings</span>
            <span className="text-[10px] font-bold uppercase mt-1">System</span>
          </button>
        </div>
      </nav>
    </div>
  );
}
