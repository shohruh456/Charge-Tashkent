const STORAGE_KEY = 'charge-tashkent-stations'
const DATA_VERSION_KEY = 'charge-tashkent-data-version'
const DATA_VERSION = '4'

const delay = (ms = 280) => new Promise((resolve) => setTimeout(resolve, ms))

async function readStored() {
  const stored = localStorage.getItem(STORAGE_KEY)
  if (stored && localStorage.getItem(DATA_VERSION_KEY) === DATA_VERSION) return JSON.parse(stored)
  const response = await fetch('/stations.json')
  if (!response.ok) throw new Error('Could not load the station network')
  const defaults = await response.json()
  const saved = stored ? JSON.parse(stored) : []
  const savedById = new Map(saved.map((station) => [station.id, station]))
  const defaultIds = new Set(defaults.map((station) => station.id))
  const stations = [
    ...defaults.map((station) => ({ ...station, ...savedById.get(station.id), queue: savedById.get(station.id)?.queue ?? station.queue ?? 0, reviews: savedById.get(station.id)?.reviews ?? station.reviews ?? [] })),
    ...saved.filter((station) => !defaultIds.has(station.id)).map((station) => ({ queue: 0, reviews: [], ...station })),
  ]
  localStorage.setItem(STORAGE_KEY, JSON.stringify(stations))
  localStorage.setItem(DATA_VERSION_KEY, DATA_VERSION)
  return stations
}

function write(stations) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(stations))
  window.dispatchEvent(new CustomEvent('charge-stations-updated', { detail: stations }))
  return stations
}

export const stationApi = {
  async list() { await delay(); return readStored() },
  async create(input) {
    await delay()
    const stations = await readStored()
    const station = { queue: 0, reviews: [], ...input, id: crypto.randomUUID(), createdAt: new Date().toISOString() }
    write([...stations, station])
    return station
  },
  async update(id, patch) {
    await delay(180)
    const stations = await readStored()
    const updated = stations.map((station) => station.id === id ? { ...station, ...patch } : station)
    write(updated)
    return updated.find((station) => station.id === id)
  },
  async remove(id) {
    await delay(180)
    const stations = await readStored()
    write(stations.filter((station) => station.id !== id))
    return id
  },
}
