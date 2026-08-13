import { Component } from 'react'
import { AlertTriangle, RefreshCw } from 'lucide-react'

export class MapErrorBoundary extends Component {
  state = { failed: false }

  static getDerivedStateFromError() {
    return { failed: true }
  }

  render() {
    if (!this.state.failed) return this.props.children
    return (
      <div className="grid h-full min-h-[520px] place-items-center bg-emerald-50 p-6 text-center dark:bg-[#102019]">
        <div className="max-w-xs"><div className="mx-auto grid size-14 place-items-center rounded-2xl bg-amber-100 text-amber-600 dark:bg-amber-400/10 dark:text-amber-400"><AlertTriangle size={26} /></div><h2 className="mt-4 text-xl font-black">Не удалось открыть карту</h2><p className="mt-2 text-sm text-slate-500">Обновите карту — список станций останется доступен.</p><button onClick={() => this.setState({ failed: false })} className="primary-button mt-5"><RefreshCw size={17} />Повторить</button></div>
      </div>
    )
  }
}
