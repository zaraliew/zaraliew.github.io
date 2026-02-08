import { useLocation, useNavigate } from 'react-router-dom'
import { useApp } from '../../context/AppContext'
import './Navigation.css'

export default function Navigation() {
  const location = useLocation()
  const navigate = useNavigate()
  const { lastPlayedSongId } = useApp()

  const tabs = [
    {
      key: 'home',
      label: 'Home',
      route: '/',
      icon: (
        <svg className="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 10.5L12 3l9 7.5V20a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V10.5z" />
          <path d="M9 21V14h6v7" />
        </svg>
      ),
      isActive: location.pathname === '/',
    },
    {
      key: 'playing',
      label: 'Playing',
      route: lastPlayedSongId ? `/song/${lastPlayedSongId}` : null,
      icon: (
        <svg className="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M9 18V5l12-2v13" />
          <circle cx="6" cy="18" r="3" />
          <circle cx="18" cy="16" r="3" />
        </svg>
      ),
      isActive: location.pathname.startsWith('/song/'),
    },
    {
      key: 'words',
      label: 'Words',
      route: '/wordbank',
      icon: (
        <svg className="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
          <path d="M4 4.5A2.5 2.5 0 0 1 6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15z" />
        </svg>
      ),
      isActive: location.pathname === '/wordbank',
    },
  ]

  const handleTabPress = (tab) => {
    if (!tab.route) return
    navigate(tab.route)
  }

  return (
    <nav className="nav">
      {tabs.map((tab) => (
        <button
          key={tab.key}
          className={`nav-item${tab.isActive ? ' active' : ''}`}
          onClick={() => handleTabPress(tab)}
          aria-label={tab.label}
          aria-current={tab.isActive ? 'page' : undefined}
        >
          {tab.icon}
          <span className="nav-label">{tab.label}</span>
        </button>
      ))}
    </nav>
  )
}
