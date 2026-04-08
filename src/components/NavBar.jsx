import { NavLink } from 'react-router-dom'
import { HomeIcon, LogIcon, HistoryIcon, ProgressIcon, GuideIcon, SettingsIcon } from './icons'

const NAV_ITEMS = [
  { to: '/', label: 'Home', Icon: HomeIcon },
  { to: '/log', label: 'Log', Icon: LogIcon },
  { to: '/history', label: 'History', Icon: HistoryIcon },
  { to: '/progress', label: 'Progress', Icon: ProgressIcon },
  { to: '/guide', label: 'Guide', Icon: GuideIcon },
  { to: '/settings', label: 'Settings', Icon: SettingsIcon },
]

export default function NavBar() {
  return (
    <nav
      className="fixed bottom-0 left-0 right-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-t border-gray-200 dark:border-gray-800 z-50 md:relative md:border-t-0 md:border-b"
      style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
    >
      <div className="max-w-2xl mx-auto flex justify-around">
        {NAV_ITEMS.map(({ to, label, Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              `flex flex-col items-center py-2 px-1 min-h-[44px] min-w-[44px] text-xs transition-colors ${
                isActive
                  ? 'text-rose-500 font-semibold'
                  : 'text-gray-400 dark:text-gray-500 hover:text-rose-400'
              }`
            }
          >
            <Icon className="w-6 h-6 mb-0.5" />
            <span>{label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  )
}
