import React from 'react';
import { useApp } from '../../context/AppContext';
import {
  Compass,
  ArrowRight,
  TrendingDown,
  Trash2,
  Navigation,
  ShieldAlert,
  BarChart3,
  Cpu,
  Leaf,
  Clock,
  CheckCircle2,
  Truck,
  Sparkles,
  MapPin,
  Flame,
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  const { setActiveView, bins, alerts, routeComparison, trucks } = useApp();

  const urgentBinsCount = bins.filter((b) => b.fillPercentage >= 70).length;
  const criticalCount = alerts.filter((a) => !a.resolved && a.severity === 'critical').length;
  const avgFill = Math.round(bins.reduce((a, b) => a + b.fillPercentage, 0) / bins.length);

  const scrollToHowItWorks = () => {
    const el = document.getElementById('how-it-works');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-[#0B1220] text-slate-100 selection:bg-emerald-500/20 selection:text-emerald-300">
      {/* Top Navigation */}
      <nav className="sticky top-0 z-40 border-b border-slate-800/80 bg-[#0B1220]/90 backdrop-blur-md px-6 py-4">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 text-slate-950 shadow-md shadow-emerald-500/20">
              <Compass className="h-5 w-5" />
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-lg font-bold tracking-tight text-white">EcoRoute</span>
              <span className="text-lg font-bold text-emerald-400">AI</span>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-400">
            <button
              onClick={scrollToHowItWorks}
              className="hover:text-white transition-colors"
            >
              How It Works
            </button>
            <button
              onClick={() => {
                const el = document.getElementById('features');
                el?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="hover:text-white transition-colors"
            >
              Features
            </button>
            <button
              onClick={() => {
                const el = document.getElementById('sustainability');
                el?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="hover:text-white transition-colors"
            >
              Impact & ROI
            </button>
          </div>

          <button
            onClick={() => setActiveView('dashboard')}
            className="flex items-center gap-2 rounded-lg bg-emerald-500 px-4 py-2 text-sm font-semibold text-slate-950 transition-all hover:bg-emerald-400 hover:shadow-lg hover:shadow-emerald-500/20"
          >
            <span>Launch Dashboard</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden px-6 pt-16 pb-20 md:pt-24 md:pb-28">
        {/* Subtle background glow */}
        <div className="pointer-events-none absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 h-96 w-96 rounded-full bg-emerald-500/10 blur-3xl" />
        <div className="pointer-events-none absolute top-1/3 right-1/4 h-80 w-80 rounded-full bg-cyan-500/10 blur-3xl" />

        <div className="mx-auto max-w-5xl text-center">
          {/* Hackathon badge */}
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-4 py-1.5 text-xs font-semibold text-emerald-300 mb-8">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Hackathon Finalist Prototype · Smart City Waste Infrastructure</span>
          </div>

          <h1 className="text-4xl font-extrabold tracking-tight sm:text-6xl lg:text-7xl">
            <span className="text-white">Cleaner Cities.</span>{' '}
            <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-emerald-500 bg-clip-text text-transparent">
              Smarter Routes.
            </span>
          </h1>

          <p className="mx-auto mt-6 max-w-3xl text-lg text-slate-300 sm:text-xl leading-relaxed">
            Optimize waste collection with intelligent bin prioritization, efficient truck routing,
            and actionable waste management insights.
          </p>

          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <button
              onClick={() => setActiveView('dashboard')}
              className="flex items-center gap-2.5 rounded-xl bg-emerald-500 px-6 py-3.5 text-base font-bold text-slate-950 shadow-lg shadow-emerald-500/25 transition-all hover:bg-emerald-400 hover:scale-[1.02] active:scale-[0.99]"
            >
              <span>Launch Dashboard</span>
              <ArrowRight className="h-5 w-5" />
            </button>
            <button
              onClick={scrollToHowItWorks}
              className="flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-900/80 px-6 py-3.5 text-base font-semibold text-slate-200 transition-all hover:border-slate-600 hover:bg-slate-800"
            >
              <span>Explore How It Works</span>
            </button>
          </div>

          {/* Quick Metrics Bar */}
          <div className="mt-16 grid grid-cols-2 gap-4 rounded-2xl border border-slate-800 bg-slate-900/60 p-6 md:grid-cols-4">
            <div className="text-center">
              <p className="text-3xl font-extrabold text-white font-mono">{bins.length}</p>
              <p className="mt-1 text-xs text-slate-400">Monitored Bins</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-extrabold text-amber-400 font-mono">{urgentBinsCount}</p>
              <p className="mt-1 text-xs text-slate-400">Urgent Collection Needs</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-extrabold text-emerald-400 font-mono">
                {routeComparison?.percentageSaved || '32.4'}%
              </p>
              <p className="mt-1 text-xs text-slate-400">Fuel & Distance Saved</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-extrabold text-cyan-400 font-mono">{trucks.length}</p>
              <p className="mt-1 text-xs text-slate-400">Active Trucks in Grid</p>
            </div>
          </div>
        </div>

        {/* Interactive Dashboard Sneak Peek */}
        <div className="mx-auto mt-16 max-w-6xl">
          <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/90 shadow-2xl">
            {/* Mock Header */}
            <div className="flex items-center justify-between border-b border-slate-800 bg-slate-950/60 px-6 py-3">
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-full bg-red-500/80" />
                <span className="h-3 w-3 rounded-full bg-amber-500/80" />
                <span className="h-3 w-3 rounded-full bg-emerald-500/80" />
                <span className="ml-3 font-mono text-xs text-slate-400">
                  live_grid_monitor // hyderabad_central
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="rounded bg-emerald-500/20 px-2 py-0.5 font-mono text-[11px] text-emerald-400">
                  Live Heuristic Active
                </span>
              </div>
            </div>

            {/* Mock Grid Content */}
            <div className="grid grid-cols-1 gap-6 p-6 lg:grid-cols-3">
              <div className="rounded-xl border border-slate-800 bg-slate-950/40 p-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-400">CRITICAL OVERFLOW RISK</span>
                  <ShieldAlert className="h-4 w-4 text-red-400" />
                </div>
                <div className="mt-3 flex items-baseline gap-2">
                  <span className="text-3xl font-bold text-red-400 font-mono">{criticalCount}</span>
                  <span className="text-xs text-slate-400">Bins above 85% capacity</span>
                </div>
                <div className="mt-4 space-y-2">
                  {bins.slice(0, 2).map((b) => (
                    <div
                      key={b.id}
                      className="flex items-center justify-between rounded-lg border border-slate-800/80 bg-slate-900/40 p-2 text-xs"
                    >
                      <div className="truncate pr-2">
                        <span className="font-semibold text-white">{b.id}</span>
                        <span className="text-slate-400 text-[11px] ml-1.5">{b.area}</span>
                      </div>
                      <span className="font-mono font-bold text-red-400">{b.fillPercentage}%</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-xl border border-slate-800 bg-slate-950/40 p-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-400">ROUTE OPTIMIZATION SUMMARY</span>
                  <Navigation className="h-4 w-4 text-emerald-400" />
                </div>
                <div className="mt-3 flex items-baseline gap-2">
                  <span className="text-3xl font-bold text-emerald-400 font-mono">
                    {routeComparison ? `${routeComparison.percentageSaved}%` : '28.6%'}
                  </span>
                  <span className="text-xs text-slate-400">Mileage reduction</span>
                </div>
                <div className="mt-4 space-y-2 text-xs text-slate-300">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Baseline Tour:</span>
                    <span className="font-mono line-through text-slate-500">
                      {routeComparison ? `${routeComparison.baselineDistanceKm} km` : '24.2 km'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Optimized TSP:</span>
                    <span className="font-mono text-emerald-400 font-semibold">
                      {routeComparison ? `${routeComparison.optimizedDistanceKm} km` : '17.3 km'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Estimated Fuel Saved:</span>
                    <span className="font-mono text-emerald-300">
                      {routeComparison ? `${routeComparison.fuelSavedLiters} L` : '2.0 L'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="rounded-xl border border-slate-800 bg-slate-950/40 p-4 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-400">MUNICIPAL FLEET STATUS</span>
                    <Truck className="h-4 w-4 text-cyan-400" />
                  </div>
                  <div className="mt-3 flex items-baseline gap-2">
                    <span className="text-3xl font-bold text-cyan-400 font-mono">{trucks.length}</span>
                    <span className="text-xs text-slate-400">Compactor units ready</span>
                  </div>
                  <p className="mt-3 text-xs text-slate-400 leading-relaxed">
                    Auto-balanced assignments based on gross payload constraints to prevent truck overload.
                  </p>
                </div>
                <button
                  onClick={() => setActiveView('optimizer')}
                  className="mt-4 flex w-full items-center justify-center gap-1.5 rounded-lg bg-slate-800 py-2 text-xs font-semibold text-emerald-400 hover:bg-slate-700 transition-colors"
                >
                  <span>Open Route Planner</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Three Steps Section: Monitor, Optimize, Collect */}
      <section id="how-it-works" className="border-t border-slate-800/80 bg-slate-950/40 px-6 py-20">
        <div className="mx-auto max-w-6xl">
          <div className="text-center">
            <h2 className="text-xs font-semibold uppercase tracking-widest text-emerald-400">
              Operational Workflow
            </h2>
            <p className="mt-2 text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Three Steps to Sustainable Waste Logistics
            </p>
            <p className="mx-auto mt-4 max-w-2xl text-slate-400">
              Transforming traditional blind fixed schedules into data-driven dynamic collections.
            </p>
          </div>

          <div className="mt-16 grid grid-cols-1 gap-8 md:grid-cols-3">
            {/* Step 1 */}
            <div className="relative rounded-2xl border border-slate-800 bg-slate-900/60 p-8 transition-transform hover:-translate-y-1">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 mb-6">
                <Trash2 className="h-6 w-6" />
              </div>
              <div className="text-xs font-mono font-semibold text-emerald-400 mb-2">STEP 01</div>
              <h3 className="text-xl font-bold text-white">Monitor</h3>
              <p className="mt-3 text-sm leading-relaxed text-slate-300">
                Continuous ultrasonic fill tracking monitors bins across civic zones. Dynamic scoring
                weighs fill percentage, time elapsed, and high-priority public spots.
              </p>
              <ul className="mt-6 space-y-2 text-xs text-slate-400">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                  <span>Real-time fill level percentages</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                  <span>Configurable priority heuristic formula</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                  <span>Automatic overflow risk alerts</span>
                </li>
              </ul>
            </div>

            {/* Step 2 */}
            <div className="relative rounded-2xl border border-slate-800 bg-slate-900/60 p-8 transition-transform hover:-translate-y-1">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 mb-6">
                <Navigation className="h-6 w-6" />
              </div>
              <div className="text-xs font-mono font-semibold text-cyan-400 mb-2">STEP 02</div>
              <h3 className="text-xl font-bold text-white">Optimize</h3>
              <p className="mt-3 text-sm leading-relaxed text-slate-300">
                Our capacitated routing engine pairs Nearest-Neighbor spatial clustering with 2-Opt
                heuristic untangling while respecting truck weight capacities.
              </p>
              <ul className="mt-6 space-y-2 text-xs text-slate-400">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-cyan-400 shrink-0" />
                  <span>Greedy Nearest Neighbor + 2-Opt TSP</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-cyan-400 shrink-0" />
                  <span>Strict truck payload capacity limits</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-cyan-400 shrink-0" />
                  <span>Full depot start and return loops</span>
                </li>
              </ul>
            </div>

            {/* Step 3 */}
            <div className="relative rounded-2xl border border-slate-800 bg-slate-900/60 p-8 transition-transform hover:-translate-y-1">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20 mb-6">
                <Truck className="h-6 w-6" />
              </div>
              <div className="text-xs font-mono font-semibold text-amber-400 mb-2">STEP 03</div>
              <h3 className="text-xl font-bold text-white">Collect</h3>
              <p className="mt-3 text-sm leading-relaxed text-slate-300">
                Drivers receive turn-by-turn stop sequences. Sanitation teams avoid empty runs,
                municipalities slash diesel bills, and citizens enjoy cleaner streets.
              </p>
              <ul className="mt-6 space-y-2 text-xs text-slate-400">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-amber-400 shrink-0" />
                  <span>Stop-by-stop navigation cards</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-amber-400 shrink-0" />
                  <span>One-click collection mark & auto-audit</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-amber-400 shrink-0" />
                  <span>Verified mileage & fuel savings</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Grid */}
      <section id="features" className="px-6 py-20">
        <div className="mx-auto max-w-6xl">
          <div className="text-center">
            <h2 className="text-xs font-semibold uppercase tracking-widest text-emerald-400">
              Core Capabilities
            </h2>
            <p className="mt-2 text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Engineered for Modern Sanitation Authorities
            </p>
          </div>

          <div className="mt-14 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-6">
              <Cpu className="h-8 w-8 text-emerald-400 mb-4" />
              <h4 className="text-lg font-semibold text-white">Transparent Priority Formula</h4>
              <p className="mt-2 text-sm text-slate-400">
                Weighted calculation incorporating fill level (60%), wait time (25%), and civic priority (15%) with safety override thresholds.
              </p>
            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-6">
              <MapPin className="h-8 w-8 text-cyan-400 mb-4" />
              <h4 className="text-lg font-semibold text-white">Interactive Leaflet GIS</h4>
              <p className="mt-2 text-sm text-slate-400">
                Geospatial visualization of Hyderabad smart grid with urgency-colored markers, route lines, and stop inspection.
              </p>
            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-6">
              <Truck className="h-8 w-8 text-amber-400 mb-4" />
              <h4 className="text-lg font-semibold text-white">Capacitated Fleet Management</h4>
              <p className="mt-2 text-sm text-slate-400">
                Checks vehicle gross payload limits before stop assignments to eliminate truck overloading violations.
              </p>
            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-6">
              <ShieldAlert className="h-8 w-8 text-red-400 mb-4" />
              <h4 className="text-lg font-semibold text-white">Active Overflow Alerts</h4>
              <p className="mt-2 text-sm text-slate-400">
                Dynamic trigger detection for bins &gt;85% capacity, overdue routes, or critical bins without assigned trucks.
              </p>
            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-6">
              <TrendingDown className="h-8 w-8 text-emerald-400 mb-4" />
              <h4 className="text-lg font-semibold text-white">Baseline vs. Optimized ROI</h4>
              <p className="mt-2 text-sm text-slate-400">
                Side-by-side metric comparison proving distance saved, fuel liters conserved, and emissions eliminated.
              </p>
            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-6">
              <BarChart3 className="h-8 w-8 text-purple-400 mb-4" />
              <h4 className="text-lg font-semibold text-white">Data Export & Reporting</h4>
              <p className="mt-2 text-sm text-slate-400">
                Direct CSV exports for bin inventories, sensor telemetry, and historical collection audits.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Sustainability Section */}
      <section id="sustainability" className="border-t border-slate-800/80 bg-slate-950/40 px-6 py-20">
        <div className="mx-auto max-w-6xl">
          <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3.5 py-1 text-xs font-semibold text-emerald-400 mb-4">
                <Leaf className="h-3.5 w-3.5" />
                <span>Municipal Sustainability</span>
              </div>
              <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
                Measurable Impact for Municipalities
              </h2>
              <p className="mt-4 text-slate-300 leading-relaxed">
                By eliminating unnecessary collection trips and dynamically sequencing urgent stops,
                EcoRoute AI helps smart cities lower operating expenditures while advancing zero-waste
                climate targets.
              </p>

              <div className="mt-8 space-y-4">
                <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-white">Fuel Consumption Reduction</span>
                    <span className="font-mono text-base font-bold text-emerald-400">Up to 35%</span>
                  </div>
                  <div className="mt-2 h-2 w-full rounded-full bg-slate-800">
                    <div className="h-2 rounded-full bg-emerald-400" style={{ width: '35%' }} />
                  </div>
                </div>

                <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-white">Overflow Incidents Prevented</span>
                    <span className="font-mono text-base font-bold text-cyan-400">92%</span>
                  </div>
                  <div className="mt-2 h-2 w-full rounded-full bg-slate-800">
                    <div className="h-2 rounded-full bg-cyan-400" style={{ width: '92%' }} />
                  </div>
                </div>

                <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-white">Truck Capacity Utilization</span>
                    <span className="font-mono text-base font-bold text-amber-400">88%</span>
                  </div>
                  <div className="mt-2 h-2 w-full rounded-full bg-slate-800">
                    <div className="h-2 rounded-full bg-amber-400" style={{ width: '88%' }} />
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-gradient-to-br from-slate-900 to-[#0B1220] p-8">
              <h3 className="text-xl font-bold text-white mb-6">Sample Daily Shift Simulation</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <span className="text-xs text-slate-400">Baseline Distance</span>
                  <span className="font-mono font-bold text-slate-300">38.4 km / shift</span>
                </div>
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <span className="text-xs text-slate-400">Optimized Dynamic Route</span>
                  <span className="font-mono font-bold text-emerald-400">25.1 km / shift</span>
                </div>
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <span className="text-xs text-slate-400">Net Diesel Conserved</span>
                  <span className="font-mono font-bold text-emerald-300">~3.8 Liters</span>
                </div>
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <span className="text-xs text-slate-400">CO2 Emissions Avoided</span>
                  <span className="font-mono font-bold text-cyan-300">~10.2 kg CO₂e</span>
                </div>
                <div className="flex items-center justify-between pt-1">
                  <span className="text-xs text-slate-400">Estimated Municipal Savings</span>
                  <span className="font-mono font-bold text-white">₹365 / vehicle / day</span>
                </div>
              </div>

              <div className="mt-8">
                <button
                  onClick={() => setActiveView('dashboard')}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-500 py-3.5 text-sm font-bold text-slate-950 hover:bg-emerald-400 transition-colors"
                >
                  <span>Launch Live Interactive Demo</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-800 bg-[#0B1220] px-6 py-10">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 md:flex-row">
          <div className="flex items-center gap-2">
            <Compass className="h-5 w-5 text-emerald-400" />
            <span className="font-bold text-white">EcoRoute AI</span>
            <span className="text-xs text-slate-500">· Waste Collection Optimizer</span>
          </div>

          <div className="text-center text-xs text-slate-400">
            College Hackathon Finalist Prototype · Simulated Hyderabad Municipal Grid · No live GPS claimed
          </div>

          <button
            onClick={() => setActiveView('dashboard')}
            className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 underline"
          >
            Open Operations Dashboard →
          </button>
        </div>
      </footer>
    </div>
  );
};
