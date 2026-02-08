import { useApp } from '../../context/AppContext'
import './LayerToggles.css'

const TOGGLES = [
  { key: 'showCharacters', label: '\u6c49\u5b57' },
  { key: 'showPinyin', label: '\u62fc\u97f3' },
  { key: 'showTranslation', label: 'EN' },
]

export default function LayerToggles() {
  const { settings, toggleSetting } = useApp()

  return (
    <div className="layer-toggles">
      <div className="layer-toggles-group">
        {TOGGLES.map(({ key, label }) => {
          const isActive = settings[key]
          return (
            <button
              key={key}
              className={`layer-toggle${isActive ? ' layer-toggle--active' : ''}`}
              onClick={() => toggleSetting(key)}
              aria-pressed={isActive}
              aria-label={`Toggle ${label}`}
            >
              {label}
            </button>
          )
        })}
      </div>
    </div>
  )
}
