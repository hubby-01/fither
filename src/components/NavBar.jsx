import { NavLink } from 'react-router-dom'

const NAV_ITEMS = [
  { to: '/', label: 'Home', icon: '⌂' },
  { to: '/log', label: 'Log', icon: '✎' },
  { to: '/history', label: 'History', icon: '☰' },
  { to: '/progress', label: 'Progress', icon: '◔' },
  { to: '/guide', label: 'Guide', icon: '☷' },
  { to: '/settings', label: 'Settings', icon: '⚙' },
]

export default function NavBar() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 z-50 md:relative md:border-t-0 md:border-b">
      <div className="max-w-2xl mx-auto flex justify-around">
        {NAV_ITEMS.map(({ to, label, icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              `flex flex-col items-center py-2 px-1 min-h-[44px] min-w-[44px] text-xs transition-colors ${
                isActive
                  ? 'text-rose-500 font-semibold'
                  : 'text-gray-400 dark:text-gray-300 hover:text-rose-400'
              }`
            }
          >
            <span className="text-lg mb-0.5">{icon}</span>
            <span>{label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  )
}
